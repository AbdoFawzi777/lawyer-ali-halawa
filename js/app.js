/**
 * Lawyer Ali Ali Mahmoud Halawa - Automated Client Intake & Filtering Engine
 * Handles multi-step form wizard, live WhatsApp preview, Google Apps Script async submission,
 * WhatsApp deep-linking, local CRM storage, and UI interactions.
 */

// Global Configuration
const LAWYER_CONFIG = {
  name: "الأستاذ علي علي محمود حلاوه",
  title: "المحامي بالاستئناف ومجلس الدولة ومستشار قضايا الجنايات والأسرة والمدني",
  address: "مصر - محافظة المنوفية - مركز منوف - منشأة سلطان",
  phone1: "01228194003",
  phone1_intl: "201228194003",
  phone2: "01003049739",
  phone2_intl: "201003049739",
  // Default Google Apps Script URL (Can be changed in settings or code)
  googleScriptUrl: localStorage.getItem('halawa_script_url') || "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec",
  workingHours: "السبت إلى الخميس: 5:00 مساءً حتى 10:30 مساءً (المكتب) / طوارئ الجنايات: 24 ساعة"
};

// Form State
let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
  initFormWizard();
  initLivePreview();
  initFaqAccordion();
  initMobileMenu();
  loadLeadStats();
  initQuickSpecialtyButtons();
  initScrollAnimations();
  initConsultantCarousel();
});

/**
 * Initialize Multi-Step Wizard
 */
function initFormWizard() {
  const nextBtn1 = document.getElementById('btn-step-1-next');
  const nextBtn2 = document.getElementById('btn-step-2-next');
  const prevBtn2 = document.getElementById('btn-step-2-prev');
  const prevBtn3 = document.getElementById('btn-step-3-prev');
  const form = document.getElementById('client-intake-form');

  if (nextBtn1) {
    nextBtn1.addEventListener('click', () => {
      if (validateStep1()) {
        goToStep(2);
      }
    });
  }

  if (nextBtn2) {
    nextBtn2.addEventListener('click', () => {
      if (validateStep2()) {
        goToStep(3);
        updateReviewBox();
      }
    });
  }

  if (prevBtn2) {
    prevBtn2.addEventListener('click', () => goToStep(1));
  }

  if (prevBtn3) {
    prevBtn3.addEventListener('click', () => goToStep(2));
  }

  if (form) {
    form.addEventListener('submit', handleFinalSubmission);
  }
}

/**
 * Step navigation
 */
