import React, { useState } from 'react';

const INITIAL = {
  fullName: '',
  mobile: '',
  houseNo: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  isDefault: false,
};

const AddressForm = ({ initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ ...INITIAL, ...initial });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Valid 10-digit mobile required';
    if (!form.houseNo.trim()) e.houseNo = 'Required';
    if (!form.street.trim()) e.street = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group full">
          <label>Full Name</label>
          <input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
          {errors.fullName && <div className="error">{errors.fullName}</div>}
        </div>
        <div className="form-group">
          <label>Mobile Number</label>
          <input value={form.mobile} onChange={(e) => handleChange('mobile', e.target.value)} maxLength={10} />
          {errors.mobile && <div className="error">{errors.mobile}</div>}
        </div>
        <div className="form-group">
          <label>Pincode</label>
          <input value={form.pincode} onChange={(e) => handleChange('pincode', e.target.value)} maxLength={6} />
          {errors.pincode && <div className="error">{errors.pincode}</div>}
        </div>
        <div className="form-group full">
          <label>House / Flat Number</label>
          <input value={form.houseNo} onChange={(e) => handleChange('houseNo', e.target.value)} />
          {errors.houseNo && <div className="error">{errors.houseNo}</div>}
        </div>
        <div className="form-group full">
          <label>Street / Area</label>
          <input value={form.street} onChange={(e) => handleChange('street', e.target.value)} />
          {errors.street && <div className="error">{errors.street}</div>}
        </div>
        <div className="form-group">
          <label>City</label>
          <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
          {errors.city && <div className="error">{errors.city}</div>}
        </div>
        <div className="form-group">
          <label>State</label>
          <input value={form.state} onChange={(e) => handleChange('state', e.target.value)} />
          {errors.state && <div className="error">{errors.state}</div>}
        </div>
        <div className="form-group full">
          <label>Country</label>
          <input value={form.country} onChange={(e) => handleChange('country', e.target.value)} />
        </div>
        <div className="form-group full">
          <label>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
            />{' '}
            Set as default address
          </label>
        </div>
      </div>
      <div className="checkout-nav">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
          Save Address
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
