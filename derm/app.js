// ===== App State =====
let currentView = 'landing';
let currentCategory = 'all';
let currentConcern = null;
let currentBudget = 'all';
let treatments = [];
let tableSort = { column: 'name', direction: 'asc' };
let selectedTableCategories = [];

// ===== Concern Map (MECE) =====
const concernMap = {
    '처진피부': ['리프팅', '타이트닝', 'HIFU', '실리프팅', '울쎄라', '슈링크', '올리지오'],
    '주름': ['주름', '보톡스', '리프팅', '타이트닝'],
    '탄력저하': ['탄력', 'RF', '콜라겐', '스킨부스터', '리쥬란', '쥬베룩', '엑소좀'],
    '모공': ['모공', 'MRF', '피지', '모공축소', '포텐자', '시크릿'],
    '기미/잡티': ['기미', '색소', '미백', '토닝', '피코', '잡티', 'IPL', '브라이트닝'],
    '여드름': ['여드름', '트러블', 'PDT', '압출', '아크네'],
    '볼륨손실': ['볼륨', '필러', '스컬트라', '엘란쎄', 'HA필러', '지방이식'],
    '흉터': ['흉터', '프랙셔널', '재생', '여드름흉터', '패인흉터'],
    '제모': ['제모', '레이저제모'],
    '바디': ['바디', '지방', '셀룰라이트', '엠스컬프', '지방분해', '윤곽', '냉각'],
    '탈모': ['탈모', '모발', '두피', 'PRP', '엑소좀'],
    '점/사마귀': ['점', '사마귀', '검버섯', '쥐젖', '한관종'],
    '다한증/액취': ['다한증', '액취', '땀'],
    '필링': ['필링', '화학필링', '각질', '피부결'],
    '스킨케어': ['스킨케어', '관리', '클렌징', '영양', '수분', '진정', '재생관리']
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    treatments = DB_EXTENDED.treatments;
    
    // Update DB count
    const dbCountEl = document.getElementById('dbCount');
    if (dbCountEl) {
        dbCountEl.textContent = `${treatments.length}개 시술`;
    }
    
    // Update all tab counts
    updateTabCounts();
    updateConcernCounts();
    
    // Setup views
    setupViewTabs();
    setupSearch();
    setupConcernView();
    setupFilterView();
    setupTableView();
    setupModal();
    setupConsultation();
});

// ===== Update Tab Counts =====
function updateTabCounts() {
    // 상단 탭에서는 숫자 표시 안함
}

// ===== Update Concern Counts =====
function updateConcernCounts() {
    Object.keys(concernMap).forEach(concern => {
        const keywords = concernMap[concern];
        const count = treatments.filter(t => {
            const searchText = `${t.category} ${t.subcategory} ${t.tags.join(' ')} ${t.effects.primary.join(' ')}`.toLowerCase();
            return keywords.some(k => searchText.includes(k.toLowerCase()));
        }).length;
        
        const countEl = document.querySelector(`[data-concern-count="${concern}"]`);
        if (countEl) countEl.textContent = `${count}개`;
    });
}

// ===== View Tabs =====
function setupViewTabs() {
    const tabs = document.querySelectorAll('.view-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.dataset.view;
            switchToView(view);
        });
    });
}

function switchToView(view) {
    const tabs = document.querySelectorAll('.view-tab');
    
    // Update tab active state
    tabs.forEach(t => t.classList.remove('active'));
    const targetTab = document.querySelector(`[data-view="${view}"]`);
    if (targetTab) targetTab.classList.add('active');
    
    // Update view panel
    document.querySelectorAll('.view-panel').forEach(p => {
        p.classList.remove('active', 'animate');
    });
    const targetPanel = document.getElementById(`view-${view}`);
    targetPanel.classList.add('active', 'animate');
    
    currentView = view;
}

function goToLanding(event) {
    event.preventDefault();
    switchToView('landing');
}

// ===== Search =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;  // 검색창이 없으면 스킵
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            if (currentView === 'cards') renderCardsView(currentCategory);
            if (currentView === 'table') renderTableView();
            if (currentView === 'filter') applyFilters();
            return;
        }
        
        const results = treatments.filter(t => 
            t.name.toLowerCase().includes(query) ||
            t.nameEn.toLowerCase().includes(query) ||
            t.brand.toLowerCase().includes(query) ||
            (t.review && t.review.summary.includes(query)) ||
            t.tags.some(tag => tag.includes(query)) ||
            t.effects.primary.some(e => e.includes(query))
        );
        
        // Switch to cards view and show results
        document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-view="cards"]').classList.add('active');
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('view-cards').classList.add('active');
        
        renderTreatmentCards(results, 'cardsGrid');
    });
}

// ===== View 1: 고민별 찾기 =====
function setupConcernView() {
    const concernCards = document.querySelectorAll('.concern-card');
    const concernResult = document.getElementById('concernResult');
    const concernGrid = document.querySelector('.concern-grid');
    const backBtn = document.getElementById('backBtn');
    const concernBudgetMin = document.getElementById('concernBudgetMin');
    const concernBudgetMax = document.getElementById('concernBudgetMax');
    
    // 필수 요소가 없으면 스킵
    if (!concernResult || !concernGrid || !backBtn || !concernBudgetMin || !concernBudgetMax) return;
    
    concernCards.forEach(card => {
        card.addEventListener('click', () => {
            const concern = card.dataset.concern;
            currentConcern = concern;
            
            concernGrid.classList.add('hidden');
            concernResult.classList.remove('hidden');
            document.getElementById('concernTitle').textContent = card.querySelector('.concern-title').textContent + ' 고민 해결';
            
            // Reset budget sliders
            concernBudgetMin.value = 0;
            concernBudgetMax.value = 200;
            document.getElementById('concernBudgetMinValue').textContent = '0';
            document.getElementById('concernBudgetMaxValue').textContent = '200+';
            
            renderConcernTreatments();
        });
    });
    
    backBtn.addEventListener('click', () => {
        concernGrid.classList.remove('hidden');
        concernResult.classList.add('hidden');
        currentConcern = null;
    });
    
    // Budget dual range for concern view
    function updateConcernBudget() {
        let minVal = parseInt(concernBudgetMin.value);
        let maxVal = parseInt(concernBudgetMax.value);
        
        if (minVal > maxVal) {
            [minVal, maxVal] = [maxVal, minVal];
            concernBudgetMin.value = minVal;
            concernBudgetMax.value = maxVal;
        }
        
        document.getElementById('concernBudgetMinValue').textContent = minVal;
        document.getElementById('concernBudgetMaxValue').textContent = maxVal >= 200 ? '200+' : maxVal;
        renderConcernTreatments();
    }
    
    concernBudgetMin.addEventListener('input', updateConcernBudget);
    concernBudgetMax.addEventListener('input', updateConcernBudget);
}

function renderConcernTreatments() {
    const keywords = concernMap[currentConcern] || [];
    const budgetMin = parseInt(document.getElementById('concernBudgetMin').value);
    const budgetMax = parseInt(document.getElementById('concernBudgetMax').value);
    
    let filtered = treatments.filter(t => {
        const searchText = `${t.category} ${t.subcategory} ${t.tags.join(' ')} ${t.effects.primary.join(' ')}`.toLowerCase();
        return keywords.some(k => searchText.includes(k.toLowerCase()));
    });
    
    // Budget filter
    filtered = filtered.filter(t => {
        const price = extractPrice(t.pricing.average);
        if (price < budgetMin) return false;
        if (budgetMax < 200 && price > budgetMax) return false;
        return true;
    });
    
    renderTreatmentCards(filtered, 'concernTreatments');
}

// ===== View 2: 맞춤 필터 =====
function setupFilterView() {
    const budgetMin = document.getElementById('budgetMin');
    const budgetMax = document.getElementById('budgetMax');
    const downtimeRange = document.getElementById('downtimeRange');
    const painRange = document.getElementById('painRange');
    const checkboxList = document.getElementById('categoryCheckboxList');
    const resetBtn = document.getElementById('resetFilters');
    const filterSelectAll = document.getElementById('filterSelectAll');
    const filterDeselectAll = document.getElementById('filterDeselectAll');
    
    // 필수 요소가 없으면 스킵
    if (!budgetMin || !budgetMax || !downtimeRange || !painRange || !checkboxList || !resetBtn) return;
    
    // Populate category checkboxes
    const categories = [...new Set(treatments.map(t => t.category))];
    categories.forEach(cat => {
        const count = treatments.filter(t => t.category === cat).length;
        const item = document.createElement('label');
        item.className = 'category-checkbox-item';
        item.innerHTML = `
            <span><input type="checkbox" name="filterCategory" value="${cat}" checked> ${cat}</span>
            <span class="cat-count">${count}</span>
        `;
        checkboxList.appendChild(item);
    });
    
    // Budget dual range
    function updateBudgetDisplay() {
        let minVal = parseInt(budgetMin.value);
        let maxVal = parseInt(budgetMax.value);
        
        // Prevent overlap
        if (minVal > maxVal) {
            [minVal, maxVal] = [maxVal, minVal];
            budgetMin.value = minVal;
            budgetMax.value = maxVal;
        }
        
        const display = document.getElementById('budgetDisplay');
        if (minVal === 0 && maxVal >= 200) {
            display.textContent = '전체';
        } else if (minVal === 0) {
            display.textContent = `~${maxVal}만`;
        } else if (maxVal >= 200) {
            display.textContent = `${minVal}만~`;
        } else {
            display.textContent = `${minVal}~${maxVal}만`;
        }
        applyFilters();
    }
    
    budgetMin.addEventListener('input', updateBudgetDisplay);
    budgetMax.addEventListener('input', updateBudgetDisplay);
    
    // Downtime slider
    const downtimeLabels = ['없음', '~3일', '전체'];
    downtimeRange.addEventListener('input', () => {
        document.getElementById('downtimeValue').textContent = downtimeLabels[downtimeRange.value];
        applyFilters();
    });
    
    painRange.addEventListener('input', () => {
        document.getElementById('painValue').textContent = painRange.value;
        applyFilters();
    });
    
    checkboxList.addEventListener('change', applyFilters);
    
    // Select All / Deselect All buttons
    if (filterSelectAll) {
        filterSelectAll.addEventListener('click', () => {
            document.querySelectorAll('input[name="filterCategory"]').forEach(cb => cb.checked = true);
            applyFilters();
        });
    }
    
    if (filterDeselectAll) {
        filterDeselectAll.addEventListener('click', () => {
            document.querySelectorAll('input[name="filterCategory"]').forEach(cb => cb.checked = false);
            applyFilters();
        });
    }
    
    resetBtn.addEventListener('click', () => {
        budgetMin.value = 0;
        budgetMax.value = 200;
        downtimeRange.value = 2;
        painRange.value = 5;
        document.getElementById('budgetDisplay').textContent = '전체';
        document.getElementById('downtimeValue').textContent = '전체';
        document.getElementById('painValue').textContent = '5';
        document.querySelectorAll('input[name="filterCategory"]').forEach(cb => cb.checked = true);
        applyFilters();
    });
    
    applyFilters();
}

function applyFilters() {
    const budgetMin = parseInt(document.getElementById('budgetMin').value);
    const budgetMax = parseInt(document.getElementById('budgetMax').value);
    const downtimeLevel = parseInt(document.getElementById('downtimeRange').value);
    const pain = parseFloat(document.getElementById('painRange').value);
    const selectedCategories = [...document.querySelectorAll('input[name="filterCategory"]:checked')].map(cb => cb.value);
    
    let filtered = treatments.filter(t => {
        // Budget (min ~ max)
        const price = extractPrice(t.pricing.average);
        if (price < budgetMin) return false;
        if (budgetMax < 200 && price > budgetMax) return false;
        
        // Pain
        if (t.recovery.painLevel > pain) return false;
        
        // Category
        if (!selectedCategories.includes(t.category)) return false;
        
        // Downtime (0: 없음만, 1: ~3일까지, 2: 전체)
        const downtime = t.recovery.downtime.toLowerCase();
        if (downtimeLevel === 0) {
            if (!(downtime.includes('없음') || downtime === '')) return false;
        } else if (downtimeLevel === 1) {
            if (downtime.includes('주') || downtime.includes('7') || downtime.includes('14')) return false;
        }
        // downtimeLevel === 2는 전체이므로 필터링 안함
        
        return true;
    });
    
    renderTreatmentCards(filtered, 'filterResults');
}