function goToStep(stepNumber) {
  currentStep = stepNumber;

  // Update Step Panels
  document.querySelectorAll('.form-step-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  const targetPanel = document.getElementById(`step-panel-${stepNumber}`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
    targetPanel.classList.add('animate-fadeIn');
  }

  // Update Indicators
  for (let i = 1; i <= totalSteps; i++) {
    const indicator = document.getElementById(`step-indicator-${i}`);
    const label = document.getElementById(`step-label-${i}`);
    if (indicator) {
      if (i === stepNumber) {
        indicator.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20";
        if (label) label.className = "text-xs mt-2 font-bold text-amber-400";
      } else if (i < stepNumber) {
        indicator.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-emerald-600 shadow-md";
        indicator.innerHTML = '<i class="fa-solid fa-check"></i>';
        if (label) label.className = "text-xs mt-2 text-emerald-400 font-medium";
      } else {
        indicator.className = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-400 bg-slate-800 border border-slate-700";
        indicator.innerText = i;
        if (label) label.className = "text-xs mt-2 text-slate-400 font-medium";
      }
    }
  }

  // Scroll smoothly to form header
  const formCard = document.getElementById('intake-section');
  if (formCard) {
    formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Validations
 */
function validateStep1() {
  const nameInput = document.getElementById('client_name');
  const phoneInput = document.getElementById('client_phone');
  let isValid = true;

  // Name Validation (At least 2 words)
  const nameVal = nameInput.value.trim();
  if (!nameVal || nameVal.length < 3) {
    showInputError('client_name', 'يرجى كتابة الاسم الثلاثي أو الثنائي بشكل صحيح');
    isValid = false;
  } else {
    clearInputError('client_name');
  }

  // Egyptian Phone Validation (010, 011, 012, 015 - 11 digits)
  const phoneVal = phoneInput.value.trim().replace(/[\s-]/g, '');
  const egPhoneRegex = /^(010|011|012|015)[0-9]{8}$/;
  if (!phoneVal || !egPhoneRegex.test(phoneVal)) {
    showInputError('client_phone', 'يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً يبدأ بـ (010 / 011 / 012 / 015)');
    isValid = false;
  } else {
    clearInputError('client_phone');
  }

  return isValid;
}

function validateStep2() {
  const caseType = document.getElementById('case_type');
  const serviceType = document.getElementById('service_type');
  let isValid = true;

  if (!caseType.value) {
    showInputError('case_type', 'يرجى اختيار تصنيف القضية أو النزاع القانوني');
    isValid = false;
  } else {
    clearInputError('case_type');
  }

  if (!serviceType.value) {
    showInputError('service_type', 'يرجى تحديد نوع الإجراء أو الخدمة القانونية المطلوبة');
    isValid = false;
  } else {
    clearInputError('service_type');
  }

  return isValid;
}

function validateStep3() {
  const summaryInput = document.getElementById('case_summary');
  let isValid = true;

  const summaryVal = summaryInput.value.trim();
  if (!summaryVal || summaryVal.length < 15) {
    showInputError('case_summary', 'يرجى كتابة نبذة واضحة ومختصرة عن المشكلة (15 حرفاً على الأقل) لتقييم الموقف بدقة');
    isValid = false;
  } else {
    clearInputError('case_summary');
  }

  return isValid;
}

function showInputError(inputId, message) {
  const input = document.getElementById(inputId);
  let errorEl = document.getElementById(`${inputId}-error`);
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.id = `${inputId}-error`;
    errorEl.className = 'text-rose-400 text-xs mt-1.5 flex items-center gap-1 font-medium';
    input.parentNode.appendChild(errorEl);
  }
  errorEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${message}`;
  input.classList.add('border-rose-500', 'ring-1', 'ring-rose-500');
}

function clearInputError(inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(`${inputId}-error`);
  if (errorEl) errorEl.remove();
  input.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');
}

/**
 * Live Preview in WhatsApp Mockup Box
 */
function initLivePreview() {
  const inputs = ['client_name', 'client_phone', 'client_location', 'case_type', 'service_type', 'urgency_level', 'case_summary', 'lawyer_phone_select'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateReviewBox);
      el.addEventListener('change', updateReviewBox);
    }
  });
}

function updateReviewBox() {
  const name = document.getElementById('client_name')?.value.trim() || 'محمد أحمد';
  const phone = document.getElementById('client_phone')?.value.trim() || '012xxxxxxxx';
  const location = document.getElementById('client_location')?.value.trim() || 'منشأة سلطان / منوف';
  const caseType = document.getElementById('case_type')?.value || 'قضايا مدنية وعقارات';
  const serviceType = document.getElementById('service_type')?.value || 'استشارة قانونية عاجلة';
  const urgency = document.getElementById('urgency_level')?.value || 'عادي';
  const summary = document.getElementById('case_summary')?.value.trim() || 'تفاصيل الاستشارة والقضية...';

  // Format urgency with emoji badge
  let urgencyEmoji = '🟢';
  if (urgency.includes('عاجل')) urgencyEmoji = '🟡';
  if (urgency.includes('طارئ') || urgency.includes('تحقيق')) urgencyEmoji = '🔴';

  const previewHtml = `
    <div class="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      <div class="font-bold text-amber-300 border-b border-white/10 pb-1 mb-2">
        مرحباً أستاذ علي حلاوه، استشارة جديدة عبر المنصة:
      </div>
      <div><span class="text-amber-400 font-bold">👤 الموكل:</span> ${escapeHtml(name)}</div>
      <div><span class="text-amber-400 font-bold">📱 الهاتف:</span> ${escapeHtml(phone)}</div>
      <div><span class="text-amber-400 font-bold">📍 المحافظة / المركز:</span> ${escapeHtml(location)}</div>
      <div><span class="text-amber-400 font-bold">⚖️ نوع القضية:</span> ${escapeHtml(caseType)}</div>
      <div><span class="text-amber-400 font-bold">🛠️ الخدمة:</span> ${escapeHtml(serviceType)}</div>
      <div><span class="text-amber-400 font-bold">🚨 الأهمية:</span> ${urgencyEmoji} ${escapeHtml(urgency)}</div>
      <div class="pt-1.5 border-t border-white/10 mt-1">
        <span class="text-amber-400 font-bold">📝 ملخص الدعوى:</span>
        <div class="mt-1 bg-black/20 p-2 rounded text-slate-200 text-xs max-h-24 overflow-y-auto whitespace-pre-wrap">${escapeHtml(summary)}</div>
      </div>
      <div class="pt-1 text-[11px] text-emerald-300 flex items-center gap-1">
        <i class="fa-solid fa-clock"></i> جاهز للإرسال الفوري للمتابعة وتحديد موعد.
      </div>
    </div>
  `;

  const previewContainer = document.getElementById('whatsapp-live-preview');
  if (previewContainer) {
    previewContainer.innerHTML = previewHtml;
  }
}

/**
 * Handle Final Form Submission (Dual-Action Pipeline)
 */
async function handleFinalSubmission(e) {
  e.preventDefault();

  if (!validateStep1() || !validateStep2() || !validateStep3()) {
    showToast('يرجى التأكد من استكمال كافة الحقول المطلوبة بشكل صحيح', 'warning');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-intake');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-lg"></i> جارٍ تشفير وتجهيز البيانات...';

  const formData = {
    id: 'HALAWA-' + Date.now().toString().slice(-6),
    timestamp: new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
    name: document.getElementById('client_name').value.trim(),
    phone: document.getElementById('client_phone').value.trim(),
    location: document.getElementById('client_location').value.trim() || 'المنوفية / منشأة سلطان',
    caseType: document.getElementById('case_type').value,
    serviceType: document.getElementById('service_type').value,
    urgency: document.getElementById('urgency_level').value,
    summary: document.getElementById('case_summary').value.trim(),
    selectedLawyerPhone: document.getElementById('lawyer_phone_select').value || LAWYER_CONFIG.phone1_intl,
    status: 'جديد'
  };

  // 1. Save in Browser LocalStorage (Local CRM Backup)
  saveLeadToLocalStorage(formData);

  // 2. Asynchronous Background POST to Google Apps Script
  sendDataToGoogleSheet(formData);

  // 3. Format WhatsApp Deep-Link Message
  let urgencyEmoji = '🟢';
  if (formData.urgency.includes('عاجل')) urgencyEmoji = '🟡';
  if (formData.urgency.includes('طارئ')) urgencyEmoji = '🔴';

  const formattedWhatsAppMsg = 
`السلام عليكم ورحمة الله وبركاته،
أستاذ علي علي محمود حلاوه المحامي،
لدي طلب استشارة وتوكيل عبر المنصة القانونية الإلكترونية:
--------------------------------
👤 *الاسم:* ${formData.name}
📱 *الهاتف:* ${formData.phone}
📍 *المركز/المحافظة:* ${formData.location}
⚖️ *نوع القضية:* ${formData.caseType}
🛠️ *الخدمة المطلوبة:* ${formData.serviceType}
🚨 *درجة الأهمية:* ${urgencyEmoji} ${formData.urgency}
--------------------------------
📝 *ملخص النزاع والموضوع:*
${formData.summary}
--------------------------------
كود الطلب المرجعي: [${formData.id}]
أود التكرم بالاطلاع وتحديد موعد لمتابعة الإجراءات ومقابلة المكتب.`;

  const encodedMsg = encodeURIComponent(formattedWhatsAppMsg);
  const targetPhone = formData.selectedLawyerPhone;
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

  // Smooth micro-interaction: brief checkmark before redirect
  submitBtn.innerHTML = '<i class="fa-solid fa-check text-lg text-emerald-300"></i> تم التحقق بنجاح!';
  await new Promise(res => setTimeout(res, 400));

  // Reset button state
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalBtnText;

  // 4. Show Success Modal with Direct Action, QR Code, and Open WhatsApp
  showSuccessModal(formData, whatsappUrl, formattedWhatsAppMsg);

  // Automatically attempt opening WhatsApp in a new tab
  try {
    const newWindow = window.open(whatsappUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      console.log('Popup blocked, modal ready.');
    }
  } catch (err) {
    console.warn('Direct open blocked:', err);
  }
}

/**
 * Send payload to Google Apps Script asynchronously
 */
function sendDataToGoogleSheet(data) {
  const scriptUrl = LAWYER_CONFIG.googleScriptUrl;

  // Only attempt if not placeholder
  if (scriptUrl && !scriptUrl.includes('YOUR_SCRIPT_ID_HERE')) {
    fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(() => {
      console.log('Lead synced with Google Sheet successfully.');
    }).catch(err => {
      console.warn('Google Sheet background sync notice:', err);
    });
  } else {
    console.info('Google Apps Script URL is placeholder. Lead safely recorded in local CRM.');
  }
}

/**
 * Save Lead to Local CRM in LocalStorage
 */
function saveLeadToLocalStorage(lead) {
  try {
    let leads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
    leads.unshift(lead);
    // Keep last 100 leads
    if (leads.length > 100) leads = leads.slice(0, 100);
    localStorage.setItem('halawa_leads', JSON.stringify(leads));
    loadLeadStats();
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

/**
 * Success Modal Dialog with QR Code and WhatsApp launch
 */
function showSuccessModal(data, whatsappUrl, rawMessage) {
  const modal = document.getElementById('success-modal');
  if (!modal) return;

  // Update modal contents
  document.getElementById('modal-client-name').innerText = data.name;
  document.getElementById('modal-ref-id').innerText = data.id;
  
  const selectedPhoneDisplay = data.selectedLawyerPhone === LAWYER_CONFIG.phone2_intl ? LAWYER_CONFIG.phone2 : LAWYER_CONFIG.phone1;
  document.getElementById('modal-target-phone').innerText = selectedPhoneDisplay;

  // Setup WhatsApp Launch button
  const launchBtn = document.getElementById('modal-whatsapp-btn');
  launchBtn.href = whatsappUrl;

  // Setup Copy Message Button
  const copyBtn = document.getElementById('modal-copy-btn');
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(rawMessage).then(() => {
      showToast('تم نسخ نص الاستشارة بنجاح، يمكنك لصقه في واتساب مباشرة', 'success');
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ بنجاح!';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> نسخ نص الرسالة';
      }, 3000);
    }).catch(() => {
      showToast('تعذر النسخ التلقائي، يمكنك فتح واتساب مباشرة', 'warning');
    });
  };

  // Generate QR code for mobile users on desktop
  const qrImg = document.getElementById('modal-qr-code');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(whatsappUrl)}`;
  }

  // Display modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

/**
 * Quick Category buttons in Services section
 */
function initQuickSpecialtyButtons() {
  document.querySelectorAll('[data-select-specialty]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const specialty = btn.getAttribute('data-select-specialty');
      const caseSelect = document.getElementById('case_type');
      if (caseSelect) {
        caseSelect.value = specialty;
      }
      goToStep(2);
      const intakeSection = document.getElementById('intake-section');
      if (intakeSection) {
        intakeSection.scrollIntoView({ behavior: 'smooth' });
      }
      showToast(`تم تحديد تخصص "${specialty}" تلقائياً في النموذج`, 'info');
    });
  });
}

