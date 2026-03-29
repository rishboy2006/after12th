import { navigate, state, daysUntil, fmtDate, urgencyClass, urgencyColors, showToast } from '../app.js';

let touchStartX = 0;
let currentIdx = 0;

export function renderCards() {
  const el = document.getElementById('screen-cards');
  const watchedExams = getWatchedExams();

  if (watchedExams.length === 0) {
    el.innerHTML = `
      <div class="status-bar"></div>
      ${bottomNav('cards')}
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No exams in watchlist</div>
        <div class="empty-body">Go to Settings to add exams to your watchlist</div>
        <button class="btn-primary" style="width:180px;margin-top:8px" onclick="navigate('watchlist')">Add Exams</button>
      </div>
    `;
    return;
  }

  currentIdx = Math.min(currentIdx, watchedExams.length - 1);

  el.innerHTML = `
    <div class="status-bar"></div>
    <div class="card-topbar">
      <button class="btn-ghost" id="card-edit">Edit list</button>
      <div class="dots" id="card-dots">${watchedExams.map((_, i) =>
        `<div class="card-dot ${i === currentIdx ? 'active' : ''}"></div>`
      ).join('')}</div>
      <button class="btn-ghost" id="card-next">Next ›</button>
    </div>
    <div class="card-viewport" id="card-viewport">
      ${watchedExams.map((exam, i) => buildCard(exam, i, currentIdx)).join('')}
    </div>
    <div class="swipe-hint">Swipe or tap Next · Sorted by deadline</div>
    ${bottomNav('cards')}
  `;

  // Navigation
  el.querySelector('#card-edit').addEventListener('click', () => navigate('watchlist'));
  el.querySelector('#card-next').addEventListener('click', () => gotoCard(currentIdx + 1, watchedExams));

  // Touch swipe
  const viewport = el.querySelector('#card-viewport');
  viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -50) gotoCard(currentIdx + 1, watchedExams);
    else if (dx > 50) gotoCard(currentIdx - 1, watchedExams);
  });

  // Contact tap handlers
  el.querySelectorAll('.contact-tile[data-action]').forEach(tile => {
    tile.addEventListener('click', () => {
      const action = tile.dataset.action;
      const val = tile.dataset.val;
      if (action === 'call') window.location.href = `tel:${val}`;
      else if (action === 'email') window.location.href = `mailto:${val}`;
      else if (action === 'url') window.open(val, '_blank');
    });
  });

  attachBottomNav(el);
}

function getWatchedExams() {
  return state.exams
    .filter(e => state.watchlist.has(e.id))
    .sort((a, b) => {
      const da = daysUntil(a.app_display?.next_actionable_date) ?? 9999;
      const db = daysUntil(b.app_display?.next_actionable_date) ?? 9999;
      return da - db;
    });
}

