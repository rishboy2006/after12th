import { navigate, state, daysUntil, fmtDate, urgencyColors, urgencyClass } from '../app.js';
import { bottomNav, attachBottomNav } from './card.js';

export function renderAlerts() {
  const el = document.getElementById('screen-alerts');

  const watched = state.exams
    .filter(e => state.watchlist.has(e.id))
    .map(e => ({ ...e, days: daysUntil(e.app_display?.next_actionable_date) }))
    .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

  const c = state.alert_contact;
  const hasContact = c.email || c.phone;

  el.innerHTML = `
    <div class="status-bar"></div>
    <div class="screen-head">
      <div class="h1">Deadlines</div>
      <div class="body" style="margin-top:4px">
        ${hasContact ? `Alerts → ${c.name || c.email}` : 'Set up alerts in Settings'}
      </div>
    </div>
    <div class="scroll">
      <div style="padding:0 20px">
        ${watched.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">🔔</div>
            <div class="empty-title">No exams in watchlist</div>
            <div class="empty-body">Add exams on the Exams tab</div>
          </div>
        ` : watched.map(exam => alertItem(exam)).join('')}

        ${watched.length > 0 && hasContact ? `
          <div style="text-align:center;padding:16px 0 4px;font-size:12px;color:var(--text3)">
            Email alerts sent ${state.alert_contact.days_before || 14} days before each deadline
          </div>
          <button class="btn-primary" id="send-test-alert" style="margin:8px 0 20px">
            Send Test Alert to ${c.email || c.phone}
          </button>
        ` : ''}

        ${!hasContact ? `
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin:10px 0 20px">
            <div style="font-size:13px;font-weight:700;color:var(--text1);margin-bottom:4px">Set up alerts</div>
            <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Add a contact email or phone to receive deadline reminders</div>
            <button class="btn-primary" onclick="navigate('settings')">Go to Settings →</button>
          </div>
        ` : ''}
      </div>
    </div>
    ${bottomNav('alerts')}
  `;

  el.querySelector('#send-test-alert')?.addEventListener('click', sendTestAlert);
  attachBottomNav(el);
}

function alertItem(exam) {
  const ad = exam.app_display || {};
  const u = urgencyColors(urgencyClass(exam.days));
  return `
    <div class="alert-item">
      <div class="alert-logo" style="background:${exam.brand_color}">${exam.short_name}</div>
      <div style="flex:1">
        <div class="alert-name">${exam.full_name}</div>
        <div class="alert-detail">${ad.next_actionable_label || 'Next deadline'} · ${fmtDate(ad.next_actionable_date || ad.registration_deadline)}</div>
        <div class="alert-meta">${exam.exam_pattern?.total_marks ? exam.exam_pattern.total_marks + ' marks' : ''} ${exam.attempts?.max_per_year ? '· ' + exam.attempts.max_per_year + '/yr' : ''}</div>
      </div>
      <div class="alert-days">
        <div class="ad" style="color:${u.color}">${exam.days !== null ? (exam.days > 0 ? exam.days + 'd' : 'Due') : '—'}</div>
        <div class="as">left</div>
      </div>
    </div>
  `;
}

async function sendTestAlert() {
  const btn = document.getElementById('send-test-alert');
  if (!btn) return;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const c = state.alert_contact;
  try {
    const res = await fetch('/.netlify/functions/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: c.email,
        to_name: c.name,
        student_name: state.profile.name,
        subject: 'After12 — Test Alert',
        message: 'This is a test alert from After12. Your deadline tracking is set up correctly! 🎉',
        is_test: true
      })
    });
    if (res.ok) {
      btn.textContent = '✓ Test alert sent!';
      setTimeout(() => { btn.textContent = `Send Test Alert to ${c.email}`; btn.disabled = false; }, 3000);
    } else {
      throw new Error('Send failed');
    }
  } catch(e) {
    btn.textContent = 'Failed — check Netlify function setup';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = `Send Test Alert to ${c.email}`; }, 3000);
  }
}
