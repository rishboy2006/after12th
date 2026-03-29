import { navigate, state } from '../app.js';
import { bottomNav, attachBottomNav } from './card.js';

export function renderNios() {
  const el = document.getElementById('screen-nios');
  const route = state.nios_route;

  el.innerHTML = `
    <div class="status-bar"></div>
    <div class="screen-head">
      <div class="h1">PCM → NEET</div>
      <div class="body" style="margin-top:4px">How to qualify for NEET as a PCM student</div>
    </div>
    <div class="scroll">
      <div id="nios-content">
        <div class="loading"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>
      </div>
    </div>
    ${bottomNav('nios')}
  `;

  attachBottomNav(el);

  if (!route) {
    el.querySelector('#nios-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-title">Loading data...</div>
      </div>`;
    return;
  }

  const steps = route.step_by_step_for_pcm_student || [];
  const warnings = route.important_warnings || [];
  const c = route.contact || {};

  el.querySelector('#nios-content').innerHTML = `
    <div style="padding:0 20px 20px">

      <!-- Hero -->
      <div class="nios-hero">
        <div style="font-size:13px;font-weight:700;color:#22C55E;margin-bottom:6px">✓ Yes — PCM students can appear for NEET</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6">${route.summary?.what || ''}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:8px">Subject: Biology (Code 314) · NIOS Sr. Secondary · Includes practical exam</div>
      </div>

      <!-- Warnings -->
      ${warnings.map(w => `
        <div class="warning-box" style="background:${{critical:'#FF4D4D18',important:'#FFB02018',info:'#6C63FF18'}[w.level]||'#ffffff10'};border:1px solid ${{critical:'#FF4D4D44',important:'#FFB02044',info:'#6C63FF44'}[w.level]||'#ffffff20'}">
          <div class="wi">${{critical:'⚠️',important:'📌',info:'ℹ️'}[w.level]||'•'}</div>
          <div>
            <div class="wt" style="color:${{critical:'#FF4D4D',important:'#FFB020',info:'#6C63FF'}[w.level]||'var(--text1)'}">${w.warning}</div>
            <div class="wb">${w.detail}</div>
          </div>
        </div>
      `).join('')}

      <!-- Two routes -->
      <div class="section-title" style="margin-top:16px">How to add Biology</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px">
          <div style="font-size:12px;font-weight:700;color:var(--text1);margin-bottom:4px">📋 Public Exam</div>
          <div style="font-size:11px;color:var(--text2);line-height:1.5">Register Apr/May or Oct/Nov session. More centres across India.</div>
          <div style="font-size:11px;color:var(--accent2);margin-top:6px">Fee: ~₹1,450</div>
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px">
          <div style="font-size:12px;font-weight:700;color:var(--text1);margin-bottom:4px">⚡ On-Demand</div>
          <div style="font-size:11px;color:var(--text2);line-height:1.5">Appear any month (except Apr/May/Oct/Nov). Result in 45 days.</div>
          <div style="font-size:11px;color:var(--accent2);margin-top:6px">Fee: ~₹850</div>
        </div>
      </div>

      <!-- Steps -->
      <div class="section-title">Step-by-step guide</div>
      <div style="background:var(--surface);border-radius:14px;border:1px solid var(--border);padding:8px 14px">
        ${steps.map(step => `
          <div class="nios-step">
            <div class="step-num">${step.step}</div>
            <div>
              <div class="step-title">${step.action}</div>
              <div class="step-body">${step.detail}</div>
              ${step.tip ? `<div class="step-tip">💡 ${step.tip}</div>` : ''}
              ${step.fee ? `<div style="font-size:11px;color:var(--accent2);margin-top:3px">Fee: ₹${step.fee}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Contact NIOS -->
      <div class="section-title" style="margin-top:16px">Contact NIOS</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="contact-tile" data-action="call" data-val="${c.nios_helpline?.replace(/\D/g,'').replace(/^/,'+91') || '18001809393'}">
          <div class="ct-icon">📞</div>
          <div>
            <div class="ct-label">Helpline (toll free)</div>
            <div class="ct-val">${c.nios_helpline || '1800-180-9393'}</div>
          </div>
        </div>
        <div class="contact-tile" data-action="email" data-val="${c.nios_email_admissions || 'lsc@nios.ac.in'}">
          <div class="ct-icon">✉️</div>
          <div>
            <div class="ct-label">Email</div>
            <div class="ct-val" style="font-size:11px">${c.nios_email_admissions || 'lsc@nios.ac.in'}</div>
          </div>
        </div>
      </div>
      <div class="contact-tile" style="margin-top:8px" data-action="url" data-val="${c.official_site || 'https://www.nios.ac.in'}">
        <div class="ct-icon">🌐</div>
        <div>
          <div class="ct-label">NIOS official site</div>
          <div class="ct-val">www.nios.ac.in</div>
        </div>
      </div>
      <div class="contact-tile" style="margin-top:8px" data-action="url" data-val="${c.admissions_portal || 'https://sdmis.nios.ac.in'}">
        <div class="ct-icon">📝</div>
        <div>
          <div class="ct-label">Admissions portal</div>
          <div class="ct-val">sdmis.nios.ac.in</div>
        </div>
      </div>

      <div style="height:16px"></div>
    </div>
  `;

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
}