// ===== View 3: 테이블 뷰 =====
function setupTableView() {
    const categoryList = document.getElementById('tableCategoryList');
    const categories = [...new Set(treatments.map(t => t.category))];
    const tableBudgetMin = document.getElementById('tableBudgetMin');
    const tableBudgetMax = document.getElementById('tableBudgetMax');
    const tableDowntimeRange = document.getElementById('tableDowntimeRange');
    const tablePainRange = document.getElementById('tablePainRange');
    const tableSelectAll = document.getElementById('tableSelectAll');
    const tableDeselectAll = document.getElementById('tableDeselectAll');
    const resetTableFilters = document.getElementById('resetTableFilters');
    
    // 필수 요소가 없으면 스킵
    if (!categoryList || !tableBudgetMin || !tableBudgetMax || !tableDowntimeRange || !tablePainRange) return;
    
    // Initialize selected categories
    selectedTableCategories = [...categories];
    
    // Create category checkboxes
    categories.forEach(cat => {
        const count = treatments.filter(t => t.category === cat).length;
        const item = document.createElement('label');
        item.className = 'category-checkbox-item';
        item.innerHTML = `
            <span><input type="checkbox" name="tableCategory" value="${cat}" checked> ${cat}</span>
            <span class="cat-count">${count}</span>
        `;
        categoryList.appendChild(item);
    });
    
    // Category change listener
    categoryList.addEventListener('change', () => {
        selectedTableCategories = [...document.querySelectorAll('input[name="tableCategory"]:checked')].map(cb => cb.value);
        renderTableView();
    });
    
    // Budget dual range
    function updateTableBudget() {
        let minVal = parseInt(tableBudgetMin.value);
        let maxVal = parseInt(tableBudgetMax.value);
        
        if (minVal > maxVal) {
            [minVal, maxVal] = [maxVal, minVal];
            tableBudgetMin.value = minVal;
            tableBudgetMax.value = maxVal;
        }
        
        const display = document.getElementById('tableBudgetDisplay');
        if (minVal === 0 && maxVal >= 200) {
            display.textContent = '전체';
        } else if (minVal === 0) {
            display.textContent = `~${maxVal}만`;
        } else if (maxVal >= 200) {
            display.textContent = `${minVal}만~`;
        } else {
            display.textContent = `${minVal}~${maxVal}만`;
        }
        renderTableView();
    }
    
    tableBudgetMin.addEventListener('input', updateTableBudget);
    tableBudgetMax.addEventListener('input', updateTableBudget);
    
    // Downtime slider
    const downtimeLabels = ['없음', '~3일', '전체'];
    tableDowntimeRange.addEventListener('input', () => {
        document.getElementById('tableDowntimeValue').textContent = downtimeLabels[tableDowntimeRange.value];
        renderTableView();
    });
    
    // Pain range
    tablePainRange.addEventListener('input', () => {
        document.getElementById('tablePainValue').textContent = tablePainRange.value;
        renderTableView();
    });
    
    // Select All / Deselect All buttons
    if (tableSelectAll) {
        tableSelectAll.addEventListener('click', () => {
            document.querySelectorAll('input[name="tableCategory"]').forEach(cb => cb.checked = true);
            selectedTableCategories = [...categories];
            renderTableView();
        });
    }
    
    if (tableDeselectAll) {
        tableDeselectAll.addEventListener('click', () => {
            document.querySelectorAll('input[name="tableCategory"]').forEach(cb => cb.checked = false);
            selectedTableCategories = [];
            renderTableView();
        });
    }
    
    // Reset button
    if (resetTableFilters) {
        resetTableFilters.addEventListener('click', () => {
            tableBudgetMin.value = 0;
            tableBudgetMax.value = 200;
            tableDowntimeRange.value = 2;
            tablePainRange.value = 5;
            document.getElementById('tableBudgetDisplay').textContent = '전체';
            document.getElementById('tableDowntimeValue').textContent = '전체';
            document.getElementById('tablePainValue').textContent = '5';
            document.querySelectorAll('input[name="tableCategory"]').forEach(cb => cb.checked = true);
            selectedTableCategories = [...categories];
            renderTableView();
        });
    }
    
    // Column sort listeners
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            
            // Toggle direction
            if (tableSort.column === column) {
                tableSort.direction = tableSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                tableSort.column = column;
                tableSort.direction = 'asc';
            }
            
            // Update header styles
            document.querySelectorAll('.data-table th.sortable').forEach(h => {
                h.classList.remove('asc', 'desc');
            });
            th.classList.add(tableSort.direction);
            
            renderTableView();
        });
    });
    
    renderTableView();
}

function renderTableView() {
    const budgetMin = parseInt(document.getElementById('tableBudgetMin').value);
    const budgetMax = parseInt(document.getElementById('tableBudgetMax').value);
    const downtimeLevel = parseInt(document.getElementById('tableDowntimeRange').value);
    const pain = parseFloat(document.getElementById('tablePainRange').value);
    
    let filtered = treatments.filter(t => {
        // Category
        if (!selectedTableCategories.includes(t.category)) return false;
        
        // Budget
        const price = extractPrice(t.pricing.average);
        if (price < budgetMin) return false;
        if (budgetMax < 200 && price > budgetMax) return false;
        
        // Pain
        if (t.recovery.painLevel > pain) return false;
        
        // Downtime (0: 없음만, 1: ~3일까지, 2: 전체)
        const downtime = t.recovery.downtime.toLowerCase();
        if (downtimeLevel === 0) {
            if (!(downtime.includes('없음') || downtime === '')) return false;
        } else if (downtimeLevel === 1) {
            if (downtime.includes('주') || downtime.includes('7') || downtime.includes('14')) return false;
        }
        
        return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (tableSort.column) {
            case 'name':
                aVal = a.name;
                bVal = b.name;
                break;
            case 'brand':
                aVal = a.brand;
                bVal = b.brand;
                break;
            case 'category':
                aVal = a.category;
                bVal = b.category;
                break;
            case 'duration':
                aVal = a.effects.duration || '';
                bVal = b.effects.duration || '';
                break;
            case 'pain':
                aVal = a.recovery.painLevel;
                bVal = b.recovery.painLevel;
                return tableSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
            case 'downtime':
                aVal = a.recovery.downtime || '';
                bVal = b.recovery.downtime || '';
                break;
            case 'price':
                aVal = extractPrice(a.pricing.average);
                bVal = extractPrice(b.pricing.average);
                return tableSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
            default:
                aVal = a.name;
                bVal = b.name;
        }
        
        if (typeof aVal === 'string') {
            const compare = aVal.localeCompare(bVal);
            return tableSort.direction === 'asc' ? compare : -compare;
        }
        return 0;
    });
    
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = filtered.map(t => `
        <tr data-id="${t.id}">
            <td><span class="table-name">${t.name}</span></td>
            <td>${t.brand}</td>
            <td>${t.category}</td>
            <td>
                <div class="table-effects">
                    ${t.effects.primary.slice(0, 3).map(e => `<span class="table-effect-tag">${e}</span>`).join('')}
                </div>
            </td>
            <td>${t.effects.duration || '-'}</td>
            <td>
                <div class="pain-bar">
                    ${[1,2,3,4,5].map(i => `<span class="pain-dot ${i <= Math.round(t.recovery.painLevel) ? 'filled' : ''}"></span>`).join('')}
                </div>
            </td>
            <td>${t.recovery.downtime || '없음'}</td>
            <td>${t.pricing.average}</td>
        </tr>
    `).join('');
    
    // Click handlers
    tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => {
            const treatment = treatments.find(t => t.id === row.dataset.id);
            if (treatment) showModal(treatment);
        });
    });
}

