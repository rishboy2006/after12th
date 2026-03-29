'use strict';

// ── STATE ──────────────────────────────────────────────────────────────────
const S = {
  exams: [],
  watchlist: [],
  contact: { name: '', guardianName: '', email: '', phone: '', alertDays: 14, stream: 'PCM' },
  channels: { push: true, sms: false, email: false },
  currentCard: 0,
  activeTab: 'exams',
  niosRoute: 'A',
  onboarded: false
};

const TODAY = new Date();
TODAY.setHours(0,0,0,0);

// ── STORAGE ────────────────────────────────────────────────────────────────
function save() {
  try {
    localStorage.setItem('after12_watchlist', JSON.stringify(S.watchlist));
    localStorage.setItem('after12_contact', JSON.stringify(S.contact));
    localStorage.setItem('after12_channels', JSON.stringify(S.channels));
    localStorage.setItem('after12_onboarded', '1');
  } catch(e) {}
}

function load() {
  try {
    const w = localStorage.getItem('after12_watchlist');
    const c = localStorage.getItem('after12_contact');
    const ch = localStorage.getItem('after12_channels');
    if (w) S.watchlist = JSON.parse(w);
    if (c) S.contact = { ...S.contact, ...JSON.parse(c) };
    if (ch) S.channels = { ...S.channels, ...JSON.parse(ch) };
    S.onboarded = !!localStorage.getItem('after12_onboarded');
  } catch(e) {}
}

// ── UTILS ──────────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0,0,0,0);
  return Math.ceil((d - TODAY) / 86400000);
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function urgencyClass(days, status) {
  if (status === 'closed') return 'closed';
  if (status === 'check_site') return 'soon';
  if (days === null || days < 0) return 'closed';
  if (days <= 14) return 'urgent';
  if (days <= 30) return 'soon';
  return 'ok';
}

function urgencyLabel(days, status) {
  if (status === 'closed') return 'CLOSED';
  if (status === 'check_site') return 'CHECK SITE';
  if (days === null || days < 0) return 'CLOSED';
  if (days === 0) return 'TODAY!';
  if (days <= 14) return 'URGENT';
  if (days <= 30) return 'SOON';
  return 'OPEN';
}

function el(id) { return document.getElementById(id); }
function qs(sel, parent) { return (parent || document).querySelector(sel); }

function timeStr() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function updateTimes() {
  document.querySelectorAll('.status-time').forEach(t => { t.textContent = timeStr(); });
}

// ── SCREEN NAVIGATION ─────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    if (s.id === 'screen-' + name) {
      s.classList.remove('hidden');
      s.classList.add('active');
    } else {
      s.classList.add('hidden');
      s.classList.remove('active');
    }
  });
}

// ── SPLASH ────────────────────────────────────────────────────────────────
function initSplash() {
  el('splash-start').addEventListener('click', () => {
    if (S.onboarded && S.watchlist.length > 0) {
      renderCards();
      showScreen('cards');
    } else {
      renderGrid();
      showScreen('watchlist');
    }
  });
}

// ── WATCHLIST GRID ────────────────────────────────────────────────────────
function renderGrid() {
  const grid = el('exam-grid');
  grid.innerHTML = '';
  S.exams.forEach(exam => {
    const on = S.watchlist.includes(exam.id);
    const tile = document.createElement('div');
    tile.className = 'exam-tile' + (on ? '' : ' off');
    tile.style.background = exam.brand_color;
    tile.style.borderColor = on ? exam.brand_color : 'transparent';
    tile.innerHTML = `
      <div class="exam-name-big">${exam.short_name}</div>
      <div class="exam-type-small">${exam.type}</div>
      ${on ? '<div class="tick">✓</div>' : ''}
    `;
    tile.addEventListener('click', () => toggleExam(exam.id, tile, exam));
    grid.appendChild(tile);
  });
  updateGridFooter();
}

