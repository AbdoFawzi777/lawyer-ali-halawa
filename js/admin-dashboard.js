/**
 * ==========================================================================
 * Lawyer Ali Ali Mahmoud Halawa - Secure Admin Dashboard Engine
 * Strict Anti-XSS DOM Rendering, Anti-CSV Injection, Case Filtering,
 * Status Workflow Management, and Dossier Inspection.
 * ==========================================================================
 */

let allLeads = [];
let currentFilteredLeads = [];

window.loadAdminDashboardData = function() {
  initDashboardControls();
  fetchAndRenderLeads();
};

function initDashboardControls() {
  const searchInput = document.getElementById('admin-search-input');
  const specialtyFilter = document.getElementById('admin-specialty-filter');
  const urgencyFilter = document.getElementById('admin-urgency-filter');
  const statusFilter = document.getElementById('admin-status-filter');
  const exportBtn = document.getElementById('admin-export-csv-btn');
  const refreshBtn = document.getElementById('admin-refresh-btn');

  if (searchInput) {
    searchInput.removeEventListener('input', filterAndRender);
    searchInput.addEventListener('input', filterAndRender);
  }

  if (specialtyFilter) {
    specialtyFilter.removeEventListener('change', filterAndRender);
    specialtyFilter.addEventListener('change', filterAndRender);
  }

  if (urgencyFilter) {
    urgencyFilter.removeEventListener('change', filterAndRender);
    urgencyFilter.addEventListener('change', filterAndRender);
  }

  if (statusFilter) {
    statusFilter.removeEventListener('change', filterAndRender);
    statusFilter.addEventListener('change', filterAndRender);
  }

  if (exportBtn) {
    exportBtn.onclick = exportSecureCsv;
  }

  if (refreshBtn) {
    refreshBtn.onclick = () => {
      fetchAndRenderLeads();
      showSecurityToast('تم تحديث السجلات بنجاح.', 'info');
    };
  }
}

function fetchAndRenderLeads() {
  try {
    allLeads = JSON.parse(localStorage.getItem('halawa_leads') || '[]');
  } catch(e) {
    allLeads = [];
  }

  updateKpiMetrics();
  filterAndRender();
}

function updateKpiMetrics() {
  const totalCountEl = document.getElementById('kpi-total-leads');
  const newCountEl = document.getElementById('kpi-new-leads');
  const urgentCountEl = document.getElementById('kpi-urgent-leads');
  const bookedCountEl = document.getElementById('kpi-booked-leads');

  const total = allLeads.length;
  const newCount = allLeads.filter(l => !l.status || l.status === 'جديد').length;
  const urgentCount = allLeads.filter(l => l.urgency && (l.urgency.includes('طارئ') || l.urgency.includes('عاجل'))).length;
  const bookedCount = allLeads.filter(l => l.status === 'تم حجز موعد' || l.status === 'استشارة مدفوعة').length;

  if (totalCountEl) totalCountEl.innerText = total;
  if (newCountEl) newCountEl.innerText = newCount;
  if (urgentCountEl) urgentCountEl.innerText = urgentCount;
  if (bookedCountEl) bookedCountEl.innerText = bookedCount;
}

function filterAndRender() {
  const searchTerm = (document.getElementById('admin-search-input')?.value || '').trim().toLowerCase();
  const selectedSpecialty = document.getElementById('admin-specialty-filter')?.value || 'all';
  const selectedUrgency = document.getElementById('admin-urgency-filter')?.value || 'all';
  const selectedStatus = document.getElementById('admin-status-filter')?.value || 'all';

  currentFilteredLeads = allLeads.filter(lead => {
    // Search Matching
    const matchesSearch = !searchTerm || 
      (lead.name && lead.name.toLowerCase().includes(searchTerm)) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.id && lead.id.toLowerCase().includes(searchTerm)) ||
      (lead.summary && lead.summary.toLowerCase().includes(searchTerm)) ||
      (lead.location && lead.location.toLowerCase().includes(searchTerm));

    // Specialty Matching
    const matchesSpecialty = (selectedSpecialty === 'all') || (lead.caseType === selectedSpecialty);

    // Urgency Matching
    const matchesUrgency = (selectedUrgency === 'all') || 
      (selectedUrgency === 'urgent' && lead.urgency && (lead.urgency.includes('عاجل') || lead.urgency.includes('طارئ'))) ||
      (selectedUrgency === 'normal' && lead.urgency && lead.urgency.includes('عادي'));

    // Status Matching
    const matchesStatus = (selectedStatus === 'all') || (lead.status === selectedStatus);

    return matchesSearch && matchesSpecialty && matchesUrgency && matchesStatus;
  });

  const countBadge = document.getElementById('admin-filtered-count');
  if (countBadge) {
    countBadge.innerText = `${currentFilteredLeads.length} من إجمالي ${allLeads.length} طلب`;
  }

  renderTable(currentFilteredLeads);
}