// ===== Render Treatment Cards =====
function renderTreatmentCards(items, containerId) {
    const container = document.getElementById(containerId);
    
    if (items.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
                조건에 맞는 시술이 없습니다.
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(t => `
        <div class="treatment-card" data-id="${t.id}">
            <div class="card-header">
                <div>
                    <div class="card-title">${t.name}</div>
                    <div class="card-brand">${t.brand}</div>
                </div>
                <span class="card-badge">${t.subcategory || t.category}</span>
            </div>
            <div class="card-desc">${t.review ? t.review.summary : t.mechanism.detailed}</div>
            <div class="card-tags">
                ${t.effects.primary.slice(0, 3).map(e => `<span class="card-tag">${e}</span>`).join('')}
            </div>
            <div class="card-stats">
                <div class="stat-item">
                    <div class="stat-row">
                        <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg></div>
                        <div class="stat-label">가격</div>
                    </div>
                    <div class="stat-value">${t.pricing.average}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-row">
                        <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                        <div class="stat-label">지속</div>
                    </div>
                    <div class="stat-value">${t.effects.duration || '-'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-row">
                        <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
                        <div class="stat-label">통증</div>
                    </div>
                    <div class="stat-value">${t.recovery.painLevel}/5</div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Click handlers
    container.querySelectorAll('.treatment-card').forEach(card => {
        card.addEventListener('click', () => {
            const treatment = treatments.find(t => t.id === card.dataset.id);
            if (treatment) showModal(treatment);
        });
    });
}

// ===== Modal =====
function setupModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    
    // 필수 요소가 없으면 스킵
    if (!overlay || !closeBtn) return;
    
    const closeModal = () => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function showModal(t) {
    document.body.style.overflow = 'hidden';
    const content = document.getElementById('modalContent');
    
    // 검색 URL 생성
    const searchName = encodeURIComponent(t.name + ' 후기');
    const searchNameEn = encodeURIComponent(t.nameEn + ' review');
    const naverBlogUrl = `https://search.naver.com/search.naver?ssc=tab.blog.all&query=${searchName}`;
    const naverBlogEnUrl = `https://search-naver-com.translate.goog/search.naver?ssc=tab.blog.all&query=${searchName}&_x_tr_sl=ko&_x_tr_tl=en&_x_tr_hl=en`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchName}`;
    const youtubeEnUrl = `https://www.youtube.com/results?search_query=${searchNameEn}`;
    const googleUrl = `https://www.google.com/search?q=${searchNameEn}`;
    
    content.innerHTML = `
        <!-- 1. 헤더 -->
        <div class="modal-header">
            <h2 class="modal-title">${t.name}</h2>
            <p class="modal-subtitle">${t.nameEn} · ${t.brand}</p>
            <span class="modal-badge">${t.category} / ${t.subcategory}</span>
        </div>
        
        <!-- 2. 한줄 요약 -->
        ${t.review ? `
        <div class="modal-section">
            <div class="review-summary">${t.review.summary}</div>
        </div>
        
        <!-- 3. 총평 -->
        <div class="modal-section">
            <div class="review-overall">
                <strong>💬 총평:</strong> ${t.review.overall}
            </div>
        </div>
        ` : ''}
        
        <!-- 4. 기대 효과 -->
        <div class="modal-section">
            <div class="modal-section-header-with-legend">
                <h3 class="modal-section-title">기대 효과</h3>
                <div class="effects-legend">
                    <span class="legend-item"><span class="legend-dot primary"></span>주요 효과</span>
                    <span class="legend-item"><span class="legend-dot secondary"></span>부가 효과</span>
                </div>
            </div>
            <div class="effects-tags-inline">
                ${t.effects.primary.map(e => `<span class="modal-effect-tag primary">${e}</span>`).join('')}
                ${t.effects.secondary.map(e => `<span class="modal-effect-tag secondary">${e}</span>`).join('')}
            </div>
        </div>
        
        <!-- 5. 핵심 정보 (빠른 판단용) -->
        <div class="modal-section">
            <h3 class="modal-section-title">핵심 정보</h3>
            <div class="modal-stats-grid modal-key-stats">
                <div class="modal-stat highlight">
                    <div class="modal-stat-label">💰 가격</div>
                    <div class="modal-stat-value">${t.pricing.range}</div>
                </div>
                <div class="modal-stat highlight">
                    <div class="modal-stat-label">⏱️ 효과 지속</div>
                    <div class="modal-stat-value">${t.effects.duration}</div>
                </div>
                <div class="modal-stat highlight">
                    <div class="modal-stat-label">🩹 다운타임</div>
                    <div class="modal-stat-value">${t.recovery.downtime || '없음'}</div>
                </div>
                <div class="modal-stat highlight">
                    <div class="modal-stat-label">😣 통증</div>
                    <div class="modal-stat-value">${t.recovery.painLevel}/5</div>
                </div>
            </div>
        </div>
        
        <!-- 6. 팁 및 후기 분석 (3분할: 팁, 좋아요, 아쉬워요) -->
        ${t.review ? `
        <div class="modal-section">
            <h3 class="modal-section-title">팁 및 후기 분석</h3>
            <div class="review-grid-3col">
                <div class="review-tips-box">
                    <h4>💡 시술 팁</h4>
                    <ul>${t.review.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
                </div>
                <div class="review-likes">
                    <h4>👍 이런 점이 좋아요</h4>
                    <ul>${t.review.likes.map(l => `<li>${l}</li>`).join('')}</ul>
                </div>
                <div class="review-dislikes">
                    <h4>👎 이런 점은 아쉬워요</h4>
                    <ul>${t.review.dislikes.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- 7. 이런 분께 추천 -->
        <div class="modal-section">
            <h3 class="modal-section-title">이런 분께 추천해요</h3>
            <div class="modal-suitability">
                <div class="suitability-age-box">
                    <h4>👤 적정 연령대</h4>
                    <p>${t.suitability.idealAge}</p>
                </div>
                <div class="suitability-recommend">
                    <h4>✅ 추천</h4>
                    <ul>${t.suitability.bestFor.map(b => `<li>${b}</li>`).join('')}</ul>
                </div>
                ${t.suitability.notRecommended.length ? `
                <div class="suitability-caution">
                    <h4>⚠️ 비추천</h4>
                    <ul>${t.suitability.notRecommended.map(n => `<li>${n}</li>`).join('')}</ul>
                </div>
                ` : ''}
            </div>
        </div>
        
        <!-- 7. 장단점 (키워드 요약) -->
        ${t.pros.length || t.cons.length ? `
        <div class="modal-section">
            <h3 class="modal-section-title">한눈에 보는 장단점</h3>
            <div class="modal-pros-cons">
                <div class="modal-pros">
                    <h4>👍 장점</h4>
                    <ul class="modal-list">
                        ${t.pros.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
                <div class="modal-cons">
                    <h4>👎 단점</h4>
                    <ul class="modal-list">
                        ${t.cons.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- 8. 상세 시술 정보 -->
        <div class="modal-section">
            <h3 class="modal-section-title">상세 시술 정보</h3>
            <div class="modal-stats-grid">
                <div class="modal-stat">
                    <div class="modal-stat-label">시술 시간</div>
                    <div class="modal-stat-value">${t.procedure.duration}</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-label">권장 횟수</div>
                    <div class="modal-stat-value">${t.procedure.sessions}</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-label">시술 간격</div>
                    <div class="modal-stat-value">${t.procedure.interval}</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-label">마취</div>
                    <div class="modal-stat-value">${t.procedure.anesthesia}</div>
                </div>
            </div>
        </div>
        
        <!-- 10. 시술 원리 -->
        <div class="modal-section">
            <h3 class="modal-section-title">시술 원리</h3>
            <div class="modal-mechanism">
                ${t.mechanism.detailed}
            </div>
        </div>
        
        <!-- 11. 비교 & 조합 -->
        ${Object.keys(t.comparison.vs).length || t.comparison.bestWith.length ? `
        <div class="modal-section">
            <h3 class="modal-section-title">비교 & 함께 하면 좋은 시술</h3>
            <div class="modal-comparison">
                ${Object.entries(t.comparison.vs).map(([k, v]) => `<p><strong>vs ${k}:</strong> ${v}</p>`).join('')}
                ${t.comparison.bestWith.length ? `<p class="best-with">🤝 <strong>추천 조합:</strong> ${t.comparison.bestWith.join(', ')}</p>` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- 12. 외부 링크 (더 알아보기) -->
        <div class="modal-section">
            <h3 class="modal-section-title">더 많은 후기 보기</h3>
            <div class="modal-external-links">
                <a href="${youtubeUrl}" target="_blank" class="external-link youtube">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    YouTube 후기
                </a>
                <a href="${youtubeEnUrl}" target="_blank" class="external-link youtube-en">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    YouTube (EN)
                </a>
                <a href="${naverBlogUrl}" target="_blank" class="external-link naver">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/></svg>
                    네이버 블로그
                </a>
                <a href="${naverBlogEnUrl}" target="_blank" class="external-link naver-en">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/></svg>
                    Naver (EN)
                </a>
                <a href="${googleUrl}" target="_blank" class="external-link google">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google (EN)
                </a>
            </div>
        </div>
    `;
    
    document.getElementById('modalOverlay').classList.remove('hidden');
}

// ===== Utilities =====
function extractPrice(priceStr) {
    if (!priceStr) return 0;
    const match = priceStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}


// ===== AI Consultation =====
let consultState = {
    currentStep: 1,
    totalSteps: 7,
    data: {
        age: null,
        experience: null,
        skinType: null,
        primaryConcerns: [],
        secondaryConcerns: [],
        concerns: [],
        areas: [],
        budget: null,
        downtime: null,
        pain: null,
        // 새로운 필드들
        treatmentType: ['상관없음'],  // 기본값
        duration: null,
        priority: null,
        frequency: null,
        pastTreatments: []
    }
};

function setupConsultation() {
    // Priority concern chips (클릭으로 추가/제거)
    setupPriorityConcerns();
    
    // Option buttons (single select)
    document.querySelectorAll('.option-btn[data-field]').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;
            
            const grid = btn.closest('.option-grid');
            if (grid) {
                grid.querySelectorAll('.option-btn').forEach(b => {
                    b.classList.remove('selected');
                });
            }
            btn.classList.add('selected');
            consultState.data[field] = value;
        });
    });
    
    // Multi-select option buttons (areas, treatmentType, pastTreatments)
    document.querySelectorAll('.option-grid.multi-select').forEach(grid => {
        const field = grid.dataset.field;
        if (!field) return;
        
        if (!Array.isArray(consultState.data[field])) {
            consultState.data[field] = [];
        }
        
        grid.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
                const selectedValues = [];
                grid.querySelectorAll('.option-btn.selected').forEach(b => {
                    selectedValues.push(b.dataset.value);
                });
                consultState.data[field] = selectedValues;
            });
        });
    });
    
    // Budget presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const budgetInput = document.getElementById('budgetInput');
            if (budgetInput) {
                budgetInput.value = btn.dataset.amount;
            }
            consultState.data.budget = parseInt(btn.dataset.amount);
        });
    });
    
    // Budget input
    const budgetInput = document.getElementById('budgetInput');
    if (budgetInput) {
        budgetInput.addEventListener('input', (e) => {
            consultState.data.budget = parseInt(e.target.value) || null;
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
        });
    }
    
    // Navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const backToConsult = document.getElementById('backToConsult');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (consultState.currentStep > 1) {
                goToStep(consultState.currentStep - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (consultState.currentStep < consultState.totalSteps) {
                goToStep(consultState.currentStep + 1);
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitConsultation);
    }
    
    if (backToConsult) {
        backToConsult.addEventListener('click', resetConsultation);
    }
}

// 우선순위 고민 선택 설정
function setupPriorityConcerns() {
    const primaryZone = document.getElementById('primaryConcerns');
    const secondaryZone = document.getElementById('secondaryConcerns');
    
    if (!primaryZone || !secondaryZone) return;
    
    // 모든 concern chip에 클릭 이벤트 추가
    document.querySelectorAll('.concern-source .concern-chip').forEach(chip => {
        chip.addEventListener('click', () => handleChipClick(chip));
        
        // 드래그 설정
        chip.draggable = true;
        chip.addEventListener('dragstart', handleDragStart);
        chip.addEventListener('dragend', handleDragEnd);
    });
    
    // 드롭존 설정
    [primaryZone, secondaryZone].forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

let currentClickTarget = 'primary'; // 클릭 시 어디로 갈지

function handleChipClick(chip) {
    const value = chip.dataset.value;
    const label = chip.innerHTML;
    
    // 이미 선택된 경우 제거
    if (chip.classList.contains('in-primary') || chip.classList.contains('in-secondary')) {
        removeFromPriority(value);
        chip.classList.remove('in-primary', 'in-secondary');
        return;
    }
    
    // 4개까지는 Primary(핵심 고민)에, 그 이후는 Secondary에 추가
    if (consultState.data.primaryConcerns.length < 4) {
        addToPriority('primary', value, label);
        chip.classList.add('in-primary');
    } else {
        addToPriority('secondary', value, label);
        chip.classList.add('in-secondary');
    }
}

function addToPriority(priority, value, label) {
    const zone = document.getElementById(priority === 'primary' ? 'primaryConcerns' : 'secondaryConcerns');
    
    // 이미 있는지 확인
    if (consultState.data.primaryConcerns.includes(value) || consultState.data.secondaryConcerns.includes(value)) {
        return;
    }
    
    // placeholder 제거
    const placeholder = zone.querySelector('.dropzone-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    
    // 칩 생성
    const newChip = document.createElement('button');
    newChip.className = 'concern-chip';
    newChip.dataset.value = value;
    newChip.innerHTML = label + ' <span class="chip-remove">×</span>';
    newChip.addEventListener('click', () => {
        removeFromPriority(value);
        // 원본 칩 상태 업데이트
        document.querySelector(`.concern-source .concern-chip[data-value="${value}"]`)?.classList.remove('in-primary', 'in-secondary');
    });
    
    zone.appendChild(newChip);
    
    // 상태 업데이트
    if (priority === 'primary') {
        consultState.data.primaryConcerns.push(value);
    } else {
        consultState.data.secondaryConcerns.push(value);
    }
    updateConcernsArray();
}

function removeFromPriority(value) {
    // Primary에서 제거
    const primaryIdx = consultState.data.primaryConcerns.indexOf(value);
    if (primaryIdx > -1) {
        consultState.data.primaryConcerns.splice(primaryIdx, 1);
        const chip = document.querySelector(`#primaryConcerns .concern-chip[data-value="${value}"]`);
        if (chip) chip.remove();
    }
    
    // Secondary에서 제거
    const secondaryIdx = consultState.data.secondaryConcerns.indexOf(value);
    if (secondaryIdx > -1) {
        consultState.data.secondaryConcerns.splice(secondaryIdx, 1);
        const chip = document.querySelector(`#secondaryConcerns .concern-chip[data-value="${value}"]`);
        if (chip) chip.remove();
    }
    
    // placeholder 복원
    ['primaryConcerns', 'secondaryConcerns'].forEach(id => {
        const zone = document.getElementById(id);
        if (zone.querySelectorAll('.concern-chip').length === 0) {
            const placeholder = zone.querySelector('.dropzone-placeholder');
            if (placeholder) placeholder.style.display = 'block';
        }
    });
    
    updateConcernsArray();
}

function updateConcernsArray() {
    consultState.data.concerns = [...consultState.data.primaryConcerns, ...consultState.data.secondaryConcerns];
}

// 드래그 앤 드롭 핸들러
let draggedChip = null;

function handleDragStart(e) {
    draggedChip = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedChip = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedChip) return;
    
    const value = draggedChip.dataset.value;
    const label = draggedChip.innerHTML;
    const priority = e.currentTarget.id === 'primaryConcerns' ? 'primary' : 'secondary';
    
    // 기존 위치에서 제거
    removeFromPriority(value);
    draggedChip.classList.remove('in-primary', 'in-secondary');
    
    // 새 위치에 추가
    addToPriority(priority, value, label);
    draggedChip.classList.add(priority === 'primary' ? 'in-primary' : 'in-secondary');
}

function goToStep(step) {
    // 다음으로 넘어갈 때만 검증 (이전 버튼은 검증 안함)
    if (step > consultState.currentStep) {
        const isValid = validateCurrentStep();
        if (!isValid) {
            return;
        }
    }
    
    // Save inputs (동기적으로 처리)
    if (consultState.currentStep === 4) {
        consultState.data.budget = parseInt(document.getElementById('budgetInput')?.value) || null;
    }
    
    consultState.currentStep = step;
    
    // 모든 스텝 즉시 숨기기
    const allSteps = document.querySelectorAll('.consult-step');
    allSteps.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
        s.style.opacity = '0';
    });
    
    // 현재 스텝만 보이기
    const currentStepEl = document.querySelector(`.consult-step[data-step="${step}"]`);
    if (currentStepEl) {
        currentStepEl.style.display = 'block';
        // 강제 리플로우 후 애니메이션
        currentStepEl.offsetHeight;
        currentStepEl.classList.add('active');
        currentStepEl.style.opacity = '1';
    }
    
    document.getElementById('progressFill').style.width = `${(step / consultState.totalSteps) * 100}%`;
    document.getElementById('progressText').textContent = `${step} / ${consultState.totalSteps}`;
    
    document.getElementById('prevBtn').disabled = step === 1;
    
    if (step === consultState.totalSteps) {
        document.getElementById('nextBtn').classList.add('hidden');
        document.getElementById('submitBtn').classList.remove('hidden');
    } else {
        document.getElementById('nextBtn').classList.remove('hidden');
        document.getElementById('submitBtn').classList.add('hidden');
    }
}

function validateCurrentStep() {
    const step = consultState.currentStep;
    let isValid = true;
    let message = '';
    
    switch(step) {
        case 1:
            if (!consultState.data.age) {
                message = '연령대를 선택해주세요.';
                isValid = false;
            } else if (!consultState.data.experience) {
                message = '시술 경험을 선택해주세요.';
                isValid = false;
            } else if (!consultState.data.skinType) {
                message = '피부 타입을 선택해주세요.';
                isValid = false;
            }
            break;
        case 2:
            if (!consultState.data.primaryConcerns || consultState.data.primaryConcerns.length === 0) {
                message = '가장 해결하고 싶은 고민을 최소 1개 이상 선택해주세요.';
                isValid = false;
            }
            break;
        case 3:
            if (!consultState.data.areas || consultState.data.areas.length === 0) {
                message = '관심 부위를 최소 1개 이상 선택해주세요.';
                isValid = false;
            }
            break;
        case 4:
            const budget = parseInt(document.getElementById('budgetInput')?.value);
            if (!budget || budget < 10) {
                message = '예산을 입력해주세요. (최소 10만원)';
                isValid = false;
            }
            break;
        case 5:
            if (!consultState.data.downtime) {
                message = '다운타임 허용 범위를 선택해주세요.';
                isValid = false;
            } else if (!consultState.data.pain) {
                message = '통증 민감도를 선택해주세요.';
                isValid = false;
            }
            break;
        case 6:
            if (!consultState.data.treatmentType || consultState.data.treatmentType.length === 0) {
                message = '선호하는 시술 방식을 선택해주세요.';
                isValid = false;
            } else if (!consultState.data.duration) {
                message = '효과 유지 기간을 선택해주세요.';
                isValid = false;
            }
            break;
        case 7:
            if (!consultState.data.priority) {
                message = '가장 중요하게 생각하는 것을 선택해주세요.';
                isValid = false;
            } else if (!consultState.data.frequency) {
                message = '시술 계획을 선택해주세요.';
                isValid = false;
            }
            break;
    }
    
    if (!isValid) {
        showValidationMessage(message);
    }
    
    return isValid;
}

function showValidationMessage(message) {
    // 기존 메시지 제거
    const existingMsg = document.querySelector('.validation-message');
    if (existingMsg) existingMsg.remove();
    
    // 새 메시지 생성
    const msgEl = document.createElement('div');
    msgEl.className = 'validation-message';
    msgEl.textContent = message;
    
    // 현재 스텝에 추가
    const currentStep = document.querySelector(`.consult-step[data-step="${consultState.currentStep}"]`);
    currentStep.appendChild(msgEl);
    
    // 3초 후 제거
    setTimeout(() => {
        msgEl.remove();
    }, 3000);
}

// 프로그레스 관련 변수
let progressTimer = null;
let progressStartTime = null;

function updateProgress(step, message, percent) {
    // 메시지 업데이트
    const msgEl = document.getElementById('loadingMessage');
    if (msgEl) msgEl.textContent = message;
    
    // 프로그레스 바 업데이트
    const fillEl = document.getElementById('loadingProgressFill');
    if (fillEl) fillEl.style.width = percent + '%';
    
    // 단계 업데이트
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById('loadingStep' + i);
        if (stepEl) {
            stepEl.classList.remove('active', 'completed');
            if (i < step) {
                stepEl.classList.add('completed');
            } else if (i === step) {
                stepEl.classList.add('active');
            }
        }
    }
}