function toggleExam(id, tile, exam) {
  const idx = S.watchlist.indexOf(id);
  if (idx >= 0) {
    S.watchlist.splice(idx, 1);
    tile.classList.add('off');
    tile.style.borderColor = 'transparent';
    const tick = tile.querySelector('.tick');
    if (tick) tick.remove();
  } else {
    S.watchlist.push(id);
    tile.classList.remove('off');
    tile.style.borderColor = exam.brand_color;
    if (!tile.querySelector('.tick')) {
      const t = document.createElement('div');
      t.className = 'tick'; t.textContent = '✓';
      tile.appendChild(t);
    }
  }
  updateGridFooter();
}

function updateGridFooter() {
  const n = S.watchlist.length;
  el('sel-count').textContent = n === 0 ? 'No exams selected' : `${n} exam${n > 1 ? 's' : ''} selected`;
  el('btn-continue').disabled = n === 0;
}

// ── SETUP FORM ────────────────────────────────────────────────────────────
function initSetup() {
  document.querySelectorAll('.stream-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.contact.stream = btn.dataset.stream;
      el('nios-row').style.display = S.contact.stream === 'PCM' ? 'flex' : 'none';
    });
  });

  document.querySelectorAll('.setup-tog').forEach(tog => {
    tog.addEventListener('click', () => {
      const key = tog.dataset.key;
      S.channels[key] = !S.channels[key];
      tog.className = 'tog setup-tog ' + (S.channels[key] ? 'on' : 'off');
    });
  });

  el('btn-save').addEventListener('click', () => {
    S.contact.name = el('inp-name').value.trim() || 'Student';
    S.contact.guardianName = el('inp-guardian').value.trim();
    S.contact.email = el('inp-email').value.trim();
    S.contact.phone = el('inp-phone').value.trim();
    S.contact.alertDays = parseInt(el('sel-days').value) || 14;
    save();
    renderCards();
    showScreen('cards');
  });

  el('nios-link-setup').addEventListener('click', () => {
    renderNios();
    showScreen('nios');
  });
}

// ── CARDS ────────────────────────────────────────────────────────────────
function getSortedWatchlist() {
  return S.watchlist
    .map(id => S.exams.find(e => e.id === id))
    .filter(Boolean)
    .sort((a, b) => {
      const da = daysUntil(a.app_display?.next_actionable_date);
      const db = daysUntil(b.app_display?.next_actionable_date);
      const sa = da === null ? 9999 : (da < 0 ? 9000 : da);
      const sb = db === null ? 9999 : (db < 0 ? 9000 : db);
      return sa - sb;
    });
}

function renderCards() {
  const list = getSortedWatchlist();
  if (list.length === 0) return;
  S.currentCard = 0;

  const scroll = el('card-scroll-area');
  const dots = el('card-dots');
  scroll.innerHTML = '';
  dots.innerHTML = '';

  list.forEach((exam, i) => {
    scroll.appendChild(buildCard(exam, i));
    const dot = document.createElement('div');
    dot.className = 'cdot' + (i === 0 ? ' active' : '');
    dot.id = 'cdot-' + i;
    dots.appendChild(dot);
  });

  let tx = 0;
  scroll.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  scroll.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) { dx < 0 ? nextCard() : prevCard(); }
  }, { passive: true });
}

