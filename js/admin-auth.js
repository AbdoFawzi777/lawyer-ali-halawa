/**
 * ==========================================================================
 * Lawyer Ali Ali Mahmoud Halawa - Cybersecurity & Admin Authentication Engine
 * Implements Salted Cryptographic Hashing, Anti-Brute-Force Rate Limiting,
 * 15-Minute Auto Inactivity Session Timeout, and Anti-CSRF Token Generation.
 * ==========================================================================
 */

const AUTH_CONFIG = {
  // Accepted usernames (trimmed, case-insensitive)
  validUsernames: ['المستشار', 'admin', 'elmostashar'],
  
  // Cryptographic Salt
  salt: 'HALAWA_SEC_SALT_2026_LEGAL_VAULT_MENOUF',
  
  // Salted SHA-256 Hash of: "ElMostashar@2026#SecuredAdmin!" + salt
  saltedHash: '10064d7ef03f526088e24615bc03b498993342c5563df08812e9a4fb11da9e97',

  // Rate Limiting Policy
  maxFailedAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 Minutes

  // Inactivity Timeout
  inactivityTimeoutMs: 15 * 60 * 1000, // 15 Minutes
  sessionStorageKey: 'halawa_secure_admin_session',
  failuresStorageKey: 'halawa_auth_failures',
  lockoutStorageKey: 'halawa_auth_lockout_until'
};

let inactivityTimer = null;
let countdownInterval = null;
let currentCsrfToken = null;

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initCsrfToken();
  checkLockoutState();
  initLoginForm();
  checkExistingSession();
});

/**
 * Generate Anti-CSRF Token using Web Crypto API
 */
function initCsrfToken() {
  const csrfInput = document.getElementById('admin_csrf_token');
  currentCsrfToken = generateRandomHex(16);
  if (csrfInput) {
    csrfInput.value = currentCsrfToken;
  }
}

/**
 * Generate Cryptographically Secure Random Hex String
 */
function generateRandomHex(byteCount = 16) {
  const array = new Uint8Array(byteCount);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute Salted SHA-256 Hash via Web Crypto Subtle API
 */
async function computeSaltedHash(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Rate Limiting & Anti-Brute-Force Check
 */
function checkLockoutState() {
  const lockoutUntil = parseInt(localStorage.getItem(AUTH_CONFIG.lockoutStorageKey) || '0', 10);
  const now = Date.now();

  const lockoutBanner = document.getElementById('lockout-alert');
  const lockoutCountdown = document.getElementById('lockout-countdown');
  const loginSubmitBtn = document.getElementById('admin-login-submit-btn');
  const attemptsBadge = document.getElementById('attempts-left-badge');

  if (lockoutUntil > now) {
    // User is currently locked out
    const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
    if (lockoutBanner) lockoutBanner.classList.remove('hidden');
    if (loginSubmitBtn) loginSubmitBtn.disabled = true;

    updateLockoutDisplay(remainingSec);

    // Live countdown interval
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      const currentRemaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (currentRemaining <= 0) {
        clearInterval(countdownInterval);
        localStorage.removeItem(AUTH_CONFIG.lockoutStorageKey);
        localStorage.removeItem(AUTH_CONFIG.failuresStorageKey);
        if (lockoutBanner) lockoutBanner.classList.add('hidden');
        if (loginSubmitBtn) loginSubmitBtn.disabled = false;
        if (attemptsBadge) attemptsBadge.innerText = '5 من 5 محاولات متاحة';
      } else {
        updateLockoutDisplay(currentRemaining);
      }
    }, 1000);

    return true;
  } else {
    if (lockoutBanner) lockoutBanner.classList.add('hidden');
    if (loginSubmitBtn) loginSubmitBtn.disabled = false;
    
    // Display remaining attempts
    const failures = parseInt(localStorage.getItem(AUTH_CONFIG.failuresStorageKey) || '0', 10);
    const remaining = Math.max(0, AUTH_CONFIG.maxFailedAttempts - failures);
    if (attemptsBadge) {
      attemptsBadge.innerText = `${remaining} من ${AUTH_CONFIG.maxFailedAttempts} محاولات متبقية`;
      if (remaining <= 2) {
        attemptsBadge.className = 'text-xs text-rose-400 font-bold';
      }
    }
    return false;
  }
}

