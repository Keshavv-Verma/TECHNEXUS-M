const { connectDB, disconnectDB, Product, Category } = require('../models');

const CATEGORY_MOBANDACCESS = 'MOBANDACCESS';
const CATEGORY_ELECTRONICS = 'ELECTRONICS';

const categories = [
  {
    name: CATEGORY_MOBANDACCESS,
    description: 'Mobile phones and accessories',
  },
  {
    name: CATEGORY_ELECTRONICS,
    description: 'Electronic devices and gadgets',
  },
];

// Product catalog recovered from the legacy MySQL/Prisma migration data.
// Legacy MOBILE and MOBILE_ACCESSORIES records are mapped to MOBANDACCESS,
// which is the category name used by the current React app.
const products = [
  {
    name: 'Samsung Galaxy M14 5G (ICY Silver, 6GB, 128GB Storage)',
    description: 'A powerful 5G smartphone with excellent performance.',
    price: 14990,
    rating: 4,
    image: 'https://m.media-amazon.com/images/I/81ZSn2rk9WL.AC_UY327_FMwebp_QL65.jpg',
    subcategory: 'Smartphone',
    stock: 50,
    categoryName: CATEGORY_MOBANDACCESS,
    createdAt: '2025-04-18T12:00:00Z',
    specifications: [
      { key: 'Display', value: '6.6 inch HD+ Display' },
      { key: 'Processor', value: 'Octa-core processor' },
      { key: 'RAM', value: '6GB' },
      { key: 'Storage', value: '128GB' },
      { key: 'Connectivity', value: '5G' },
    ],
  },
  {
    name: 'Zebronics Zeb-Transformer-M Wireless Keyboard Mouse Combo',
    description: 'Wireless keyboard and mouse combo for work and gaming.',
    price: 1099,
    rating: 4,
    image: 'https://m.media-amazon.com/images/I/61KZWPeNgHL.AC_UL480_FMwebp_QL65.jpg',
    subcategory: 'Keyboard & Mouse',
    stock: 32,
    categoryName: CATEGORY_ELECTRONICS,
    createdAt: '2024-12-10T09:30:00Z',
    specifications: [
      { key: 'Connectivity', value: 'Wireless 2.4GHz' },
      { key: 'Battery', value: 'AA batteries' },
      { key: 'Compatibility', value: 'Windows, Mac, Linux' },
      { key: 'Range', value: '10 meters' },
    ],
  },
  {
    name: 'Sounce Study from Home Kit with Webcam',
    description: 'Basic home setup kit for online learning.',
    price: 259,
    rating: 3,
    image: 'https://m.media-amazon.com/images/I/61+XjHbWrZL.AC_UL480_FMwebp_QL65.jpg',
    subcategory: 'Webcam Kit',
    stock: 87,
    categoryName: CATEGORY_ELECTRONICS,
    createdAt: '2024-12-27T10:20:00Z',
    specifications: [
      { key: 'Resolution', value: 'HD 720p' },
      { key: 'Connectivity', value: 'USB 2.0' },
      { key: 'Compatibility', value: 'Windows, Mac' },
      { key: 'Frame Rate', value: '30 fps' },
    ],
  },
  {
    name: 'Redmi 12C (Matte Black, 4GB RAM, 64GB Storage)',
    description: 'Affordable smartphone with essential features.',
    price: 8499,
    rating: 4,
    image: 'https://m.media-amazon.com/images/I/81YEyQqHjPL.AC_UY327_FMwebp_QL65.jpg',
    subcategory: 'Smartphone',
    stock: 60,
    categoryName: CATEGORY_MOBANDACCESS,
    createdAt: '2025-04-18T14:00:00Z',
    specifications: [
      { key: 'Display', value: '6.6 inch HD+ Display' },
      { key: 'Processor', value: 'Octa-core processor' },
      { key: 'RAM', value: '4GB' },
      { key: 'Storage', value: '64GB' },
      { key: 'Connectivity', value: '4G LTE' },
    ],
  },
  {
    name: 'OnePlus Nord CE 3 Lite 5G (Pastel Lime, 8GB RAM, 128GB Storage)',
    description: 'The OnePlus Nord CE 3 Lite offers a smooth 5G experience.',
    price: 19999,
    rating: 4,
    image: 'https://m.media-amazon.com/images/I/61QRgOgBx0L.AC_UY327_FMwebp_QL65.jpg',
    subcategory: 'Smartphone',
    stock: 30,
    categoryName: CATEGORY_MOBANDACCESS,
    createdAt: '2025-04-18T12:30:00Z',
    specifications: [
      { key: 'Display', value: '6.6 inch HD+ Display' },
      { key: 'Processor', value: 'Octa-core processor' },
      { key: 'RAM', value: '8GB' },
      { key: 'Storage', value: '128GB' },
      { key: 'Connectivity', value: '5G' },
    ],
  },
  {
    name: 'iQOO Z7s 5G by vivo (Norway Blue, 8GB RAM, 128GB Storage)',
    description: 'A 5G smartphone offering a smooth user experience.',
    price: 18999,
    rating: 4,
    image: 'https://m.media-amazon.com/images/I/61JS7lF2aqL.AC_UY327_FMwebp_QL65.jpg',
    subcategory: 'Smartphone',
    stock: 25,
    categoryName: CATEGORY_MOBANDACCESS,
    createdAt: '2025-04-18T13:30:00Z',
    specifications: [
      { key: 'Display', value: '6.6 inch HD+ Display' },
      { key: 'Processor', value: 'Octa-core processor' },
      { key: 'RAM', value: '8GB' },
      { key: 'Storage', value: '128GB' },
      { key: 'Connectivity', value: '5G' },
    ],
  },
  {
    name: 'I Phone 13 Pro max',
    description: 'IPhone',
    price: 94995,
    rating: 4,
    image: 'https://www.google.com/imgres?q=iphone%2013%20pro%20max&imgurl=https%3',
    subcategory: 'Smartphone',
    stock: 0,
    categoryName: CATEGORY_MOBANDACCESS,
    createdAt: '2025-05-13T02:55:24.363Z',
    specifications: [
      { key: 'Display', value: '6.6 inch HD+ Display' },
      { key: 'Processor', value: 'Octa-core processor' },
      { key: 'RAM', value: '4GB' },
      { key: 'Storage', value: '64GB' },
      { key: 'Connectivity', value: '4G LTE' },
    ],
  },
  {
    name: 'pc',
    description: 'pc',
    price: 100000,
    rating: 4,
    image: 'https://m.media-amazon.com/images/I/61-XXPIOivL._AC_UF1000,1000_QL80_.jpg',
    subcategory: 'Computer',
    stock: 0,
    categoryName: CATEGORY_MOBANDACCESS,
    createdAt: '2025-05-13T06:24:31.500Z',
    specifications: [],
  },
  {
    name: 'PC',
    description: 'pc',
    price: 1000000,
    rating: 4,
    image: 'https://media.istockphoto.com/id/506040816/photo/modern-desktop-pc-wit',
    subcategory: 'Computer',
    stock: 0,
    categoryName: CATEGORY_ELECTRONICS,
    createdAt: '2025-05-13T16:27:45.373Z',
    specifications: [],
  },
];

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function upsertCategory(categoryData) {
  const existingCategory = await Category.findOne({
    name: new RegExp(`^${escapeRegExp(categoryData.name)}$`, 'i'),
  });

  if (existingCategory) {
    existingCategory.name = categoryData.name;
    existingCategory.description = categoryData.description;
    await existingCategory.save();
    return existingCategory;
  }

  return Category.create(categoryData);
}

