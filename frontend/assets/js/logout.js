// frontend/assets/js/logout.js
import { logout } from './auth.js';

export function attachLogoutButton(selector = '#logout-btn') {
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.addEventListener('click', () => logout('/pages/login.html'));
}
