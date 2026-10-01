/**
 * Auto Tablet / Desktop Viewport Controller
 * Automatically sets mobile devices to Tablet/Desktop layout (1024px) upon entry,
 * with optional toggle switch between Desktop and Mobile modes.
 */
(function() {
  var TARGET_WIDTH = 1024;
  var STORAGE_KEY = 'lawyer_viewport_mode';

  function isMobileScreen() {
    var sw = window.screen ? (window.screen.width || window.screen.availWidth) : window.innerWidth;
    var sh = window.screen ? (window.screen.height || window.screen.availHeight) : window.innerHeight;
    var minDim = Math.min(sw || 1024, sh || 1024);
    var ua = navigator.userAgent || '';
    var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return isMobileUA || minDim < TARGET_WIDTH;
  }

  function getStoredMode() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}
  }

  function applyViewport(mode) {
    var activeMode = mode || getStoredMode() || 'desktop'; // Default to desktop/tablet view
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }

    if (activeMode === 'desktop' && isMobileScreen()) {
      var currentW = window.innerWidth || (window.screen ? window.screen.width : 390);
      var scale = currentW > 0 ? (currentW / TARGET_WIDTH) : 0.38;
      if (scale > 1.0) scale = 1.0;
      if (scale < 0.25) scale = 0.25;

      meta.setAttribute(
        'content',
        'width=' + TARGET_WIDTH + ', initial-scale=' + scale.toFixed(4) + ', minimum-scale=' + (scale * 0.5).toFixed(4) + ', maximum-scale=3.0, user-scalable=yes'
      );
      document.documentElement.classList.add('tablet-desktop-mode');
    } else {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
      document.documentElement.classList.remove('tablet-desktop-mode');
    }

    updateUI(activeMode);
  }

  function updateUI(currentMode) {
    var btn = document.getElementById('viewport-mode-toggle');
    if (!btn) return;
    if (currentMode === 'desktop') {
      btn.innerHTML = '<i class="fa-solid fa-desktop text-amber-400"></i><span>وضع الكمبيوتر / التابلت (مفعل)</span>';
      btn.setAttribute('title', 'انقر للتحويل إلى وضع شاشة الهاتف العادي');
      btn.classList.add('border-amber-500/50');
      btn.classList.remove('border-emerald-500/50');
    } else {
      btn.innerHTML = '<i class="fa-solid fa-mobile-screen text-emerald-400"></i><span>وضع الهاتف (مفعل)</span>';
      btn.setAttribute('title', 'انقر للتحويل إلى وضع عرض الكمبيوتر / التابلت');
      btn.classList.add('border-emerald-500/50');
      btn.classList.remove('border-amber-500/50');
    }
  }

  window.toggleViewportMode = function() {
    var current = getStoredMode() || 'desktop';
    var next = current === 'desktop' ? 'mobile' : 'desktop';
    setStoredMode(next);
    applyViewport(next);
  };

  // Immediate execution in <head>
  applyViewport();

  // Listen for orientation and resize events
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      applyViewport();
    }, 200);
  });

  window.addEventListener('resize', function() {
    // Only adjust scale if in desktop mode on mobile screen
    if ((getStoredMode() || 'desktop') === 'desktop' && isMobileScreen()) {
      applyViewport('desktop');
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    updateUI(getStoredMode() || 'desktop');
  });
})();