function startProgressTimer() {
    progressStartTime = Date.now();
    progressTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - progressStartTime) / 1000);
        const timeEl = document.getElementById('progressTime');
        if (timeEl) timeEl.textContent = `경과 시간: ${elapsed}초`;
    }, 1000);
}

function stopProgressTimer() {
    if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
    }
}

async function submitConsultation() {
    consultState.data.budget = parseInt(document.getElementById('budgetInput')?.value) || null;
    
    document.getElementById('consultWizard').classList.add('hidden');
    document.getElementById('consultLoading').classList.remove('hidden');
    
    // 프로그레스 초기화 및 시작
    updateProgress(1, '요청을 준비하고 있어요...', 10);
    startProgressTimer();
    
    // 룰베이스 추천 (비동기 시뮬레이션)
    setTimeout(() => {
        updateProgress(2, '시술 데이터베이스를 검색하고 있어요...', 30);
        
        setTimeout(() => {
            updateProgress(3, '최적의 조합을 분석하고 있어요...', 60);
            
            setTimeout(() => {
                updateProgress(4, '결과를 생성하고 있어요...', 90);
                
                setTimeout(() => {
                    stopProgressTimer();
                    try {
                        const response = generateRuleBasedRecommendation(consultState.data);
                        displayResult(response);
                    } catch (error) {
                        console.error('Rule-based Error:', error);
                        displayError(error);
                    }
                }, 300);
            }, 400);
        }, 400);
    }, 300);
}

