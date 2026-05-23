/**
 * Keyword-based product matching and fallback recommendations when Gemini is unavailable.
 */

const CATEGORY_ALIASES = {
  laptop: ['laptop', 'notebook', 'macbook', 'surface', 'thinkpad', 'spectre', 'xps', 'rog', 'razer', 'imac'],
  gaming: ['gaming', 'rog', 'razer', 'blade', 'gpu', 'rtx', 'gtx'],
  smartphone: ['phone', 'smartphone', 'mobile', 'iphone', 'galaxy', 'pixel', 'oneplus', 'redmi'],
  headphones: ['headphone', 'headphones', 'earbud', 'earbuds', 'audio', 'wh-1000', 'bose', 'skullcandy'],
  tv: ['tv', 'television', 'oled', '4k', 'display'],
  tablet: ['tablet', 'ipad', 'tab '],
  camera: ['camera', 'nikon', 'drone', 'dji'],
  keyboard: ['keyboard', 'keychron', 'corsair k'],
  mouse: ['mouse', 'mx master'],
  monitor: ['monitor', 'display', 'ultrawide', 'proart'],
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'with', 'under', 'below', 'best', 'good', 'need', 'want',
  'looking', 'find', 'show', 'me', 'some', 'any', 'budget', 'cheap', 'affordable',
]);

/** Strip emojis and normalize query text */
const normalizeQuery = (query) =>
  query
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/[₹$€£]/g, ' ')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/** Extract max budget from phrases like "under 70000" or "under ₹70,000" */
const extractMaxPrice = (query) => {
  const normalized = normalizeQuery(query);
  const underMatch = normalized.match(/(?:under|below|max|upto|up to|less than)\s*(\d+(?:\.\d+)?)/);
  if (underMatch) return parseFloat(underMatch[1]);

  const priceMatch = normalized.match(/(\d{4,}(?:\.\d+)?)/);
  return priceMatch ? parseFloat(priceMatch[1]) : null;
};

const getSearchTerms = (query) => {
  const normalized = normalizeQuery(query);
  return normalized
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

const detectProductTypes = (query) => {
  const normalized = normalizeQuery(query);
  const types = [];

  for (const [type, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      types.push(type);
    }
  }

  if (normalized.includes('laptop') || (normalized.includes('gaming') && normalized.includes('pc'))) {
    if (!types.includes('laptop')) types.unshift('laptop');
  }

  return types;
};

const productSearchText = (product) =>
  `${product.name || ''} ${product.description || ''} ${product.subcategory || ''}`.toLowerCase();

const matchesProductType = (product, types) => {
  if (types.length === 0) return true;

  const text = productSearchText(product);
  const aliases = types.flatMap((type) => CATEGORY_ALIASES[type] || []);

  return aliases.some((alias) => text.includes(alias));
};

const scoreProduct = (product, terms, types, maxPrice) => {
  const text = productSearchText(product);
  let score = 0;

  for (const term of terms) {
    if (text.includes(term)) score += 3;
  }

  if (matchesProductType(product, types)) score += 5;

  if (types.includes('laptop') && /keyboard|mouse|earbud|buds|headphone|powerbank|webcam/i.test(text)) {
    score -= 8;
  }

  if (types.includes('laptop') && /laptop|macbook|surface|thinkpad|spectre|xps|rog|razer blade|imac/i.test(text)) {
    score += 6;
  }

  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price);
  if (maxPrice && !Number.isNaN(price)) {
    if (price <= maxPrice) score += 4;
    else if (price <= maxPrice * 1.15) score += 2;
    else score -= 3;
  }

  if (product.stock > 0) score += 1;
  score += (product.rating || 4) * 0.5;

  return score;
};

/**
 * Rank products by relevance to the user query.
 */
const rankProductsForQuery = (query, products, limit = 25) => {
  const terms = getSearchTerms(query);
  const types = detectProductTypes(query);
  const maxPrice = extractMaxPrice(query);

  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, terms, types, maxPrice),
    }))
    .filter(({ score, product }) => score > 0 || matchesProductType(product, types))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return products.slice(0, limit);
  }

  return scored.slice(0, limit).map(({ product }) => product);
};

const formatPrice = (price) => {
  if (typeof price !== 'number' || Number.isNaN(price)) return String(price);
  if (price >= 1000) return `₹${price.toLocaleString('en-IN')}`;
  return `$${price}`;
};

