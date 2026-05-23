const mysql = require('mysql2/promise');
const { connectDB, disconnectDB, Product, Category } = require('../models');
require('dotenv').config();

const MYSQL_URL = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;

const categoryNameAliases = {
  MOBILE: 'MOBANDACCESS',
  MOBILE_ACCESSORIES: 'MOBANDACCESS',
};

function getMysqlConnectionConfig() {
  if (MYSQL_URL && MYSQL_URL.startsWith('mysql://')) {
    return MYSQL_URL;
  }

  return {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Anonymous435.',
    database: process.env.MYSQL_DB || 'technexus',
  };
}

function normalizeCategoryName(name) {
  const normalized = String(name || 'UNCATEGORIZED').trim().toUpperCase();
  return categoryNameAliases[normalized] || normalized;
}

function toBoolean(value, fallback = true) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query('SHOW TABLES LIKE ?', [tableName]);
  return rows.length > 0;
}

async function loadSpecifications(connection) {
  if (!(await tableExists(connection, 'product_specifications'))) {
    return new Map();
  }

  const [specs] = await connection.query('SELECT * FROM product_specifications');
  const specsByProductId = new Map();

  for (const spec of specs) {
    const productId = String(spec.productId);
    const productSpecs = specsByProductId.get(productId) || [];

    productSpecs.push({
      key: String(spec.key || '').trim(),
      value: String(spec.value || '').trim(),
    });

    specsByProductId.set(productId, productSpecs);
  }

  return specsByProductId;
}

async function upsertCategories(connection) {
  const [mysqlCategories] = await connection.query('SELECT * FROM categories');
  const categoryMap = new Map();
  let created = 0;
  let updated = 0;

  for (const mysqlCategory of mysqlCategories) {
    const legacyMysqlId = String(mysqlCategory.id);
    const name = normalizeCategoryName(mysqlCategory.name);

    let category = await Category.findOne({ legacyMysqlId });

    if (!category) {
      category = await Category.findOne({ name });
    }

    if (category) {
      category.name = name;
      category.description = mysqlCategory.description || category.description || null;
      category.legacyMysqlId = legacyMysqlId;
      await category.save();
      updated += 1;
    } else {
      category = await Category.create({
        name,
        description: mysqlCategory.description || null,
        legacyMysqlId,
      });
      created += 1;
    }

    categoryMap.set(legacyMysqlId, category._id);
  }

  return { categoryMap, sourceCount: mysqlCategories.length, created, updated };
}

async function findExistingProduct(mysqlProduct) {
  const legacyMysqlId = String(mysqlProduct.id);
  const byLegacyId = await Product.findOne({ legacyMysqlId });

  if (byLegacyId) {
    return byLegacyId;
  }

  return Product.findOne({
    name: mysqlProduct.name,
    $or: [{ legacyMysqlId: null }, { legacyMysqlId: { $exists: false } }],
  });
}

async function migrateProducts() {
  let mysqlConnection;

  try {
    console.log('Starting MySQL product migration into MongoDB');

    mysqlConnection = await mysql.createConnection(getMysqlConnectionConfig());
    console.log('MySQL connected');

    await connectDB();
    console.log('MongoDB connected');

    const categories = await upsertCategories(mysqlConnection);
    console.log(`Categories read from MySQL: ${categories.sourceCount}`);
    console.log(`Categories created: ${categories.created}`);
    console.log(`Categories updated: ${categories.updated}`);

    const [mysqlProducts] = await mysqlConnection.query('SELECT * FROM products ORDER BY createdAt ASC');
    const specsByProductId = await loadSpecifications(mysqlConnection);

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const mysqlProduct of mysqlProducts) {
      try {
        const legacyMysqlId = String(mysqlProduct.id);
        const categoryId = categories.categoryMap.get(String(mysqlProduct.categoryId));

        if (!categoryId) {
          throw new Error(`categoryId ${mysqlProduct.categoryId} was not found in migrated categories`);
        }

        const productData = {
          name: mysqlProduct.name,
          description: mysqlProduct.description || null,
          price: Number(mysqlProduct.price),
          rating: mysqlProduct.rating === null || mysqlProduct.rating === undefined
            ? 4.0
            : Number(mysqlProduct.rating),
          image: mysqlProduct.image,
          subcategory: mysqlProduct.subcategory || null,
          stock: Number(mysqlProduct.stock || 0),
          isActive: toBoolean(mysqlProduct.isActive, true),
          categoryId,
          specifications: specsByProductId.get(legacyMysqlId) || [],
          legacyMysqlId,
        };

        const existingProduct = await findExistingProduct(mysqlProduct);

        if (existingProduct) {
          await Product.updateOne({ _id: existingProduct._id }, { $set: productData });
          updated += 1;
        } else {
          await Product.create({
            ...productData,
            createdAt: mysqlProduct.createdAt || new Date(),
          });
          created += 1;
        }
      } catch (error) {
        failed += 1;
        console.log(`Failed: ${mysqlProduct.name} - ${error.message}`);
      }
    }

    const migratedTotal = await Product.countDocuments({
      legacyMysqlId: { $in: mysqlProducts.map(product => String(product.id)) },
    });
    const totalProducts = await Product.countDocuments();

    console.log('Migration complete');
    console.log(`Products read from MySQL: ${mysqlProducts.length}`);
    console.log(`Products created: ${created}`);
    console.log(`Products updated: ${updated}`);
    console.log(`Products failed: ${failed}`);
    console.log(`Migrated products present: ${migratedTotal}/${mysqlProducts.length}`);
    console.log(`Total products in MongoDB: ${totalProducts}`);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('MySQL disconnected');
    }

    await disconnectDB();
    console.log('MongoDB disconnected');
  }
}

migrateProducts().catch(error => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
