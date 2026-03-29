import { navigate, state, saveState } from '../app.js';

export function renderWatchlist() {
  const el = document.getElementById('screen-watchlist');

  function render() {
    el.innerHTML = `
      <div class="status-bar"></div>
      <div class="screen-head">
        <div class="h1">Your Exams</div>
        <div class="body" style="margin-top:4px">Tap to add to your watchlist</div>
      </div>
      <div class="scroll">
        <div class="exam-grid" id="exam-grid"></div>
      </div>
      <div class="grid-foot">
        <div class="sel-count" id="sel-count">${state.watchlist.size} exam${state.watchlist.size !== 1 ? 's' : ''} selected</div>
        <button class="btn-primary" id="watchlist-next" ${state.watchlist.size === 0 ? 'disabled' : ''}>Continue →</button>
      </div>
    `;

    const grid = el.querySelector('#exam-grid');
    state.exams.forEach(exam => {
      const selected = state.watchlist.has(exam.id);
      const box = document.createElement('div');
      box.className = `exam-box${selected ? '' : ' off'}`;
      box.style.background = exam.brand_color;
      box.style.borderColor = selected ? exam.brand_color : 'rgba(255,255,255,0.12)';
      box.innerHTML = `
        <div class="ename">${exam.short_name}</div>
        <div class="etype">${exam.type}</div>
        ${selected ? '<div class="tick">✓</div>' : ''}
      `;
      box.addEventListener('click', () => {
        if (state.watchlist.has(exam.id)) {
          state.watchlist.delete(exam.id);
        } else {
          state.watchlist.add(exam.id);
        }
        saveState();
        render();
      });
      grid.appendChild(box);
    });

    el.querySelector('#watchlist-next').addEventListener('click', () => {
      navigate('setup');
    });
  }

  render();
}