/**
 * Strict Anti-XSS DOM Rendering
 * Using document.createElement & textContent for zero raw HTML injection
 */
function renderTable(leads) {
  const tableBody = document.getElementById('admin-leads-table-body');
  if (!tableBody) return;

  // Clear existing rows safely
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }

  if (leads.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 8;
    emptyCell.className = 'py-16 text-center text-slate-400';
    emptyCell.innerHTML = `
      <i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-600 block"></i>
      لا توجد طلبات استشارة مطابقة لخيارات الفرز الحالية.
    `;
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  leads.forEach(lead => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-800 hover:bg-slate-800/40 transition duration-150 text-xs sm:text-sm';

    // 1. Reference ID
    const cellId = document.createElement('td');
    cellId.className = 'py-3.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap';
    cellId.textContent = lead.id || '-';
    row.appendChild(cellId);

    // 2. Client Name & Location
    const cellName = document.createElement('td');
    cellName.className = 'py-3.5 px-3';
    const nameDiv = document.createElement('div');
    nameDiv.className = 'font-bold text-white';
    nameDiv.textContent = lead.name || 'غير معروف';
    const locDiv = document.createElement('div');
    locDiv.className = 'text-[11px] text-slate-400 flex items-center gap-1 mt-0.5';
    locDiv.innerHTML = '<i class="fa-solid fa-location-dot text-amber-500/70"></i> ';
    const locSpan = document.createElement('span');
    locSpan.textContent = lead.location || 'المنوفية';
    locDiv.appendChild(locSpan);
    cellName.appendChild(nameDiv);
    cellName.appendChild(locDiv);
    row.appendChild(cellName);

    // 3. Phone & Direct WhatsApp
    const cellPhone = document.createElement('td');
    cellPhone.className = 'py-3.5 px-3 whitespace-nowrap';
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:${encodeURIComponent(lead.phone || '')}`;
    phoneLink.className = 'font-mono text-sky-400 hover:underline block font-semibold';
    phoneLink.textContent = lead.phone || '-';
    const waLink = document.createElement('a');
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    waLink.href = `https://wa.me/2${cleanPhone}`;
    waLink.target = '_blank';
    waLink.className = 'inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold mt-1';
    waLink.innerHTML = '<i class="fa-brands fa-whatsapp text-sm"></i> محادثة واتساب';
    cellPhone.appendChild(phoneLink);
    cellPhone.appendChild(waLink);
    row.appendChild(cellPhone);

    // 4. Case Area & Service
    const cellCase = document.createElement('td');
    cellCase.className = 'py-3.5 px-3';
    const caseTypeDiv = document.createElement('div');
    caseTypeDiv.className = 'font-medium text-slate-200';
    caseTypeDiv.textContent = lead.caseType || '-';
    const serviceDiv = document.createElement('div');
    serviceDiv.className = 'text-[11px] text-amber-300/90 mt-0.5';
    serviceDiv.textContent = lead.serviceType || '-';
    cellCase.appendChild(caseTypeDiv);
    cellCase.appendChild(serviceDiv);
    row.appendChild(cellCase);

    // 5. Urgency Badge
    const cellUrgency = document.createElement('td');
    cellUrgency.className = 'py-3.5 px-3 whitespace-nowrap';
    const urgencyBadge = document.createElement('span');
    const urgencyText = lead.urgency || 'عادي';
    if (urgencyText.includes('طارئ')) {
      urgencyBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1';
      urgencyBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span> طارئ فوري';
    } else if (urgencyText.includes('عاجل')) {
      urgencyBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1';
      urgencyBadge.textContent = '🟡 عاجل (24 س)';
    } else {
      urgencyBadge.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1';
      urgencyBadge.textContent = '🟢 عادي';
    }
    cellUrgency.appendChild(urgencyBadge);
    row.appendChild(cellUrgency);

    // 6. Case Summary (Truncated with click-to-expand)
    const cellSummary = document.createElement('td');
    cellSummary.className = 'py-3.5 px-3 max-w-xs';
    const summaryP = document.createElement('p');
    summaryP.className = 'text-xs text-slate-300 truncate';
    summaryP.textContent = lead.summary || '-';
    const expandBtn = document.createElement('button');
    expandBtn.className = 'text-[11px] text-amber-400 hover:underline block mt-0.5 font-semibold';
    expandBtn.textContent = 'عرض الملف كاملاً...';
    expandBtn.onclick = () => openDossierModal(lead);
    cellSummary.appendChild(summaryP);
    cellSummary.appendChild(expandBtn);
    row.appendChild(cellSummary);

    // 7. Status Workflow Dropdown
    const cellStatus = document.createElement('td');
    cellStatus.className = 'py-3.5 px-3 whitespace-nowrap';
    const statusSelect = document.createElement('select');
    statusSelect.className = 'text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-amber-400 outline-none';
    const statuses = ['جديد', 'تم التواصل', 'استشارة مدفوعة', 'تم حجز موعد', 'مكتمل'];
    statuses.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      if (lead.status === st) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.onchange = (e) => updateCaseStatus(lead.id, e.target.value);
    cellStatus.appendChild(statusSelect);
    row.appendChild(cellStatus);

    // 8. Actions (Inspect Dossier, Delete)
    const cellActions = document.createElement('td');
    cellActions.className = 'py-3.5 px-3 text-left whitespace-nowrap';
    
    // Inspect Button
    const inspectBtn = document.createElement('button');
    inspectBtn.className = 'px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs border border-amber-500/40 ml-1.5 transition';
    inspectBtn.title = 'فحص ملف الموكل كاملاً وطباعته';
    inspectBtn.innerHTML = '<i class="fa-solid fa-file-shield"></i>';
    inspectBtn.onclick = () => openDossierModal(lead);
    cellActions.appendChild(inspectBtn);

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs border border-rose-500/40 transition';
    deleteBtn.title = 'حذف السجل نهائياً';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.onclick = () => deleteCaseRecord(lead.id);
    cellActions.appendChild(deleteBtn);

    row.appendChild(cellActions);
    tableBody.appendChild(row);
  });
}

