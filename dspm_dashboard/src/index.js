// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './setupSafeJson'; // JSON.parse 패치

const root = ReactDOM.createRoot(document.getElementById('root'));

// 개발모드 중복 useEffect 실행 방지: StrictMode 제거
root.render(<App />);

// 성능 측정 필요하면 함수 전달
reportWebVitals();
