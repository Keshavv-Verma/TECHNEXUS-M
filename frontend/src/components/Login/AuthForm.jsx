import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '../../utils/authUtils';
import { joinApiUrl } from '../../services/api';
import './AuthForm.css';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.redirect || '/';

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      name: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send required fields based on isLogin
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      if (!isLogin && formData.password.length < 12) {
        alert('Password must be at least 12 characters');
        return;
      }

      const apiUrl = joinApiUrl(`/api/${isLogin ? 'login' : 'signup'}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          clearAuth();
          localStorage.setItem('token', data.token);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('isAdmin', String(data.isAdmin));
          if (data.userId) localStorage.setItem('userId', data.userId);
          localStorage.setItem('currentUser', JSON.stringify({
            username: formData.email,
            userId: data.userId,
          }));
          clearForm();
          navigate(redirectPath);
          window.location.reload(); // Force reload to update navbar
        } else {
          clearForm();
          setIsLogin(true);
          alert('Registration successful! Please login.');
        }
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      alert('Authentication failed: ' + error.message);
    }
  };

  useEffect(() => {
    clearForm();
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-left-panel">
          <h1>TechNexus</h1>
          <p>Your Gateway to Premium Tech</p>
        </div>
        <div className="auth-right-panel">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            
            {!isLogin && (
              <div className="form-group">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="form-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder={isLogin ? 'Password' : 'Password (min. 12 characters)'}
                value={formData.password}
                onChange={handleChange}
                minLength={isLogin ? undefined : 12}
                required
              />
            </div>
            
            <button type="submit" className="auth-button">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            
            <p className="auth-switch" onClick={() => setIsLogin(!isLogin)}>
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Login"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;