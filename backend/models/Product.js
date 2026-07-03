const mongoose = require('mongoose');

function addCategoryAlias(ret) {
  const cat = ret.categoryId;
  if (cat && typeof cat === 'object' && cat.name != null) {
    ret.category = cat;
  }
  return ret;
}

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    subcategory: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    legacyMysqlId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        return addCategoryAlias(ret);
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret) {
        return addCategoryAlias(ret);
      },
    },
  }
);

// Indexes for performance
productSchema.index({ categoryId: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId'
});

module.exports = mongoose.model('Product', productSchema);
