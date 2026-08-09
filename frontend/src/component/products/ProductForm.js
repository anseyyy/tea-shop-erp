import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../component/common';

export default function ProductForm({ product = null, onSubmit, loading = false }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setPreviewUrl(product.image || '');
      setImageFile(null);
    } else {
      setName('');
      setPrice('');
      setPreviewUrl('');
      setImageFile(null);
    }
  }, [product]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid positive price';
    }
    if (!product && !imageFile) {
      newErrors.image = 'Product image is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (imageFile) {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('price', Number(price));
      formData.append('image', imageFile);
      onSubmit(formData);
    } else {
      onSubmit({
        name: name.trim(),
        price: Number(price),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        id="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Enter product name (e.g. Milk Tea)"
      />

      <Input
        label="Price (₹)"
        id="price"
        type="number"
        step="0.01"
        required
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={errors.price}
        placeholder="Enter price (e.g. 15)"
      />

      <div className="flex flex-col space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Product Image {!product && <span className="text-red-500">*</span>}
        </label>
        
        {previewUrl && (
          <div className="aspect-[3/4] w-full max-w-[200px] border border-gray-200 rounded-lg overflow-hidden relative bg-gray-50 mb-2">
            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
        />
        {errors.image && <span className="text-xs text-red-600 font-medium">{errors.image}</span>}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <Button variant="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Uploading & Saving...' : product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