// ===== 룰베이스 추천 엔진 =====
function generateRuleBasedRecommendation(userData) {
    const budget = userData.budget || 100;
    const primaryConcerns = userData.primaryConcerns || [];
    const secondaryConcerns = userData.secondaryConcerns || [];
    const downtime = userData.downtime || '상관없음';
    const pain = userData.pain || '보통';
    
    // 새로운 인풋들
    const treatmentType = userData.treatmentType || [];    // 선호 시술 타입
    const duration = userData.duration || '중기';          // 효과 유지 기간
    const priority = userData.priority || '효과';          // 우선순위
    const frequency = userData.frequency || '비정기';      // 시술 빈도
    const pastTreatments = userData.pastTreatments || [];  // 이전 시술 경험
    const experience = userData.experience || '처음';       // 피부과 경험
    
    // 시술 타입 → 카테고리 매핑
    const typeToCategory = {
        '주사': ['보톡스', '필러', '스킨부스터', '리쥬란', '물광', '주사', 'PRP', '엑소좀', '쥬베룩', '볼뉴머'],
        '레이저': ['레이저', '토닝', 'IPL', '프락셀', '피코', '제네시스', '브이빔', '클라리티'],
        '리프팅': ['울쎄라', '써마지', '슈링크', '인모드', '실리프팅', '하이푸', 'HIFU', '올리지오', '더블로'],
        '스킨케어': ['필링', '아쿠아필', '스케일링', 'MTS', '더마펜']
    };
    
    // 유지 기간 → 시술 특성 매핑
    const durationToTreatments = {
        '단기': ['보톡스', '필러', '물광주사', '아쿠아필', '스킨부스터', 'MTS'],
        '중기': ['리쥬란', '쥬베룩', '레이저토닝', 'IPL', '제네시스', '스킨보톡스'],
        '장기': ['울쎄라', '써마지', '실리프팅', '스컬트라', '엘란쎄', '프락셀', '지방이식']
    };
    
    // 고민 → 시술 매핑 (대폭 확장)
    const concernToTreatments = {
        '처진피부': ['울쎄라', '써마지', '실리프팅', '인모드', '슈링크', '올리지오', '텐써마', '유써마', '더블로', '리프테라', '소프웨이브', '하이푸', 'HIFU', '울트라포머', '울트라셀', '실루엣소프트', '민트실', '녹는실', '보톡스', '스킨보톡스'],
        '주름': ['보톡스', '필러', '써마지', '울쎄라', '리쥬란', '스킨보톡스', '주름보톡스', '이마보톡스', '눈가보톡스', '미간보톡스', '팔자필러', '입술필러', '콜라겐부스터', '쥬베룩', '리즈네', '엑소좀'],
        '탄력저하': ['써마지', '울쎄라', '인모드', '스킨보톡스', '콜라겐부스터', '리쥬란', '쥬베룩', '볼뉴머', '프로파일로', '엑소좀', '슈링크', '소프웨이브', '올리지오', '폴리뉴클레오타이드'],
        '볼륨손실': ['필러', '스컬트라', '엘란쎄', '지방이식', '콜라겐부스터', '볼필러', '애교살필러', '이마필러', '관자필러', '쥬베룩', '볼뉴머'],
        '이중턱': ['지방분해주사', '슈링크', '울쎄라', '실리프팅', '윤곽주사', '턱보톡스', '지방흡입', '인모드', '벨라소닉', '더블로'],
        '팔자주름': ['필러', '실리프팅', '울쎄라', '보톡스', '팔자필러', '콜라겐부스터', '하이푸', '써마지'],
        '모공': ['프락셀', '피코슈어', 'CO2레이저', '아쿠아필', '모피어스8', '실펌', '레이저토닝', 'MTS', '마이크로니들', '제네시스', 'IPL', '스킨보톡스', '써마지', '피코토닝'],
        '기미잡티': ['피코슈어', '레이저토닝', 'IPL', '스타워커', '루비레이저', '큐스위치', '멜라논', '트리플토닝', '클라리티', '엑셀브이', '피코웨이', '피코플러스', '스펙트라', '제네시스'],
        '피부결': ['아쿠아필', '리쥬란', '엑소좀', '벨벳필', '스킨부스터', '물광주사', 'MTS', '더마펜', '실펌', '제네시스', '레이저토닝', '콜라겐부스터', '연어주사', '쥬베룩'],
        '피부톤': ['IPL', '레이저토닝', '비타민주사', '글루타치온', '백옥주사', '신데렐라주사', '제네시스', '클라리티', '엑셀브이', '스펙트라'],
        '홍조': ['브이빔', 'IPL', '엑셀브이', '제네시스', '옐로우레이저', '클라리티', '엑셀브이플러스', '혈관레이저'],
        '색소침착': ['피코슈어', '레이저토닝', 'IPL', '스타워커', '피코웨이', '루비레이저', '큐스위치', '스펙트라'],
        '여드름': ['아쿠아필', 'PDT', '압출', '여드름주사', '살리실산필링', '제네시스', 'IPL', '아그네스', '클라리티', '레이저토닝', '스킨스케일링', 'BHA필링'],
        '여드름흉터': ['프락셀', 'CO2레이저', '모피어스8', '서브시전', '인트라셀', '실펌', 'MTS', '더마펜', '에어젯', 'TCA크로스', '도트필링', '포텐자', '시크릿'],
        '흉터': ['프락셀', 'CO2레이저', '레이저박피', '실리콘시트', '모피어스8', '인트라셀', '시크릿', '포텐자'],
        '튼살': ['프락셀', 'CO2레이저', '카복시', '인피니', '실펌', '모피어스8', 'MTS'],
        '다크서클': ['필러', '리쥬란아이', '지방이식', '카복시', '눈밑필러', '아이리쥬란', '엑소좀', '콜라겐부스터'],
        '제모': ['의료레이저제모', '소프라노', '젠틀맥스', '클라리티', '다이오드', '알렉산드라이트', 'IPL제모'],
        '탈모': ['탈모주사', 'PRP', '엑소좀', '두피스케일링', '메조테라피', '미녹시딜', 'HARG', '줄기세포', '두피MTS'],
        '다한증': ['보톡스', '미라드라이', '다한증보톡스']
    };
    
    // 다운타임 허용에 따른 필터
    const downtimeFilter = {
        '없어야함': 0,
        '당일': 1,
        '1-2일': 2,
        '3-4일': 4,
        '일주일': 7,
        '상관없음': 30
    };
    const maxDowntime = downtimeFilter[downtime] || 30;
    
    // 통증 민감도에 따른 필터
    const painFilter = {
        '매우민감': 1,
        '민감': 2,
        '보통': 3,
        '괜찮음': 5
    };
    const maxPain = painFilter[pain] || 3;
    
    // 시술 매칭 및 점수화
    function scoreTreatment(treatment, isPrimary) {
        let score = 0;
        const concerns = isPrimary ? primaryConcerns : secondaryConcerns;
        const treatmentName = treatment.name || '';
        
        // 1. concernToTreatments 매핑 기반 점수 (가장 중요)
        concerns.forEach(concern => {
            const mappedTreatments = concernToTreatments[concern] || [];
            if (mappedTreatments.some(mt => treatmentName.includes(mt) || mt.includes(treatmentName))) {
                score += isPrimary ? 50 : 25;
            }
        });
        
        // 2. 효과/타겟 텍스트 매칭 점수
        concerns.forEach(concern => {
            const effects = treatment.effects?.primary || [];
            const targets = treatment.effects?.targets || [];
            const allEffects = [...effects, ...targets].join(' ').toLowerCase();
            const concernLower = concern.toLowerCase();
            
            if (allEffects.includes(concernLower) || concernLower.includes(treatment.category?.toLowerCase() || '')) {
                score += isPrimary ? 20 : 10;
            }
        });
        
        // 3. 카테고리 매칭 (리프팅, 필러 등)
        const categoryMap = {
            '처진피부': ['리프팅', 'HIFU', '고주파', '실리프팅'],
            '주름': ['보톡스', '필러', '리프팅'],
            '탄력저하': ['리프팅', '고주파', 'HIFU', '스킨부스터'],
            '볼륨손실': ['필러', '지방이식'],
            '모공': ['레이저', '필링', '프락셔널'],
            '기미잡티': ['레이저', '토닝', 'IPL'],
            '여드름': ['필링', '레이저', 'PDT'],
            '여드름흉터': ['프락셔널', '레이저', 'MTS']
        };
        
        concerns.forEach(concern => {
            const categories = categoryMap[concern] || [];
            if (categories.some(cat => treatment.category?.includes(cat))) {
                score += isPrimary ? 15 : 8;
            }
        });
        
        // 4. 시술 타입 선호도 매칭 (새로 추가)
        if (treatmentType.length > 0 && !treatmentType.includes('상관없음')) {
            let typeMatch = false;
            treatmentType.forEach(type => {
                const matchKeywords = typeToCategory[type] || [];
                if (matchKeywords.some(kw => treatmentName.includes(kw) || treatment.category?.includes(kw))) {
                    typeMatch = true;
                    score += 25;  // 선호 타입 매칭 보너스
                }
            });
            if (!typeMatch) {
                score -= 15;  // 선호하지 않는 타입 페널티
            }
        }
        
        // 5. 유지 기간 선호도 매칭 (새로 추가)
        const durationTreatments = durationToTreatments[duration] || [];
        if (durationTreatments.some(dt => treatmentName.includes(dt))) {
            score += 20;  // 선호 유지기간 매칭 보너스
        }
        
        // 6. 우선순위 반영 (새로 추가)
        if (priority === '효과') {
            // 고가/강한 시술 선호
            const minPrice = extractMinPrice(treatment.pricing?.range);
            if (minPrice >= 50) score += 10;
        } else if (priority === '편안함') {
            // 통증 낮은 시술 선호
            const painLevel = treatment.recovery?.painLevel || 0;
            if (painLevel <= 2) score += 15;
            if (painLevel >= 4) score -= 20;
        } else if (priority === '가성비') {
            // 가격 대비 효과 좋은 시술
            const minPrice = extractMinPrice(treatment.pricing?.range);
            if (minPrice > 0 && minPrice <= 30) score += 15;
        }
        
        // 7. 시술 경험 반영 (새로 추가)
        if (experience === '처음') {
            // 초보자에게 쉬운 시술 추천
            const painLevel = treatment.recovery?.painLevel || 0;
            if (painLevel <= 2) score += 10;
            // 복잡한 시술 페널티
            if (['실리프팅', '지방이식', '지방흡입'].some(t => treatmentName.includes(t))) {
                score -= 15;
            }
        } else if (experience === '자주') {
            // 경험자에게 다양한 시술 OK
            score += 5;
        }
        
        // 8. 이전 시술 경험 반영 (새로 추가)
        if (pastTreatments.length > 0 && !pastTreatments.includes('없음')) {
            pastTreatments.forEach(past => {
                // 이전에 해본 시술과 같은 종류면 익숙함 보너스
                if (treatmentName.includes(past)) {
                    score += 10;
                }
                // 시너지 있는 새로운 시술 추천
                const synergies = synergyMap[past] || [];
                if (synergies.some(s => treatmentName.includes(s))) {
                    score += 15;
                }
            });
        }
        
        // 다운타임 체크
        const downtimeDays = parseDowntime(treatment.recovery?.downtime);
        if (downtimeDays > maxDowntime) {
            score -= 50;
        }
        
        // 통증 체크
        const painLevel = treatment.recovery?.painLevel || 0;
        if (painLevel > maxPain) {
            score -= 20;
        }
        
        // 가격 체크
        const minPrice = extractMinPrice(treatment.pricing?.range);
        if (minPrice > budget * 0.5) {
            score -= 10;
        }
        
        return score;
    }
    
    function parseDowntime(str) {
        if (!str || str === '없음') return 0;
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[0]) : 3;
    }
    
    // 시술 시너지 맵 - 함께 받으면 효과적인 조합
    const synergyMap = {
        // 리프팅 + 볼륨
        '울쎄라': ['보톡스', '필러', '스킨보톡스', '리쥬란'],
        '써마지': ['보톡스', '필러', '스킨보톡스', '인모드'],
        '슈링크': ['보톡스', '필러', '스킨보톡스'],
        '실리프팅': ['보톡스', '필러'],
        '인모드': ['보톡스', '써마지'],
        
        // 보톡스/필러 + 피부관리
        '보톡스': ['필러', '스킨보톡스', '리쥬란', '물광주사'],
        '필러': ['보톡스', '리쥬란', '스킨보톡스'],
        '스킨보톡스': ['리쥬란', '물광주사', '아쿠아필'],
        
        // 피부결 + 톤
        '리쥬란': ['물광주사', '레이저토닝', '아쿠아필'],
        '물광주사': ['리쥬란', '아쿠아필', '레이저토닝'],
        '아쿠아필': ['리쥬란', '물광주사', '레이저토닝'],
        
        // 색소 + 톤
        '피코슈어': ['레이저토닝', 'IPL', '리쥬란'],
        '레이저토닝': ['피코슈어', 'IPL', '리쥬란', '아쿠아필'],
        'IPL': ['레이저토닝', '리쥬란'],
        
        // 흉터/모공
        '프락셀': ['리쥬란', '스킨보톡스', 'CO2레이저'],
        'CO2레이저': ['리쥬란', '프락셀'],
        '모피어스8': ['리쥬란', '보톡스'],
        
        // 지방/윤곽
        '지방분해주사': ['고주파', '윤곽주사'],
        '윤곽주사': ['지방분해주사', '보톡스'],
        
        // 홍조
        '브이빔': ['IPL', '제네시스'],
        '제네시스': ['리쥬란', '브이빔']
    };
    
    // 모든 시술 점수 계산 (primary + secondary 모두 반영)
    const scoredTreatments = treatments.map(t => {
        const primaryScore = scoreTreatment(t, true);
        const secondaryScore = scoreTreatment(t, false);
        return {
            ...t,
            score: primaryScore + secondaryScore * 0.7,  // secondary 가중치 높임
            primaryScore,
            secondaryScore,
            minPrice: extractMinPrice(t.pricing?.range)
        };
    }).filter(t => t.score > 0 && t.minPrice > 0)
      .sort((a, b) => b.score - a.score);
    
    // 부가 고민 전용 시술 (primary=0, secondary>0)
    const secondaryOnlyTreatments = treatments.map(t => {
        const secondaryScore = scoreTreatment(t, false);
        return {
            ...t,
            score: secondaryScore,
            primaryScore: 0,
            secondaryScore,
            minPrice: extractMinPrice(t.pricing?.range)
        };
    }).filter(t => t.score > 0 && t.minPrice > 0 && !scoredTreatments.some(st => st.name === t.name))
      .sort((a, b) => b.score - a.score);
    
    // 시술에 매칭된 고민 찾기 (더 넓은 매칭)
    function getMatchedConcerns(treatment) {
        const matched = [];
        const treatmentName = treatment.name || '';
        const category = treatment.category || '';
        const subcategory = treatment.subcategory || '';
        const effects = [...(treatment.effects?.primary || []), ...(treatment.effects?.targets || [])].join(' ').toLowerCase();
        const allText = `${treatmentName} ${category} ${subcategory} ${effects}`.toLowerCase();
        
        [...primaryConcerns, ...secondaryConcerns].forEach(concern => {
            // 1. concernToTreatments 매핑 체크
            const mappedTreatments = concernToTreatments[concern] || [];
            if (mappedTreatments.some(mt => treatmentName.includes(mt) || mt.includes(treatmentName))) {
                matched.push(concern);
                return;
            }
            
            // 2. 효과/타겟에서 고민 키워드 체크
            const concernLower = concern.toLowerCase();
            if (effects.includes(concernLower)) {
                matched.push(concern);
                return;
            }
            
            // 3. 카테고리/서브카테고리/시술명 매칭 (확장)
            const categoryMap = {
                '처진피부': ['리프팅', 'HIFU', '고주파', '울쎄라', '써마지', '실리프팅', '슈링크', '인모드', '타이트닝'],
                '주름': ['보톡스', '필러', '리프팅', '주름', '울쎄라', '써마지'],
                '탄력저하': ['리프팅', '고주파', '스킨부스터', '콜라겐', '탄력', '써마지', '울쎄라', '타이트닝'],
                '볼륨손실': ['필러', '지방', '볼륨', '스컬트라', '엘란쎄'],
                '이중턱': ['지방', '윤곽', '턱', '슈링크', '인모드'],
                '팔자주름': ['필러', '리프팅', '팔자'],
                '모공': ['레이저', '필링', '프락셔널', '토닝', '모공', '피코'],
                '기미잡티': ['레이저', '토닝', 'IPL', '피코', '기미', '색소', '멜라닌'],
                '피부결': ['필링', '스킨부스터', '리쥬란', 'MTS', '레이저', '아쿠아필', '피부결'],
                '피부톤': ['토닝', 'IPL', '레이저', '백옥', '신데렐라', '글루타치온', '비타민'],
                '홍조': ['브이빔', 'IPL', '혈관', '홍조', '레이저'],
                '색소침착': ['토닝', '피코', 'IPL', '색소'],
                '여드름': ['필링', 'PDT', '레이저', '여드름', '아그네스', '압출'],
                '여드름흉터': ['프락셀', '프락셔널', 'MTS', 'CO2', '레이저', '흉터', '모피어스', '시크릿'],
                '흉터': ['프락셀', '프락셔널', 'CO2', '레이저', '흉터', '모피어스'],
                '튼살': ['프락셀', 'CO2', '카복시', '튼살', 'MTS'],
                '다크서클': ['필러', '리쥬란', '눈밑', '다크서클', '카복시'],
                '제모': ['제모', '레이저', '소프라노', '젠틀맥스'],
                '탈모': ['탈모', 'PRP', '두피', '모발'],
                '다한증': ['다한증', '미라드라이', '보톡스']
            };
            
            const cats = categoryMap[concern] || [];
            if (cats.some(c => allText.includes(c.toLowerCase()))) {
                matched.push(concern);
            }
        });
        
        return [...new Set(matched)]; // 중복 제거
    }
    
    // 예산 내 조합 생성 (최대 8개, 시너지 고려)
    function createCombination(name, budgetRatio, strategy, excludeTreatments = new Set()) {
        const targetBudget = budget * budgetRatio;
        const combo = { name, treatments: [], totalMin: 0, totalMax: 0 };
        const usedCategories = new Set();
        const usedNames = new Set();
        
        // 핵심: 고민과 관련있는 시술만 필터링 (score > 20 이상, 제외 목록 제외)
        const relevantTreatments = scoredTreatments
            .filter(t => t.score >= 20 && !excludeTreatments.has(t.name));
        
        // 전략에 따른 시술 정렬
        let pool = [...relevantTreatments];
        
        if (strategy === 'premium') {
            // 프리미엄: 가격 높은 순 (단, 점수 30 이상만)
            pool = pool.filter(t => t.score >= 30);
            pool.sort((a, b) => b.minPrice - a.minPrice);
        } else if (strategy === 'value') {
            // 가성비: 점수/가격 비율
            pool.sort((a, b) => (b.score / Math.max(b.minPrice, 1)) - (a.score / Math.max(a.minPrice, 1)));
        } else {
            // 기본: 점수순
            pool.sort((a, b) => b.score - a.score);
        }
        
        // 시술 추가 함수
        function addTreatment(treatment) {
            combo.treatments.push({
                ...treatment,
                matchedConcerns: getMatchedConcerns(treatment)
            });
            combo.totalMin += treatment.minPrice;
            usedCategories.add(treatment.category);
            usedNames.add(treatment.name);
            
            const priceMatch = (treatment.pricing?.range || '').match(/(\d+)/g);
            if (priceMatch) {
                combo.totalMax += parseInt(priceMatch[priceMatch.length - 1]) || treatment.minPrice;
            } else {
                combo.totalMax += treatment.minPrice;
            }
        }
        
        // 1단계: 핵심 시술 선택
        for (const treatment of pool) {
            if (combo.totalMin >= targetBudget * 0.6) break;
            if (combo.treatments.length >= 3) break;
            
            const newTotal = combo.totalMin + treatment.minPrice;
            if (newTotal <= targetBudget) {
                addTreatment(treatment);
            }
        }
        
        // 2단계: 시너지 시술 추가
        const addedCore = combo.treatments.map(t => t.name);
        const synergyPool = relevantTreatments.filter(t => {
            if (usedNames.has(t.name)) return false;
            return addedCore.some(coreName => {
                const synergies = synergyMap[coreName] || [];
                return synergies.includes(t.name);
            });
        });
        
        for (const treatment of synergyPool) {
            if (combo.totalMin >= targetBudget * 0.9) break;
            if (combo.treatments.length >= 8) break;
            
            const newTotal = combo.totalMin + treatment.minPrice;
            if (newTotal <= targetBudget) {
                addTreatment(treatment);
            }
        }
        
        // 3단계: 남은 예산으로 추가 시술 (핵심 고민)
        const remainingPool = pool.filter(t => !usedNames.has(t.name));
        for (const treatment of remainingPool) {
            if (combo.totalMin >= targetBudget * 0.85) break;
            if (combo.treatments.length >= 6) break;
            
            const newTotal = combo.totalMin + treatment.minPrice;
            if (newTotal <= targetBudget) {
                addTreatment(treatment);
            }
        }
        
        // 4단계: 부가 고민 시술 추가 (secondary concerns)
        if (secondaryConcerns.length > 0) {
            const secondaryPool = [...secondaryOnlyTreatments, ...scoredTreatments.filter(t => t.secondaryScore > 0)]
                .filter(t => !usedNames.has(t.name) && !excludeTreatments.has(t.name))
                .sort((a, b) => b.secondaryScore - a.secondaryScore);
            
            for (const treatment of secondaryPool) {
                if (combo.totalMin >= targetBudget * 0.95) break;
                if (combo.treatments.length >= 8) break;
                
                const newTotal = combo.totalMin + treatment.minPrice;
                if (newTotal <= targetBudget) {
                    addTreatment(treatment);
                }
            }
        }
        
        return { combo, usedNames };
    }
    
    // 3가지 조합 생성 (중복 최소화)
    const { combo: comboA, usedNames: usedA } = createCombination('프리미엄 집중 케어', 1.0, 'premium');
    
    // B는 A에서 사용한 고가 시술 일부 제외
    const expensiveFromA = new Set(
        comboA.treatments
            .filter(t => t.minPrice >= 30)
            .slice(0, 2)
            .map(t => t.name)
    );
    const { combo: comboB, usedNames: usedB } = createCombination('스마트 밸런스', 0.7, 'value', expensiveFromA);
    
    // C는 A, B의 고가 시술 제외
    const expensiveFromAB = new Set([
        ...comboA.treatments.filter(t => t.minPrice >= 40).map(t => t.name),
        ...comboB.treatments.filter(t => t.minPrice >= 40).map(t => t.name)
    ]);
    let { combo: comboC } = createCombination('효율 중심 플랜', 0.5, 'value', expensiveFromAB);
    
    // B와 C가 완전히 동일한지 체크 (시술 목록 비교)
    const getBNames = comboB.treatments.map(t => t.name).sort().join(',');
    const getCNames = comboC.treatments.map(t => t.name).sort().join(',');
    
    if (getBNames === getCNames && comboC.treatments.length > 1) {
        // C에서 가장 비싼 시술 1개 제거하여 차별화
        const sorted = [...comboC.treatments].sort((a, b) => b.minPrice - a.minPrice);
        const toRemove = sorted[0];
        comboC.treatments = comboC.treatments.filter(t => t.name !== toRemove.name);
        comboC.totalMin -= toRemove.minPrice;
        const priceMatch = (toRemove.pricing?.range || '').match(/(\d+)/g);
        if (priceMatch) {
            comboC.totalMax -= parseInt(priceMatch[priceMatch.length - 1]) || toRemove.minPrice;
        } else {
            comboC.totalMax -= toRemove.minPrice;
        }
    }
    
    // 가격 차이 보장 (A > B > C)
    let combos = [comboA, comboB, comboC];
    
    // 가격순 정렬
    combos.sort((a, b) => b.totalMin - a.totalMin);
    
    // 이름 재할당
    const comboLabels = [
        { name: '프리미엄 집중 케어', tip: '최고의 효과를 원하시는 분께 추천드립니다.' },
        { name: '스마트 밸런스', tip: '가성비와 효과의 균형을 원하시는 분께 추천드립니다.' },
        { name: '효율 중심 플랜', tip: '핵심 고민에 집중하고 싶으신 분께 추천드립니다.' }
    ];
    
    // 결과 포맷팅
    const combinations = combos.map((combo, i) => {
        return {
            name: comboLabels[i].name,
            totalPrice: combo.totalMin === combo.totalMax ? 
                `약 ${combo.totalMin}만원` : 
                `약 ${combo.totalMin}~${combo.totalMax}만원`,
            budgetUsage: Math.round((combo.totalMin / budget) * 100) + '%',
            tip: comboLabels[i].tip,
            treatments: combo.treatments.map(t => ({
                name: t.name,
                category: t.category,
                price: t.pricing?.range || '',
                sessions: t.procedure?.sessions || '',
                reason: getRecommendReason(t, primaryConcerns, secondaryConcerns),
                matchedConcerns: t.matchedConcerns || [],
                painLevel: t.recovery?.painLevel || 0,
                downtime: t.recovery?.downtime || '없음'
            }))
        };
    });
    
    // 모든 추천 시술 상세정보 수집
    const allTreatmentNames = new Set();
    combinations.forEach(combo => {
        combo.treatments.forEach(t => allTreatmentNames.add(t.name));
    });
    
    const treatmentDetails = [];
    allTreatmentNames.forEach(name => {
        const t = treatments.find(tr => tr.name === name);
        if (t) {
            const review = t.review || {};
            let mechanismText = '';
            if (typeof t.mechanism === 'object') {
                mechanismText = t.mechanism?.detailed || t.mechanism?.summary || '';
            } else {
                mechanismText = t.mechanism || '';
            }
            
            treatmentDetails.push({
                name: t.name,
                fullName: t.fullName || t.name,
                brand: t.brand || '',
                category: t.category || '',
                priceRange: t.pricing?.range || '',
                sessions: t.procedure?.sessions || '',
                anesthesia: t.procedure?.anesthesia || '',
                description: review.summary || t.description || '',
                mechanism: mechanismText,
                expectedEffects: t.effects?.primary || [],
                secondaryEffects: t.effects?.secondary || [],
                pros: review.likes || t.pros || [],
                cons: review.dislikes || t.cons || [],
                tips: review.tips || [],
                overall: review.overall || '',
                painLevel: t.recovery?.painLevel || 0,
                downtime: t.recovery?.downtime || '없음'
            });
        }
    });
    
    // 인사말 생성
    const concernText = primaryConcerns.slice(0, 2).join(', ');
    const greeting = `${concernText} 고민을 중심으로 분석해드렸어요. ${budget}만원 예산 내에서 최적의 조합을 찾아봤습니다.`;
    
    // 분석 생성
    const analysis = `주요 고민인 ${primaryConcerns.join(', ')}에 집중하여 ${scoredTreatments.length}개의 시술을 검토했습니다. 다운타임 ${downtime}, 통증 민감도 ${pain} 조건을 고려하여 총 3가지 조합을 추천드립니다.`;
    
    return {
        greeting,
        analysis,
        combinations,
        recommendation: `세 가지 조합 모두 예산 내에서 효과적인 플랜입니다. A는 최대 효과, B는 균형, C는 효율을 중시한 조합이니 상황에 맞게 선택하세요.`,
        tips: [
            '첫 상담 시 여러 병원을 비교해보세요.',
            '패키지 구매 시 10~20% 할인 가능합니다.',
            '시술 전 2주간 레티놀, 필링 제품을 중단하세요.'
        ],
        treatmentDetails,
        priceGuide: {
            note: "가격은 병원, 지역, 프로모션에 따라 달라질 수 있습니다.",
            negotiationTip: "첫 방문 시 상담만 받고 여러 병원 비교 후 결정하세요.",
            packageTip: "3회 이상 패키지로 구매하면 10-20% 할인받을 수 있습니다."
        },
        precautions: {
            before: ["시술 2주 전부터 레티놀, 필링 제품 중단", "시술 당일 음주 금지", "아스피린 등 혈액 응고제 복용 시 의사에게 알리기"],
            after: ["시술 부위 자외선 차단 철저히", "시술 후 2-3일간 사우나, 격렬한 운동 피하기", "충분한 수분 섭취와 보습"],
            emergency: "심한 붓기, 발적, 통증 시 즉시 시술 병원에 연락하세요."
        }
    };
}