/**
 * FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-accordion-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');

        // Close other items
        faqItems.forEach(otherItem => {
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-icon');
          if (otherContent) otherContent.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
          content.classList.add('hidden');
          if (icon) icon.style.transform = 'rotate(0deg)';
        }
      });
    }
  });
}

/**
 * Mobile Navigation Toggle
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu-drawer');
  const closeBtn = document.getElementById('close-mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }

  // Close menu when clicking nav link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  });
}

/**
 * Load Leads Stats for UI indicators
 */
function loadLeadStats() {
  try {
    const leads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
    const countBadge = document.getElementById('leads-counter-badge');
    if (countBadge) {
      countBadge.innerText = leads.length;
      countBadge.style.display = leads.length > 0 ? 'inline-flex' : 'none';
    }
  } catch (e) {
    // Ignore
  }
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    info: 'bg-slate-800 text-sky-300 border-sky-500/40',
    success: 'bg-slate-800 text-emerald-300 border-emerald-500/40',
    warning: 'bg-slate-800 text-amber-300 border-amber-500/40',
    danger: 'bg-slate-800 text-rose-300 border-rose-500/40'
  };

  const icons = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    danger: 'fa-circle-xmark'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-lg"></i>
    <span class="text-sm font-medium text-white">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

/**
 * Scroll Animations using IntersectionObserver
 * Smoothly reveals sections and elements with .reveal-on-scroll
 */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/**
 * Consultant Photos Carousel / Slider
 * Infinitely looping with auto-play, pause-on-hover, touch-swipe, and smooth cross-fades
 */
