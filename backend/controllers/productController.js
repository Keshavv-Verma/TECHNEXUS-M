const { Product, Category, Review } = require('../models');

/**
 * GET /api/products
 * Fetch all products with optional search and filtering
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, populate } = req.query;
    let query = Product.find();

    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({
        name: new RegExp(`^${category}$`, 'i'),
      });
      if (categoryDoc) {
        query = query.where('categoryId').equals(categoryDoc._id);
      } else {
        return res.json([]);
      }
    }

    // Text search on name and description
    if (search) {
      query = query.where({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Always populate category and reviews
    query = query.populate('categoryId', 'name description');

    if (populate) {
      query = query.populate({
        path: 'categoryId',
        select: 'name description',
      });
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
};

/**
 * GET /api/products/category/:category
 * Fetch products by specific category
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { populate } = req.query;

    const categoryDoc = await Category.findOne({
      name: new RegExp(`^${category}$`, 'i'),
    });

    if (!categoryDoc) {
      return res.json([]);
    }

    let query = Product.find({ categoryId: categoryDoc._id }).populate(
      'categoryId',
      'name description'
    );

    if (populate) {
      query = query.populate({
        path: 'categoryId',
        select: 'name description',
      });
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Fetch single product by ID with all details
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name description')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'id name',
        },
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error:', error);
    next(error);
  }
};

/**
 * POST /api/products
 * Create new product (authenticated users)
 */
const createProduct = async (req, res, next) => {
  try {
    console.log('Received product data:', req.body);
    console.log('User:', req.user);

    // First, find or create category
    let category = await Category.findOne({
      name: new RegExp(`^${req.body.category}$`, 'i'),
    });

    if (!category) {
      category = await Category.create({
        name: req.body.category.toUpperCase(),
      });
    }

    const product = await Product.create({
      name: req.body.name,
      price: Number(req.body.price),
      rating: Number(req.body.rating) || 4,
      image: req.body.image,
      description: req.body.description,
      subcategory: req.body.subcategory,
      stock: req.body.stock || 0,
      categoryId: category._id,
      specifications: req.body.specifications || [],
    });

    const populatedProduct = await product.populate('categoryId');

    console.log('Saved product:', populatedProduct);
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error saving product:', error);
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Update product (admin only)
 */
const updateProduct = async (req, res, next) => {
  try {
    console.log('Updating product:', req.params.id);
    console.log('Update data:', req.body);

    const { name, price, rating, image, description, category, stock, specifications } = req.body;

    // Get the product to find its current category
    const existingProduct = await Product.findById(req.params.id).populate(
      'categoryId'
    );

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If category is being changed, find or create new category
    let categoryId = existingProduct.categoryId._id;
    if (category && category.toUpperCase() !== existingProduct.categoryId.name) {
      let newCategory = await Category.findOne({
        name: new RegExp(`^${category}$`, 'i'),
      });

      if (!newCategory) {
        newCategory = await Category.create({
          name: category.toUpperCase(),
        });
      }
      categoryId = newCategory._id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name || existingProduct.name,
        price: price ? Number(price) : existingProduct.price,
        rating: rating ? Number(rating) : existingProduct.rating,
        image: image || existingProduct.image,
        description: description || existingProduct.description,
        stock: stock ? Number(stock) : existingProduct.stock,
        specifications: specifications || existingProduct.specifications,
        categoryId: categoryId,
      },
      { new: true }
    ).populate('categoryId');

    console.log('Product updated successfully:', updatedProduct.name);
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Delete product
 */
const deleteProduct = async (req, res, next) => {
  try {
    console.log('Deleting product:', req.params.id);
    const deleted = await Product.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product deleted successfully:', deleted.name);
    res.json({
      message: 'Product deleted successfully',
      product: deleted,
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    next(error);
  }
};

/**
 * GET /api/categories
 * Fetch all categories or filter by category name
 */
const getCategories = async (req, res, next) => {
  try {
    const { populate: category } = req.query;
    if (!category) {
      const products = await Product.find().populate('categoryId');
      return res.json(products);
    }
    if (category) {
      const products = await Product.find({
        categoryId: {
          $in: await Category.find({
            name: { $regex: category.toUpperCase(), $options: 'i' },
          }).select('_id'),
        },
      }).populate('categoryId');
      return res.json(products);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
