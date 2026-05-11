// Showcase site interactive layer
// - Fetch latest snapshot.json from Mac Mini cron
// - Populate Hero last-sync + last-update footer
// - Populate 5 worker heartbeats in core-infra section
// - Populate 24h event feed
// - Toggle [展開技術細節] sections (placeholder for Phase 2 deep content)

(async function () {
  try {
    const res = await fetch('assets/snapshot.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`snapshot 讀取失敗 (${res.status})`);
    const data = await res.json();

    // ── Hero: last sync + footer last update ──
    const lastSync = document.getElementById('last-sync');
    if (lastSync && data.last_sync) lastSync.textContent = data.last_sync;

    const lastUpdate = document.getElementById('last-update');
    if (lastUpdate && data.last_sync) lastUpdate.textContent = data.last_sync;

    // ── 5 worker heartbeats (in #core-infra section) ──
    if (Array.isArray(data.workers)) {
      data.workers.forEach((w) => {
        const card = document.querySelector(`[data-worker="${w.name}"]`);
        if (card) {
          const hb = card.querySelector('.heartbeat');
          if (hb) hb.textContent = `🟢 ${w.uptime_days} 天 · ${w.last_heartbeat}`;
        }
      });
    }

    // ── 24h event feed ──
    const feed = document.getElementById('events-feed');
    if (feed && Array.isArray(data.recent_events)) {
      feed.innerHTML = data.recent_events.map(e => {
        const color = e.level === 'warn' ? 'var(--warning)' : 'var(--success)';
        return `<div class="event-row">
          <span class="event-ago" style="color:${color}">${escapeHTML(e.ago)}</span>
          <span class="event-source">${escapeHTML(e.source)}</span>
          <span>${escapeHTML(e.msg)}</span>
        </div>`;
      }).join('');
    }

    // ── Hook stats（如果 hook section 有 mount point） ──
    const hookSummary = document.getElementById('hook-summary');
    if (hookSummary && data.hook_stats) {
      const s = data.hook_stats;
      hookSummary.innerHTML = `<strong>${s.registered}</strong> 註冊<br/><span class="muted">過去 7 天觸發 <strong style="color:var(--success)">${s.active_7d}</strong> 條活躍</span>`;
    }
  } catch (err) {
    console.warn('[showcase] snapshot fetch failed:', err);
    // Graceful degradation: 留 hardcode 預設值,不破壞頁面
  }
})();

// ── Onboarding banner dismiss ──
document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('onboarding-banner');
  if (!banner) return;

  if (localStorage.getItem('onboarding_dismissed') === '1') {
    banner.classList.add('hidden');
  }

  document.getElementById('onboarding-dismiss')?.addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem('onboarding_dismissed', '1');
  });
});

// ── Toggle [展開技術細節] — 真實 expand/collapse ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.detail-toggle, .expand-hint').forEach(t => {
    t.addEventListener('click', e => {
      e.preventDefault();
      const targetId = t.getAttribute('data-toggle');
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
          target.hidden = !target.hidden;
          // 更新箭頭符號 ▼ ↔ ▲
          t.textContent = target.hidden
            ? t.textContent.replace('▲', '▼')
            : t.textContent.replace('▼', '▲');
          return;
        }
      }
      // fallback: detail-toggle 沒 data-toggle 屬性時
      alert('技術細節（完整圖）規劃中、Phase 4 補入');
    });
  });
});

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