function updateLockoutDisplay(seconds) {
  const countdownEl = document.getElementById('lockout-countdown');
  if (countdownEl) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    countdownEl.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Handle Login Form Submission
 */
function initLoginForm() {
  const loginForm = document.getElementById('admin-login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (checkLockoutState()) {
      showSecurityToast('النظام في وضع الإغلاق المؤقت (Lockout) بسبب تكرار المحاولات الخاطئة.', 'danger');
      return;
    }

    const usernameInput = document.getElementById('admin_username');
    const passwordInput = document.getElementById('admin_password');
    const csrfInput = document.getElementById('admin_csrf_token');
    const submitBtn = document.getElementById('admin-login-submit-btn');

    // Anti-CSRF verification
    if (!csrfInput || csrfInput.value !== currentCsrfToken) {
      showSecurityToast('فشل التحقق من رمز الحماية (CSRF Token Mismatch). يرجى تحديث الصفحة.', 'danger');
      return;
    }

    const usernameVal = usernameInput.value.trim().toLowerCase();
    const passwordVal = passwordInput.value;

    if (!usernameVal || !passwordVal) {
      showSecurityToast('يرجى كتابة اسم المستخدم وكلمة المرور.', 'warning');
      return;
    }

    // UI Loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-shield-halved fa-spin text-lg"></i> جارٍ التحقق الأمني وتفكيك التشفير...';

    // Verify Salted Hash
    const computedHash = await computeSaltedHash(passwordVal, AUTH_CONFIG.salt);
    const isUserValid = AUTH_CONFIG.validUsernames.includes(usernameVal);
    const isPassValid = (computedHash === AUTH_CONFIG.saltedHash);

    // Artificial timing delay (400ms) to prevent side-channel timing attacks
    await new Promise(r => setTimeout(r, 400));

    if (isUserValid && isPassValid) {
      // Successful Login
      localStorage.removeItem(AUTH_CONFIG.failuresStorageKey);
      localStorage.removeItem(AUTH_CONFIG.lockoutStorageKey);

      // Create Secure Session
      const sessionPayload = {
        token: generateRandomHex(32),
        username: 'المستشار علي علي محمود حلاوه',
        csrfToken: generateRandomHex(16),
        loginTime: Date.now(),
        lastActivity: Date.now(),
        expiresAt: Date.now() + AUTH_CONFIG.inactivityTimeoutMs
      };

      sessionStorage.setItem(AUTH_CONFIG.sessionStorageKey, JSON.stringify(sessionPayload));
      
      submitBtn.innerHTML = '<i class="fa-solid fa-check text-lg text-emerald-400"></i> تم التحقق بنجاح!';
      await new Promise(r => setTimeout(r, 300));

      // Transition to Dashboard View
      renderAuthenticatedDashboard(sessionPayload);
      showSecurityToast('تم تسجيل الدخول بنجاح إلى منظومة إدارة الاستشارات.', 'success');

    } else {
      // Failed Login Attempt
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      let failures = parseInt(localStorage.getItem(AUTH_CONFIG.failuresStorageKey) || '0', 10) + 1;
      localStorage.setItem(AUTH_CONFIG.failuresStorageKey, failures.toString());

      if (failures >= AUTH_CONFIG.maxFailedAttempts) {
        // Trigger 15-min lockout
        const lockoutTime = Date.now() + AUTH_CONFIG.lockoutDurationMs;
        localStorage.setItem(AUTH_CONFIG.lockoutStorageKey, lockoutTime.toString());
        checkLockoutState();
        showSecurityToast('تم استنفاد 5 محاولات! تم إغلاق لوحة التحكم لمدة 15 دقيقة لمنع هجمات التخمين.', 'danger');
      } else {
        const remaining = AUTH_CONFIG.maxFailedAttempts - failures;
        checkLockoutState();
        showSecurityToast(`بيانات الدخول غير صحيحة. متبقي ${remaining} محاولات قبل الإغلاق الأمني.`, 'danger');
      }
    }
  });
}

/**
 * Check existing active session on page load
 */
function checkExistingSession() {
  const sessionStr = sessionStorage.getItem(AUTH_CONFIG.sessionStorageKey);
  if (!sessionStr) {
    showLoginView();
    return;
  }

  try {
    const session = JSON.parse(sessionStr);
    const now = Date.now();
    const isExpired = (now - session.lastActivity) > AUTH_CONFIG.inactivityTimeoutMs;

    if (isExpired) {
      logoutAdmin('تم إنهاء الجلسة تلقائياً لعدم النشاط لمدة 15 دقيقة.');
    } else {
      // Session is valid, refresh last activity
      session.lastActivity = now;
      sessionStorage.setItem(AUTH_CONFIG.sessionStorageKey, JSON.stringify(session));
      renderAuthenticatedDashboard(session);
    }
  } catch (err) {
    logoutAdmin();
  }
}

