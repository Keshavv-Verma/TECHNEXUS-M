const mongoose = require('mongoose');
require('dotenv').config();

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  rating: Number,
  image: String,
  subcategory: String,
  stock: Number,
  isActive: Boolean,
  categoryId: mongoose.Schema.Types.ObjectId,
  specifications: [{ key: String, value: String }],
});

const Product = mongoose.model('Product', productSchema);

async function fetchProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      retryWrites: true,
      w: 'majority',
    });

    const products = await Product.find({ isActive: true })
      .select('name description price rating image subcategory stock specifications')
      .lean();

    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    process.exit(1);
  }
}

fetchProducts();
