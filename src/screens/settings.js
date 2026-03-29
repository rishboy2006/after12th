import { navigate, state, saveState, showToast } from '../app.js';
import { bottomNav, attachBottomNav } from './card.js';

export function renderSettings() {
  const el = document.getElementById('screen-settings');
  const c = state.alert_contact;
  const p = state.profile;
  const watched = state.exams.filter(e => state.watchlist.has(e.id));

  el.innerHTML = `
    <div class="status-bar"></div>
    <div class="screen-head">
      <div class="h1">Settings</div>
    </div>
    <div class="scroll">
      <div style="padding:0 20px 20px">

        <div class="set-section">Student</div>
        <div class="set-card">
          <div class="set-row">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px">👨‍🎓</div>
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--text1)">${p.name || 'Student'}</div>
                <div style="font-size:11px;color:var(--text3)">Class XII · ${p.stream || 'PCM'}</div>
              </div>
            </div>
            <button class="btn-ghost" onclick="navigate('setup')">Edit</button>
          </div>
        </div>

        <div class="set-section">Alert Contact</div>
        <div class="set-card">
          <div class="set-row">
            <span class="sr-label">Name</span>
            <span class="sr-val">${c.name || 'Not set'}</span>
          </div>
          <div class="set-row">
            <span class="sr-label">Email</span>
            <span class="sr-val">${c.email || 'Not set'}</span>
          </div>
          <div class="set-row">
            <span class="sr-label">Mobile</span>
            <span class="sr-val">${c.phone || 'Not set'}</span>
          </div>
          <div class="set-row">
            <span class="sr-label">Alert timing</span>
            <span class="sr-val sr-accent">${c.days_before || 14} days before</span>
          </div>
          <a class="set-link" onclick="navigate('setup')">Edit alert settings →</a>
        </div>

        <div class="set-section">Watchlist (${watched.length} exam${watched.length !== 1 ? 's' : ''})</div>
        <div class="set-card">
          <div class="watchlist-chips">
            ${watched.map(e => `<div class="wchip" style="background:${e.brand_color}">${e.short_name}</div>`).join('')}
            ${watched.length === 0 ? '<div style="font-size:13px;color:var(--text3)">No exams added yet</div>' : ''}
          </div>
          <a class="set-link" onclick="navigate('watchlist')">Edit watchlist →</a>
        </div>

        <div class="set-section">Notifications</div>
        <div class="set-card">
          ${settingToggle('📧', 'Email', '', 'email')}
          ${settingToggle('💬', 'SMS', '', 'sms')}
          ${settingToggle('🔔', 'Push', 'In-app reminders', 'push')}
          <div class="toggle-row" style="opacity:0.35">
            <div class="left">
              <span class="icon">🟢</span>
              <div><div class="label-text">WhatsApp</div><div class="sub">Coming soon</div></div>
            </div>
            <button class="tog" disabled></button>
          </div>
        </div>

        <div class="set-section">About</div>
        <div class="set-card">
          <div class="set-row">
            <span class="sr-label">Version</span>
            <span class="sr-val">After12 v1.0</span>
          </div>
          <div class="set-row">
            <span class="sr-label">Data updated</span>
            <span class="sr-val">March 2026</span>
          </div>
          <div class="set-row" style="cursor:pointer" onclick="navigate('nios')">
            <span class="sr-label">PCM → NEET guide</span>
            <span class="sr-val sr-accent">View →</span>
          </div>
        </div>

        <div style="text-align:center;padding:12px 0">
          <button class="btn-ghost" style="color:var(--red);font-size:13px" id="reset-btn">Reset all data</button>
        </div>

        <div class="app-version">Exam dates verified March 2026 · Update annually</div>
      </div>
    </div>
    ${bottomNav('settings')}
  `;

  // Toggle handlers
  el.querySelectorAll('.tog[data-channel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.channel;
      state.channels[key] = !state.channels[key];
      btn.classList.toggle('on', state.channels[key]);
      saveState();
    });
  });

  el.querySelector('#reset-btn').addEventListener('click', () => {
    if (confirm('Reset all data? This clears your watchlist and settings.')) {
      localStorage.removeItem('after12_state');
      location.reload();
    }
  });

  attachBottomNav(el);
}

function settingToggle(icon, label, sub, key) {
  return `
    <div class="toggle-row">
      <div class="left">
        <span class="icon">${icon}</span>
        <div>
          <div class="label-text">${label}</div>
          ${sub ? `<div class="sub">${sub}</div>` : ''}
        </div>
      </div>
      <button class="tog ${state.channels[key] ? 'on' : ''}" data-channel="${key}"></button>
    </div>
  `;
}