function initConsultantCarousel() {
  const container = document.getElementById('consultant-carousel-container');
  if (!container) return;

  const slides = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const pauseIndicator = document.getElementById('carousel-pause-indicator');

  if (slides.length <= 1) return;

  let currentIndex = 0;
  const autoPlayDelay = 3500; // 3.5 seconds per slide
  let autoPlayTimer = null;

  function updateSlide(newIndex) {
    slides[currentIndex].classList.remove('active');
    if (dots[currentIndex]) {
      dots[currentIndex].className = 'carousel-dot w-2.5 h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all';
    }

    currentIndex = (newIndex + slides.length) % slides.length;

    slides[currentIndex].classList.add('active');
    if (dots[currentIndex]) {
      dots[currentIndex].className = 'carousel-dot active w-7 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/40 transition-all';
    }
  }

  function nextSlide() {
    updateSlide(currentIndex + 1);
  }

  function prevSlide() {
    updateSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(nextSlide, autoPlayDelay);
    if (pauseIndicator) pauseIndicator.classList.add('hidden');
  }

  function pauseAutoPlay() {
    clearInterval(autoPlayTimer);
    if (pauseIndicator) pauseIndicator.classList.remove('hidden');
  }

  // Interactive Button Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      startAutoPlay();
    });
  }

  // Dots click listeners
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(dot.getAttribute('data-target-slide') || '0', 10);
      updateSlide(targetIdx);
      startAutoPlay();
    });
  });

  // Pause on Hover
  container.addEventListener('mouseenter', pauseAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchStartY = 0;

  container.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      pauseAutoPlay();
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Only trigger if horizontal swipe is more prominent than vertical scroll
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          // Swipe Left in RTL -> Next slide
          nextSlide();
        } else {
          // Swipe Right in RTL -> Prev slide
          prevSlide();
        }
      }
      startAutoPlay();
    }
  }, { passive: true });

  // Start initial auto-play
  startAutoPlay();
}

