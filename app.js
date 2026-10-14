// ==========================================================================
// DhanaKhaata - Core Application Logic
// ==========================================================================

// Global App State
const state = {
  incomes: [],
  expenses: [],
  lent: [],
  borrowed: [],
  theme: 'dark',
  activeTab: 'dashboard',
  calcMode: 'desi',
  chartView: 'income', // 'income' or 'expense'
  quickDueFilter: 'all',
  firebaseConfig: null,
  forex: {
    usdtInr: 94.92,
    usdInr: 88.65,
    customRate: 94.92,
    activeMode: 'usdt', // 'usdt', 'forex', 'custom'
    lastUpdated: null,
    usdtChange24h: 0.15,
    isFetching: false
  }
};

// Storage Keys
const STORAGE_KEYS = {
  INCOMES: 'dhanakhaata_incomes_v1',
  EXPENSES: 'dhanakhaata_expenses_v1',
  LENT: 'dhanakhaata_lent_v1',
  BORROWED: 'dhanakhaata_borrowed_v1',
  THEME: 'dhanakhaata_theme_v1',
  FB_CONFIG: 'dhanakhaata_fb_config_v1',
  FOREX_CUSTOM_RATE: 'dhanakhaata_forex_custom_v1'
};

// ==========================================================================
// 1. Initialization & State Loading
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadLocalData();
  setupEventListeners();
  initTheme();
  initDefaultDates();
  calculateInterest();
  initForexConverter();
  initFirebaseFromStorage();
  refreshAllViews();
});

function loadLocalData() {
  try {
    const rawIncomes = localStorage.getItem(STORAGE_KEYS.INCOMES);
    const rawExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const rawLent = localStorage.getItem(STORAGE_KEYS.LENT);
    const rawBorrowed = localStorage.getItem(STORAGE_KEYS.BORROWED);
    const rawFbConfig = localStorage.getItem(STORAGE_KEYS.FB_CONFIG);

    state.incomes = rawIncomes ? JSON.parse(rawIncomes) : getSampleIncomes();
    state.expenses = rawExpenses ? JSON.parse(rawExpenses) : getSampleExpenses();
    state.lent = rawLent ? JSON.parse(rawLent) : getSampleLent();
    state.borrowed = rawBorrowed ? JSON.parse(rawBorrowed) : getSampleBorrowed();

    if (rawFbConfig) {
      state.firebaseConfig = JSON.parse(rawFbConfig);
      populateFirebaseForm(state.firebaseConfig);
    }
  } catch (err) {
    console.error("Error loading local data:", err);
    showToast("Error loading local storage data", "danger");
  }
}

function saveState(key) {
  try {
    if (key === 'incomes' || !key) {
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(state.incomes));
    }
    if (key === 'expenses' || !key) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(state.expenses));
    }
    if (key === 'lent' || !key) {
      localStorage.setItem(STORAGE_KEYS.LENT, JSON.stringify(state.lent));
    }
    if (key === 'borrowed' || !key) {
      localStorage.setItem(STORAGE_KEYS.BORROWED, JSON.stringify(state.borrowed));
    }
    if (key === 'firebaseConfig' || !key) {
      if (state.firebaseConfig) {
        localStorage.setItem(STORAGE_KEYS.FB_CONFIG, JSON.stringify(state.firebaseConfig));
      } else {
        localStorage.removeItem(STORAGE_KEYS.FB_CONFIG);
      }
    }
  } catch (e) {
    console.error("Storage save failed:", e);
  }
}

// Sample Data Initializers
function getSampleIncomes() {
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0];
  return [
    {
      id: 'inc_' + Date.now() + '_1',
      amount: 45000,
      date: today,
      category: 'Salary',
      customSource: '',
      mode: 'Bank',
      notes: 'Monthly Software & Tech Salary',
      createdAt: new Date().toISOString()
    },
    {
      id: 'inc_' + Date.now() + '_2',
      amount: 12000,
      date: lastMonth,
      category: 'Freelance',
      customSource: '',
      mode: 'UPI',
      notes: 'Website UI Design for Client',
      createdAt: new Date().toISOString()
    },
    {
      id: 'inc_' + Date.now() + '_3',
      amount: 5500,
      date: today,
      category: 'Rental',
      customSource: '',
      mode: 'Cash',
      notes: 'Ground Floor Room Rent',
      createdAt: new Date().toISOString()
    }
  ];
}

function getSampleExpenses() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0];
  return [
    {
      id: 'exp_' + Date.now() + '_1',
      amount: 4200,
      date: today,
      category: 'Food & Groceries',
      customCategory: '',
      mode: 'UPI',
      notes: 'Weekly grocery & fresh vegetable shopping',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp_' + Date.now() + '_2',
      amount: 1850,
      date: yesterday,
      category: 'Utilities & Bills',
      customCategory: '',
      mode: 'UPI',
      notes: 'Monthly Electricity & Mobile Recharge',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp_' + Date.now() + '_3',
      amount: 800,
      date: today,
      category: 'Fuel & Transport',
      customCategory: '',
      mode: 'Cash',
      notes: 'Bike petrol refill',
      createdAt: new Date().toISOString()
    }
  ];
}

function getSampleLent() {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
  return [
    {
      id: 'lent_' + Date.now() + '_1',
      personName: 'Rakesh Behera',
      phone: '9876543210',
      amount: 15000,
      dateGiven: today,
      dueDate: dueDate,
      interestRate: 2,
      reason: 'Urgent medical expenses',
      status: 'pending',
      repayments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'lent_' + Date.now() + '_2',
      personName: 'Prakash Swain',
      phone: '9437123456',
      amount: 8000,
      dateGiven: '2026-09-10',
      dueDate: '2026-10-25',
      interestRate: 0,
      reason: 'Shop inventory purchase',
      status: 'partial',
      repayments: [
        { amount: 3000, date: '2026-10-01', mode: 'UPI', note: 'First installment via PhonePe' }
      ],
      createdAt: new Date().toISOString()
    }
  ];
}

function getSampleBorrowed() {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0];
  return [
    {
      id: 'bor_' + Date.now() + '_1',
      personName: 'Manoj Kumar Panda',
      phone: '9861009988',
      amount: 10000,
      dateTaken: today,
      dueDate: dueDate,
      interestRate: 0,
      reason: 'Laptop screen replacement emergency',
      status: 'pending',
      repayments: [],
      createdAt: new Date().toISOString()
    }
  ];
}

// ==========================================================================
// 2. Navigation, Tabs & Theme Management
// ==========================================================================

function setupEventListeners() {
  // Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      switchTab(tabTarget);
    });
  });

  // Theme Toggle
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Settings & Status modal triggers
  document.getElementById('openSettingsBtn').addEventListener('click', () => openModal('settingsModal'));
  document.getElementById('firebaseStatusBtn').addEventListener('click', () => openModal('settingsModal'));

  // Calculator Mode Buttons
  document.querySelectorAll('.calc-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.calc-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.calcMode = btn.getAttribute('data-calcmode');
      updateCalcFormVisibility();
      calculateInterest();
    });
  });

  // Close modals on clicking outside or escape key
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.add('hidden');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(modal => modal.classList.add('hidden'));
    }
  });
}

function switchTab(tabId) {
  if (tabId === 'udhar-diachhi') tabId = 'lent';
  if (tabId === 'udhar-aanichhi') tabId = 'borrowed';
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.mobile-nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(pane => {
    pane.classList.remove('active');
  });

  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) {
    activeContent.classList.add('active');
  }

  // Refresh view on tab switch
  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'income') renderIncomeTable();
  if (tabId === 'expense') renderExpenseTable();
  if (tabId === 'lent') renderLentTable();
  if (tabId === 'borrowed') renderBorrowedTable();
  if (tabId === 'forex') {
    fetchLiveUsdtRate();
    updateForexUI();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');
  if (theme === 'light') {
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  } else {
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  }

  drawDonutChart();
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function initDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const incDate = document.getElementById('incomeDate');
  if (incDate) incDate.value = today;

  const expDate = document.getElementById('expenseDate');
  if (expDate) expDate.value = today;

  const lentDate = document.getElementById('lentDateGiven');
  if (lentDate) lentDate.value = today;

  const lentDue = document.getElementById('lentDueDate');
  if (lentDue) lentDue.value = nextMonth;

  const borDate = document.getElementById('borrowedDateTaken');
  if (borDate) borDate.value = today;

  const borDue = document.getElementById('borrowedDueDate');
  if (borDue) borDue.value = nextMonth;

  const repayDate = document.getElementById('repayDate');
  if (repayDate) repayDate.value = today;
}

// Modal management
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
};

// ==========================================================================
// 3. Dashboard Analytics & Charts
// ==========================================================================

function refreshAllViews() {
  renderDashboard();
  renderIncomeTable();
  renderExpenseTable();
  renderLentTable();
  renderBorrowedTable();
}

