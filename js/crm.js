/**
 * Lawyer Ali Ali Mahmoud Halawa - Local CRM & Lead Management System
 * Allows the lawyer to review, filter, export to CSV/Excel, and manage consultation requests
 * directly within the web app with zero dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCrmModal();
  initCrmControls();
});

function initCrmModal() {
  const openBtn = document.getElementById('open-crm-btn');
  const openBtnMobile = document.getElementById('open-crm-btn-mobile');
  const closeBtn = document.getElementById('close-crm-btn');
  const modal = document.getElementById('crm-modal');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openCrmDashboard();
    });
  }

  if (openBtnMobile) {
    openBtnMobile.addEventListener('click', () => {
      openCrmDashboard();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }
}

function openCrmDashboard() {
  const modal = document.getElementById('crm-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderCrmTable();
    loadScriptSettings();
  }
}

function initCrmControls() {
  // Search
  const searchInput = document.getElementById('crm-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderCrmTable());
  }

  // Filter by Status
  const statusFilter = document.getElementById('crm-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => renderCrmTable());
  }

  // Export CSV
  const exportBtn = document.getElementById('crm-export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportLeadsToCsv);
  }

  // Add Demo Sample Lead for testing
  const addSampleBtn = document.getElementById('crm-add-sample-btn');
  if (addSampleBtn) {
    addSampleBtn.addEventListener('click', injectSampleLead);
  }

  // Clear All Leads
  const clearBtn = document.getElementById('crm-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('هل أنت متأكد من رغبتك في مسح كافة الطلبات المسجلة محلياً؟')) {
        localStorage.removeItem('halawa_leads');
        renderCrmTable();
        loadLeadStats();
        showToast('تم مسح السجل المحلي بنجاح', 'info');
      }
    });
  }

  // Save Google Script URL
  const saveScriptBtn = document.getElementById('save-script-url-btn');
  if (saveScriptBtn) {
    saveScriptBtn.addEventListener('click', () => {
      const urlInput = document.getElementById('settings-script-url');
      if (urlInput) {
        const val = urlInput.value.trim();
        localStorage.setItem('halawa_script_url', val);
        LAWYER_CONFIG.googleScriptUrl = val;
        showToast('تم حفظ رابط Google Apps Script بنجاح!', 'success');
      }
    });
  }
}

function renderCrmTable() {
  const tableBody = document.getElementById('crm-table-body');
  const countEl = document.getElementById('crm-total-count');
  if (!tableBody) return;

  const rawLeads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
  const searchTerm = (document.getElementById('crm-search-input')?.value || '').toLowerCase();
  const selectedStatus = document.getElementById('crm-status-filter')?.value || 'all';

  // Filter
  const filtered = rawLeads.filter(lead => {
    const matchesSearch = 
      (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.caseType && lead.caseType.toLowerCase().includes(searchTerm)) ||
      (lead.id && lead.id.toLowerCase().includes(searchTerm));

    const matchesStatus = (selectedStatus === 'all') || (lead.status === selectedStatus);

    return matchesSearch && matchesStatus;
  });

  if (countEl) {
    countEl.innerText = `${filtered.length} من إجمالي ${rawLeads.length} طلب`;
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-400">
          <i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-600 block"></i>
          لا توجد طلبات استشارة مطابقة حتى الآن. يمكنك إرسال طلب تجريبي أو الضغط على "إضافة طلب تجريبي".
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(lead => {
    const urgencyBadge = lead.urgency && lead.urgency.includes('طارئ')
      ? '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">🔴 طارئ</span>'
      : (lead.urgency && lead.urgency.includes('عاجل')
        ? '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 عاجل</span>'
        : '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 عادي</span>');

    const statusOptions = ['جديد', 'تم التواصل', 'استشارة مدفوعة', 'تم حجز موعد', 'مكتمل'];
    const statusSelect = `
      <select onchange="updateLeadStatus('${lead.id}', this.value)" class="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-amber-400">
        ${statusOptions.map(opt => `<option value="${opt}" ${lead.status === opt ? 'selected' : ''}>${opt}</option>`).join('')}
      </select>
    `;

    return `
      <tr class="border-b border-slate-800 hover:bg-slate-800/50 transition">
        <td class="py-3 px-3 text-xs font-mono text-amber-400">${lead.id || '-'}</td>
        <td class="py-3 px-3">
          <div class="font-bold text-white text-xs sm:text-sm">${escapeHtml(lead.name)}</div>
          <div class="text-[11px] text-slate-400"><i class="fa-solid fa-location-dot text-amber-500/70 ml-1"></i>${escapeHtml(lead.location || 'المنوفية')}</div>
        </td>
        <td class="py-3 px-3 text-xs">
          <a href="tel:${lead.phone}" class="text-sky-400 hover:underline block">${lead.phone}</a>
          <a href="https://wa.me/2${lead.phone}" target="_blank" class="text-emerald-400 hover:underline text-[11px] flex items-center gap-1 mt-0.5">
            <i class="fa-brands fa-whatsapp"></i> واتساب الموكل
          </a>
        </td>
        <td class="py-3 px-3 text-xs">
          <div class="font-medium text-slate-200">${escapeHtml(lead.caseType)}</div>
          <div class="text-[11px] text-amber-300">${escapeHtml(lead.serviceType)}</div>
        </td>
        <td class="py-3 px-3 text-xs">${urgencyBadge}</td>
        <td class="py-3 px-3 text-xs">${statusSelect}</td>
        <td class="py-3 px-3 text-xs text-left">
          <button onclick="viewLeadDetails('${lead.id}')" class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs border border-amber-500/40 ml-1">
            <i class="fa-solid fa-eye"></i> تفاصيل
          </button>
          <button onclick="deleteLead('${lead.id}')" class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs border border-rose-500/40">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.updateLeadStatus = function(leadId, newStatus) {
  let leads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
  leads = leads.map(item => {
    if (item.id === leadId) {
      item.status = newStatus;
    }
    return item;
  });
  localStorage.setItem('halawa_leads', JSON.stringify(leads));
  showToast(`تم تحديث حالة الطلب إلى "${newStatus}"`, 'success');
};

window.deleteLead = function(leadId) {
  if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
    let leads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
    leads = leads.filter(item => item.id !== leadId);
    localStorage.setItem('halawa_leads', JSON.stringify(leads));
    renderCrmTable();
    loadLeadStats();
    showToast('تم حذف الطلب', 'info');
  }
};

window.viewLeadDetails = function(leadId) {
  const leads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  const detailBox = document.getElementById('crm-lead-detail-content');
  const detailModal = document.getElementById('crm-lead-detail-modal');

  if (detailBox && detailModal) {
    detailBox.innerHTML = `
      <div class="space-y-4 text-sm text-slate-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <div>
            <span class="text-xs font-mono text-amber-400 font-bold">${lead.id}</span>
            <h3 class="text-lg font-bold text-white mt-1">${escapeHtml(lead.name)}</h3>
          </div>
          <div class="text-right text-xs text-slate-400">
            <div>${lead.timestamp}</div>
            <div class="mt-1 font-bold text-amber-400">الحالة: ${lead.status || 'جديد'}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-xs">رقم هاتف الموكل:</span>
            <span class="font-bold text-white">${lead.phone}</span>
          </div>
          <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-xs">المحافظة / المركز:</span>
            <span class="font-bold text-white">${escapeHtml(lead.location || 'غير محدد')}</span>
          </div>
          <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-xs">تخصص القضية:</span>
            <span class="font-bold text-amber-300">${escapeHtml(lead.caseType)}</span>
          </div>
          <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
            <span class="text-slate-400 block text-xs">الخدمة المطلوبة:</span>
            <span class="font-bold text-sky-300">${escapeHtml(lead.serviceType)}</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
          <span class="text-amber-400 font-bold block mb-1.5 text-xs"><i class="fa-solid fa-file-lines ml-1"></i>ملخص موضوع القضية وتفاصيل النزاع:</span>
          <p class="whitespace-pre-wrap text-slate-200 leading-relaxed text-sm bg-black/30 p-3 rounded-lg border border-slate-800/80">${escapeHtml(lead.summary)}</p>
        </div>

        <div class="flex items-center justify-between pt-2">
          <a href="https://wa.me/2${lead.phone}" target="_blank" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
            <i class="fa-brands fa-whatsapp text-sm"></i> محادثة الموكل في واتساب
          </a>
          <button onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700">
            <i class="fa-solid fa-print"></i> طباعة ملف الموكل
          </button>
        </div>
      </div>
    `;
    detailModal.classList.remove('hidden');
  }
};

window.closeLeadDetailModal = function() {
  const detailModal = document.getElementById('crm-lead-detail-modal');
  if (detailModal) detailModal.classList.add('hidden');
};

function exportLeadsToCsv() {
  const leads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
  if (leads.length === 0) {
    showToast('لا توجد بيانات متاحة للتصدير حالياً', 'warning');
    return;
  }

  // CSV Headers with UTF-8 BOM for Arabic support in Excel
  const bom = "\uFEFF";
  const headers = ["كود_الطلب", "التاريخ_والوقت", "اسم_الموكل", "رقم_الهاتف", "المركز_المحافظة", "تخصص_القضية", "الخدمة_المطلوبة", "درجة_الأهمية", "ملخص_الدعوى", "الحالة"];
  
  const rows = leads.map(l => [
    `"${l.id || ''}"`,
    `"${l.timestamp || ''}"`,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${l.phone || ''}"`,
    `"${(l.location || '').replace(/"/g, '""')}"`,
    `"${(l.caseType || '').replace(/"/g, '""')}"`,
    `"${(l.serviceType || '').replace(/"/g, '""')}"`,
    `"${(l.urgency || '').replace(/"/g, '""')}"`,
    `"${(l.summary || '').replace(/"/g, '""')}"`,
    `"${l.status || 'جديد'}"`
  ]);

  const csvContent = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `طلبات_مكتب_حلاوه_المحامي_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('تم تصدير ملف الإكسل (CSV) بنجاح!', 'success');
}

function injectSampleLead() {
  const sample = {
    id: 'HALAWA-' + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
    name: 'محمود عبد الرازق إبراهيم',
    phone: '01228194000',
    location: 'منوف - منشأة سلطان',
    caseType: 'قضايا مدنية وعقارات',
    serviceType: 'توكيل في دعوى قضائية',
    urgency: 'عاجل (خلال 24 ساعة)',
    summary: 'نزاع عقاري على قطعة أرض زراعية وبناء بعقد بيع ابتدائي، والطرف الآخر يمتنع عن التسليم ويطالب بمبالغ إضافية دون وجه حق. أحتاج توكيل فوري لرفع دعوى صحة ونفاذ وطرد للغصب.',
    selectedLawyerPhone: LAWYER_CONFIG.phone1_intl,
    status: 'جديد'
  };

  saveLeadToLocalStorage(sample);
  renderCrmTable();
  showToast('تمت إضافة طلب تجريبي للاختبار', 'success');
}

function loadScriptSettings() {
  const urlInput = document.getElementById('settings-script-url');
  if (urlInput) {
    urlInput.value = localStorage.getItem('halawa_script_url') || '';
  }
}
