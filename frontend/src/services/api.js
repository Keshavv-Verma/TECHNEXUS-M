import axios from 'axios';

const DEFAULT_CATEGORY_IMAGE =
  'https://m.media-amazon.com/images/I/61KZWPeNgHL.AC_UL480_FMwebp_QL65.jpg';

/** Avoid https://host//api/... when REACT_APP_API_URL has a trailing slash */
export const getApiBaseUrl = () => {
  const raw = (process.env.REACT_APP_API_URL || 'http://localhost:5000').trim();
  return raw.replace(/\/+$/, '');
};

export const joinApiUrl = (path = '') => {
  const base = getApiBaseUrl();
  const normalizedPath = `/${String(path).replace(/^\/+/, '')}`;
  return `${base}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1');
};

const toStrapiMedia = (url) => ({
  data: [
    {
      attributes: {
        url: url || DEFAULT_CATEGORY_IMAGE,
      },
    },
  ],
});

export const toStrapiProduct = (product) => {
  if (!product) return null;
  const category = product.category || product.categoryId;
  const categoryId =
    category && typeof category === 'object' ? category._id || category.id : category;
  const categoryName =
    category && typeof category === 'object' ? category.name : undefined;

  return {
    id: product._id || product.id,
    attributes: {
      title: product.name,
      name: product.name,
      price: product.price,
      desc: product.description,
      description: product.description,
      rating: product.rating,
      stock: product.stock,
      img: toStrapiMedia(product.image),
      quantity: product.quantity || 1,
      categories: {
        data: categoryId
          ? [
              {
                id: categoryId,
                attributes: {
                  title: categoryName || 'Category',
                  name: categoryName,
                },
              },
            ]
          : [],
      },
    },
  };
};

export const toStrapiCategory = (category) => ({
  id: category._id || category.id,
  attributes: {
    title: category.name,
    name: category.name,
    description: category.description,
    img: {
      data: {
        attributes: {
          url: category.image || DEFAULT_CATEGORY_IMAGE,
        },
      },
    },
  },
});

export const normalizeApiResponse = (url, data) => {
  if (!url) return data;

  const path = url.split('?')[0];

  if (path.includes('/api/categories')) {
    const list = Array.isArray(data) ? data : [];
    return { data: list.map(toStrapiCategory) };
  }

  const singleProductMatch = path.match(/\/api\/products\/([^/]+)$/);
  if (singleProductMatch && data && !Array.isArray(data)) {
    return { data: [toStrapiProduct(data)] };
  }

  if (path.includes('/api/products')) {
    const list = Array.isArray(data) ? data : [];
    return { data: list.map(toStrapiProduct) };
  }

  return data;
};

export const fetchDataFromApi = async (url) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const { data } = await axios.get(joinApiUrl(url), { headers });
    return normalizeApiResponse(url, data);
  } catch (error) {
    console.error('API request failed:', error?.response?.status, url, error?.message);
    throw error;
  }
};

export const makePaymentRequest = axios.create({
  baseURL: getApiBaseUrl(),
});
