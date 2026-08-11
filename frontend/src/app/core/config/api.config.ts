// Configura aquí la URL de tu backend desplegado en Render.com
// Si estás en localhost, usará automáticamente http://localhost:8080
export const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080'
  : 'https://taskflow-backend-7dpl.onrender.com';