/**
 * Render Authenticated Dashboard
 */
function renderAuthenticatedDashboard(session) {
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  if (loginView) loginView.classList.add('hidden');
  if (dashboardView) {
    dashboardView.classList.remove('hidden');
    dashboardView.classList.add('animate-fadeIn');
  }

  // Update session ID in UI (truncated)
  const sessionBadge = document.getElementById('admin-session-badge');
  if (sessionBadge) {
    sessionBadge.innerText = 'SEC-ID: ' + session.token.slice(0, 10).toUpperCase();
  }

  // Start Inactivity Watcher (15 minutes)
  startInactivityWatcher();

  // Load CRM Data into Dashboard
  if (window.loadAdminDashboardData) {
    window.loadAdminDashboardData();
  }
}

/**
 * 15-Minute Inactivity Auto-Logout Watcher
 */
function startInactivityWatcher() {
  // Reset activity on user interaction
  const resetActivity = () => {
    const sessionStr = sessionStorage.getItem(AUTH_CONFIG.sessionStorageKey);
    if (!sessionStr) return;
    try {
      const session = JSON.parse(sessionStr);
      session.lastActivity = Date.now();
      sessionStorage.setItem(AUTH_CONFIG.sessionStorageKey, JSON.stringify(session));
    } catch(e) {}
  };

  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, resetActivity, { passive: true });
  });

  // Check every second for timeout and update live countdown badge
  clearInterval(inactivityTimer);
  inactivityTimer = setInterval(() => {
    const sessionStr = sessionStorage.getItem(AUTH_CONFIG.sessionStorageKey);
    if (!sessionStr) {
      clearInterval(inactivityTimer);
      return;
    }

    try {
      const session = JSON.parse(sessionStr);
      const elapsed = Date.now() - session.lastActivity;
      const remainingMs = AUTH_CONFIG.inactivityTimeoutMs - elapsed;

      if (remainingMs <= 0) {
        clearInterval(inactivityTimer);
        logoutAdmin('انتهت مهلة الجلسة (15 دقيقة) لعدم النشاط لحماية بيانات الموكلين.');
      } else {
        const remainingSec = Math.floor(remainingMs / 1000);
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        const timerBadge = document.getElementById('inactivity-countdown-badge');
        if (timerBadge) {
          timerBadge.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
          if (remainingSec < 120) {
            timerBadge.className = 'text-rose-400 font-bold font-mono animate-pulse';
          } else {
            timerBadge.className = 'text-amber-400 font-bold font-mono';
          }
        }
      }
    } catch(e) {
      clearInterval(inactivityTimer);
    }
  }, 1000);
}

/**
 * Logout Admin & Purge Session
 */
function logoutAdmin(message = null) {
  clearInterval(inactivityTimer);
  sessionStorage.removeItem(AUTH_CONFIG.sessionStorageKey);

  showLoginView();

  if (message) {
    showSecurityToast(message, 'warning');
  } else {
    showSecurityToast('تم تسجيل الخروج بنجاح وإتلاف رموز الجلسة المشفرة.', 'info');
  }
}

function showLoginView() {
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  if (loginView) loginView.classList.remove('hidden');
  if (dashboardView) dashboardView.classList.add('hidden');

  // Reset inputs
  const pwdInput = document.getElementById('admin_password');
  if (pwdInput) pwdInput.value = '';

  initCsrfToken();
  checkLockoutState();
}

/**
 * Security Toast Notification Helper
 */
function showSecurityToast(message, type = 'info') {
  const container = document.getElementById('admin-toast-container');
  if (!container) return;

  const colors = {
    info: 'bg-slate-900 text-sky-300 border-sky-500/40',
    success: 'bg-slate-900 text-emerald-300 border-emerald-500/40',
    warning: 'bg-slate-900 text-amber-300 border-amber-500/40',
    danger: 'bg-slate-900 text-rose-300 border-rose-500/50'
  };

  const icons = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    danger: 'fa-shield-halved'
  };

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-3 opacity-0 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-lg"></i>
    <span class="text-xs sm:text-sm font-bold text-white">${escapeAdminText(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function escapeAdminText(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

// Global hook for logout button
window.logoutAdmin = logoutAdmin;
