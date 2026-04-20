import React, { useState, useEffect } from 'react';
import './ProductFormModal.css';
import { getImageUrl } from '../utils/imageUtils';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);

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
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
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