function buildCard(exam, idx) {
  const ad = exam.app_display || {};
  const regDays = daysUntil(ad.next_actionable_date);
  const urg = urgencyClass(regDays, ad.registration_status);
  const urgLbl = urgencyLabel(regDays, ad.registration_status);
  const contact = exam.contact || {};

  const card = document.createElement('div');
  card.className = 'card' + (idx === 0 ? ' active' : ' next');
  card.id = 'card-' + idx;

  const daysDisplay = regDays === null ? '—' : regDays < 0 ? 'Passed' : regDays === 0 ? 'Today' : `${regDays}d`;
  const progressPct = Math.min(100, Math.max(5, regDays === null || regDays < 0 ? 100 : 100 - (regDays / 90 * 100)));
  const fillColor = urg === 'urgent' ? 'var(--red)' : urg === 'soon' ? 'var(--amber)' : urg === 'ok' ? 'var(--green)' : 'var(--text3)';
  const popPct = ((exam.popularity_score || 7) / 10 * 100).toFixed(0);

  const feeVal = exam.fees?.general || exam.fees?.general_male || exam.fees?.all_categories || exam.fees?.general_standard_courses;
  const feeSub = exam.fees?.sc_st ? `₹${exam.fees.sc_st} SC/ST` : exam.fees?.note || '';
  const passing = exam.qualifying?.passing_marks || '—';
  const attempts = exam.attempts?.max_total === null ? '∞' : exam.attempts?.max_per_year ? `${exam.attempts.max_per_year}/yr` : '—';

  card.innerHTML = `
    <div class="card-header">
      <div class="card-logo" style="background:${exam.brand_color}">${exam.short_name}</div>
      <div>
        <div class="card-name">${exam.short_name}</div>
        <div class="card-fullname">${exam.full_name}</div>
      </div>
      <div class="urgency-pill ${urg}">${urgLbl}</div>
    </div>
    <div class="info-grid">
      <div class="info-tile ${urg === 'urgent' || urg === 'soon' ? 'highlight' : ''}">
        <div class="itl">${ad.deadline_label || 'Reg. deadline'}</div>
        <div class="itv">${fmtDate(ad.registration_deadline)}</div>
        <div class="its">${ad.registration_status === 'closed' ? 'Registration closed' : ad.registration_status === 'open' ? 'Registration open' : 'Check official site'}</div>
      </div>
      <div class="info-tile">
        <div class="itl">App. fee</div>
        <div class="itv">${feeVal ? '₹' + feeVal : '—'}</div>
        <div class="its">${feeSub}</div>
      </div>
      <div class="info-tile">
        <div class="itl">Exam date</div>
        <div class="itv">${fmtDate(ad.exam_date)}</div>
      </div>
      <div class="info-tile">
        <div class="itl">Results</div>
        <div class="itv">${fmtDate(ad.result_date)}</div>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-tile">
        <div class="sv">${exam.exam_pattern?.total_marks || '—'}</div>
        <div class="sl">Total marks</div>
      </div>
      <div class="stat-tile">
        <div class="sv">${passing}</div>
        <div class="sl">Pass / cutoff</div>
      </div>
      <div class="stat-tile">
        <div class="sv">${attempts}</div>
        <div class="sl">Attempts</div>
      </div>
    </div>
    <div class="pop-row">
      <div class="pop-label">Popularity</div>
      <div class="pop-track"><div class="pop-fill" style="width:${popPct}%"></div></div>
      <div class="pop-score">${exam.popularity_score?.toFixed(1) || '—'}/10</div>
    </div>
    ${contact.helpline_phone ? `
    <div style="display:flex;flex-direction:column;gap:6px">
      <a class="contact-row" href="tel:${contact.helpline_phone[0].replace(/[\s-]/g,'')}">
        <div class="contact-icon">📞</div>
        <div><div class="contact-label">${contact.hours || 'Helpdesk'}</div><div class="contact-value">${contact.helpline_phone[0]}</div></div>
      </a>
      <a class="contact-row" href="mailto:${contact.email}">
        <div class="contact-icon">✉️</div>
        <div><div class="contact-label">Email</div><div class="contact-value">${contact.email}</div></div>
      </a>
    </div>` : ''}
    <div class="deadline-strip ${urg}">
      <div style="flex:1">
        <div class="dl-days ${urg}">${daysDisplay}</div>
        <div class="dl-sub">${ad.next_actionable_label || 'until next deadline'}</div>
        <div class="dl-progress"><div class="dl-fill" style="width:${progressPct}%;background:${fillColor}"></div></div>
      </div>
      <div class="dl-emoji">${urg === 'urgent' ? '⚠️' : urg === 'soon' ? '📌' : urg === 'ok' ? '✅' : '🔒'}</div>
    </div>
  `;
  return card;
}