/**
 * Update Case Status
 */
function updateCaseStatus(leadId, newStatus) {
  allLeads = allLeads.map(item => {
    if (item.id === leadId) {
      item.status = newStatus;
    }
    return item;
  });

  localStorage.setItem('halawa_leads', JSON.stringify(allLeads));
  updateKpiMetrics();
  showSecurityToast(`تم تحديث حالة الطلب إلى "${newStatus}" بنجاح.`, 'success');
}

/**
 * Delete Case Record (with security confirmation)
 */
function deleteCaseRecord(leadId) {
  if (confirm(`تحذير أمني: هل أنت متأكد من حذف السجل رقم [${leadId}] نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) {
    allLeads = allLeads.filter(item => item.id !== leadId);
    localStorage.setItem('halawa_leads', JSON.stringify(allLeads));
    fetchAndRenderLeads();
    showSecurityToast(`تم حذف السجل [${leadId}] نهائياً من قاعدة البيانات المحلية.`, 'info');
  }
}

/**
 * Open Full Case Dossier Modal
 */
function openDossierModal(lead) {
  const modal = document.getElementById('admin-dossier-modal');
  const container = document.getElementById('admin-dossier-content');
  if (!modal || !container) return;

  // Clear container
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Header Box
  const headerBox = document.createElement('div');
  headerBox.className = 'flex items-center justify-between pb-4 border-b border-slate-700';

  const titleGroup = document.createElement('div');
  const refCode = document.createElement('span');
  refCode.className = 'text-xs font-mono text-amber-400 font-bold';
  refCode.textContent = lead.id || '-';
  const nameHeading = document.createElement('h3');
  nameHeading.className = 'text-xl font-bold text-white mt-1';
  nameHeading.textContent = lead.name || '-';
  titleGroup.appendChild(refCode);
  titleGroup.appendChild(nameHeading);

  const timeGroup = document.createElement('div');
  timeGroup.className = 'text-left text-xs text-slate-400';
  const timeText = document.createElement('div');
  timeText.textContent = lead.timestamp || '-';
  const statusBadge = document.createElement('div');
  statusBadge.className = 'mt-1 font-bold text-amber-300';
  statusBadge.textContent = `الحالة: ${lead.status || 'جديد'}`;
  timeGroup.appendChild(timeText);
  timeGroup.appendChild(statusBadge);

  headerBox.appendChild(titleGroup);
  headerBox.appendChild(timeGroup);
  container.appendChild(headerBox);

  // Meta Grid (2x2)
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-3 pt-4 text-xs sm:text-sm';

  const metaItems = [
    { label: 'رقم هاتف الموكل:', value: lead.phone || '-', isPhone: true },
    { label: 'المركز / المحافظة:', value: lead.location || 'المنوفية' },
    { label: 'تخصص القضية:', value: lead.caseType || '-' },
    { label: 'الخدمة المطلوبة:', value: lead.serviceType || '-' },
    { label: 'درجة الأهمية:', value: lead.urgency || 'عادي' },
    { label: 'خط الاستقبال المختار:', value: lead.selectedLawyerPhone === '201003049739' ? '01003049739 (فودافون)' : '01228194003 (أورانج)' }
  ];

  metaItems.forEach(item => {
    const box = document.createElement('div');
    box.className = 'p-3 bg-slate-900/80 rounded-xl border border-slate-800';
    const labelSpan = document.createElement('span');
    labelSpan.className = 'text-slate-400 block text-xs mb-0.5';
    labelSpan.textContent = item.label;
    const valueSpan = document.createElement('span');
    valueSpan.className = 'font-bold text-white';
    valueSpan.textContent = item.value;
    box.appendChild(labelSpan);
    box.appendChild(valueSpan);
    grid.appendChild(box);
  });
  container.appendChild(grid);

  // Summary Textbox
  const summaryBox = document.createElement('div');
  summaryBox.className = 'pt-4';
  const summaryLabel = document.createElement('span');
  summaryLabel.className = 'text-amber-400 font-bold block mb-1.5 text-xs';
  summaryLabel.textContent = 'ملخص النزاع وتفاصيل استشارة الموكل:';
  const summaryP = document.createElement('div');
  summaryP.className = 'whitespace-pre-wrap text-slate-200 leading-relaxed text-sm bg-black/40 p-4 rounded-xl border border-slate-800';
  summaryP.textContent = lead.summary || '-';
  summaryBox.appendChild(summaryLabel);
  summaryBox.appendChild(summaryP);
  container.appendChild(summaryBox);

  // Action Buttons inside Modal
  const actionsBar = document.createElement('div');
  actionsBar.className = 'pt-6 flex items-center justify-between border-t border-slate-800 mt-6';

  const waBtn = document.createElement('a');
  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  waBtn.href = `https://wa.me/2${cleanPhone}`;
  waBtn.target = '_blank';
  waBtn.className = 'px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow';
  waBtn.innerHTML = '<i class="fa-brands fa-whatsapp text-base"></i> محادثة الموكل في واتساب';

  const printBtn = document.createElement('button');
  printBtn.className = 'px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700';
  printBtn.innerHTML = '<i class="fa-solid fa-print"></i> طباعة ملف الموكل';
  printBtn.onclick = () => window.print();

  actionsBar.appendChild(waBtn);
  actionsBar.appendChild(printBtn);
  container.appendChild(actionsBar);

  modal.classList.remove('hidden');
}

window.closeDossierModal = function() {
  const modal = document.getElementById('admin-dossier-modal');
  if (modal) modal.classList.add('hidden');
};

/**
 * Secure CSV Export (Anti-CSV / Formula Injection Protected)
 */
function exportSecureCsv() {
  if (allLeads.length === 0) {
    showSecurityToast('لا توجد بيانات متاحة للتصدير حالياً.', 'warning');
    return;
  }

  // UTF-8 BOM for Arabic in Excel
  const bom = "\uFEFF";
  const headers = ["كود_الطلب", "التاريخ_والوقت", "اسم_الموكل", "رقم_الهاتف", "المركز_المحافظة", "تخصص_القضية", "الخدمة_المطلوبة", "درجة_الأهمية", "ملخص_الدعوى", "الحالة"];

  // Anti-Formula Injection Sanitizer
  const sanitizeCell = (val) => {
    let str = (val || '').toString();
    // If cell starts with formula triggers (=, +, -, @, tab, return), escape by prepending apostrophe
    if (/^[=\+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    // Escape internal quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = allLeads.map(l => [
    sanitizeCell(l.id),
    sanitizeCell(l.timestamp),
    sanitizeCell(l.name),
    sanitizeCell(l.phone),
    sanitizeCell(l.location),
    sanitizeCell(l.caseType),
    sanitizeCell(l.serviceType),
    sanitizeCell(l.urgency),
    sanitizeCell(l.summary),
    sanitizeCell(l.status || 'جديد')
  ]);

  const csvContent = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `سجل_قضايا_مكتب_حلاوه_المؤمن_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showSecurityToast('تم تصدير ملف الإكسل (CSV) مؤمن ومحمي ضد حقن المعادلات بنجاح!', 'success');
}