function getRecommendReason(treatment, primary, secondary) {
    const effects = treatment.effects?.primary || [];
    const matchedPrimary = primary.filter(c => effects.some(e => e.includes(c) || c.includes(e)));
    const matchedSecondary = secondary.filter(c => effects.some(e => e.includes(c) || c.includes(e)));
    
    if (matchedPrimary.length > 0) {
        return `${matchedPrimary[0]} 개선에 효과적인 ${treatment.category} 시술입니다.`;
    } else if (matchedSecondary.length > 0) {
        return `${matchedSecondary[0]} 개선을 함께 기대할 수 있습니다.`;
    } else {
        return `${treatment.category} 효과로 전반적인 피부 개선에 도움됩니다.`;
    }
}

function displayError(error) {
    document.getElementById('consultLoading').classList.add('hidden');
    document.getElementById('consultResult').classList.remove('hidden');
    
    const errorMessage = error.message || '알 수 없는 오류';
    const errorDetails = error.details || '';
    const errorStatus = error.status || '';
    const errorHint = errorDetails?.hint || '';
    
    const html = `
        <div class="report-container">
            <div class="report-header error-header">
                <h2 class="report-title">⚠️ 오류가 발생했습니다</h2>
                <p class="report-subtitle">AI 상담 결과를 불러오는 중 문제가 발생했습니다.</p>
            </div>
            
            <div class="error-box">
                <div class="error-section">
                    <h3>🔴 오류 메시지</h3>
                    <p class="error-message">${errorMessage}</p>
                </div>
                
                ${errorHint ? `
                <div class="error-section hint-section">
                    <h3>💡 원인 분석</h3>
                    <p class="error-hint">${errorHint}</p>
                </div>
                ` : ''}
                
                ${errorStatus ? `
                <div class="error-section">
                    <h3>📊 상태 코드</h3>
                    <p>${errorStatus}</p>
                </div>
                ` : ''}
                
                ${errorDetails ? `
                <div class="error-section">
                    <h3>📋 상세 정보</h3>
                    <pre class="error-details">${typeof errorDetails === 'object' ? JSON.stringify(errorDetails, null, 2) : errorDetails}</pre>
                </div>
                ` : ''}
                
                <div class="error-section">
                    <h3>🔧 해결 방법</h3>
                    <ul>
                        <li>인터넷 연결 상태를 확인해주세요.</li>
                        <li>잠시 후 다시 시도해주세요.</li>
                        <li>문제가 지속되면 관리자에게 문의해주세요.</li>
                    </ul>
                </div>
                
                <div class="error-actions">
                    <button class="retry-btn" onclick="location.reload()">🔄 새로고침</button>
                    <button class="back-btn-error" onclick="backToConsultWizard()">← 다시 상담하기</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('resultContent').innerHTML = html;
}

function backToConsultWizard() {
    document.getElementById('consultResult').classList.add('hidden');
    document.getElementById('consultWizard').classList.remove('hidden');
}

async function callClaudeAPI(userData) {
    const SUPABASE_URL = 'https://iausfassbdmpieinhaba.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhdXNmYXNzYmRtcGllaW5oYWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTg1ODQsImV4cCI6MjA4MjMzNDU4NH0.E6zhK_NvH8MMjAbGU9yJruJPytwtL8TeJm-pqWhIduc';
    
    // 시술 DB를 간략화 (이름, 카테고리, 최소가격만)
    const treatmentList = treatments.map(t => 
        `${t.name}(${t.category},${extractMinPrice(t.pricing?.range)}만원)`
    ).join(', ');
    
    const budget = userData.budget || 100;
    
    // 최적화된 간결한 프롬프트
    const prompt = `피부과 시술 추천 JSON을 생성하세요.

[고객정보]
나이:${userData.age||'-'}, 고민:${userData.concerns?.join(',')||'-'}, 예산:${budget}만원, 다운타임:${userData.downtime||'-'}, 통증민감도:${userData.pain||'-'}
${userData.concernsExtra ? '추가고민:'+userData.concernsExtra : ''}
${userData.event ? '일정:'+userData.event : ''}

[시술DB] ${treatmentList}

[규칙]
1. 예산의 80-95% 사용하는 3가지 조합 제안 (A, B, C)
2. 각 조합에 3-5개 시술 포함
3. 중요하고 효과적인 시술은 여러 조합에 중복 포함 가능
4. 시술명은 반드시 [시술DB]에 있는 이름 그대로 사용

[JSON형식]
{
"greeting":"인사(2문장)",
"analysis":"피부분석(2문장)",
"combinations":[
{"name":"조합명","price":"총XX만원","treatments":[
{"name":"시술명(DB와 동일)","reason":"추천이유(1문장)","sessions":"횟수"}
],"tip":"조합팁(1문장)"}
],
"recommendation":"종합추천(2문장)",
"tips":["팁1","팁2","팁3"]
}`;

    // Step 2: 서버 연결
    updateProgress(2, '서버에 연결하고 있어요...', 20);
    
    let response;
    try {
        response = await fetch(`${SUPABASE_URL}/functions/v1/claude-proxy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }]
            })
        });
        
        // 연결 성공 → Step 3
        updateProgress(3, 'AI가 맞춤 시술을 분석하고 있어요...', 50);
        
    } catch (fetchError) {
        const error = new Error('Failed to fetch');
        error.details = {
            type: 'NETWORK_ERROR',
            message: fetchError.message,
            hint: '네트워크 연결을 확인하거나, Supabase Edge Function이 배포되었는지 확인하세요.',
            url: `${SUPABASE_URL}/functions/v1/claude-proxy`
        };
        throw error;
    }
    
    if (!response.ok) {
        const errorBody = await response.text();
        let errorDetails;
        try {
            errorDetails = JSON.parse(errorBody);
        } catch {
            errorDetails = errorBody;
        }
        const error = new Error(`API 요청 실패: HTTP ${response.status}`);
        error.status = response.status;
        error.details = {
            httpStatus: response.status,
            statusText: response.statusText,
            body: errorDetails,
            hint: response.status === 500 ? 'Edge Function 내부 오류. Supabase 로그를 확인하세요.' :
                  response.status === 401 ? 'API 키가 올바르지 않습니다.' :
                  response.status === 429 ? 'API 요청 한도 초과. 잠시 후 다시 시도하세요.' :
                  '알 수 없는 오류입니다.'
        };
        throw error;
    }
    
    // Step 4: 결과 생성
    updateProgress(4, '결과를 생성하고 있어요...', 80);
    
    let data;
    try {
        data = await response.json();
    } catch (e) {
        const error = new Error('API 응답을 JSON으로 파싱할 수 없습니다.');
        error.details = {
            parseError: e.message,
            hint: 'Edge Function 응답이 올바른 JSON이 아닙니다.'
        };
        throw error;
    }
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
        const error = new Error('API 응답 형식이 올바르지 않습니다.');
        error.details = {
            receivedData: data,
            hint: data.error ? `Anthropic API 오류: ${data.error.message || JSON.stringify(data.error)}` : 
                  'content 필드가 없습니다. Edge Function을 확인하세요.'
        };
        throw error;
    }
    
    const content = data.content[0].text;
    
    // 프로그레스 완료
    updateProgress(4, '완료! 결과를 표시합니다...', 100);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const aiResponse = JSON.parse(jsonMatch[0]);
            // AI 응답에 DB 상세정보 병합
            return enrichResponseWithDB(aiResponse, userData);
        } catch (e) {
            const error = new Error('AI 응답의 JSON 파싱 실패');
            error.details = { 
                parseError: e.message, 
                content: content.substring(0, 1000),
                hint: 'AI 응답이 완전한 JSON이 아닙니다.'
            };
            throw error;
        }
    }
    
    const error = new Error('AI 응답에서 JSON 형식을 찾을 수 없습니다.');
    error.details = { 
        content: content.substring(0, 1000),
        hint: 'AI가 JSON 형식으로 응답하지 않았습니다.'
    };
    throw error;
}