function showCard(idx) {
  const list = getSortedWatchlist();
  list.forEach((_, i) => {
    const c = el('card-' + i);
    const d = el('cdot-' + i);
    if (!c) return;
    c.className = 'card' + (i === idx ? ' active' : i < idx ? ' prev' : ' next');
    if (d) d.className = 'cdot' + (i === idx ? ' active' : '');
  });
}

function nextCard() {
  const max = getSortedWatchlist().length - 1;
  if (S.currentCard < max) { S.currentCard++; showCard(S.currentCard); }
}

function prevCard() {
  if (S.currentCard > 0) { S.currentCard--; showCard(S.currentCard); }
}

// ── ALERTS ────────────────────────────────────────────────────────────────
function renderAlerts() {
  const list = el('alert-list');
  const sorted = getSortedWatchlist();
  if (sorted.length === 0) {
    list.innerHTML = '<div class="alert-empty">No exams in your watchlist.<br>Add some to see deadlines here.</div>';
    return;
  }
  list.innerHTML = sorted.map(exam => {
    const ad = exam.app_display || {};
    const days = daysUntil(ad.next_actionable_date);
    const urg = urgencyClass(days, ad.registration_status);
    const daysStr = days === null ? '—' : days < 0 ? 'Done' : days === 0 ? '0' : String(days);
    const feeVal = exam.fees?.general || exam.fees?.all_categories || exam.fees?.general_male || '';
    const feeStr = feeVal ? '₹' + feeVal : '';
    const marks = exam.exam_pattern?.total_marks ? exam.exam_pattern.total_marks + ' marks' : '';
    return `<div class="alert-item">
      <div class="alert-logo" style="background:${exam.brand_color}">${exam.short_name}</div>
      <div>
        <div class="alert-name">${exam.short_name}</div>
        <div class="alert-detail">${ad.next_actionable_label || ad.deadline_label || ''}</div>
        <div class="alert-extra">${[feeStr, marks].filter(Boolean).join(' · ')}</div>
      </div>
      <div class="alert-days">
        <div class="alert-num ${urg}">${daysStr}${days !== null && days > 0 ? '<span style="font-size:11px;font-weight:400">d</span>' : ''}</div>
        <div class="alert-unit">${days !== null && days < 0 ? 'passed' : days === null ? '' : 'left'}</div>
      </div>
    </div>`;
  }).join('');
}

// ── NIOS ──────────────────────────────────────────────────────────────────
function renderNios() {
  const niosData = window._niosData;
  if (!niosData) return;
  const route = niosData.two_routes[S.niosRoute === 'A' ? 'route_a' : 'route_b'];
  const steps = niosData.step_by_step_for_pcm_student;
  const warnings = niosData.important_warnings;

  el('nios-steps').innerHTML = steps.map(s => `
    <div class="step-card">
      <div class="step-num">${s.step}</div>
      <div>
        <div class="step-action">${s.action}</div>
        <div class="step-detail">${s.detail}</div>
        ${s.tip ? `<div class="step-tip">💡 ${s.tip}</div>` : ''}
      </div>
    </div>`).join('');

  el('nios-route-detail').innerHTML = `
    <div class="info-tile" style="margin-bottom:8px">
      <div class="itl">Approximate fee</div>
      <div class="itv">₹${route.fees?.total_approx || '—'}</div>
      <div class="its">${route.fees?.note || ''}</div>
    </div>
    <div style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:8px">${route.description}</div>
    ${(route.how_to_apply || []).map((step, i) => `
      <div style="display:flex;gap:8px;margin-bottom:6px">
        <div style="width:18px;height:18px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--accent);flex-shrink:0;margin-top:1px">${i+1}</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.5">${step}</div>
      </div>`).join('')}`;

  el('nios-warnings').innerHTML = warnings.map(w => `
    <div class="warning-card ${w.level}">
      <div class="warning-icon">${w.level === 'critical' ? '⚠️' : w.level === 'important' ? '❗' : 'ℹ️'}</div>
      <div>
        <div class="warning-title">${w.warning}</div>
        <div class="warning-text">${w.detail}</div>
      </div>
    </div>`).join('');

  const c = niosData.contact;
  el('nios-contact').innerHTML = `
    <a class="contact-row" href="tel:18001809393">
      <div class="contact-icon">📞</div>
      <div><div class="contact-label">NIOS Helpline (Toll Free)</div><div class="contact-value">${c.nios_helpline}</div></div>
    </a>
    <a class="contact-row" href="mailto:${c.nios_email_admissions}" style="margin-top:6px">
      <div class="contact-icon">✉️</div>
      <div><div class="contact-label">Admissions</div><div class="contact-value">${c.nios_email_admissions}</div></div>
    </a>`;
}