async function seedProducts() {
  const categoryMap = new Map();
  let created = 0;
  let updated = 0;

  await connectDB();

  for (const categoryData of categories) {
    const category = await upsertCategory(categoryData);
    categoryMap.set(category.name, category);
  }

  for (const productData of products) {
    const { categoryName, createdAt, ...productFields } = productData;
    const category = categoryMap.get(categoryName);

    if (!category) {
      throw new Error(`Missing category: ${categoryName}`);
    }

    const existingProduct = await Product.findOne({ name: productData.name });
    const data = {
      ...productFields,
      isActive: true,
      categoryId: category._id,
    };

    if (existingProduct) {
      await Product.updateOne({ _id: existingProduct._id }, { $set: data });
      updated += 1;
    } else {
      await Product.create({
        ...data,
        createdAt: new Date(createdAt),
      });
      created += 1;
    }
  }

  const seededNames = products.map(product => product.name);
  const seededTotal = await Product.countDocuments({ name: { $in: seededNames } });
  const totalProducts = await Product.countDocuments();

  console.log('Seed complete');
  console.log(`Categories upserted: ${categories.length}`);
  console.log(`Products created: ${created}`);
  console.log(`Products updated: ${updated}`);
  console.log(`Seeded products present: ${seededTotal}/${products.length}`);
  console.log(`Total products in MongoDB: ${totalProducts}`);
}

seedProducts()
  .catch(error => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