// AI 응답에 DB 상세정보 병합
function enrichResponseWithDB(aiResponse, userData) {
    const recommendedTreatmentNames = new Set();
    
    // 추천된 시술명 수집
    aiResponse.combinations?.forEach(combo => {
        combo.treatments?.forEach(t => {
            recommendedTreatmentNames.add(t.name);
        });
    });
    
    // 시술 상세정보 DB에서 가져오기
    const treatmentDetails = [];
    recommendedTreatmentNames.forEach(name => {
        const dbTreatment = treatments.find(t => 
            t.name === name || t.name.includes(name) || name.includes(t.name)
        );
        if (dbTreatment) {
            // mechanism 처리 (객체일 수 있음)
            let mechanismText = '';
            if (typeof dbTreatment.mechanism === 'object') {
                mechanismText = dbTreatment.mechanism?.detailed || dbTreatment.mechanism?.summary || '';
            } else {
                mechanismText = dbTreatment.mechanism || '';
            }
            
            // review 객체에서 정보 추출
            const review = dbTreatment.review || {};
            
            treatmentDetails.push({
                name: dbTreatment.name,
                fullName: dbTreatment.fullName || dbTreatment.name,
                brand: dbTreatment.brand || '',
                category: dbTreatment.category || '',
                priceRange: dbTreatment.pricing?.range || '',
                priceNote: dbTreatment.pricing?.note || '병원마다 상이',
                sessions: dbTreatment.procedure?.sessions || '',
                duration: dbTreatment.procedure?.duration || '',
                anesthesia: dbTreatment.procedure?.anesthesia || '',
                
                // 설명
                description: review.summary || dbTreatment.description || '',
                mechanism: mechanismText,
                
                // 효과
                expectedEffects: dbTreatment.effects?.primary || [],
                secondaryEffects: dbTreatment.effects?.secondary || [],
                targets: dbTreatment.effects?.targets || [],
                notFor: dbTreatment.effects?.notFor || [],
                
                // 장단점 (review에서)
                pros: review.likes || dbTreatment.pros || [],
                cons: review.dislikes || dbTreatment.cons || [],
                tips: review.tips || [],
                overall: review.overall || '',
                
                // 회복
                painLevel: dbTreatment.recovery?.painLevel || 0,
                downtime: dbTreatment.recovery?.downtime || '없음',
                recoveryTips: dbTreatment.recovery?.tips || [],
                aftercare: dbTreatment.recovery?.aftercare || [],
                
                // 주의사항
                warnings: dbTreatment.warnings || [],
                contraindications: dbTreatment.contraindications || [],
                
                // 추천 대상
                idealFor: dbTreatment.idealFor || '',
                bestFor: dbTreatment.bestFor || []
            });
        }
    });
    
    // combinations 내 시술에도 DB 정보 추가
    aiResponse.combinations?.forEach(combo => {
        let totalMin = 0;
        let totalMax = 0;
        
        combo.treatments?.forEach(t => {
            const dbTreatment = treatments.find(db => 
                db.name === t.name || db.name.includes(t.name) || t.name.includes(db.name)
            );
            if (dbTreatment) {
                t.category = dbTreatment.category || '';
                t.price = dbTreatment.pricing?.range || '';
                t.downtime = dbTreatment.recovery?.downtime || '없음';
                t.painLevel = dbTreatment.recovery?.painLevel || 0;
                t.effect = dbTreatment.effects?.primary?.[0] || '';
                t.sessions = dbTreatment.procedure?.sessions || '';
                
                // 가격 합산
                const priceMatch = (dbTreatment.pricing?.range || '').match(/(\d+)/g);
                if (priceMatch) {
                    totalMin += parseInt(priceMatch[0]) || 0;
                    totalMax += parseInt(priceMatch[priceMatch.length - 1]) || parseInt(priceMatch[0]) || 0;
                }
            }
        });
        
        // 총 가격 범위 계산
        if (totalMin > 0) {
            combo.totalPrice = totalMin === totalMax ? 
                `약 ${totalMin}만원` : 
                `약 ${totalMin}~${totalMax}만원`;
            combo.budgetUsage = Math.round((totalMin / userData.budget) * 100) + '%';
        }
    });
    
    // 병합된 응답 반환
    return {
        ...aiResponse,
        treatmentDetails,
        // 가격 가이드 기본값
        priceGuide: {
            note: "가격은 병원, 지역, 프로모션에 따라 달라질 수 있습니다.",
            negotiationTip: "첫 방문 시 상담만 받고 여러 병원 비교 후 결정하세요.",
            packageTip: "3회 이상 패키지로 구매하면 10-20% 할인받을 수 있습니다."
        },
        // 주의사항 기본값
        precautions: {
            before: ["시술 2주 전부터 레티놀, 필링 제품 중단", "시술 당일 음주 금지", "아스피린 등 혈액 응고제 복용 시 의사에게 알리기"],
            after: ["시술 부위 자외선 차단 철저히", "시술 후 2-3일간 사우나, 격렬한 운동 피하기", "충분한 수분 섭취와 보습"],
            emergency: "심한 붓기, 발적, 통증 시 즉시 시술 병원에 연락하세요."
        }
    };
}