const buildWhyReasons = (product, query, maxPrice) => {
  const reasons = [];
  const text = productSearchText(product);
  const types = detectProductTypes(query);

  if (types.includes('laptop') && /laptop|macbook|surface|rog|razer|thinkpad|spectre|xps/i.test(text)) {
    reasons.push('Matches your laptop search from our catalog');
  } else if (types.includes('gaming') && /gaming|rog|razer/i.test(text)) {
    reasons.push('Gaming-oriented product in our store');
  } else {
    reasons.push('Closest match in our catalog for your query');
  }

  const price = product.price;
  if (maxPrice && typeof price === 'number') {
    if (price <= maxPrice) {
      reasons.push(`Within your budget at ${formatPrice(price)}`);
    } else {
      reasons.push(`Slightly above budget (${formatPrice(price)}) but best available option`);
    }
  } else {
    reasons.push(`Priced at ${formatPrice(price)}`);
  }

  reasons.push(`Rated ${product.rating || 4}/5 with ${product.stock || 0} in stock`);

  return reasons.slice(0, 3);
};

/**
 * Build structured recommendations without calling Gemini.
 */
const buildFallbackRecommendations = (query, products) => {
  const maxPrice = extractMaxPrice(query);
  const ranked = rankProductsForQuery(query, products, 10);

  if (ranked.length === 0) {
    return { success: false, statusCode: 404, error: 'No matching products found for your query' };
  }

  const top = ranked[0];
  const alternatives = ranked.slice(1, 9).map((product) => ({
    productName: product.name,
    reason: buildWhyReasons(product, query, maxPrice)[0],
    price: formatPrice(product.price),
    rating: product.rating || 4,
    productId: String(product._id),
  }));

  const budgetNote = maxPrice
    ? ` (budget up to ${formatPrice(maxPrice)})`
    : '';

  return {
    success: true,
    data: {
      recommendation: {
        productName: top.name,
        why: buildWhyReasons(top, query, maxPrice),
        price: formatPrice(top.price),
        rating: top.rating || 4,
        stock: top.stock || 0,
        productId: String(top._id),
      },
      alternatives,
      verdict: `Based on our catalog${budgetNote}, ${top.name} is the best match for "${query.trim()}".`,
    },
    source: 'fallback',
  };
};

const findProductByName = (products, name) => {
  if (!name || !products?.length) return null;
  const normalized = name.trim().toLowerCase();
  return (
    products.find((p) => p.name?.toLowerCase() === normalized) ||
    products.find(
      (p) =>
        p.name?.toLowerCase().includes(normalized) ||
        normalized.includes(p.name?.toLowerCase() || '')
    )
  );
};

const MAX_ALTERNATIVES = 8;

/**
 * Ensure productIds are set and pad alternatives from ranked catalog matches.
 */
const enrichRecommendations = (raw, query, products) => {
  if (!raw?.recommendation) return raw;

  const maxPrice = extractMaxPrice(query);
  const ranked = rankProductsForQuery(query, products, 15);
  const resolveId = (name, fallback) => {
    const match = findProductByName(products, name);
    return String(match?._id || fallback || '');
  };

  const recommendation = { ...raw.recommendation };
  if (!recommendation.productId && recommendation.productName) {
    recommendation.productId = resolveId(recommendation.productName, ranked[0]?._id);
  }

  let alternatives = (raw.alternatives || []).map((alt) => ({
    ...alt,
    productId: alt.productId || resolveId(alt.productName, ''),
    rating: alt.rating ?? 4,
  })).filter((alt) => alt.productId && alt.productName);

  const topId = recommendation.productId;
  const usedIds = new Set([topId, ...alternatives.map((a) => a.productId)]);

  for (const product of ranked) {
    if (alternatives.length >= MAX_ALTERNATIVES) break;
    const id = String(product._id);
    if (usedIds.has(id)) continue;
    usedIds.add(id);
    alternatives.push({
      productName: product.name,
      reason: buildWhyReasons(product, query, maxPrice)[0],
      price: formatPrice(product.price),
      rating: product.rating || 4,
      productId: id,
    });
  }

  return {
    recommendation,
    alternatives: alternatives.slice(0, MAX_ALTERNATIVES),
    verdict: raw.verdict || `We recommend ${recommendation.productName} for your search.`,
  };
};

module.exports = {
  normalizeQuery,
  extractMaxPrice,
  rankProductsForQuery,
  buildFallbackRecommendations,
  enrichRecommendations,
};