function renderDashboard() {
  // 1. Total Income
  const totalIncome = state.incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  document.getElementById('dashTotalIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('dashIncomeCount').textContent = `${state.incomes.length} recorded entries`;

  // 2. Total Expense
  const totalExpense = state.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const expElem = document.getElementById('dashTotalExpense');
  if (expElem) expElem.textContent = formatCurrency(totalExpense);
  const expCountElem = document.getElementById('dashExpenseCount');
  if (expCountElem) expCountElem.textContent = `${state.expenses.length} recorded entries`;

  // 3. Money Lent
  const totalLentGiven = state.lent.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalLentRecovered = state.lent.reduce((acc, curr) => {
    const repaid = (curr.repayments || []).reduce((rSum, r) => rSum + Number(r.amount || 0), 0);
    return acc + repaid;
  }, 0);
  const totalLentPending = Math.max(0, totalLentGiven - totalLentRecovered);

  document.getElementById('dashLentPending').textContent = formatCurrency(totalLentPending);
  document.getElementById('dashLentTotal').textContent = `Total Given: ${formatCurrency(totalLentGiven)}`;
  document.getElementById('dashLentRecovered').textContent = `Recovered: ${formatCurrency(totalLentRecovered)}`;

  // 4. Money Borrowed
  const totalBorrowedSum = state.borrowed.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalBorrowedRepaid = state.borrowed.reduce((acc, curr) => {
    const repaid = (curr.repayments || []).reduce((rSum, r) => rSum + Number(r.amount || 0), 0);
    return acc + repaid;
  }, 0);
  const totalBorrowedPending = Math.max(0, totalBorrowedSum - totalBorrowedRepaid);

  document.getElementById('dashBorrowedPending').textContent = formatCurrency(totalBorrowedPending);
  document.getElementById('dashBorrowedTotal').textContent = `Total Taken: ${formatCurrency(totalBorrowedSum)}`;
  document.getElementById('dashBorrowedRepaid').textContent = `Repaid: ${formatCurrency(totalBorrowedRepaid)}`;

  // 5. In-Hand Cash Balance & Net Position
  // In-Hand Cash = Total Income - Total Expense
  const inHandCash = totalIncome - totalExpense;
  const inHandElem = document.getElementById('dashInHandCash');
  if (inHandElem) {
    inHandElem.textContent = formatCurrency(inHandCash);
    inHandElem.className = inHandCash >= 0 ? 'stat-value text-success' : 'stat-value text-danger';
  }

  // Net Financial Position = In-Hand Cash + Pending Lent (Receivables) - Pending Borrowed (Payables)
  const netPosition = inHandCash + totalLentPending - totalBorrowedPending;
  const netElem = document.getElementById('dashNetBalance');
  if (netElem) {
    netElem.textContent = formatCurrency(netPosition);
  }

  // Draw Charts & Recent items
  drawDonutChart();
  renderQuickDues();
  renderRecentActivity();
}

// Donut Chart Toggle (Income vs Expense)
window.setChartView = function(view) {
  state.chartView = view;
  const incomeBtn = document.getElementById('chartViewIncomeBtn');
  const expenseBtn = document.getElementById('chartViewExpenseBtn');

  if (incomeBtn) incomeBtn.classList.toggle('active', view === 'income');
  if (expenseBtn) expenseBtn.classList.toggle('active', view === 'expense');

  drawDonutChart();
};

function drawDonutChart() {
  const canvas = document.getElementById('incomeDonutCanvas');
  const legendElem = document.getElementById('incomeLegendList');
  const donutTotalElem = document.getElementById('donutTotalText');
  const donutLabelElem = document.getElementById('donutTotalLabel');
  const titleOdia = document.getElementById('dashBreakdownOdia');
  const descElem = document.getElementById('dashBreakdownDesc');

  if (!canvas || !legendElem) return;

  const isIncome = state.chartView === 'income';

  if (titleOdia) {
    titleOdia.textContent = isIncome ? 'Income Breakdown' : 'Expense Breakdown';
  }
  if (descElem) {
    descElem.textContent = isIncome ? 'Where your earnings came from' : 'Where your hard-earned money went';
  }
  if (donutLabelElem) {
    donutLabelElem.textContent = isIncome ? 'Total Income' : 'Total Expense';
  }

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const dataset = isIncome ? state.incomes : state.expenses;
  const categoryTotals = {};
  let totalAmount = 0;

  dataset.forEach(item => {
    let cat = item.category;
    if (item.category === 'Custom') {
      cat = item.customSource || item.customCategory || 'Custom';
    }
    const amt = Number(item.amount || 0);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalAmount += amt;
  });

  donutTotalElem.textContent = formatCurrency(totalAmount);

  if (totalAmount === 0) {
    legendElem.innerHTML = `<div class="empty-hint">No ${isIncome ? 'income' : 'expense'} recorded yet. Click '+ Add ${isIncome ? 'Income' : 'Expense'}' to begin.</div>`;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 75, 0, 2 * Math.PI);
    ctx.strokeStyle = state.theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 22;
    ctx.stroke();
    return;
  }

  const colors = isIncome
    ? ['#10b981', '#06b6d4', '#8b5cf6', '#3b82f6', '#14b8a6', '#6366f1', '#10b981']
    : ['#f97316', '#ef4444', '#ec4899', '#f59e0b', '#8b5cf6', '#e11d48', '#d97706'];

  let startAngle = -0.5 * Math.PI;
  let colorIdx = 0;
  let legendHtml = '';

  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  entries.forEach(([cat, amt]) => {
    const sliceAngle = (amt / totalAmount) * 2 * Math.PI;
    const color = colors[colorIdx % colors.length];

    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 75, startAngle, startAngle + sliceAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 22;
    ctx.lineCap = 'butt';
    ctx.stroke();

    startAngle += sliceAngle;

    const percentage = Math.round((amt / totalAmount) * 100);
    legendHtml += `
      <div class="legend-row">
        <div class="legend-name">
          <span class="legend-dot" style="background: ${color}"></span>
          <span>${escapeHtml(cat)} <small class="text-muted">(${percentage}%)</small></span>
        </div>
        <div class="legend-amount">${formatCurrency(amt)}</div>
      </div>
    `;

    colorIdx++;
  });

  legendElem.innerHTML = legendHtml;
}

// Quick Dues in Dashboard
window.setQuickDueFilter = function(filter) {
  state.quickDueFilter = filter;
  document.getElementById('quickDueFilterAll').classList.toggle('active', filter === 'all');
  document.getElementById('quickDueFilterLent').classList.toggle('active', filter === 'lent');
  document.getElementById('quickDueFilterBorrowed').classList.toggle('active', filter === 'borrowed');
  renderQuickDues();
};