function gotoCard(idx, exams) {
  if (idx < 0 || idx >= exams.length) return;
  const cards = document.querySelectorAll('.exam-card');
  cards.forEach((c, i) => {
    c.className = 'exam-card ' + (i === idx ? 'active' : i < idx ? 'prev' : 'next');
  });
  document.querySelectorAll('.card-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
  currentIdx = idx;
}

function buildCard(exam, idx, currentIdx) {
  const ad = exam.app_display || {};
  const contact = exam.contact || {};
  const days = daysUntil(ad.next_actionable_date);
  const regDays = daysUntil(ad.registration_deadline);
  const cls = urgencyClass(days);
  const u = urgencyColors(cls);
  const status = ad.registration_status || 'unknown';

  const statusDot = { open: '#22C55E', closed: '#FF4D4D', check_site: '#FFB020' }[status] || '#606060';
  const statusLabel = { open: 'Registration open', closed: 'Registration closed', check_site: 'Check official site' }[status] || 'Unknown';

  const progPct = days !== null && days > 0 ? Math.min(100, Math.max(5, (1 - days/90) * 100)) : 100;

  const posClass = idx === currentIdx ? 'active' : idx < currentIdx ? 'prev' : 'next';

  return `
    <div class="exam-card ${posClass}" data-exam="${exam.id}">
      <!-- Header -->
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="card-logo" style="background:${exam.brand_color}">${exam.short_name}</div>
          <div>
            <div class="card-name">${exam.full_name}</div>
            <div class="card-full">${exam.official_name}</div>
          </div>
        </div>
        <div class="urgency-badge" style="background:${u.bg};color:${u.color}">${u.label?.toUpperCase()}</div>
      </div>

      <!-- Registration status -->
      <div class="reg-status-bar" style="background:${statusDot}18;border:1px solid ${statusDot}44">
        <div class="reg-status-dot" style="background:${statusDot}"></div>
        <div>
          <div class="reg-status-text" style="color:${statusDot}">${statusLabel}</div>
          <div class="reg-status-note">${ad.registration_note || ''}</div>
        </div>
      </div>

      <!-- Dates grid -->
      <div class="info-grid">
        <div class="info-tile">
          <div class="itl">Reg. deadline</div>
          <div class="itv">${fmtDate(ad.registration_deadline)}</div>
          <div class="its">${regDays !== null ? (regDays > 0 ? `${regDays}d left` : 'Passed') : ''}</div>
        </div>
        <div class="info-tile">
          <div class="itl">App. fee</div>
          <div class="itv">${exam.fees ? (exam.fees.general || exam.fees.all_categories ? '₹' + (exam.fees.general || exam.fees.all_categories) : exam.fees.note || '—') : '—'}</div>
          <div class="its">${exam.fees?.note || ''}</div>
        </div>
        <div class="info-tile">
          <div class="itl">Exam date</div>
          <div class="itv">${fmtDate(ad.exam_date)}</div>
          <div class="its">${daysUntil(ad.exam_date) !== null && daysUntil(ad.exam_date) > 0 ? daysUntil(ad.exam_date) + 'd away' : ''}</div>
        </div>
        <div class="info-tile">
          <div class="itl">Results</div>
          <div class="itv">${fmtDate(ad.result_date)}</div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-tile">
          <div class="sv">${exam.exam_pattern?.total_marks || '—'}</div>
          <div class="sl">Total marks</div>
        </div>
        <div class="stat-tile">
          <div class="sv">${exam.qualifying?.passing_marks || '—'}</div>
          <div class="sl">Pass / cutoff</div>
        </div>
        <div class="stat-tile">
          <div class="sv">${exam.attempts?.max_per_year ? exam.attempts.max_per_year + '/yr' : exam.attempts?.max_total ? exam.attempts.max_total + '×' : '∞'}</div>
          <div class="sl">Attempts</div>
        </div>
      </div>

      <!-- Popularity -->
      <div class="pop-row">
        <div class="pop-label">Popularity</div>
        <div class="pop-bar-wrap">
          <div class="pop-bar-fill" style="width:${(exam.popularity_score || 5) * 10}%"></div>
        </div>
        <div class="pop-score">${exam.popularity_score || '—'} / 10</div>
      </div>

      <!-- Contact -->
      ${contact.helpline_phone ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="contact-tile" data-action="call" data-val="${contact.helpline_phone[0]}">
            <div class="ct-icon">📞</div>
            <div>
              <div class="ct-label">Helpline</div>
              <div class="ct-val">${contact.helpline_phone[0]}</div>
              <div class="ct-hours">${contact.hours || ''}</div>
            </div>
          </div>
          <div class="contact-tile" data-action="email" data-val="${contact.email || ''}">
            <div class="ct-icon">✉️</div>
            <div>
              <div class="ct-label">Email</div>
              <div class="ct-val" style="font-size:11px">${contact.email || '—'}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Official site -->
      <div class="contact-tile" data-action="url" data-val="${exam.official_site}">
        <div class="ct-icon">🌐</div>
        <div>
          <div class="ct-label">Official site</div>
          <div class="ct-val">${exam.official_site?.replace('https://','')}</div>
        </div>
      </div>

      <!-- PCM NEET pathway hint -->
      ${exam.id === 'NEET' && state.profile.stream === 'PCM' ? `
        <div style="background:#006B3C18;border:1px solid #006B3C44;border-radius:10px;padding:10px 12px;cursor:pointer" onclick="window.navigateToNios && window.navigateToNios()">
          <div style="font-size:12px;font-weight:700;color:#22C55E">PCM student? You can still appear for NEET →</div>
          <div style="font-size:11px;color:#a0bfaa;margin-top:3px">Add Biology via NIOS and become eligible. Tap to learn how.</div>
        </div>
      ` : ''}

      <!-- Deadline strip -->
      <div class="deadline-strip" style="background:${u.bg};color:${u.color}">
        <div style="flex:1">
          <div class="dl-days">${days !== null ? (days > 0 ? days + ' days' : 'Passed') : '—'}</div>
          <div class="dl-sub">${ad.next_actionable_label || 'until next deadline'}</div>
          <div class="dl-prog-wrap">
            <div class="dl-prog-fill" style="width:${progPct}%;background:${u.prog}"></div>
          </div>
        </div>
        <div style="font-size:26px">${{ urgent:'⚠️', soon:'📌', ok:'✅', closed:'🔒' }[cls] || ''}</div>
      </div>
    </div>
  `;
}

export function bottomNav(active) {
  return `
    <div class="bottom-nav">
      <button class="nav-btn ${active==='cards'?'active':''}" data-screen="cards">
        <div class="nav-icon">📋</div><div class="nav-label">Exams</div>
      </button>
      <button class="nav-btn ${active==='alerts'?'active':''}" data-screen="alerts">
        <div class="nav-icon">🔔</div><div class="nav-label">Alerts</div>
      </button>
      <button class="nav-btn ${active==='nios'?'active':''}" data-screen="nios">
        <div class="nav-icon">🧬</div><div class="nav-label">NIOS</div>
      </button>
      <button class="nav-btn ${active==='settings'?'active':''}" data-screen="settings">
        <div class="nav-icon">⚙️</div><div class="nav-label">Settings</div>
      </button>
    </div>
  `;
}

export function attachBottomNav(el) {
  el.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.screen));
  });
  // expose navigateToNios globally for the NEET card hint
  window.navigateToNios = () => navigate('nios');
}
