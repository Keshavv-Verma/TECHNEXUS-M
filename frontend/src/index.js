import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import { getApiBaseUrl } from './services/api';

axios.defaults.baseURL = getApiBaseUrl();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