function renderQuickDues() {
  const container = document.getElementById('dashboardQuickDues');
  if (!container) return;

  const items = [];

  // Lent items with pending balance
  if (state.quickDueFilter === 'all' || state.quickDueFilter === 'lent') {
    state.lent.forEach(l => {
      const repaid = (l.repayments || []).reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const remaining = Number(l.amount || 0) - repaid;
      if (remaining > 0) {
        items.push({
          type: 'lent',
          id: l.id,
          name: l.personName,
          phone: l.phone,
          remaining: remaining,
          dueDate: l.dueDate,
          reason: l.reason
        });
      }
    });
  }

  // Borrowed items with pending balance
  if (state.quickDueFilter === 'all' || state.quickDueFilter === 'borrowed') {
    state.borrowed.forEach(b => {
      const repaid = (b.repayments || []).reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const remaining = Number(b.amount || 0) - repaid;
      if (remaining > 0) {
        items.push({
          type: 'borrowed',
          id: b.id,
          name: b.personName,
          phone: b.phone,
          remaining: remaining,
          dueDate: b.dueDate,
          reason: b.reason
        });
      }
    });
  }

  items.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-hint">No pending dues found! You're completely settled. 🎉</div>`;
    return;
  }

  let html = '';
  items.slice(0, 5).forEach(item => {
    const isLent = item.type === 'lent';
    const tagClass = isLent ? 'tag-lent' : 'tag-borrowed';
    const tagText = isLent ? 'To Collect' : 'To Repay';
    const initial = (item.name || 'U').charAt(0).toUpperCase();

    const dueFormatted = item.dueDate ? formatDate(item.dueDate) : 'No due date';
    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();

    html += `
      <div class="due-item">
        <div class="due-info">
          <div class="due-avatar ${isLent ? 'text-lent' : 'text-borrowed'}">${initial}</div>
          <div>
            <div class="due-name">${escapeHtml(item.name)} <span class="due-type-tag ${tagClass}">${tagText}</span></div>
            <div class="due-date ${isOverdue ? 'text-danger font-bold' : ''}">
              ${isOverdue ? '⚠️ Overdue: ' : '📅 Due: '} ${dueFormatted}
            </div>
          </div>
        </div>
        <div class="due-balance">
          <div class="due-amount ${isLent ? 'text-lent' : 'text-borrowed'}">${formatCurrency(item.remaining)}</div>
          <button class="btn btn-sm btn-outline mt-1" onclick="openRepaymentModal('${item.type}', '${item.id}')">Pay / Collect</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Recent Activity Table
function renderRecentActivity() {
  const tbody = document.getElementById('recentActivityTbody');
  if (!tbody) return;

  const activities = [];

  state.incomes.forEach(i => {
    activities.push({
      type: 'Income',
      name: i.category === 'Custom' ? i.customSource : i.category,
      amount: i.amount,
      date: i.date,
      mode: i.mode,
      note: i.notes,
      rawType: 'income'
    });
  });

  state.expenses.forEach(e => {
    activities.push({
      type: 'Expense',
      name: e.category === 'Custom' ? e.customCategory : e.category,
      amount: e.amount,
      date: e.date,
      mode: e.mode,
      note: e.notes,
      rawType: 'expense'
    });
  });

  state.lent.forEach(l => {
    activities.push({
      type: 'Money Lent',
      name: l.personName,
      amount: l.amount,
      date: l.dateGiven,
      mode: 'Lent',
      note: l.reason || 'Lent to borrower',
      rawType: 'lent'
    });
  });

  state.borrowed.forEach(b => {
    activities.push({
      type: 'Money Borrowed',
      name: b.personName,
      amount: b.amount,
      date: b.dateTaken,
      mode: 'Borrowed',
      note: b.reason || 'Loan from lender',
      rawType: 'borrowed'
    });
  });

  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (activities.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center empty-hint">No transactions added yet.</td></tr>`;
    return;
  }

  let html = '';
  activities.slice(0, 8).forEach(act => {
    let badgeClass = 'text-success';
    let targetTab = 'income';
    if (act.rawType === 'expense') {
      badgeClass = 'text-expense';
      targetTab = 'expense';
    } else if (act.rawType === 'lent') {
      badgeClass = 'text-lent';
      targetTab = 'lent';
    } else if (act.rawType === 'borrowed') {
      badgeClass = 'text-borrowed';
      targetTab = 'borrowed';
    }

    html += `
      <tr>
        <td><span class="mode-badge ${badgeClass}">${act.type}</span></td>
        <td><strong>${escapeHtml(act.name)}</strong></td>
        <td><span class="font-bold ${badgeClass}">${act.rawType === 'expense' ? '-' : '+'}${formatCurrency(act.amount)}</span></td>
        <td>${formatDate(act.date)}</td>
        <td class="text-muted">${escapeHtml(act.note || '-')}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="switchTab('${targetTab}')">View</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==========================================================================
// 4. Income Tracker Functions
// ==========================================================================

window.handleIncomeCategoryChange = function() {
  const cat = document.getElementById('incomeCategory').value;
  const customGroup = document.getElementById('incomeCustomSourceGroup');
  if (cat === 'Custom') {
    customGroup.classList.remove('hidden');
    document.getElementById('incomeCustomSource').required = true;
  } else {
    customGroup.classList.add('hidden');
    document.getElementById('incomeCustomSource').required = false;
  }
};

window.handleIncomeSubmit = async function(event) {
  event.preventDefault();

  const editId = document.getElementById('incomeEditId').value;
  const amount = Number(document.getElementById('incomeAmount').value);
  const date = document.getElementById('incomeDate').value;
  const category = document.getElementById('incomeCategory').value;
  const customSource = document.getElementById('incomeCustomSource').value.trim();
  const notes = document.getElementById('incomeNotes').value.trim();

  const modeRadio = document.querySelector('input[name="incomeMode"]:checked');
  const mode = modeRadio ? modeRadio.value : 'UPI';

  if (!amount || amount <= 0 || !date) {
    showToast("Please enter valid amount and date", "danger");
    return;
  }

  const incomeItem = {
    id: editId || 'inc_' + Date.now(),
    amount: amount,
    date: date,
    category: category,
    customSource: category === 'Custom' ? customSource : '',
    mode: mode,
    notes: notes,
    updatedAt: new Date().toISOString()
  };

  if (editId) {
    const idx = state.incomes.findIndex(i => i.id === editId);
    if (idx !== -1) {
      state.incomes[idx] = { ...state.incomes[idx], ...incomeItem };
      showToast("Income record updated!", "success");
    }
  } else {
    incomeItem.createdAt = new Date().toISOString();
    state.incomes.unshift(incomeItem);
    showToast(`₹${amount.toLocaleString('en-IN')} income added!`, "success");
  }

  saveState('incomes');
  closeModal('incomeModal');
  resetIncomeForm();
  renderDashboard();
  renderIncomeTable();

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.syncDocToCloud('incomes', incomeItem.id, incomeItem);
  }
};

function resetIncomeForm() {
  document.getElementById('incomeForm').reset();
  document.getElementById('incomeEditId').value = '';
  document.getElementById('incomeModalTitle').innerHTML = `Add Income`;
  document.getElementById('incomeCustomSourceGroup').classList.add('hidden');
  initDefaultDates();
}

window.editIncome = function(id) {
  const item = state.incomes.find(i => i.id === id);
  if (!item) return;

  document.getElementById('incomeEditId').value = item.id;
  document.getElementById('incomeAmount').value = item.amount;
  document.getElementById('incomeDate').value = item.date;
  document.getElementById('incomeCategory').value = item.category;

  if (item.category === 'Custom') {
    document.getElementById('incomeCustomSourceGroup').classList.remove('hidden');
    document.getElementById('incomeCustomSource').value = item.customSource || '';
  } else {
    document.getElementById('incomeCustomSourceGroup').classList.add('hidden');
  }

  const modeRadio = document.querySelector(`input[name="incomeMode"][value="${item.mode}"]`);
  if (modeRadio) modeRadio.checked = true;

  document.getElementById('incomeNotes').value = item.notes || '';
  document.getElementById('incomeModalTitle').innerHTML = `Edit Income`;

  openModal('incomeModal');
};

window.deleteIncome = async function(id) {
  if (!confirm("Are you sure you want to delete this income record?")) return;

  state.incomes = state.incomes.filter(i => i.id !== id);
  saveState('incomes');
  renderDashboard();
  renderIncomeTable();
  showToast("Income record deleted", "info");

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.removeDocFromCloud('incomes', id);
  }
};

function renderIncomeTable() {
  const tbody = document.getElementById('incomeTableBody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('incomeSearchInput')?.value || '').toLowerCase();
  const categoryFilter = document.getElementById('incomeCategoryFilter')?.value || '';
  const timeFilter = document.getElementById('incomeTimeFilter')?.value || 'all';

  let filtered = state.incomes.filter(item => {
    const sourceName = item.category === 'Custom' ? item.customSource : item.category;
    const matchQuery = sourceName.toLowerCase().includes(searchQuery) ||
                       (item.notes || '').toLowerCase().includes(searchQuery) ||
                       (item.mode || '').toLowerCase().includes(searchQuery);
    if (!matchQuery) return false;

    if (categoryFilter && item.category !== categoryFilter) return false;

    if (timeFilter !== 'all') {
      const itemDate = new Date(item.date);
      const now = new Date();
      if (timeFilter === 'this-month') {
        if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
      } else if (timeFilter === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (itemDate.getMonth() !== lastMonth.getMonth() || itemDate.getFullYear() !== lastMonth.getFullYear()) return false;
      } else if (timeFilter === 'this-year') {
        if (itemDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  document.getElementById('incomeFilteredTotal').textContent = formatCurrency(total);
  document.getElementById('incomeFilteredCount').textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center empty-hint">No income entries match the selected filters.</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const sourceDisplay = item.category === 'Custom' && item.customSource ? `${item.customSource} (Custom)` : item.category;

    html += `
      <tr>
        <td><strong>${formatDate(item.date)}</strong></td>
        <td>
          <span class="category-tag">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" class="text-success"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ${escapeHtml(sourceDisplay)}
          </span>
        </td>
        <td><strong class="text-success">${formatCurrency(item.amount)}</strong></td>
        <td><span class="mode-badge">${escapeHtml(item.mode || 'UPI')}</span></td>
        <td>${escapeHtml(item.notes || '-')}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editIncome('${item.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteIncome('${item.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==========================================================================
// 5. Expense Tracker Functions
// ==========================================================================

window.handleExpenseCategoryChange = function() {
  const cat = document.getElementById('expenseCategory').value;
  const customGroup = document.getElementById('expenseCustomCategoryGroup');
  if (cat === 'Custom') {
    customGroup.classList.remove('hidden');
    document.getElementById('expenseCustomCategory').required = true;
  } else {
    customGroup.classList.add('hidden');
    document.getElementById('expenseCustomCategory').required = false;
  }
};

window.handleExpenseSubmit = async function(event) {
  event.preventDefault();

  const editId = document.getElementById('expenseEditId').value;
  const amount = Number(document.getElementById('expenseAmount').value);
  const date = document.getElementById('expenseDate').value;
  const category = document.getElementById('expenseCategory').value;
  const customCategory = document.getElementById('expenseCustomCategory').value.trim();
  const notes = document.getElementById('expenseNotes').value.trim();

  const modeRadio = document.querySelector('input[name="expenseMode"]:checked');
  const mode = modeRadio ? modeRadio.value : 'UPI';

  if (!amount || amount <= 0 || !date) {
    showToast("Please enter valid expense amount and date", "danger");
    return;
  }

  const expenseItem = {
    id: editId || 'exp_' + Date.now(),
    amount: amount,
    date: date,
    category: category,
    customCategory: category === 'Custom' ? customCategory : '',
    mode: mode,
    notes: notes,
    updatedAt: new Date().toISOString()
  };

  if (editId) {
    const idx = state.expenses.findIndex(e => e.id === editId);
    if (idx !== -1) {
      state.expenses[idx] = { ...state.expenses[idx], ...expenseItem };
      showToast("Expense record updated!", "success");
    }
  } else {
    expenseItem.createdAt = new Date().toISOString();
    state.expenses.unshift(expenseItem);
    showToast(`₹${amount.toLocaleString('en-IN')} expense recorded!`, "info");
  }

  saveState('expenses');
  closeModal('expenseModal');
  resetExpenseForm();
  renderDashboard();
  renderExpenseTable();

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.syncDocToCloud('expenses', expenseItem.id, expenseItem);
  }
};

function resetExpenseForm() {
  document.getElementById('expenseForm').reset();
  document.getElementById('expenseEditId').value = '';
  document.getElementById('expenseModalTitle').innerHTML = `Add Expense`;
  document.getElementById('expenseCustomCategoryGroup').classList.add('hidden');
  initDefaultDates();
}

window.editExpense = function(id) {
  const item = state.expenses.find(e => e.id === id);
  if (!item) return;

  document.getElementById('expenseEditId').value = item.id;
  document.getElementById('expenseAmount').value = item.amount;
  document.getElementById('expenseDate').value = item.date;
  document.getElementById('expenseCategory').value = item.category;

  if (item.category === 'Custom') {
    document.getElementById('expenseCustomCategoryGroup').classList.remove('hidden');
    document.getElementById('expenseCustomCategory').value = item.customCategory || '';
  } else {
    document.getElementById('expenseCustomCategoryGroup').classList.add('hidden');
  }

  const modeRadio = document.querySelector(`input[name="expenseMode"][value="${item.mode}"]`);
  if (modeRadio) modeRadio.checked = true;

  document.getElementById('expenseNotes').value = item.notes || '';
  document.getElementById('expenseModalTitle').innerHTML = `Edit Expense`;

  openModal('expenseModal');
};

window.deleteExpense = async function(id) {
  if (!confirm("Are you sure you want to delete this expense record?")) return;

  state.expenses = state.expenses.filter(e => e.id !== id);
  saveState('expenses');
  renderDashboard();
  renderExpenseTable();
  showToast("Expense record deleted", "info");

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.removeDocFromCloud('expenses', id);
  }
};

function renderExpenseTable() {
  const tbody = document.getElementById('expenseTableBody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('expenseSearchInput')?.value || '').toLowerCase();
  const categoryFilter = document.getElementById('expenseCategoryFilter')?.value || '';
  const timeFilter = document.getElementById('expenseTimeFilter')?.value || 'all';

  let filtered = state.expenses.filter(item => {
    const catName = item.category === 'Custom' ? item.customCategory : item.category;
    const matchQuery = catName.toLowerCase().includes(searchQuery) ||
                       (item.notes || '').toLowerCase().includes(searchQuery) ||
                       (item.mode || '').toLowerCase().includes(searchQuery);
    if (!matchQuery) return false;

    if (categoryFilter && item.category !== categoryFilter) return false;

    if (timeFilter !== 'all') {
      const itemDate = new Date(item.date);
      const now = new Date();
      if (timeFilter === 'this-month') {
        if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
      } else if (timeFilter === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (itemDate.getMonth() !== lastMonth.getMonth() || itemDate.getFullYear() !== lastMonth.getFullYear()) return false;
      } else if (timeFilter === 'this-year') {
        if (itemDate.getFullYear() !== now.getFullYear()) return false;
      }
    }

    return true;
  });

  const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  document.getElementById('expenseFilteredTotal').textContent = formatCurrency(total);
  document.getElementById('expenseFilteredCount').textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center empty-hint">No expense entries match the selected filters.</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const catDisplay = item.category === 'Custom' && item.customCategory ? `${item.customCategory} (Custom)` : item.category;

    html += `
      <tr>
        <td><strong>${formatDate(item.date)}</strong></td>
        <td>
          <span class="category-tag">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" class="text-expense"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${escapeHtml(catDisplay)}
          </span>
        </td>
        <td><strong class="text-expense">${formatCurrency(item.amount)}</strong></td>
        <td><span class="mode-badge">${escapeHtml(item.mode || 'UPI')}</span></td>
        <td>${escapeHtml(item.notes || '-')}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editExpense('${item.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense('${item.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==========================================================================
// 6. Money Lent Tracker
// ==========================================================================

window.handleLentSubmit = async function(event) {
  event.preventDefault();

  const editId = document.getElementById('lentEditId').value;
  const personName = document.getElementById('lentPersonName').value.trim();
  const phone = document.getElementById('lentPhone').value.trim();
  const amount = Number(document.getElementById('lentAmount').value);
  const dateGiven = document.getElementById('lentDateGiven').value;
  const dueDate = document.getElementById('lentDueDate').value;
  const interestRate = Number(document.getElementById('lentInterestRate').value || 0);
  const reason = document.getElementById('lentReason').value.trim();

  if (!personName || !amount || amount <= 0 || !dateGiven) {
    showToast("Please provide valid borrower name, amount and date", "danger");
    return;
  }

  const lentItem = {
    id: editId || 'lent_' + Date.now(),
    personName,
    phone,
    amount,
    dateGiven,
    dueDate,
    interestRate,
    reason,
    status: 'pending',
    repayments: editId ? (state.lent.find(l => l.id === editId)?.repayments || []) : [],
    updatedAt: new Date().toISOString()
  };

  if (editId) {
    const idx = state.lent.findIndex(l => l.id === editId);
    if (idx !== -1) {
      state.lent[idx] = { ...state.lent[idx], ...lentItem };
      updateItemStatus(state.lent[idx]);
      showToast("Loan record updated!", "success");
    }
  } else {
    lentItem.createdAt = new Date().toISOString();
    state.lent.unshift(lentItem);
    showToast(`Money lent of ₹${amount.toLocaleString('en-IN')} to ${personName} recorded!`, "success");
  }

  saveState('lent');
  closeModal('lentModal');
  resetLentForm();
  renderDashboard();
  renderLentTable();

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.syncDocToCloud('lent_records', lentItem.id, lentItem);
  }
};

function resetLentForm() {
  document.getElementById('lentForm').reset();
  document.getElementById('lentEditId').value = '';
  document.getElementById('lentModalTitle').innerHTML = `Record Money Lent`;
  initDefaultDates();
}

window.editLent = function(id) {
  const item = state.lent.find(l => l.id === id);
  if (!item) return;

  document.getElementById('lentEditId').value = item.id;
  document.getElementById('lentPersonName').value = item.personName;
  document.getElementById('lentPhone').value = item.phone || '';
  document.getElementById('lentAmount').value = item.amount;
  document.getElementById('lentDateGiven').value = item.dateGiven;
  document.getElementById('lentDueDate').value = item.dueDate || '';
  document.getElementById('lentInterestRate').value = item.interestRate || 0;
  document.getElementById('lentReason').value = item.reason || '';

  document.getElementById('lentModalTitle').innerHTML = `Edit Money Lent`;
  openModal('lentModal');
};

window.deleteLent = async function(id) {
  if (!confirm("Are you sure you want to delete this lent record and its payment history?")) return;

  state.lent = state.lent.filter(l => l.id !== id);
  saveState('lent');
  renderDashboard();
  renderLentTable();
  showToast("Loan record deleted", "info");

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.removeDocFromCloud('lent_records', id);
  }
};

function renderLentTable() {
  const grid = document.getElementById('lentCardsGrid');
  if (!grid) return;

  const searchQuery = (document.getElementById('lentSearchInput')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('lentStatusFilter')?.value || '';

  let filtered = state.lent.filter(item => {
    const matchQuery = (item.personName || '').toLowerCase().includes(searchQuery) ||
                       (item.phone || '').toLowerCase().includes(searchQuery) ||
                       (item.reason || '').toLowerCase().includes(searchQuery);
    if (!matchQuery) return false;

    if (statusFilter && item.status !== statusFilter) return false;
    return true;
  });

  let totalGiven = 0;
  let totalRecovered = 0;

  state.lent.forEach(item => {
    totalGiven += Number(item.amount || 0);
    const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    totalRecovered += repaid;
  });

  document.getElementById('lentTotalGiven').textContent = formatCurrency(totalGiven);
  document.getElementById('lentTotalRecovered').textContent = formatCurrency(totalRecovered);
  document.getElementById('lentStillToCollect').textContent = formatCurrency(Math.max(0, totalGiven - totalRecovered));

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-hint" style="grid-column: 1/-1;">No lent records found matching criteria.</div>`;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const initial = (item.personName || 'U').charAt(0).toUpperCase();
    const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const remaining = Math.max(0, Number(item.amount || 0) - repaid);
    const progressPct = Math.min(100, Math.round((repaid / item.amount) * 100));

    let statusClass = 'status-badge-pending';
    let statusText = 'Pending';
    if (item.status === 'settled' || remaining === 0) {
      statusClass = 'status-badge-settled';
      statusText = 'Fully Settled';
    } else if (item.status === 'partial' || repaid > 0) {
      statusClass = 'status-badge-partial';
      statusText = 'Partially Paid';
    }

    const isOverdue = item.dueDate && remaining > 0 && new Date(item.dueDate) < new Date();

    html += `
      <div class="loan-card udhar-card">
        <div>
          <div class="loan-card-header udhar-card-header">
            <div class="card-person-info">
              <div class="card-avatar avatar-lent">${initial}</div>
              <div>
                <div class="card-person-name">${escapeHtml(item.personName)}</div>
                <div class="card-person-phone">${item.phone ? '📞 ' + escapeHtml(item.phone) : 'No phone'}</div>
              </div>
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>

          <div class="card-money-box">
            <div class="money-row-main">
              <span class="money-label">Balance to Collect:</span>
              <span class="money-val-remaining text-lent">${formatCurrency(remaining)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill progress-fill-lent" style="width: ${progressPct}%;"></div>
            </div>
            <div class="card-meta-grid">
              <div class="card-meta-item">Total Lent: <strong>${formatCurrency(item.amount)}</strong></div>
              <div class="card-meta-item">Recovered: <strong class="text-success">${formatCurrency(repaid)} (${progressPct}%)</strong></div>
            </div>
          </div>

          <div class="card-meta-grid">
            <div class="card-meta-item">Given Date: <strong>${formatDate(item.dateGiven)}</strong></div>
            <div class="card-meta-item">
              Return Due: <strong class="${isOverdue ? 'text-danger' : ''}">${item.dueDate ? formatDate(item.dueDate) : 'Not specified'}</strong>
              ${isOverdue ? '<span class="text-danger font-bold text-xs"> (Overdue!)</span>' : ''}
            </div>
            ${item.interestRate > 0 ? `<div class="card-meta-item" style="grid-column: 1/-1;">Interest: <strong>${item.interestRate}% / month</strong></div>` : ''}
            ${item.reason ? `<div class="card-meta-item" style="grid-column: 1/-1;">Note: <em>${escapeHtml(item.reason)}</em></div>` : ''}
          </div>
        </div>

        <div class="card-actions-row">
          <button class="btn btn-sm btn-success" onclick="openRepaymentModal('lent', '${item.id}')">
            + Record Return
          </button>
          ${item.phone ? `
            <button class="btn btn-sm btn-whatsapp" onclick="sendWhatsAppReminder('${item.id}')" title="Send WhatsApp Payment Reminder">
              💬 WhatsApp
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline" onclick="editLent('${item.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteLent('${item.id}')">Delete</button>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// Send WhatsApp Reminder
window.sendWhatsAppReminder = function(lentId) {
  const item = state.lent.find(l => l.id === lentId);
  if (!item || !item.phone) {
    showToast("No phone number found for borrower", "danger");
    return;
  }

  const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  const remaining = Math.max(0, Number(item.amount || 0) - repaid);

  let cleanPhone = item.phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const message = `Hello ${item.personName},\n\nThis is a friendly reminder regarding the pending amount of ₹${remaining.toLocaleString('en-IN')}.\nDue Date: ${item.dueDate || 'Soon'}.\n\nPlease arrange to clear the payment when convenient. Thank you!`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
};

// ==========================================================================
// 7. Money Borrowed Tracker (Debt to repay)
// ==========================================================================

window.handleBorrowedSubmit = async function(event) {
  event.preventDefault();

  const editId = document.getElementById('borrowedEditId').value;
  const personName = document.getElementById('borrowedPersonName').value.trim();
  const phone = document.getElementById('borrowedPhone').value.trim();
  const amount = Number(document.getElementById('borrowedAmount').value);
  const dateTaken = document.getElementById('borrowedDateTaken').value;
  const dueDate = document.getElementById('borrowedDueDate').value;
  const interestRate = Number(document.getElementById('borrowedInterestRate').value || 0);
  const reason = document.getElementById('borrowedReason').value.trim();

  if (!personName || !amount || amount <= 0 || !dateTaken) {
    showToast("Please provide valid lender name, amount and date", "danger");
    return;
  }

  const borItem = {
    id: editId || 'bor_' + Date.now(),
    personName,
    phone,
    amount,
    dateTaken,
    dueDate,
    interestRate,
    reason,
    status: 'pending',
    repayments: editId ? (state.borrowed.find(b => b.id === editId)?.repayments || []) : [],
    updatedAt: new Date().toISOString()
  };

  if (editId) {
    const idx = state.borrowed.findIndex(b => b.id === editId);
    if (idx !== -1) {
      state.borrowed[idx] = { ...state.borrowed[idx], ...borItem };
      updateItemStatus(state.borrowed[idx]);
      showToast("Borrowed record updated!", "success");
    }
  } else {
    borItem.createdAt = new Date().toISOString();
    state.borrowed.unshift(borItem);
    showToast(`Money borrowed of ₹${amount.toLocaleString('en-IN')} from ${personName} recorded!`, "success");
  }

  saveState('borrowed');
  closeModal('borrowedModal');
  resetBorrowedForm();
  renderDashboard();
  renderBorrowedTable();

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.syncDocToCloud('borrowed_records', borItem.id, borItem);
  }
};

function resetBorrowedForm() {
  document.getElementById('borrowedForm').reset();
  document.getElementById('borrowedEditId').value = '';
  document.getElementById('borrowedModalTitle').innerHTML = `Record Money Borrowed`;
  initDefaultDates();
}

window.editBorrowed = function(id) {
  const item = state.borrowed.find(b => b.id === id);
  if (!item) return;

  document.getElementById('borrowedEditId').value = item.id;
  document.getElementById('borrowedPersonName').value = item.personName;
  document.getElementById('borrowedPhone').value = item.phone || '';
  document.getElementById('borrowedAmount').value = item.amount;
  document.getElementById('borrowedDateTaken').value = item.dateTaken;
  document.getElementById('borrowedDueDate').value = item.dueDate || '';
  document.getElementById('borrowedInterestRate').value = item.interestRate || 0;
  document.getElementById('borrowedReason').value = item.reason || '';

  document.getElementById('borrowedModalTitle').innerHTML = `Edit Money Borrowed`;
  openModal('borrowedModal');
};

window.deleteBorrowed = async function(id) {
  if (!confirm("Are you sure you want to delete this borrowed loan record?")) return;

  state.borrowed = state.borrowed.filter(b => b.id !== id);
  saveState('borrowed');
  renderDashboard();
  renderBorrowedTable();
  showToast("Borrowed record deleted", "info");

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    window.FirebaseBridge.removeDocFromCloud('borrowed_records', id);
  }
};

function renderBorrowedTable() {
  const grid = document.getElementById('borrowedCardsGrid');
  if (!grid) return;

  const searchQuery = (document.getElementById('borrowedSearchInput')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('borrowedStatusFilter')?.value || '';

  let filtered = state.borrowed.filter(item => {
    const matchQuery = (item.personName || '').toLowerCase().includes(searchQuery) ||
                       (item.phone || '').toLowerCase().includes(searchQuery) ||
                       (item.reason || '').toLowerCase().includes(searchQuery);
    if (!matchQuery) return false;

    if (statusFilter && item.status !== statusFilter) return false;
    return true;
  });

  let totalBorrowedSum = 0;
  let totalRepaidSum = 0;

  state.borrowed.forEach(item => {
    totalBorrowedSum += Number(item.amount || 0);
    const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    totalRepaidSum += repaid;
  });

  document.getElementById('borrowedTotalSum').textContent = formatCurrency(totalBorrowedSum);
  document.getElementById('borrowedTotalRepaid').textContent = formatCurrency(totalRepaidSum);
  document.getElementById('borrowedStillToPay').textContent = formatCurrency(Math.max(0, totalBorrowedSum - totalRepaidSum));

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-hint" style="grid-column: 1/-1;">No borrowed records found matching criteria.</div>`;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const initial = (item.personName || 'L').charAt(0).toUpperCase();
    const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const remaining = Math.max(0, Number(item.amount || 0) - repaid);
    const progressPct = Math.min(100, Math.round((repaid / item.amount) * 100));

    let statusClass = 'status-badge-pending';
    let statusText = 'Pending';
    if (item.status === 'settled' || remaining === 0) {
      statusClass = 'status-badge-settled';
      statusText = 'Fully Repaid';
    } else if (item.status === 'partial' || repaid > 0) {
      statusClass = 'status-badge-partial';
      statusText = 'Partially Repaid';
    }

    const isOverdue = item.dueDate && remaining > 0 && new Date(item.dueDate) < new Date();

    html += `
      <div class="loan-card udhar-card">
        <div>
          <div class="loan-card-header udhar-card-header">
            <div class="card-person-info">
              <div class="card-avatar avatar-borrowed">${initial}</div>
              <div>
                <div class="card-person-name">${escapeHtml(item.personName)}</div>
                <div class="card-person-phone">${item.phone ? '📞 ' + escapeHtml(item.phone) : 'No phone'}</div>
              </div>
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>

          <div class="card-money-box">
            <div class="money-row-main">
              <span class="money-label">Remaining Debt to Pay:</span>
              <span class="money-val-remaining text-borrowed">${formatCurrency(remaining)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill progress-fill-borrowed" style="width: ${progressPct}%;"></div>
            </div>
            <div class="card-meta-grid">
              <div class="card-meta-item">Total Borrowed: <strong>${formatCurrency(item.amount)}</strong></div>
              <div class="card-meta-item">Repaid: <strong class="text-success">${formatCurrency(repaid)} (${progressPct}%)</strong></div>
            </div>
          </div>

          <div class="card-meta-grid">
            <div class="card-meta-item">Taken Date: <strong>${formatDate(item.dateTaken)}</strong></div>
            <div class="card-meta-item">
              Repay Due: <strong class="${isOverdue ? 'text-danger' : ''}">${item.dueDate ? formatDate(item.dueDate) : 'Not specified'}</strong>
              ${isOverdue ? '<span class="text-danger font-bold text-xs"> (Overdue!)</span>' : ''}
            </div>
            ${item.interestRate > 0 ? `<div class="card-meta-item" style="grid-column: 1/-1;">Interest: <strong>${item.interestRate}% / month</strong></div>` : ''}
            ${item.reason ? `<div class="card-meta-item" style="grid-column: 1/-1;">Note: <em>${escapeHtml(item.reason)}</em></div>` : ''}
          </div>
        </div>

        <div class="card-actions-row">
          <button class="btn btn-sm btn-danger" onclick="openRepaymentModal('borrowed', '${item.id}')">
            💸 Repay Debt
          </button>
          <button class="btn btn-sm btn-outline" onclick="editBorrowed('${item.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteBorrowed('${item.id}')">Delete</button>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function updateItemStatus(item) {
  const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  if (repaid >= Number(item.amount)) {
    item.status = 'settled';
  } else if (repaid > 0) {
    item.status = 'partial';
  } else {
    item.status = 'pending';
  }
}

// ==========================================================================
// 8. Repayment Tracking Modal & History
// ==========================================================================

window.openRepaymentModal = function(type, id) {
  const item = type === 'lent' ? state.lent.find(l => l.id === id) : state.borrowed.find(b => b.id === id);
  if (!item) return;

  document.getElementById('repayTargetType').value = type;
  document.getElementById('repayTargetId').value = id;

  const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  const remaining = Math.max(0, Number(item.amount || 0) - repaid);

  document.getElementById('repayTotalOriginal').textContent = formatCurrency(item.amount);
  document.getElementById('repayAlreadyPaid').textContent = formatCurrency(repaid);
  document.getElementById('repayRemainingBalance').textContent = formatCurrency(remaining);

  const titlePrefix = type === 'lent' ? 'Collect Repayment from' : 'Repay Debt to';
  document.getElementById('repayModalTitle').innerHTML = `${titlePrefix} ${escapeHtml(item.personName)}`;
  document.getElementById('repayModalSubtitle').textContent = `Total balance still pending: ${formatCurrency(remaining)}`;

  document.getElementById('repayAmount').value = '';
  document.getElementById('repayNote').value = '';
  document.getElementById('repayDate').value = new Date().toISOString().split('T')[0];

  renderRepaymentHistory(item.repayments || [], type);
  openModal('repaymentModal');
};

window.fillFullRemainingAmount = function() {
  const type = document.getElementById('repayTargetType').value;
  const id = document.getElementById('repayTargetId').value;
  const item = type === 'lent' ? state.lent.find(l => l.id === id) : state.borrowed.find(b => b.id === id);
  if (!item) return;

  const repaid = (item.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  const remaining = Math.max(0, Number(item.amount || 0) - repaid);
  document.getElementById('repayAmount').value = remaining;
};

window.handleRepaymentSubmit = async function(event) {
  event.preventDefault();

  const type = document.getElementById('repayTargetType').value;
  const id = document.getElementById('repayTargetId').value;
  const amount = Number(document.getElementById('repayAmount').value);
  const date = document.getElementById('repayDate').value;
  const mode = document.querySelector('input[name="repayMode"]:checked')?.value || 'UPI';
  const note = document.getElementById('repayNote').value.trim();

  if (!amount || amount <= 0 || !date) {
    showToast("Please enter a valid payment amount and date", "danger");
    return;
  }

  const item = type === 'lent' ? state.lent.find(l => l.id === id) : state.borrowed.find(b => b.id === id);
  if (!item) return;

  if (!item.repayments) item.repayments = [];

  const paymentRecord = {
    paymentId: 'pay_' + Date.now(),
    amount: amount,
    date: date,
    mode: mode,
    note: note,
    recordedAt: new Date().toISOString()
  };

  item.repayments.unshift(paymentRecord);
  updateItemStatus(item);

  saveState(type);
  showToast(`Payment of ₹${amount.toLocaleString('en-IN')} logged!`, "success");

  const repaid = item.repayments.reduce((s, r) => s + Number(r.amount || 0), 0);
  const remaining = Math.max(0, Number(item.amount || 0) - repaid);
  document.getElementById('repayAlreadyPaid').textContent = formatCurrency(repaid);
  document.getElementById('repayRemainingBalance').textContent = formatCurrency(remaining);
  renderRepaymentHistory(item.repayments, type);

  if (window.FirebaseBridge && window.FirebaseBridge.isConnected()) {
    const colName = type === 'lent' ? 'lent_records' : 'borrowed_records';
    window.FirebaseBridge.syncDocToCloud(colName, item.id, item);
  }

  renderDashboard();
  if (type === 'lent') renderLentTable();
  else renderBorrowedTable();

  if (remaining === 0) {
    showToast(`🎉 Entire loan has been fully settled!`, "success");
    setTimeout(() => closeModal('repaymentModal'), 1200);
  }
};

function renderRepaymentHistory(repayments, type) {
  const container = document.getElementById('repayHistoryList');
  if (!container) return;

  if (repayments.length === 0) {
    container.innerHTML = `<div class="empty-hint">No past payments logged yet.</div>`;
    return;
  }

  let html = '';
  repayments.forEach(r => {
    html += `
      <div class="history-item">
        <div>
          <strong>${formatCurrency(r.amount)}</strong>
          <span class="mode-badge ml-2">${escapeHtml(r.mode || 'UPI')}</span>
          <div class="text-muted text-xs">${formatDate(r.date)} ${r.note ? '• ' + escapeHtml(r.note) : ''}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================================================
// 9. Interest Calculator Tool
// ==========================================================================

function updateCalcFormVisibility() {
  const mode = state.calcMode;
  const desiGroup = document.getElementById('rateDesiGroup');
  const annualGroup = document.getElementById('rateAnnualGroup');
  const ciFreqGroup = document.getElementById('ciFreqGroup');
  const daysGroup = document.getElementById('daysGroup');
  const resEmiRow = document.getElementById('resEmiRow');
  const resDailyRow = document.getElementById('resDailyRow');
  const badgeTitle = document.getElementById('calcBadgeTitle');

  if (mode === 'desi') {
    desiGroup.classList.remove('hidden');
    annualGroup.classList.add('hidden');
    ciFreqGroup.classList.add('hidden');
    daysGroup.classList.remove('hidden');
    resEmiRow.classList.add('hidden');
    resDailyRow.classList.remove('hidden');
    badgeTitle.textContent = "Desi Monthly (₹/₹100)";
  } else if (mode === 'si') {
    desiGroup.classList.add('hidden');
    annualGroup.classList.remove('hidden');
    ciFreqGroup.classList.add('hidden');
    daysGroup.classList.remove('hidden');
    resEmiRow.classList.add('hidden');
    resDailyRow.classList.remove('hidden');
    badgeTitle.textContent = "Simple Interest (SI)";
  } else if (mode === 'ci') {
    desiGroup.classList.add('hidden');
    annualGroup.classList.remove('hidden');
    ciFreqGroup.classList.remove('hidden');
    daysGroup.classList.add('hidden');
    resEmiRow.classList.add('hidden');
    resDailyRow.classList.add('hidden');
    badgeTitle.textContent = "Compound Interest (CI)";
  } else if (mode === 'emi') {
    desiGroup.classList.add('hidden');
    annualGroup.classList.remove('hidden');
    ciFreqGroup.classList.add('hidden');
    daysGroup.classList.add('hidden');
    resEmiRow.classList.remove('hidden');
    resDailyRow.classList.add('hidden');
    badgeTitle.textContent = "Bank Loan EMI";
  }
}

window.calculateInterest = function() {
  const mode = state.calcMode;
  const principal = Number(document.getElementById('calcPrincipal')?.value || 0);
  const months = Number(document.getElementById('calcTimeMonths')?.value || 0);
  const days = Number(document.getElementById('calcTimeDays')?.value || 0);

  let totalInterest = 0;
  let totalPayable = principal;
  let perMonthInterest = 0;
  let perDayInterest = 0;
  let emiAmount = 0;

  if (mode === 'desi') {
    const monthlyRatePct = Number(document.getElementById('calcDesiRate')?.value || 0);
    document.getElementById('desiAnnualEq').textContent = (monthlyRatePct * 12).toFixed(1) + '%';

    perMonthInterest = principal * (monthlyRatePct / 100);
    perDayInterest = perMonthInterest / 30;

    totalInterest = (perMonthInterest * months) + (perDayInterest * days);
    totalPayable = principal + totalInterest;

  } else if (mode === 'si') {
    const annualRate = Number(document.getElementById('calcAnnualRate')?.value || 0);
    const totalTimeYears = (months + (days / 30)) / 12;

    totalInterest = (principal * annualRate * totalTimeYears) / 100;
    totalPayable = principal + totalInterest;
    perMonthInterest = totalTimeYears > 0 ? totalInterest / (months + (days / 30)) : 0;
    perDayInterest = perMonthInterest / 30;

  } else if (mode === 'ci') {
    const annualRate = Number(document.getElementById('calcAnnualRate')?.value || 0);
    const freq = Number(document.getElementById('calcCiFreq')?.value || 1);
    const timeYears = months / 12;

    if (principal > 0 && annualRate > 0 && timeYears > 0) {
      const r = annualRate / 100;
      totalPayable = principal * Math.pow((1 + (r / freq)), (freq * timeYears));
      totalInterest = totalPayable - principal;
      perMonthInterest = months > 0 ? totalInterest / months : 0;
    }

  } else if (mode === 'emi') {
    const annualRate = Number(document.getElementById('calcAnnualRate')?.value || 0);
    const tenureMonths = months;

    if (principal > 0 && annualRate > 0 && tenureMonths > 0) {
      const monthlyR = (annualRate / 12) / 100;
      emiAmount = (principal * monthlyR * Math.pow(1 + monthlyR, tenureMonths)) / (Math.pow(1 + monthlyR, tenureMonths) - 1);
      totalPayable = emiAmount * tenureMonths;
      totalInterest = totalPayable - principal;
      perMonthInterest = totalInterest / tenureMonths;
    }
  }

  document.getElementById('resTotalPayable').textContent = formatCurrency(Math.round(totalPayable));
  document.getElementById('resPrincipal').textContent = formatCurrency(principal);
  document.getElementById('resTotalInterest').textContent = formatCurrency(Math.round(totalInterest));
  document.getElementById('resPerMonthInterest').textContent = formatCurrency(Math.round(perMonthInterest));
  document.getElementById('resPerDayInterest').textContent = formatCurrency(perDayInterest.toFixed(2));
  document.getElementById('resEmiAmount').textContent = formatCurrency(Math.round(emiAmount)) + ' / month';

  const totalBar = principal + totalInterest;
  let pPct = 100;
  let iPct = 0;
  if (totalBar > 0) {
    pPct = Math.round((principal / totalBar) * 100);
    iPct = 100 - pPct;
  }
  document.getElementById('splitPrincipalBar').style.width = pPct + '%';
  document.getElementById('splitInterestBar').style.width = iPct + '%';
  document.getElementById('splitPrincipalPct').textContent = pPct + '%';
  document.getElementById('splitInterestPct').textContent = iPct + '%';
};

window.resetCalculator = function() {
  document.getElementById('calcPrincipal').value = 50000;
  document.getElementById('calcDesiRate').value = 2;
  document.getElementById('calcAnnualRate').value = 12;
  document.getElementById('calcTimeMonths').value = 6;
  document.getElementById('calcTimeDays').value = 0;
  calculateInterest();
};

window.applyCalcToLoan = window.applyCalcToUdhar = function(targetType) {
  const principal = Number(document.getElementById('calcPrincipal').value || 0);
  const mode = state.calcMode;
  let rate = 0;
  if (mode === 'desi') {
    rate = Number(document.getElementById('calcDesiRate').value || 0);
  } else {
    rate = (Number(document.getElementById('calcAnnualRate').value || 0) / 12).toFixed(1);
  }

  const months = Number(document.getElementById('calcTimeMonths').value || 1);
  const futureDueDate = new Date(Date.now() + months * 30 * 86400000).toISOString().split('T')[0];

  if (targetType === 'lent') {
    document.getElementById('lentAmount').value = principal;
    document.getElementById('lentInterestRate').value = rate;
    document.getElementById('lentDueDate').value = futureDueDate;
    switchTab('lent');
    openModal('lentModal');
    showToast("Calculated amount applied to Money Lent!", "info");
  } else {
    document.getElementById('borrowedAmount').value = principal;
    document.getElementById('borrowedInterestRate').value = rate;
    document.getElementById('borrowedDueDate').value = futureDueDate;
    switchTab('borrowed');
    openModal('borrowedModal');
    showToast("Calculated amount applied to Money Borrowed!", "info");
  }
};

// ==========================================================================
// 10. USD & USDT Real-Time Live Converter & Currency Hub
// ==========================================================================

function initForexConverter() {
  const savedCustom = localStorage.getItem(STORAGE_KEYS.FOREX_CUSTOM_RATE);
  if (savedCustom && Number(savedCustom) > 0) {
    state.forex.customRate = Number(savedCustom);
  }

  // Initial live rate fetch
  fetchLiveUsdtRate();

  // Periodic auto-update every 60 seconds
  setInterval(() => {
    fetchLiveUsdtRate();
  }, 60000);
}

function getActiveForexRate() {
  if (state.forex.activeMode === 'custom') {
    return Number(state.forex.customRate) || state.forex.usdtInr || 94.92;
  } else if (state.forex.activeMode === 'forex') {
    return Number(state.forex.usdInr) || 88.65;
  }
  return Number(state.forex.usdtInr) || 94.92;
}

async function fetchLiveUsdtRate(isUserClick = false) {
  if (state.forex.isFetching) return;
  state.forex.isFetching = true;

  const spinner = document.getElementById('refreshForexSpinner');
  if (spinner) spinner.style.animation = 'spin 1s linear infinite';

  try {
    // 1. Fetch live USDT from CoinGecko public API
    const cgFetch = fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr,usd&include_24hr_change=true')
      .then(res => res.json())
      .then(data => {
        if (data && data.tether && data.tether.inr) {
          state.forex.usdtInr = Number(data.tether.inr);
          if (data.tether.inr_24h_change !== undefined) {
            state.forex.usdtChange24h = Number(data.tether.inr_24h_change);
          }
        }
      })
      .catch(e => console.warn('CoinGecko API unavailable, fallback used:', e));

    // 2. Fetch official USD/INR forex rate from open exchange API
    const erFetch = fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.INR) {
          state.forex.usdInr = Number(data.rates.INR);
        }
      })
      .catch(e => console.warn('Forex API unavailable, fallback used:', e));

    await Promise.allSettled([cgFetch, erFetch]);

    state.forex.lastUpdated = new Date();
    updateForexUI();
    if (isUserClick) showToast("Live USDT & USD rates refreshed successfully!", "success");
  } catch (err) {
    console.error("Forex rate refresh error:", err);
    if (isUserClick) showToast("Could not reach live market. Using cached rate.", "info");
  } finally {
    state.forex.isFetching = false;
    if (spinner) spinner.style.animation = 'none';
  }
}

function updateForexUI() {
  const activeRate = getActiveForexRate();

  // Navbar ticker
  const navPrice = document.getElementById('navUsdtPrice');
  if (navPrice) navPrice.textContent = `₹${state.forex.usdtInr.toFixed(2)}`;

  // Cards
  const cardUsdt = document.getElementById('cardUsdtPrice');
  if (cardUsdt) cardUsdt.textContent = `₹${state.forex.usdtInr.toFixed(2)}`;

  const usdtChange = document.getElementById('usdtChangeTag');
  if (usdtChange) {
    const chg = state.forex.usdtChange24h || 0;
    const sign = chg >= 0 ? '+' : '';
    usdtChange.textContent = `${sign}${chg.toFixed(2)}% (24h)`;
    usdtChange.className = chg >= 0 ? 'forex-change-tag text-success' : 'forex-change-tag text-danger';
  }

  const cardUsd = document.getElementById('cardUsdPrice');
  if (cardUsd) cardUsd.textContent = `₹${state.forex.usdInr.toFixed(2)}`;

  const activeDisplay = document.getElementById('activeRateDisplay');
  if (activeDisplay) activeDisplay.textContent = `₹${activeRate.toFixed(2)}`;

  const activeLabel = document.getElementById('activeRateLabel');
  if (activeLabel) {
    if (state.forex.activeMode === 'usdt') activeLabel.textContent = 'Using Live USDT Market Rate';
    else if (state.forex.activeMode === 'forex') activeLabel.textContent = 'Using Official Forex Rate';
    else activeLabel.textContent = `Using Custom Rate (₹${activeRate.toFixed(2)})`;
  }

  const usdHint = document.getElementById('usdBoxRateHint');
  if (usdHint) usdHint.textContent = `Rate: ₹${activeRate.toFixed(2)} / $`;

  const lastUpdated = document.getElementById('forexLastUpdated');
  if (lastUpdated) {
    const timeStr = state.forex.lastUpdated ? state.forex.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live';
    lastUpdated.textContent = `Updated: ${timeStr}`;
  }

  // Update modal hints
  ['income', 'expense', 'lent', 'borrowed'].forEach(m => {
    const hint = document.getElementById(`${m}UsdHint`);
    if (hint) hint.textContent = `⚡ Live Auto-Convert @ ₹${activeRate.toFixed(2)} / USDT`;
  });

  // Re-calculate converter fields
  recalculateForex();
  renderForexCheatTable();
}

window.setForexMode = function(mode) {
  state.forex.activeMode = mode;
  document.getElementById('tabModeUsdt')?.classList.toggle('active', mode === 'usdt');
  document.getElementById('tabModeForex')?.classList.toggle('active', mode === 'forex');
  document.getElementById('tabModeCustom')?.classList.toggle('active', mode === 'custom');

  const customRow = document.getElementById('customRateRow');
  if (customRow) {
    if (mode === 'custom') {
      customRow.classList.remove('hidden');
      const input = document.getElementById('customRateInput');
      if (input && !input.value) input.value = state.forex.customRate || state.forex.usdtInr;
    } else {
      customRow.classList.add('hidden');
    }
  }

  updateForexUI();
  showToast(`Switched to ${mode.toUpperCase()} conversion rate (₹${getActiveForexRate().toFixed(2)})`, "info");
};

window.onCustomRateInput = function() {
  const val = Number(document.getElementById('customRateInput').value);
  if (val > 0) {
    state.forex.customRate = val;
    localStorage.setItem(STORAGE_KEYS.FOREX_CUSTOM_RATE, val);
    updateForexUI();
  }
};

window.onForexUsdChange = function() {
  const usdInput = document.getElementById('forexUsdInput');
  const usdVal = Number(usdInput?.value) || 0;
  const rate = getActiveForexRate();
  const grossInr = usdVal * rate;

  const inrInput = document.getElementById('forexInrInput');
  if (inrInput) {
    inrInput.value = grossInr > 0 ? (grossInr % 1 === 0 ? grossInr : grossInr.toFixed(2)) : '';
  }

  updateForexSummary(usdVal, grossInr);
};

window.onForexInrChange = function() {
  const inrInput = document.getElementById('forexInrInput');
  const inrVal = Number(inrInput?.value) || 0;
  const rate = getActiveForexRate();
  const usdVal = rate > 0 ? inrVal / rate : 0;

  const usdInput = document.getElementById('forexUsdInput');
  if (usdInput) {
    usdInput.value = usdVal > 0 ? (usdVal % 1 === 0 ? usdVal : usdVal.toFixed(2)) : '';
  }

  updateForexSummary(usdVal, inrVal);
};

function recalculateForex() {
  window.onForexUsdChange();
}

function updateForexSummary(usdVal, grossInr) {
  const rate = getActiveForexRate();
  const deductTds = document.getElementById('forexTdsCheckbox')?.checked ?? true;
  const feeInr = deductTds ? grossInr * 0.01 : 0;
  const netInr = Math.max(0, grossInr - feeInr);

  const sumUsd = document.getElementById('summaryUsdAmount');
  if (sumUsd) sumUsd.textContent = `$${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sumRate = document.getElementById('summaryRateUsed');
  if (sumRate) sumRate.textContent = `₹${rate.toFixed(2)} per $1`;

  const sumGross = document.getElementById('summaryGrossInr');
  if (sumGross) sumGross.textContent = formatCurrency(grossInr);

  const sumFee = document.getElementById('summaryFeeInr');
  if (sumFee) sumFee.textContent = deductTds ? `-${formatCurrency(feeInr)}` : '₹0.00 (0% Fee)';

  const sumNet = document.getElementById('summaryNetInr');
  if (sumNet) sumNet.textContent = formatCurrency(netInr);

  const netHint = document.getElementById('forexNetInrHint');
  if (netHint) netHint.innerHTML = `Net In-Hand: <strong>${formatCurrency(netInr)}</strong>`;
}

window.addForexAmount = function(delta) {
  const input = document.getElementById('forexUsdInput');
  if (!input) return;
  const current = Number(input.value) || 0;
  input.value = current + delta;
  window.onForexUsdChange();
};

window.setForexExactAmount = function(val) {
  const input = document.getElementById('forexUsdInput');
  if (!input) return;
  input.value = val === 0 ? '' : val;
  window.onForexUsdChange();
};

window.invertForexValues = function() {
  const usdInput = document.getElementById('forexUsdInput');
  const inrInput = document.getElementById('forexInrInput');
  if (!usdInput || !inrInput) return;
  const temp = usdInput.value;
  usdInput.value = inrInput.value;
  inrInput.value = temp;
  window.onForexUsdChange();
};

function renderForexCheatTable() {
  const tbody = document.getElementById('forexCheatTbody');
  if (!tbody) return;

  const rate = getActiveForexRate();
  const amounts = [1, 5, 10, 20, 50, 100, 250, 500, 1000, 5000];
  let html = '';

  amounts.forEach(amt => {
    const gross = amt * rate;
    const net = gross * 0.99;
    html += `
      <tr>
        <td><strong>$${amt.toLocaleString()}</strong></td>
        <td>${formatCurrency(gross)}</td>
        <td class="text-success font-bold">${formatCurrency(net)}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  const note = document.getElementById('cheatSheetRateNote');
  if (note) note.textContent = `1 USDT = ₹${rate.toFixed(2)}`;
}

window.transferForexToLedger = function(targetType) {
  const usdVal = Number(document.getElementById('forexUsdInput').value) || 0;
  if (usdVal <= 0) {
    showToast("Please enter a valid dollar amount first", "danger");
    return;
  }

  const rate = getActiveForexRate();
  const deductTds = document.getElementById('forexTdsCheckbox')?.checked ?? true;
  const inrAmount = deductTds ? Math.round(usdVal * rate * 0.99) : Math.round(usdVal * rate);
  const noteText = `Converted from $${usdVal} USDT @ ₹${rate.toFixed(2)}`;

  if (targetType === 'income') {
    switchTab('income');
    openModal('incomeModal');
    document.getElementById('incomeAmount').value = inrAmount;
    document.getElementById('incomeCategory').value = 'Freelance';
    const noteField = document.getElementById('incomeNote');
    if (noteField) noteField.value = noteText;
    showToast(`Converted $${usdVal} to ₹${inrAmount.toLocaleString('en-IN')} for Income!`, "success");
  } else if (targetType === 'expense') {
    switchTab('expense');
    openModal('expenseModal');
    document.getElementById('expenseAmount').value = inrAmount;
    document.getElementById('expenseCategory').value = 'Shopping';
    const noteField = document.getElementById('expenseNotes');
    if (noteField) noteField.value = noteText;
    showToast(`Converted $${usdVal} to ₹${inrAmount.toLocaleString('en-IN')} for Expense!`, "success");
  } else if (targetType === 'lent') {
    switchTab('lent');
    openModal('lentModal');
    document.getElementById('lentAmount').value = inrAmount;
    const noteField = document.getElementById('lentReason');
    if (noteField) noteField.value = noteText;
    showToast(`Converted $${usdVal} to ₹${inrAmount.toLocaleString('en-IN')} for Money Lent!`, "success");
  } else if (targetType === 'borrowed') {
    switchTab('borrowed');
    openModal('borrowedModal');
    document.getElementById('borrowedAmount').value = inrAmount;
    const noteField = document.getElementById('borrowedReason');
    if (noteField) noteField.value = noteText;
    showToast(`Converted $${usdVal} to ₹${inrAmount.toLocaleString('en-IN')} for Money Borrowed!`, "success");
  }
};

window.toggleUsdHelper = function(modalType) {
  const box = document.getElementById(`${modalType}UsdHelperBox`);
  if (!box) return;
  const isHidden = box.classList.toggle('hidden');
  if (!isHidden) {
    const input = document.getElementById(`${modalType}UsdInput`);
    if (input) {
      input.focus();
      const inrField = document.getElementById(`${modalType}Amount`);
      if (inrField && inrField.value > 0) {
        const rate = getActiveForexRate();
        input.value = (Number(inrField.value) / rate).toFixed(2);
      }
    }
  }
};

window.convertModalUsdToInr = function(modalType) {
  const usdVal = Number(document.getElementById(`${modalType}UsdInput`).value) || 0;
  const rate = getActiveForexRate();
  const inrField = document.getElementById(`${modalType}Amount`);

  if (inrField) {
    if (usdVal > 0) {
      const computedInr = Math.round(usdVal * rate);
      inrField.value = computedInr;

      const noteField = document.getElementById(
        modalType === 'income' ? 'incomeNote' :
        modalType === 'expense' ? 'expenseNotes' :
        modalType === 'lent' ? 'lentReason' : 'borrowedReason'
      );
      if (noteField && !noteField.value) {
        noteField.value = `(${usdVal} USDT @ ₹${rate.toFixed(2)})`;
      }
    } else {
      inrField.value = '';
    }
  }
};

// ==========================================================================
// 11. Firebase Integration & Settings
// ==========================================================================

function populateFirebaseForm(cfg) {
  if (!cfg) return;
  if (document.getElementById('fbApiKey')) document.getElementById('fbApiKey').value = cfg.apiKey || '';
  if (document.getElementById('fbProjectId')) document.getElementById('fbProjectId').value = cfg.projectId || '';
  if (document.getElementById('fbAuthDomain')) document.getElementById('fbAuthDomain').value = cfg.authDomain || '';
  if (document.getElementById('fbStorageBucket')) document.getElementById('fbStorageBucket').value = cfg.storageBucket || '';
  if (document.getElementById('fbMessagingSenderId')) document.getElementById('fbMessagingSenderId').value = cfg.messagingSenderId || '';
  if (document.getElementById('fbAppId')) document.getElementById('fbAppId').value = cfg.appId || '';
}

async function initFirebaseFromStorage() {
  if (!state.firebaseConfig) {
    updateFirebaseUIStatus(false, "Local Storage Mode (Offline Safe)");
    return;
  }

  if (window.FirebaseBridge) {
    try {
      const res = await window.FirebaseBridge.initializeFirebaseService(state.firebaseConfig);
      if (res.success) {
        updateFirebaseUIStatus(true, `Firebase Connected: ${state.firebaseConfig.projectId}`);
      } else {
        updateFirebaseUIStatus(false, "Firebase Config Error");
      }
    } catch (e) {
      console.warn("Firebase auto-connect failed:", e);
      updateFirebaseUIStatus(false, "Firebase Offline / Error");
    }
  }
}

function updateFirebaseUIStatus(online, text) {
  const statusBtn = document.getElementById('firebaseStatusBtn');
  const statusText = document.getElementById('firebaseStatusText');
  const bannerBadge = document.getElementById('firebaseBannerBadge');
  const bannerText = document.getElementById('firebaseBannerText');
  const bannerHint = document.getElementById('firebaseBannerHint');

  if (online) {
    statusBtn.className = 'status-pill status-online';
    statusText.textContent = text || 'Firebase Connected';
    if (bannerBadge) bannerBadge.className = 'status-indicator-badge text-success';
    if (bannerText) bannerText.textContent = '🟢 Google Firebase Firestore Live Sync Active';
    if (bannerHint) bannerHint.textContent = 'All changes are automatically synced to your cloud database in real-time!';
  } else {
    statusBtn.className = 'status-pill status-offline';
    statusText.textContent = text || 'Local Storage Mode';
    if (bannerBadge) bannerBadge.className = 'status-indicator-badge text-warning';
    if (bannerText) bannerText.textContent = '🟡 Local Storage Mode (Offline Safe)';
    if (bannerHint) bannerHint.textContent = 'Your data is saved securely in this browser. Enter Firebase credentials below to enable cloud sync.';
  }
}

window.handleFirebaseConfigSubmit = async function(event) {
  event.preventDefault();

  const apiKey = document.getElementById('fbApiKey').value.trim();
  const projectId = document.getElementById('fbProjectId').value.trim();
  const authDomain = document.getElementById('fbAuthDomain').value.trim();
  const storageBucket = document.getElementById('fbStorageBucket').value.trim();
  const messagingSenderId = document.getElementById('fbMessagingSenderId').value.trim();
  const appId = document.getElementById('fbAppId').value.trim();

  if (!apiKey || !projectId || !appId) {
    showToast("Please provide API Key, Project ID, and App ID", "danger");
    return;
  }

  const config = {
    apiKey,
    projectId,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    storageBucket: storageBucket || `${projectId}.appspot.com`,
    messagingSenderId,
    appId
  };

  state.firebaseConfig = config;
  saveState('firebaseConfig');

  if (window.FirebaseBridge) {
    const res = await window.FirebaseBridge.initializeFirebaseService(config);
    if (res.success) {
      updateFirebaseUIStatus(true, `Firebase: ${projectId}`);
      showToast("Connected to Firebase Firestore successfully!", "success");
    } else {
      updateFirebaseUIStatus(false, "Connection Failed");
      showToast(`Firebase error: ${res.message}`, "danger");
    }
  }
};

window.testFirebaseConnection = async function() {
  const apiKey = document.getElementById('fbApiKey').value.trim();
  const projectId = document.getElementById('fbProjectId').value.trim();
  const appId = document.getElementById('fbAppId').value.trim();

  if (!apiKey || !projectId) {
    showToast("Please enter API Key and Project ID first", "danger");
    return;
  }

  showToast("Testing Firebase connection...", "info");
  const testCfg = {
    apiKey,
    projectId,
    appId: appId || 'test'
  };

  if (window.FirebaseBridge) {
    const res = await window.FirebaseBridge.initializeFirebaseService(testCfg);
    if (res.success) {
      showToast("✅ Firebase credentials are valid!", "success");
    } else {
      showToast(`❌ Connection failed: ${res.message}`, "danger");
    }
  }
};

window.syncLocalToFirebase = async function() {
  if (!window.FirebaseBridge || !window.FirebaseBridge.isConnected()) {
    showToast("Please connect to Firebase first!", "danger");
    return;
  }

  showToast("Uploading local data to Firebase Cloud...", "info");
  try {
    const count = await window.FirebaseBridge.batchUploadToCloud(state.incomes, state.expenses, state.lent, state.borrowed);
    showToast(`Successfully uploaded ${count} documents to Firebase! ☁️`, "success");
  } catch (err) {
    showToast(`Upload failed: ${err.message}`, "danger");
  }
};

window.fetchFromFirebase = async function() {
  if (!window.FirebaseBridge || !window.FirebaseBridge.isConnected()) {
    showToast("Please connect to Firebase first!", "danger");
    return;
  }

  showToast("Fetching records from Firestore...", "info");
  try {
    const cloudIncomes = await window.FirebaseBridge.fetchCollectionFromCloud('incomes');
    const cloudExpenses = await window.FirebaseBridge.fetchCollectionFromCloud('expenses');
    const cloudLent = await window.FirebaseBridge.fetchCollectionFromCloud('lent_records');
    const cloudBorrowed = await window.FirebaseBridge.fetchCollectionFromCloud('borrowed_records');

    if (cloudIncomes.length > 0) state.incomes = cloudIncomes;
    if (cloudExpenses.length > 0) state.expenses = cloudExpenses;
    if (cloudLent.length > 0) state.lent = cloudLent;
    if (cloudBorrowed.length > 0) state.borrowed = cloudBorrowed;

    saveState();
    refreshAllViews();
    showToast(`Downloaded data from Firebase! (${cloudIncomes.length + cloudExpenses.length + cloudLent.length + cloudBorrowed.length} total)`, "success");
  } catch (err) {
    showToast(`Fetch failed: ${err.message}`, "danger");
  }
};

window.disconnectFirebase = function() {
  state.firebaseConfig = null;
  saveState('firebaseConfig');
  document.getElementById('firebaseConfigForm').reset();
  updateFirebaseUIStatus(false, "Local Storage Mode");
  showToast("Disconnected from Firebase. Using local storage.", "info");
};

// Settings Tab switching
window.switchSettingsTab = function(tabName) {
  document.querySelectorAll('.tab-settings-btn').forEach((b, idx) => {
    const isTarget = (tabName === 'config' && idx === 0) || 
                     (tabName === 'backup' && idx === 1) || 
                     (tabName === 'guide' && idx === 2);
    b.classList.toggle('active', isTarget);
  });

  document.getElementById('settingsTabConfig').classList.toggle('hidden', tabName !== 'config');
  document.getElementById('settingsTabBackup').classList.toggle('hidden', tabName !== 'backup');
  document.getElementById('settingsTabGuide').classList.toggle('hidden', tabName !== 'guide');
};

// ==========================================================================
// 11. Backup, Restore & Export
// ==========================================================================

window.downloadJsonBackup = function() {
  const data = {
    version: '1.1',
    exportedAt: new Date().toISOString(),
    incomes: state.incomes,
    expenses: state.expenses,
    lent: state.lent,
    borrowed: state.borrowed
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dhanakhaata_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Backup JSON file downloaded!", "success");
};

window.handleRestoreBackup = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.incomes && Array.isArray(data.incomes)) state.incomes = data.incomes;
      if (data.expenses && Array.isArray(data.expenses)) state.expenses = data.expenses;
      if (data.lent && Array.isArray(data.lent)) state.lent = data.lent;
      if (data.borrowed && Array.isArray(data.borrowed)) state.borrowed = data.borrowed;

      saveState();
      refreshAllViews();
      showToast("Data restored successfully from backup!", "success");
      closeModal('settingsModal');
    } catch (err) {
      showToast("Invalid JSON backup file format", "danger");
    }
  };
  reader.readAsText(file);
};

