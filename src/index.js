import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

document.documentElement.classList.remove('n3-loading');
document.body.classList.remove('n3-loading');