function extractMinPrice(priceRange) {
    if (!priceRange) return 0;
    const match = priceRange.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}


function getPriceRange(combinations) {
    if (!combinations || combinations.length === 0) return '-';
    
    // 각 조합별 총 가격 계산
    const comboPrices = combinations.map(combo => {
        let min = 0;
        let max = 0;
        combo.treatments?.forEach(t => {
            const priceStr = t.price || '';
            const matches = priceStr.match(/(\d+)/g);
            if (matches) {
                min += parseInt(matches[0]) || 0;
                max += parseInt(matches[matches.length - 1]) || parseInt(matches[0]) || 0;
            }
        });
        return { min, max };
    }).filter(p => p.min > 0);
    
    if (comboPrices.length === 0) return '-';
    
    // 조합들 중 최저가와 최고가
    const lowestMin = Math.min(...comboPrices.map(p => p.min));
    const highestMax = Math.max(...comboPrices.map(p => p.max));
    
    if (lowestMin === highestMax) return `약 ${lowestMin}만원`;
    return `${lowestMin}~${highestMax}만원`;
}

function getTotalTreatments(combinations) {
    if (!combinations) return 0;
    
    const allTreatments = new Set();
    combinations.forEach(c => {
        c.treatments?.forEach(t => {
            allTreatments.add(t.name);
        });
    });
    return allTreatments.size;
}

function displayResult(response) {
    document.getElementById('consultLoading').classList.add('hidden');
    document.getElementById('consultResult').classList.remove('hidden');
    
    const userData = consultState.data;
    const primaryConcerns = userData.primaryConcerns || [];
    const secondaryConcerns = userData.secondaryConcerns || [];
    const tips = response.tips || [];
    const precautions = response.precautions || {};
    
    const html = `
        <div class="report-container-v2">
            <!-- 헤더 -->
            <div class="report-header-v2">
                <span class="report-badge">ANALYSIS COMPLETE</span>
                <h1 class="report-title-v2">맞춤 시술 리포트</h1>
                <p class="report-desc">${treatments.length}개 시술 DB 분석 · ${getTotalTreatments(response.combinations)}개 시술 추천 · ${response.combinations?.length || 0}개 조합 제안</p>
            </div>
            
            <!-- 분석 요약 3열 -->
            <div class="analysis-summary">
                <div class="summary-card">
                    <h4>요청 조건</h4>
                    <div class="summary-row"><span>연령</span><strong>${userData.age || '-'}</strong></div>
                    <div class="summary-row"><span>예산</span><strong>${userData.budget ? userData.budget + '만원' : '-'}</strong></div>
                    <div class="summary-row"><span>다운타임</span><strong>${userData.downtime || '-'}</strong></div>
                    <div class="summary-row"><span>통증</span><strong>${userData.pain || '-'}</strong></div>
                </div>
                
                <div class="summary-card highlight">
                    <h4>우선순위</h4>
                    ${primaryConcerns.length > 0 ? `
                    <div class="concern-group">
                        <span class="concern-label primary">핵심</span>
                        <div class="concern-tags">${primaryConcerns.map(c => `<span class="ctag primary">${c}</span>`).join('')}</div>
                    </div>
                    ` : ''}
                    ${secondaryConcerns.length > 0 ? `
                    <div class="concern-group">
                        <span class="concern-label secondary">부가</span>
                        <div class="concern-tags">${secondaryConcerns.map(c => `<span class="ctag secondary">${c}</span>`).join('')}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="summary-card result">
                    <h4>분석 결과</h4>
                    <div class="result-big">
                        <span class="result-price">${getPriceRange(response.combinations)}</span>
                        <span class="result-label">예상 비용 범위</span>
                    </div>
                    <div class="result-meta">
                        <span>${getTotalTreatments(response.combinations)}개 시술</span>
                        <span>3개 플랜</span>
                    </div>
                </div>
            </div>
            
            <!-- AI 코멘트 -->
            <div class="ai-comment-v2">
                <div class="comment-content">
                    <p>${response.greeting || ''}</p>
                    <p class="sub">${response.analysis || ''}</p>
                </div>
            </div>
            
            <!-- 3가지 조합 -->
            <div class="section-v2">
                <div class="section-header">
                    <h3>맞춤 시술 조합</h3>
                    <span class="section-badge">3가지 플랜</span>
                </div>
                
                <div class="combo-grid-v2">
                ${response.combinations?.map((combo, i) => {
                    const txList = combo.treatments || [];
                    if (txList.length === 0) return '';
                    const labels = ['A', 'B', 'C'];
                    const themes = ['gold', 'navy', 'gray'];
                    return `
                    <div class="combo-card-v2 ${themes[i]}">
                        <div class="combo-top">
                            <span class="combo-letter">${labels[i]}</span>
                            <div class="combo-info-v2">
                                <h4>${combo.name || '플랜 ' + labels[i]}</h4>
                                <span class="combo-price-v2">${combo.totalPrice || combo.price || ''}</span>
                            </div>
                        </div>
                        ${combo.tip ? `<p class="combo-tip-v2">${combo.tip}</p>` : ''}
                        <ul class="combo-list-v2">
                            ${txList.map(t => `
                                <li>
                                    <div class="tx-info-v2">
                                        <span class="tx-name-v2">${t.name}</span>
                                        ${t.matchedConcerns?.length ? `
                                            <div class="tx-concerns">
                                                ${t.matchedConcerns.map(c => {
                                                    const isPrimary = primaryConcerns.includes(c);
                                                    return `<span class="concern-tag ${isPrimary ? 'primary' : 'secondary'}">${c}</span>`;
                                                }).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <span class="tx-price-v2">${t.price || ''}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    `;
                }).join('') || ''}
                </div>
            </div>
            
            <!-- 종합 추천 -->
            ${response.recommendation ? `
            <div class="recommendation-v2">
                <strong>종합 추천</strong>
                <p>${response.recommendation}</p>
            </div>
            ` : ''}
            
            <!-- 시술 상세 -->
            ${response.treatmentDetails?.length ? `
            <div class="section-v2">
                <div class="section-header">
                    <h3>시술 상세 정보</h3>
                    <span class="section-badge">${response.treatmentDetails.length}개</span>
                </div>
                
                <div class="detail-list-v2">
                    ${response.treatmentDetails.map((d, idx) => `
                        <div class="detail-card-v3">
                            <!-- 헤더: 번호, 이름, 카테고리, 가격 -->
                            <div class="dc-header">
                                <div class="dc-title-area">
                                    <span class="dc-number">${idx + 1}</span>
                                    <div class="dc-title-info">
                                        <h4 class="dc-name">${d.name}</h4>
                                        <span class="dc-meta">${d.category || ''}${d.brand ? ' · ' + d.brand : ''}</span>
                                    </div>
                                </div>
                                <span class="dc-price">${d.priceRange || ''}</span>
                            </div>
                            
                            <!-- 핵심 정보 바 -->
                            <div class="dc-quick-stats">
                                ${d.sessions ? `<span>횟수 <b>${d.sessions}</b></span>` : ''}
                                ${d.downtime ? `<span>회복 <b>${d.downtime}</b></span>` : ''}
                                ${d.painLevel ? `<span>통증 <b>${'●'.repeat(d.painLevel)}${'○'.repeat(5-d.painLevel)}</b></span>` : ''}
                            </div>
                            
                            <!-- 한줄 요약 -->
                            ${d.description ? `<p class="dc-summary">${d.description}</p>` : ''}
                            
                            <!-- 작용 원리 -->
                            ${d.mechanism ? `
                            <div class="dc-box mechanism">
                                <span class="dc-box-label">작용 원리</span>
                                <p>${d.mechanism}</p>
                            </div>
                            ` : ''}
                            
                            <!-- 기대 효과 태그 -->
                            ${d.expectedEffects?.length ? `
                            <div class="dc-effects">
                                ${d.expectedEffects.map(e => `<span class="dc-effect-tag">${e}</span>`).join('')}
                            </div>
                            ` : ''}
                            
                            <!-- 장단점 (2열) -->
                            ${d.pros?.length || d.cons?.length ? `
                            <div class="dc-pros-cons">
                                ${d.pros?.length ? `
                                <div class="dc-pc-col pros">
                                    <strong>장점</strong>
                                    <ul>${d.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                                </div>
                                ` : ''}
                                ${d.cons?.length ? `
                                <div class="dc-pc-col cons">
                                    <strong>단점</strong>
                                    <ul>${d.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            <!-- 시술 팁 -->
                            ${d.tips?.length ? `
                            <div class="dc-box tips">
                                <span class="dc-box-label">시술 팁</span>
                                <ul>${d.tips.map(t => `<li>${t}</li>`).join('')}</ul>
                            </div>
                            ` : ''}
                            
                            <!-- 총평 (하단 강조) -->
                            ${d.overall ? `
                            <div class="dc-overall">
                                <p>${d.overall}</p>
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- 팁 -->
            ${tips.length > 0 ? `
            <div class="section-v2">
                <div class="section-header">
                    <h3>전문가 팁</h3>
                </div>
                <div class="tips-v2">
                    ${tips.map((tip, i) => `<div class="tip-item"><span>${i + 1}</span><p>${tip}</p></div>`).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- 주의사항 -->
            ${precautions.before?.length || precautions.after?.length ? `
            <div class="section-v2">
                <div class="section-header">
                    <h3>시술 전후 주의사항</h3>
                </div>
                <div class="precaution-v2">
                    ${precautions.before?.length ? `<div class="prec-col"><strong>시술 전</strong><ul>${precautions.before.map(p => `<li>${p}</li>`).join('')}</ul></div>` : ''}
                    ${precautions.after?.length ? `<div class="prec-col"><strong>시술 후</strong><ul>${precautions.after.map(p => `<li>${p}</li>`).join('')}</ul></div>` : ''}
                </div>
            </div>
            ` : ''}
            
            <!-- 액션 -->
            <div class="report-actions-v2">
                <button class="btn-secondary" onclick="resetConsultation()">다시 상담받기</button>
                <button class="btn-primary" onclick="window.print()">리포트 저장</button>
            </div>
            
            <!-- 푸터 -->
            <div class="report-footer-v2">
                <p>본 리포트는 DB 기반 알고리즘 분석 결과이며, 실제 시술은 전문의 상담 후 결정하세요.</p>
            </div>
        </div>
    `;
    
    document.getElementById('consultResult').innerHTML = html;
}
function resetConsultation() {
    consultState = {
        currentStep: 1,
        totalSteps: 7,
        data: {
            age: null,
            experience: null,
            skinType: null,
            primaryConcerns: [],
            secondaryConcerns: [],
            concerns: [],
            areas: [],
            budget: null,
            downtime: null,
            pain: null,
            treatmentType: ['상관없음'],  // 기본값
            duration: null,
            priority: null,
            frequency: null,
            pastTreatments: []
        }
    };
    
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.concern-chip').forEach(chip => chip.classList.remove('in-primary', 'in-secondary'));
    
    // "상관없음" 버튼 다시 선택 상태로
    const defaultTypeBtn = document.querySelector('.option-grid[data-field="treatmentType"] .option-btn[data-value="상관없음"]');
    if (defaultTypeBtn) defaultTypeBtn.classList.add('selected');
    
    // 드롭존 초기화
    ['primaryConcerns', 'secondaryConcerns'].forEach(id => {
        const zone = document.getElementById(id);
        if (zone) {
            zone.querySelectorAll('.concern-chip').forEach(c => c.remove());
            const placeholder = zone.querySelector('.dropzone-placeholder');
            if (placeholder) placeholder.style.display = 'block';
        }
    });
    
    goToStep(1);
    
    document.getElementById('consultResult').classList.add('hidden');
    document.getElementById('consultLoading').classList.add('hidden');
    document.getElementById('consultWizard').classList.remove('hidden');
}
