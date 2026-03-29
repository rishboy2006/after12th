import { navigate, state } from '../app.js';

export function renderSplash() {
  const el = document.getElementById('screen-splash');
  el.innerHTML = `
    <div class="status-bar"></div>
    <div class="splash-logo">A12</div>
    <div class="splash-title">After12</div>
    <div class="splash-sub">Every entrance exam. Every deadline. Never miss what matters.</div>
    <div class="splash-actions">
      <button class="btn-primary" id="splash-start">Get Started — It's Free</button>
      <div class="splash-note">No account · Works offline · Updated annually</div>
    </div>
    <div class="splash-dots">
      <div class="splash-dot active"></div>
      <div class="splash-dot"></div>
      <div class="splash-dot"></div>
    </div>
  `;
  el.querySelector('#splash-start').addEventListener('click', () => {
    navigate(state.onboarded ? 'cards' : 'watchlist');
  });
}
