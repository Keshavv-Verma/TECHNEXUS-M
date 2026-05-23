const { Address } = require('../models');
const { addressSchema } = require('../utils/validationSchemas');

const getAddresses = async (req, res) => {
  const addresses = await Address.find({ userId: req.user.userId }).sort({ isDefault: -1, updatedAt: -1 });
  res.json(addresses);
};

const createAddress = async (req, res, next) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    if (value.isDefault) {
      await Address.updateMany({ userId: req.user.userId }, { isDefault: false });
    }

    const count = await Address.countDocuments({ userId: req.user.userId });
    const isDefault = value.isDefault || count === 0;

    const address = await Address.create({
      ...value,
      userId: req.user.userId,
      isDefault,
    });

    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const address = await Address.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!address) return res.status(404).json({ error: 'Address not found' });

    if (value.isDefault) {
      await Address.updateMany({ userId: req.user.userId }, { isDefault: false });
    }

    Object.assign(address, value);
    await address.save();
    res.json(address);
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!address) return res.status(404).json({ error: 'Address not found' });

  if (address.isDefault) {
    const nextDefault = await Address.findOne({ userId: req.user.userId }).sort({ updatedAt: -1 });
    if (nextDefault) {
      nextDefault.isDefault = true;
      await nextDefault.save();
    }
  }

  res.json({ message: 'Address deleted' });
};

const setDefaultAddress = async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!address) return res.status(404).json({ error: 'Address not found' });

  await Address.updateMany({ userId: req.user.userId }, { isDefault: false });
  address.isDefault = true;
  await address.save();
  res.json(address);
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