// ── SETTINGS ──────────────────────────────────────────────────────────────
function renderSettings() {
  const c = S.contact;
  el('set-profile-name').textContent = c.name || 'Student';
  el('set-profile-sub').textContent = (c.stream || 'PCM') + ' · Class XII';
  el('set-guardian').textContent = c.guardianName || '—';
  el('set-email').textContent = c.email || '—';
  el('set-phone').textContent = c.phone || '—';
  el('set-days').textContent = (c.alertDays || 14) + ' days before';
  ['push','sms','email'].forEach(key => {
    const tog = el('tog-' + key);
    if (tog) tog.className = 'tog ' + (S.channels[key] ? 'on' : 'off');
  });
  el('watchlist-pills').innerHTML = S.watchlist.map(id => {
    const exam = S.exams.find(e => e.id === id);
    return exam ? `<div class="watch-pill" style="background:${exam.brand_color}">${exam.short_name}</div>` : '';
  }).join('');
  document.querySelectorAll('.set-stream-btn').forEach(btn => {
    btn.className = 'stream-btn set-stream-btn' + (btn.dataset.stream === (c.stream || 'PCM') ? ' active' : '');
  });
}

// ── TAB NAVIGATION ────────────────────────────────────────────────────────
function switchTab(tab) {
  S.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'exams') { renderCards(); showScreen('cards'); }
  else if (tab === 'alerts') { renderAlerts(); showScreen('alerts'); }
  else if (tab === 'settings') { renderSettings(); showScreen('settings'); }
}

// ── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  load();
  updateTimes();
  setInterval(updateTimes, 30000);

  try {
    const res = await fetch('data/exams.json');
    const data = await res.json();
    S.exams = data.exams;
    window._niosData = data.nios_biology_route;
  } catch(e) {
    console.error('Failed to load exam data:', e);
  }

  // Splash
  initSplash();

  // Watchlist
  el('btn-continue').addEventListener('click', () => { save(); initSetup(); showScreen('setup'); });

  // Setup
  initSetup();

  // Card nav
  el('btn-prev').addEventListener('click', prevCard);
  el('btn-next').addEventListener('click', nextCard);
  el('btn-edit').addEventListener('click', () => { renderGrid(); showScreen('watchlist'); });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // NIOS route toggle
  document.querySelectorAll('.route-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.route-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.niosRoute = btn.dataset.route;
      renderNios();
    });
  });

  // NIOS back button
  el('btn-back-nios').addEventListener('click', () => { renderSettings(); showScreen('settings'); });

  // Settings links
  el('edit-watchlist-link').addEventListener('click', () => { renderGrid(); showScreen('watchlist'); });
  el('nios-link').addEventListener('click', () => { renderNios(); showScreen('nios'); });

  // Settings toggles
  ['push','sms','email'].forEach(key => {
    el('tog-' + key)?.addEventListener('click', () => {
      S.channels[key] = !S.channels[key];
      el('tog-' + key).className = 'tog ' + (S.channels[key] ? 'on' : 'off');
      save();
    });
  });

  // Settings stream buttons
  document.querySelectorAll('.set-stream-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.set-stream-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.contact.stream = btn.dataset.stream;
      save();
      renderSettings();
    });
  });

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Show splash
  showScreen('splash');
}

window.addEventListener('load', init);