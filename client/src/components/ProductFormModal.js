import React, { useState, useEffect, useRef } from 'react';
import './ProductFormModal.css';
import { getImageUrl } from '../utils/imageUtils';
import API from '../api';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const aiFileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || '',
        imageUrl: initialData.image || '',
      });
      setImageFile(null); // Reset file input when editing
    } else {
      setFormData({ title: '', description: '', price: '', category: '', imageUrl: '' });
      setImageFile(null);
    }
    setAiMessage(null);
    setAiLoading(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Shared helper — calls the backend and auto-fills form fields
  const runAiAnalysis = async (requestConfig) => {
    setAiLoading(true);
    setAiMessage(null);

    try {
      const res = await API.post('/api/admin/analyze-product', ...requestConfig);
      const result = res.data;

      // Auto-fill the text fields from AI response
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
      setAiMessage({
        type: 'error',
        text: '⚠️ AI analysis failed. Please fill manually.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiAnalyse = () => {
    // CASE 1 — Image URL is already pasted: send it as JSON directly
    if (formData.imageUrl && formData.imageUrl.trim()) {
      runAiAnalysis([
        { imageUrl: formData.imageUrl.trim() },
        { headers: { 'Content-Type': 'application/json' } },
      ]);
      return;
    }

    // CASE 2 — No URL: open file picker
    aiFileInputRef.current.click();
  };

  const handleAiFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    await runAiAnalysis([
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ]);

    // Reset the file input so the same file can be re-selected
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    
    if (imageFile) {
      data.append('image', imageFile);
    } else if (formData.imageUrl) {
      data.append('imageUrl', formData.imageUrl);
    }

    onSubmit(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="product-form">

          {/* AI Analyse Section — only shown for new products */}
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
              {/* Hidden file input for AI analysis */}
              <input
                type="file"
                ref={aiFileInputRef}
                accept="image/jpeg, image/jpg, image/png, image/webp"
                onChange={handleAiFileSelected}
                style={{ display: 'none' }}
              />
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

          <div className="form-group">
            <label>Product Image</label>
            {initialData && initialData.image && !imageFile && (
              <div className="current-image-preview">
                <p>Current Image:</p>
                <img src={getImageUrl(initialData.image)} alt="Current product" width="100" />
              </div>
            )}
            
            <div className="image-input-container">
              <input 
                type="text" 
                name="imageUrl" 
                placeholder="Paste Image URL here (e.g. from Cloudinary)" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                style={{ marginBottom: '10px', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
              />
              <div style={{ textAlign: 'center', margin: '5px 0', color: '#666', fontSize: '12px', fontWeight: 'bold' }}>— OR UPLOAD LOCAL FILE —</div>
              <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">{initialData ? 'Update' : 'Save'} Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
