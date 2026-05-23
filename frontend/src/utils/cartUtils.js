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
    return raw.map((item) => ({
      ...item,
      id: String(item.id || item._id),
      stock: item.stock ?? 99,
    }));
  } catch {
    return [];
  }
};

export const saveCart = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartCount = (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
