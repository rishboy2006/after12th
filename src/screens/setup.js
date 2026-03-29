import { navigate, state, saveState, showToast } from '../app.js';

export function renderSetup() {
  const el = document.getElementById('screen-setup');
  const c = state.alert_contact;
  const p = state.profile;
  const ch = state.channels;

  el.innerHTML = `
    <div class="status-bar"></div>
    <div class="screen-head">
      <button class="back" id="setup-back">‹ Back</button>
      <div class="h1">Alert Setup</div>
      <div class="body" style="margin-top:4px">Who gets notified as deadlines near?</div>
    </div>
    <div class="scroll">
      <div style="padding:0 20px 20px">
        <div class="section-title">Student</div>
        <div class="input-group">
          <label>Your name</label>
          <input type="text" id="inp-student-name" placeholder="e.g. Arjun Sharma" value="${p.name || ''}"/>
        </div>
        <div class="input-group">
          <label>Stream</label>
          <select id="inp-stream">
            <option value="PCM" ${p.stream==='PCM'?'selected':''}>PCM — Physics, Chemistry, Maths</option>
            <option value="PCB" ${p.stream==='PCB'?'selected':''}>PCB — Physics, Chemistry, Biology</option>
            <option value="PCMB" ${p.stream==='PCMB'?'selected':''}>PCMB — All four subjects</option>
          </select>
        </div>

        <div class="section-title">Alert Contact (Parent / Guardian)</div>
        <div class="input-group">
          <label>Name</label>
          <input type="text" id="inp-contact-name" placeholder="e.g. Priya Sharma (Mum)" value="${c.name || ''}"/>
        </div>
        <div class="input-group">
          <label>Email</label>
          <input type="email" id="inp-contact-email" placeholder="parent@email.com" value="${c.email || ''}"/>
        </div>
        <div class="input-group">
          <label>Mobile</label>
          <input type="tel" id="inp-contact-phone" placeholder="+91 98765 43210" value="${c.phone || ''}"/>
        </div>
        <div class="input-group">
          <label>Alert me how early?</label>
          <select id="inp-days">
            <option value="30" ${c.days_before===30?'selected':''}>30 days before deadline</option>
            <option value="14" ${c.days_before===14?'selected':''}>14 days before deadline</option>
            <option value="7"  ${c.days_before===7?'selected':''}>7 days before deadline</option>
            <option value="3"  ${c.days_before===3?'selected':''}>3 days before deadline</option>
          </select>
        </div>

        <div class="section-title">Alert Channels</div>
        <div class="channel-card">
          ${channelRow('📧', 'Email alerts', 'Sent to contact email', 'email', ch.email)}
          ${channelRow('💬', 'SMS alerts', 'Text to contact mobile', 'sms', ch.sms)}
          ${channelRow('🔔', 'Push notifications', 'In-app reminders', 'push', ch.push)}
          <div class="toggle-row" style="opacity:0.4">
            <div class="left">
              <span class="icon">🟢</span>
              <div>
                <div class="label-text">WhatsApp</div>
                <div class="sub">Coming soon</div>
              </div>
            </div>
            <button class="tog" disabled></button>
          </div>
        </div>

        <div style="margin-top:20px">
          <button class="btn-primary" id="setup-save">Save &amp; Start Tracking</button>
        </div>
      </div>
    </div>
  `;

  // Toggle handlers
  el.querySelectorAll('.tog[data-channel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ch_key = btn.dataset.channel;
      state.channels[ch_key] = !state.channels[ch_key];
      btn.classList.toggle('on', state.channels[ch_key]);
    });
  });

  el.querySelector('#setup-back').addEventListener('click', () => navigate('watchlist'));

  el.querySelector('#setup-save').addEventListener('click', () => {
    const name = el.querySelector('#inp-student-name').value.trim();
    const cname = el.querySelector('#inp-contact-name').value.trim();
    const email = el.querySelector('#inp-contact-email').value.trim();

    if (!cname || !email) {
      showToast('Please add contact name and email');
      return;
    }

    state.profile.name = name;
    state.profile.stream = el.querySelector('#inp-stream').value;
    state.alert_contact.name = cname;
    state.alert_contact.email = email;
    state.alert_contact.phone = el.querySelector('#inp-contact-phone').value.trim();
    state.alert_contact.days_before = parseInt(el.querySelector('#inp-days').value);
    state.onboarded = true;
    saveState();
    showToast('✓ Saved! Tracking your exams.');
    navigate('cards');
  });
}

function channelRow(icon, label, sub, key, active) {
  return `
    <div class="toggle-row">
      <div class="left">
        <span class="icon">${icon}</span>
        <div>
          <div class="label-text">${label}</div>
          <div class="sub">${sub}</div>
        </div>
      </div>
      <button class="tog ${active ? 'on' : ''}" data-channel="${key}"></button>
    </div>
  `;
}
