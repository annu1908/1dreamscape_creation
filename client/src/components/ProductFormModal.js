import React, { useState, useEffect, useRef } from 'react';
import './ProductFormModal.css';
import { getImageUrl } from '../utils/imageUtils';
import API from '../api';

const parseImageUrls = (value = '') =>
  value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);

const getProductImageUrls = (product) => {
  const urls = [
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : []),
  ].filter(Boolean);

  return [...new Set(urls)];
};

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // Phase: 'upload' (image first) or 'form' (product details)
  const [phase, setPhase] = useState('upload');
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | done | error
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Additional gallery images (Phase 2)
  const [additionalImages, setAdditionalImages] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes or switches between add/edit
  useEffect(() => {
    if (initialData) {
      // Edit mode — skip Phase 1, go directly to form
      setPhase('form');
      setCloudinaryUrl(initialData.image || '');
      setUploadStatus('done');
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || '',
        imageUrl: getProductImageUrls(initialData).join('\n'),
      });
      setAdditionalImages([]);
    } else {
      // Add mode — start at Phase 1
      setPhase('upload');
      setCloudinaryUrl('');
      setUploadStatus('idle');
      setUploadError('');
      setFormData({ title: '', description: '', price: '', category: '', imageUrl: '' });
      setAdditionalImages([]);
    }
    setAiMessage(null);
    setAiLoading(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // ─── Phase 1: Cloudinary Upload ───

  const uploadToCloudinary = async (file) => {
    setUploadStatus('uploading');
    setUploadError('');

    try {
      const data = new FormData();
      data.append('image', file);

      const res = await API.post('/api/admin/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;
      setCloudinaryUrl(url);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      setUploadStatus('done');
      // Auto-advance to form phase
      setPhase('form');
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
      setUploadStatus('error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadToCloudinary(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadToCloudinary(file);
    } else {
      setUploadError('Please drop a valid image file (JPG, PNG, or WebP).');
      setUploadStatus('error');
    }
  };

  const handleReUpload = () => {
    setPhase('upload');
    setCloudinaryUrl('');
    setUploadStatus('idle');
    setUploadError('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  // ─── Phase 2: Form & AI ───

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRemoveImageUrl = (imageUrlToRemove) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: parseImageUrls(prev.imageUrl)
        .filter((url) => url !== imageUrlToRemove)
        .join('\n'),
    }));
  };

  // ─── Gallery: upload additional images ───

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = '';

    setGalleryUploading(true);
    for (const file of files) {
      try {
        const data = new FormData();
        data.append('image', file);
        const res = await API.post('/api/admin/upload-image', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAdditionalImages((prev) => [...prev, res.data.url]);
      } catch (err) {
        console.error('Gallery upload failed for', file.name, err);
      }
    }
    setGalleryUploading(false);
  };

  const handleRemoveGalleryImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAiAnalyse = async () => {
    // Determine which URL to send
    const urlToAnalyze = cloudinaryUrl || formData.imageUrl?.trim();

    if (!urlToAnalyze) {
      setAiMessage({ type: 'error', text: 'No image URL available for analysis.' });
      return;
    }

    setAiLoading(true);
    setAiMessage(null);

    try {
      const res = await API.post('/api/admin/analyze-product', {
        imageUrl: urlToAnalyze,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const result = res.data;

      setFormData((prev) => ({
        ...prev,
        title: result.title || prev.title,
        category: result.category || prev.category,
        price: result.price != null ? String(result.price) : prev.price,
        description: result.description || prev.description,
      }));

      setAiMessage({
        type: 'success',
        text: '✅ Details filled by AI. You can edit before saving.',
      });
    } catch (err) {
      console.error('AI analysis failed:', err);
      const message =
        err.response?.data?.message || 'AI analysis failed. Please fill manually.';
      setAiMessage({ type: 'error', text: message });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const imageUrls = parseImageUrls(formData.imageUrl);

    if (initialData) {
      // Edit mode — keep existing FormData flow for backward compat
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('imageUrl', imageUrls[0] || '');
      for (let i = 1; i < imageUrls.length; i++) {
        data.append('images', imageUrls[i]);
      }
      onSubmit(data);
    } else {
      // New product — send JSON with Cloudinary URL
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('imageUrl', cloudinaryUrl || imageUrls[0] || '');
      // Combine any parsed extra URLs + gallery-uploaded URLs
      const allExtra = [
        ...imageUrls.slice(1),
        ...additionalImages,
      ];
      for (const url of allExtra) {
        data.append('images', url);
      }
      onSubmit(data);
    }
  };

  const currentImageUrls = parseImageUrls(formData.imageUrl);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Edit Product' : 'Add New Product'}</h2>

        {/* ═══ PHASE 1: Image Upload (new products only) ═══ */}
        {!initialData && phase === 'upload' && (
          <div className="upload-phase">
            <div className="upload-phase__header">
              <div className="phase-badge">Step 1 of 2</div>
              <p className="upload-phase__subtitle">
                Upload a product image to get started
              </p>
            </div>

            {uploadStatus === 'idle' || uploadStatus === 'error' ? (
              <div
                className={`upload-dropzone ${dragActive ? 'upload-dropzone--active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-dropzone__icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M24 32V16M24 16L18 22M24 16L30 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 32L8 36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="upload-dropzone__text">
                  <strong>Drag & drop</strong> your image here
                </p>
                <p className="upload-dropzone__hint">or click to browse files</p>
                <p className="upload-dropzone__formats">JPG, PNG, WebP — Max 5 MB</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            ) : uploadStatus === 'uploading' ? (
              <div className="upload-progress">
                <div className="upload-progress__spinner"></div>
                <p className="upload-progress__text">Uploading to cloud…</p>
              </div>
            ) : null}

            {uploadStatus === 'error' && uploadError && (
              <div className="upload-error">
                <span>⚠️</span> {uploadError}
              </div>
            )}

            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ═══ PHASE 2: Product Form ═══ */}
        {(phase === 'form' || initialData) && (
          <form onSubmit={handleSubmit} className="product-form phase-form-enter">
            {/* Uploaded image preview + re-upload option */}
            {!initialData && cloudinaryUrl && (
              <div className="uploaded-preview">
                <div className="uploaded-preview__badge">
                  <span className="phase-badge">Step 2 of 2</span>
                </div>
                <div className="uploaded-preview__image-wrap">
                  <img src={cloudinaryUrl} alt="Uploaded product" />
                  <button
                    type="button"
                    className="uploaded-preview__change-btn"
                    onClick={handleReUpload}
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}

            {/* AI Analyse Section — only for new products */}
            {!initialData && (
              <div className="ai-analyse-section">
                <div className="ai-analyse-row">
                  <button
                    type="button"
                    className="btn-ai-analyse"
                    onClick={handleAiAnalyse}
                    disabled={aiLoading}
                  >
                    {aiLoading ? '⏳ Analysing image...' : '🤖 Analyse with AI'}
                  </button>
                  {aiLoading && (
                    <span className="ai-loading-text">Analysing image...</span>
                  )}
                </div>
                {aiMessage && (
                  <div className={`ai-message ai-message-${aiMessage.type}`}>
                    {aiMessage.text}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required></textarea>
            </div>

            {/* ─── Additional Gallery Images (new products) ─── */}
            {!initialData && (
              <div className="form-group">
                <label>Additional Images <span className="label-hint">(optional — for product gallery)</span></label>
                <div className="gallery-upload-section">
                  {/* Thumbnails */}
                  {additionalImages.length > 0 && (
                    <div className="gallery-thumbs">
                      {additionalImages.map((url, i) => (
                        <div className="gallery-thumb" key={url + i}>
                          <img src={url} alt={`Gallery ${i + 1}`} />
                          <button
                            type="button"
                            className="gallery-thumb__remove"
                            onClick={() => handleRemoveGalleryImage(i)}
                            aria-label={`Remove image ${i + 1}`}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <button
                    type="button"
                    className="gallery-add-btn"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryUploading}
                  >
                    {galleryUploading ? (
                      <><span className="gallery-add-btn__spinner"></span> Uploading...</>
                    ) : (
                      <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add More Images</>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleGalleryUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Image management for EDIT mode */}
            {initialData && (
              <div className="form-group">
                <label>Product Images</label>
                {currentImageUrls.length > 0 && (
                  <div className="current-image-preview">
                    <p>Current Images:</p>
                    {currentImageUrls.map((imageUrl, index) => (
                      <div className="current-image-preview__item" key={imageUrl}>
                        <img
                          src={getImageUrl(imageUrl)}
                          alt={`Current product ${index + 1}`}
                          width="100"
                        />
                        <button
                          type="button"
                          className="current-image-preview__remove"
                          onClick={() => handleRemoveImageUrl(imageUrl)}
                          aria-label={`Remove image ${index + 1}`}
                          title="Remove image"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="image-input-container">
                  <textarea
                    name="imageUrl"
                    placeholder="Paste Image URL(s) here (one per line or comma separated)"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    rows="2"
                    style={{ marginBottom: '10px', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit">{initialData ? 'Update' : 'Save'} Product</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductFormModal;