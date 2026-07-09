// Initialize Lucide Icons
if (window.lucide) {
  window.lucide.createIcons();
}

// Widget State Animator
const widgetOuterRing = document.getElementById('widget-outer-ring');
const widgetMicBtn = document.getElementById('widget-mic-btn');
const widgetMicIcon = document.getElementById('widget-mic-icon');
const widgetStatusText = document.getElementById('widget-status-text');
const widgetSubText = document.getElementById('widget-sub-text');
const widgetReadyBadge = document.getElementById('widget-ready-badge');
const widgetBadgeLabel = document.getElementById('widget-badge-label');
const wave1 = document.getElementById('wave-1');
const wave2 = document.getElementById('wave-2');

const promptVal = "Design a sleek layout leveraging architecture-grade glass elements and asymmetric margins...";

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function startWidgetAnimationCycle() {
  while (true) {
    // ── Phase 1: Idle ──
    setIdleState();
    await delay(3000);

    // ── Phase 2: Listening ──
    setListeningState();
    await delay(3000);

    // ── Phase 3: Processing / Typing ──
    await setProcessingState();
    await delay(2500);

    // ── Phase 4: Done / Injected ──
    setDoneState();
    await delay(3000);
  }
}

function setIdleState() {
  if (widgetOuterRing) widgetOuterRing.style.borderColor = 'rgba(0, 255, 153, 0.08)';
  if (widgetMicBtn) {
    widgetMicBtn.style.background = 'rgba(0, 255, 153, 0.06)';
    widgetMicBtn.style.borderColor = 'rgba(0, 255, 153, 0.25)';
    widgetMicBtn.style.color = '#00FF99';
    widgetMicBtn.style.boxShadow = '0 0 20px rgba(0, 255, 153, 0.15)';
  }
  if (widgetStatusText) widgetStatusText.innerText = 'Ready to Dictate';
  if (widgetSubText) widgetSubText.innerText = 'Press microphone or shortcut to speak';
  if (widgetReadyBadge) {
    widgetReadyBadge.style.background = 'rgba(0, 255, 153, 0.04)';
    widgetReadyBadge.style.borderColor = 'rgba(0, 255, 153, 0.15)';
  }
  if (widgetBadgeLabel) {
    widgetBadgeLabel.innerText = 'READY';
    widgetBadgeLabel.style.color = '#00FF99';
  }
  if (wave1) wave1.style.display = 'none';
  if (wave2) wave2.style.display = 'none';
}

function setListeningState() {
  if (widgetOuterRing) widgetOuterRing.style.borderColor = 'rgba(0, 255, 153, 0.22)';
  if (widgetMicBtn) {
    widgetMicBtn.style.background = 'rgba(0, 255, 153, 0.15)';
    widgetMicBtn.style.borderColor = '#00FF99';
    widgetMicBtn.style.boxShadow = '0 0 30px rgba(0, 255, 153, 0.45)';
  }
  if (widgetStatusText) widgetStatusText.innerText = 'Listening...';
  if (widgetSubText) widgetSubText.innerText = 'Hold hotkey and speak your thoughts';
  if (wave1) wave1.style.display = 'block';
  if (wave2) wave2.style.display = 'block';
}

async function setProcessingState() {
  if (wave1) wave1.style.display = 'none';
  if (wave2) wave2.style.display = 'none';
  if (widgetOuterRing) widgetOuterRing.style.borderColor = 'rgba(255, 255, 255, 0.04)';
  if (widgetMicBtn) {
    widgetMicBtn.style.background = 'rgba(255, 255, 255, 0.02)';
    widgetMicBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    widgetMicBtn.style.color = 'rgba(255, 255, 255, 0.4)';
    widgetMicBtn.style.boxShadow = 'none';
  }
  if (widgetStatusText) widgetStatusText.innerText = 'Optimizing prompt...';
  if (widgetReadyBadge) {
    widgetReadyBadge.style.background = 'rgba(167, 139, 250, 0.04)';
    widgetReadyBadge.style.borderColor = 'rgba(167, 139, 250, 0.15)';
  }
  if (widgetBadgeLabel) {
    widgetBadgeLabel.innerText = 'AI OPTIMIZING';
    widgetBadgeLabel.style.color = '#a78bfa';
  }

  // Type out text simulating streaming
  for (let i = 0; i <= promptVal.length; i++) {
    if (widgetSubText) {
      widgetSubText.innerText = promptVal.slice(0, i) + (i < promptVal.length ? '▊' : '');
    }
    await delay(20);
  }
}

function setDoneState() {
  if (widgetMicBtn) {
    widgetMicBtn.style.background = 'rgba(0, 255, 153, 0.08)';
    widgetMicBtn.style.borderColor = 'rgba(0, 255, 153, 0.3)';
    widgetMicBtn.style.color = '#00FF99';
    widgetMicBtn.style.boxShadow = '0 0 20px rgba(0, 255, 153, 0.2)';
  }
  if (widgetStatusText) widgetStatusText.innerText = 'Injected Successfully';
  if (widgetReadyBadge) {
    widgetReadyBadge.style.background = 'rgba(0, 255, 153, 0.04)';
    widgetReadyBadge.style.borderColor = 'rgba(0, 255, 153, 0.15)';
  }
  if (widgetBadgeLabel) {
    widgetBadgeLabel.innerText = 'SUCCESS';
    widgetBadgeLabel.style.color = '#00FF99';
  }
}

// Start animation on load
window.addEventListener('DOMContentLoaded', () => {
  startWidgetAnimationCycle();
});