window.exportData = function(type, format) {
  let csvContent = "";
  let filename = "";

  if (type === 'income') {
    csvContent = "Date,Source,Amount,Mode,Notes\n";
    state.incomes.forEach(i => {
      const source = i.category === 'Custom' ? i.customSource : i.category;
      csvContent += `"${i.date}","${source}","${i.amount}","${i.mode}","${(i.notes || '').replace(/"/g, '""')}"\n`;
    });
    filename = `income_report_${new Date().toISOString().split('T')[0]}.csv`;
  } else if (type === 'expense') {
    csvContent = "Date,Category,Amount,Mode,Notes\n";
    state.expenses.forEach(e => {
      const cat = e.category === 'Custom' ? e.customCategory : e.category;
      csvContent += `"${e.date}","${cat}","${e.amount}","${e.mode}","${(e.notes || '').replace(/"/g, '""')}"\n`;
    });
    filename = `expense_report_${new Date().toISOString().split('T')[0]}.csv`;
  } else if (type === 'lent') {
    csvContent = "Borrower,Phone,AmountLent,DateGiven,DueDate,Recovered,Remaining,Status,Notes\n";
    state.lent.forEach(l => {
      const repaid = (l.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
      const remaining = Number(l.amount || 0) - repaid;
      csvContent += `"${l.personName}","${l.phone || ''}","${l.amount}","${l.dateGiven}","${l.dueDate || ''}","${repaid}","${remaining}","${l.status}","${(l.reason || '').replace(/"/g, '""')}"\n`;
    });
    filename = `money_lent_${new Date().toISOString().split('T')[0]}.csv`;
  } else if (type === 'borrowed') {
    csvContent = "Lender,Phone,AmountBorrowed,DateTaken,DueDate,Repaid,Remaining,Status,Notes\n";
    state.borrowed.forEach(b => {
      const repaid = (b.repayments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
      const remaining = Number(b.amount || 0) - repaid;
      csvContent += `"${b.personName}","${b.phone || ''}","${b.amount}","${b.dateTaken}","${b.dueDate || ''}","${repaid}","${remaining}","${b.status}","${(b.reason || '').replace(/"/g, '""')}"\n`;
    });
    filename = `money_borrowed_${new Date().toISOString().split('T')[0]}.csv`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`${type.toUpperCase()} exported to CSV!`, "success");
};

// ==========================================================================
// 12. Utilities & Toast Notifications
// ==========================================================================

function formatCurrency(amount) {
  const num = Number(amount || 0);
  return '₹' + num.toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(60px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
