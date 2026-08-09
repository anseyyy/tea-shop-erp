const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'teashoperp_products' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, price } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Product image file is required' });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    const product = await Product.create({
      name,
      price,
      image: result.secure_url,
      cloudinaryId: result.public_id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Image upload or product creation failed' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public/Employee
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, price } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.price = price || product.price;

    // If new image is uploaded
    if (req.file) {
      // Optional: Delete old image from Cloudinary
      if (product.cloudinaryId) {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      }

      // Upload new image
      const result = await uploadToCloudinary(req.file.buffer);
      product.image = result.secure_url;
      product.cloudinaryId = result.public_id;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image from Cloudinary
    if (product.cloudinaryId) {
      await cloudinary.uploader.destroy(product.cloudinaryId);
    }

    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
