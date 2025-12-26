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
    document.getElementById('dbCount').textContent = `${treatments.length}개 시술`;
    
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
    document.getElementById('filterSelectAll').addEventListener('click', () => {
        document.querySelectorAll('input[name="filterCategory"]').forEach(cb => cb.checked = true);
        applyFilters();
    });
    
    document.getElementById('filterDeselectAll').addEventListener('click', () => {
        document.querySelectorAll('input[name="filterCategory"]').forEach(cb => cb.checked = false);
        applyFilters();
    });
    
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
    document.getElementById('tableSelectAll').addEventListener('click', () => {
        document.querySelectorAll('input[name="tableCategory"]').forEach(cb => cb.checked = true);
        selectedTableCategories = [...categories];
        renderTableView();
    });
    
    document.getElementById('tableDeselectAll').addEventListener('click', () => {
        document.querySelectorAll('input[name="tableCategory"]').forEach(cb => cb.checked = false);
        selectedTableCategories = [];
        renderTableView();
    });
    
    // Reset button
    document.getElementById('resetTableFilters').addEventListener('click', () => {
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
    totalSteps: 6,
    data: {
        age: null,
        experience: null,
        skinType: null,
        concerns: [],
        concernsExtra: '',
        areas: [],
        budget: null,
        downtime: null,
        pain: null,
        anesthesia: null,
        event: '',
        extra: ''
    }
};

function setupConsultation() {
    // Option buttons (single select)
    document.querySelectorAll('.option-btn[data-field]').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            const value = btn.dataset.value;
            
            btn.closest('.option-grid').querySelectorAll('.option-btn').forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
            consultState.data[field] = value;
        });
    });
    
    // Multi-select option buttons
    document.querySelectorAll('.option-grid.multi-select').forEach(grid => {
        const field = grid.dataset.field;
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
            document.getElementById('budgetInput').value = btn.dataset.amount;
            consultState.data.budget = parseInt(btn.dataset.amount);
        });
    });
    
    // Budget input
    document.getElementById('budgetInput')?.addEventListener('input', (e) => {
        consultState.data.budget = parseInt(e.target.value) || null;
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
    });
    
    // Navigation
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (consultState.currentStep > 1) {
            goToStep(consultState.currentStep - 1);
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (consultState.currentStep < consultState.totalSteps) {
            goToStep(consultState.currentStep + 1);
        }
    });
    
    document.getElementById('submitBtn').addEventListener('click', submitConsultation);
    document.getElementById('backToConsult').addEventListener('click', resetConsultation);
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
    if (consultState.currentStep === 2) {
        consultState.data.concernsExtra = document.getElementById('concernsExtra')?.value || '';
    }
    if (consultState.currentStep === 4) {
        consultState.data.budget = parseInt(document.getElementById('budgetInput')?.value) || null;
    }
    if (consultState.currentStep === 6) {
        consultState.data.event = document.getElementById('eventInput')?.value || '';
        consultState.data.extra = document.getElementById('extraInput')?.value || '';
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
            if (!consultState.data.concerns || consultState.data.concerns.length === 0) {
                message = '고민을 최소 1개 이상 선택해주세요.';
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
    consultState.data.event = document.getElementById('eventInput')?.value || '';
    consultState.data.extra = document.getElementById('extraInput')?.value || '';
    consultState.data.budget = parseInt(document.getElementById('budgetInput')?.value) || null;
    
    document.getElementById('consultWizard').classList.add('hidden');
    document.getElementById('consultLoading').classList.remove('hidden');
    
    // 프로그레스 초기화 및 시작
    updateProgress(1, '요청을 준비하고 있어요...', 5);
    startProgressTimer();
    
    try {
        const response = await callClaudeAPI(consultState.data);
        stopProgressTimer();
        displayResult(response);
    } catch (error) {
        stopProgressTimer();
        console.error('API Error:', error);
        displayError(error);
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
    const analysis = response.analysis || '';
    const tips = response.tips || [];
    const priceGuide = response.priceGuide || {};
    const precautions = response.precautions || {};
    
    const html = `
        <div class="report-container">
            <div class="report-header">
                <h2 class="report-title">맞춤 시술 상담 리포트</h2>
                <p class="report-subtitle">AI 상담사가 분석한 고객님만을 위한 추천</p>
            </div>
            
            <div class="report-summary-box">
                <div class="report-summary-title">📊 상담 요약</div>
                <div class="report-summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">연령대</div>
                        <div class="summary-value">${userData.age || '-'}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">주요 고민</div>
                        <div class="summary-value">${userData.concerns?.slice(0,2).join(', ') || '-'}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">설정 예산</div>
                        <div class="summary-value">${userData.budget ? userData.budget + '만원' : '-'}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">총 제안 금액</div>
                        <div class="summary-value highlight">${getPriceRange(response.combinations)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">다운타임</div>
                        <div class="summary-value">${userData.downtime || '-'}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">추천 시술</div>
                        <div class="summary-value">${getTotalTreatments(response.combinations)}종</div>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h3 class="report-section-title">💬 상담사 인사</h3>
                <div class="report-greeting">
                    <p>${response.greeting || ''}</p>
                </div>
            </div>
            
            ${analysis ? `
            <div class="report-section">
                <h3 class="report-section-title">🔍 피부 분석</h3>
                <div class="analysis-box">
                    <p>${typeof analysis === 'string' ? analysis : analysis.summary || ''}</p>
                </div>
            </div>
            ` : ''}
            
            <div class="report-section">
                <h3 class="report-section-title">
                    🎯 맞춤 시술 조합 
                    <span class="badge">${response.combinations?.length || 0}가지 제안</span>
                </h3>
                
                <div class="combo-list">
                ${response.combinations?.map((combo, i) => {
                    // 시술 목록이 없으면 빈 배열
                    const treatments = combo.treatments || [];
                    if (treatments.length === 0) return '';
                    
                    const labels = ['A', 'B', 'C', 'D', 'E'];
                    const label = labels[i] || (i + 1);
                    const colorClass = ['combo-a', 'combo-b', 'combo-c'][i] || '';
                    
                    return `
                    <div class="combo-card ${colorClass}">
                        <div class="combo-header">
                            <div class="combo-left">
                                <span class="combo-label">${label}</span>
                                <div class="combo-title-wrap">
                                    <h4 class="combo-name">${combo.name || '조합 ' + label}</h4>
                                    ${combo.tip ? `<p class="combo-desc">${combo.tip}</p>` : ''}
                                </div>
                            </div>
                            <div class="combo-right">
                                <div class="combo-price">${combo.totalPrice || combo.price || ''}</div>
                                ${combo.budgetUsage ? `<div class="combo-budget">예산의 ${combo.budgetUsage}</div>` : ''}
                            </div>
                        </div>
                        
                        <div class="combo-treatments">
                            ${treatments.map((t, ti) => `
                                <div class="combo-treatment-item">
                                    <div class="cti-num">${ti + 1}</div>
                                    <div class="cti-content">
                                        <div class="cti-main">
                                            <span class="cti-name">${t.name || ''}</span>
                                            ${t.category ? `<span class="cti-category">${t.category}</span>` : ''}
                                        </div>
                                        ${t.reason ? `<p class="cti-reason">${t.reason}</p>` : ''}
                                        <div class="cti-meta">
                                            <span class="cti-price">${t.price || ''}</span>
                                            ${t.sessions ? `<span class="cti-sessions">${t.sessions}</span>` : ''}
                                            ${t.painLevel ? `<span class="cti-pain">통증 ${'●'.repeat(Math.min(t.painLevel, 5))}${'○'.repeat(Math.max(5-t.painLevel, 0))}</span>` : ''}
                                            ${t.downtime ? `<span class="cti-down">회복 ${t.downtime}</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    `;
                }).join('') || '<p class="no-data">추천 조합을 불러올 수 없습니다.</p>'}
                </div>
            </div>
            
            ${response.recommendation ? `
            <div class="report-section">
                <h3 class="report-section-title">🎯 종합 추천</h3>
                <div class="recommendation-box overall">
                    <p>${response.recommendation}</p>
                </div>
            </div>
            ` : ''}
            
            ${response.treatmentDetails?.length ? `
            <div class="report-section">
                <h3 class="report-section-title">📖 추천 시술 상세 가이드 <span class="badge">${response.treatmentDetails.length}개 시술</span></h3>
                <p class="section-desc">조합 A, B, C에 포함된 모든 시술에 대한 상세 정보입니다.</p>
                <div class="treatment-details-list">
                    ${response.treatmentDetails.map((detail, idx) => `
                        <div class="detail-card-simple">
                            <div class="detail-header-simple">
                                <div class="detail-header-left">
                                    <span class="detail-num">${idx + 1}</span>
                                    <div class="detail-title-info">
                                        <h4>${detail.name}</h4>
                                        <div class="detail-tags">
                                            ${detail.category ? `<span class="detail-tag">${detail.category}</span>` : ''}
                                            ${detail.brand ? `<span class="detail-tag brand">${detail.brand}</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                                ${detail.priceRange ? `<span class="detail-price-badge">${detail.priceRange}</span>` : ''}
                            </div>
                            
                            <div class="detail-stats-row">
                                ${detail.sessions ? `<div class="stat-item"><span class="stat-label">횟수</span><span class="stat-value">${detail.sessions}</span></div>` : ''}
                                ${detail.downtime ? `<div class="stat-item"><span class="stat-label">회복</span><span class="stat-value">${detail.downtime}</span></div>` : ''}
                                ${detail.painLevel ? `<div class="stat-item"><span class="stat-label">통증</span><span class="stat-value">${'●'.repeat(detail.painLevel)}${'○'.repeat(5-detail.painLevel)}</span></div>` : ''}
                                ${detail.anesthesia ? `<div class="stat-item"><span class="stat-label">마취</span><span class="stat-value">${detail.anesthesia}</span></div>` : ''}
                            </div>
                            
                            ${detail.description ? `
                            <div class="detail-desc-box">
                                <p>${detail.description}</p>
                            </div>
                            ` : ''}
                            
                            ${detail.mechanism ? `
                            <div class="detail-mechanism-box">
                                <span class="box-label">작용 원리</span>
                                <p>${detail.mechanism}</p>
                            </div>
                            ` : ''}
                            
                            ${detail.expectedEffects?.length ? `
                            <div class="detail-effects-row">
                                <span class="effects-label">주요 효과</span>
                                <div class="effect-tags-simple">
                                    ${detail.expectedEffects.map(e => `<span class="effect-tag-simple">${e}</span>`).join('')}
                                </div>
                            </div>
                            ` : ''}
                            
                            ${detail.pros?.length || detail.cons?.length ? `
                            <div class="detail-pros-cons-simple">
                                ${detail.pros?.length ? `
                                <div class="pros-box">
                                    <span class="box-title">👍 장점</span>
                                    <ul>${detail.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                                </div>
                                ` : ''}
                                ${detail.cons?.length ? `
                                <div class="cons-box">
                                    <span class="box-title">👎 단점</span>
                                    <ul>${detail.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${detail.tips?.length ? `
                            <div class="detail-tips-box">
                                <span class="box-title">💡 시술 팁</span>
                                <ul>${detail.tips.map(t => `<li>${t}</li>`).join('')}</ul>
                            </div>
                            ` : ''}
                            
                            ${detail.overall ? `
                            <div class="detail-overall-box">
                                <p>${detail.overall}</p>
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${priceGuide.note || priceGuide.negotiationTip ? `
            <div class="report-section">
                <h3 class="report-section-title">💰 가격 가이드</h3>
                <div class="price-guide-box">
                    ${priceGuide.note ? `<p>${priceGuide.note}</p>` : ''}
                    ${priceGuide.negotiationTip ? `<p>💡 <strong>협상 팁:</strong> ${priceGuide.negotiationTip}</p>` : ''}
                    ${priceGuide.packageTip ? `<p>🎁 <strong>패키지 팁:</strong> ${priceGuide.packageTip}</p>` : ''}
                </div>
            </div>
            ` : ''}
            
            ${precautions.before?.length || precautions.after?.length ? `
            <div class="report-section">
                <h3 class="report-section-title">📋 시술 전후 주의사항</h3>
                <div class="precautions-grid">
                    ${precautions.before?.length ? `
                    <div class="precaution-box before">
                        <h4>시술 전</h4>
                        <ul>
                            ${precautions.before.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    ${precautions.after?.length ? `
                    <div class="precaution-box after">
                        <h4>시술 후</h4>
                        <ul>
                            ${precautions.after.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                ${precautions.emergency ? `
                <div class="emergency-box">
                    <strong>🚨 응급 상황:</strong> ${precautions.emergency}
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${tips?.length ? `
            <div class="report-section">
                <h3 class="report-section-title">💡 전문가 팁</h3>
                <div class="tips-box">
                    <ul>
                        ${tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}
            
            ${response.closing ? `
            <div class="report-section closing">
                <p>${response.closing}</p>
            </div>
            ` : ''}
            
            <div class="report-actions">
                <button class="btn-retry" onclick="backToConsultWizard()">← 다시 상담받기</button>
                <button class="btn-print" onclick="window.print()">🖨️ 인쇄하기</button>
            </div>
        </div>
    `;
    
    document.getElementById('resultContent').innerHTML = html;
}

function resetConsultation() {
    consultState = {
        currentStep: 1,
        totalSteps: 6,
        data: {
            age: null,
            experience: null,
            skinType: null,
            concerns: [],
            concernsExtra: '',
            areas: [],
            budget: null,
            downtime: null,
            pain: null,
            anesthesia: null,
            event: '',
            extra: ''
        }
    };
    
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.text-input').forEach(input => input.value = '');
    
    goToStep(1);
    
    document.getElementById('consultResult').classList.add('hidden');
    document.getElementById('consultLoading').classList.add('hidden');
    document.getElementById('consultWizard').classList.remove('hidden');
}
