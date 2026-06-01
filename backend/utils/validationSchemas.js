const Joi = require('joi');

// User signup validation schema
const signupSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(12).max(128).messages({
    'string.min': 'Password must be at least 12 characters',
  }),
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const addressSchema = Joi.object({
  fullName: Joi.string().required().min(2).max(100),
  mobile: Joi.string().required().pattern(/^[6-9]\d{9}$/).messages({
    'string.pattern.base': 'Mobile must be a valid 10-digit Indian number',
  }),
  houseNo: Joi.string().required().min(1).max(100),
  street: Joi.string().required().min(2).max(200),
  city: Joi.string().required().min(2).max(100),
  state: Joi.string().required().min(2).max(100),
  pincode: Joi.string().required().pattern(/^\d{6}$/).messages({
    'string.pattern.base': 'Pincode must be 6 digits',
  }),
  country: Joi.string().default('India').max(100),
  isDefault: Joi.boolean().default(false),
});

const couponValidateSchema = Joi.object({
  code: Joi.string().required().trim(),
  subtotal: Joi.number().required().min(0),
});

const checkoutPreviewSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  couponCode: Joi.string().allow('', null).optional(),
});

const placeOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  addressId: Joi.string().required(),
  couponCode: Joi.string().allow('', null).optional(),
  paymentMethod: Joi.string()
    .valid('COD', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'STRIPE')
    .required(),
  paymentStatus: Joi.string().valid('PENDING', 'COMPLETED').default('PENDING'),
  stripeSessionId: Joi.string().allow('', null).optional(),
  stripePaymentIntentId: Joi.string().allow('', null).optional(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(12).max(128).messages({
    'string.min': 'New password must be at least 12 characters',
  }),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().required(),
  newPassword: Joi.string().required().min(12).max(128).messages({
    'string.min': 'New password must be at least 12 characters',
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  addressSchema,
  couponValidateSchema,
  checkoutPreviewSchema,
  placeOrderSchema,
  changePasswordSchema,
  resetPasswordSchema,
};

