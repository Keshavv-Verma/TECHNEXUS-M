export const getProductId = (product) =>
  product?.id || product?._id || product?.productId;

export const normalizeCartItem = (product, quantity = 1) => {
  const id = String(getProductId(product));
  return {
    id,
    _id: id,
    name: product.name,
    price: product.price,
    image: product.image,
    stock: product.stock ?? 99,
    quantity,
  };
};

export const loadCart = () => {
  try {
    const raw = JSON.parse(localStorage.getItem('cart')) || [];
    return raw.map((item) => {
      const productId = item.productId || item.id || item._id;
      return {
        ...item,
        id: String(productId),
        productId: String(productId),
        stock: item.stock ?? 99,
      };
    });
  } catch {
    return [];
  }
};

let cartUpdateTimer = null;

export const saveCart = (items, { silent = false } = {}) => {
  localStorage.setItem('cart', JSON.stringify(items));
  if (!silent) {
    if (cartUpdateTimer) {
      clearTimeout(cartUpdateTimer);
    }
    cartUpdateTimer = window.setTimeout(() => {
      window.dispatchEvent(new Event('cartUpdated'));
      cartUpdateTimer = null;
    }, 100);
  }
};

export const getCartCount = (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
