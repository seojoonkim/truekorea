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

async function submitConsultation() {
    consultState.data.event = document.getElementById('eventInput')?.value || '';
    consultState.data.extra = document.getElementById('extraInput')?.value || '';
    consultState.data.budget = parseInt(document.getElementById('budgetInput')?.value) || null;
    
    document.getElementById('consultWizard').classList.add('hidden');
    document.getElementById('consultLoading').classList.remove('hidden');
    
    try {
        const response = await callClaudeAPI(consultState.data);
        displayResult(response);
    } catch (error) {
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
                    <h3>💡 해결 방법</h3>
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
    
    const treatmentSummary = treatments.map(t => ({
        name: t.name,
        brand: t.brand || '',
        category: t.category,
        effects: t.effects?.primary?.join(', ') || '',
        priceMin: extractMinPrice(t.pricing?.range),
        priceRange: t.pricing?.range || '',
        downtime: t.recovery?.downtime || '없음',
        pain: t.recovery?.painLevel || 0,
        sessions: t.procedure?.sessions || ''
    }));
    
    const budgetLevel = userData.budget >= 500 ? '고예산' : userData.budget >= 200 ? '중예산' : '일반';
    const minTreatments = userData.budget >= 500 ? 6 : userData.budget >= 200 ? 4 : 3;
    
    const systemPrompt = `당신은 10년 경력의 피부과 전문 상담사입니다. 오프라인에서 1:1로 상담하듯 따뜻하고 전문적으로 설명해주세요.

[핵심 규칙]
1. 고객의 총 예산은 ${userData.budget}만원입니다. (${budgetLevel} 고객)
2. 예산의 85~95%를 사용하는 조합을 제안하세요. 예산을 최대한 활용해주세요!
3. 각 조합에 최소 ${minTreatments}개 이상의 시술을 포함하세요.
4. 3가지 조합을 제안하되:
   - 조합1 "프리미엄 풀케어": 예산의 90-95% 활용, 고급 시술 중심, 최대한 많은 시술
   - 조합2 "스마트 밸런스": 예산의 85-90% 활용, 효과 대비 가성비 좋은 조합
   - 조합3 "전략적 집중": 예산의 75-85% 활용, 핵심 고민에 집중
5. 가격은 최소 가격 기준으로 계산하되, 실제 범위도 함께 표시하세요.
6. 우리 데이터베이스의 실제 시술 정보를 기반으로 추천해주세요.
7. 중요: 3가지 조합 모두 예산 내이므로, 하나를 고르라고 하지 말고 모두 진행을 권장하세요.

[응답 형식 - 반드시 이 JSON 형식으로]
{
    "greeting": "고객 맞춤 인사말 (3-4문장, 고민에 공감하며 따뜻하게, 예산 언급)",
    "requestAnalysis": {
        "included": [
            {
                "concern": "포함된 고민/요청사항",
                "reason": "왜 이 고민을 포함했는지 (1문장)",
                "relatedTreatments": ["관련 시술명 1", "관련 시술명 2"]
            }
        ],
        "excluded": [
            {
                "concern": "제외된 고민/요청사항 (있는 경우만)",
                "reason": "왜 우선순위에서 밀렸는지 설명 (예산, 다운타임, 시술 간 간격 등)",
                "suggestion": "나중에 추가로 고려하시면 좋을 시술이나 방법"
            }
        ],
        "priorityExplanation": "전체 우선순위를 이렇게 정한 이유 (2-3문장, 예산 활용, 시너지 효과, 고객 조건 등 종합)"
    },
    "analysis": {
        "summary": "피부 상태 종합 분석 (3-4문장)",
        "mainConcerns": ["핵심 고민 1", "핵심 고민 2", "핵심 고민 3"],
        "approach": "치료 접근 방향 설명 (2-3문장)",
        "expectedDuration": "전체 관리 예상 기간"
    },
    "combinations": [
        {
            "name": "조합 이름",
            "badge": "뱃지 (예: 가장 인기, 가성비 최고, 프리미엄)",
            "concept": "이 조합의 컨셉 (2문장)",
            "targetPerson": "이런 분께 추천 (1문장)",
            "totalPrice": "총 예상 비용 (예: 약 450만원)",
            "budgetUsage": "예산 대비 사용률 (예: 90%)",
            "expectedResult": "기대 효과 상세 (2-3문장)",
            "treatments": [
                {
                    "name": "시술명",
                    "category": "카테고리 (예: 리프팅, 스킨부스터)",
                    "reason": "선택 이유 (2문장, 구체적으로)",
                    "effect": "주요 효과",
                    "price": "가격 범위 (예: 30~50만원)",
                    "priceNote": "가격 참고사항 (예: 병원마다 상이)",
                    "sessions": "권장 횟수 및 주기",
                    "painLevel": "통증 (1-5단계)",
                    "downtime": "다운타임",
                    "duration": "효과 지속 기간"
                }
            ],
            "schedule": {
                "total": "전체 소요 기간",
                "steps": ["1단계: 시술A (1-2주차)", "2단계: 시술B (3-4주차)"],
                "interval": "시술 간 권장 간격"
            },
            "synergy": "시술 조합의 시너지 효과 설명 (2문장)",
            "maintenance": "유지 관리 방법 (2문장)"
        }
    ],
    "treatmentDetails": [
        // 중요: 위 combinations에서 추천한 모든 시술에 대해 각각 상세 정보를 작성하세요!
        // 예: 3개 조합에 총 6종류 시술이 있다면, 6개의 상세 정보를 작성해야 합니다.
        {
            "name": "시술명",
            "fullName": "정식 명칭 (영문 포함)",
            "priceRange": "가격 범위 (예: 20~50만원)",
            "priceNote": "가격 참고사항 (예: 1회 기준, 부위별 상이)",
            "sessions": "권장 횟수 및 주기 (예: 3회 권장, 2-4주 간격)",
            "description": "시술 설명 (3-4문장, 원리와 방법)",
            "expectedEffects": ["기대 효과 1", "기대 효과 2", "기대 효과 3"],
            "pros": ["장점 1", "장점 2", "장점 3"],
            "cons": ["단점 1", "단점 2", "단점 3"],
            "tips": ["시술 팁 1", "시술 팁 2", "시술 팁 3"],
            "warnings": ["주의사항 1", "주의사항 2", "주의사항 3"],
            "idealFor": "이런 분께 추천",
            "notFor": "이런 분은 피하세요",
            "recoveryGuide": "회복 과정 가이드 (2-3문장)"
        }
        // ... 추천된 모든 시술에 대해 반복
    ],
    "overallRecommendation": {
        "summary": "3가지 조합 모두 예산 내이므로 순차적으로 모두 진행하시는 것을 권장드립니다 (3-4문장)",
        "suggestedOrder": "추천 진행 순서와 이유 (2-3문장)",
        "budgetTip": "예산 활용 팁 (2문장)"
    },
    "precautions": {
        "before": ["시술 전 주의사항 5가지 (구체적으로)"],
        "after": ["시술 후 관리법 5가지 (구체적으로)"],
        "avoid": ["반드시 피해야 할 것 3가지"],
        "emergency": "이상 반응 시 대처법"
    },
    "hospitalChecklist": [
        "병원 선택 시 확인할 점 5가지 (질문 포함)"
    ],
    "priceGuide": {
        "note": "가격 관련 안내 (병원마다 다름 등)",
        "negotiationTip": "가격 협상 팁",
        "packageTip": "패키지 할인 팁"
    },
    "timeline": {
        "summary": "전체 플랜 요약 (2-3문장)",
        "milestones": ["1개월 후 예상", "3개월 후 예상", "6개월 후 예상"]
    },
    "expertTips": ["전문가 꿀팁 5가지 (실용적이고 구체적인 조언)"],
    "closing": "따뜻한 마무리와 응원 (2-3문장)"
}

[시술 데이터베이스]
${JSON.stringify(treatmentSummary, null, 2)}`;

    const userMessage = `고객 정보:
- 연령대: ${userData.age || '미입력'}
- 시술 경험: ${userData.experience || '미입력'}
- 피부 타입: ${userData.skinType || '미입력'}
- 주요 고민: ${userData.concerns?.join(', ') || '미입력'}
- 추가 고민: ${userData.concernsExtra || '없음'}
- 관심 부위: ${userData.areas?.join(', ') || '미입력'}
- 총 예산: ${userData.budget || '미입력'}만원
- 다운타임 허용: ${userData.downtime || '미입력'}
- 통증 민감도: ${userData.pain || '미입력'}
- 마취 선호: ${userData.anesthesia || '미입력'}
- 중요 일정: ${userData.event || '없음'}
- 추가 요청: ${userData.extra || '없음'}

위 정보를 바탕으로 예산 내에서 3가지 시술 조합을 추천해주세요. 최대한 자세하고 친절하게 설명해주세요.`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-proxy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
            messages: [
                { role: 'user', content: systemPrompt + '\n\n' + userMessage }
            ]
        })
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        let errorDetails;
        try {
            errorDetails = JSON.parse(errorBody);
        } catch {
            errorDetails = errorBody;
        }
        const error = new Error(`API 요청 실패: HTTP ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
    }
    
    let data;
    try {
        data = await response.json();
    } catch (e) {
        const error = new Error('API 응답을 JSON으로 파싱할 수 없습니다.');
        error.details = await response.text();
        throw error;
    }
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
        const error = new Error('API 응답 형식이 올바르지 않습니다.');
        error.details = data;
        throw error;
    }
    
    const content = data.content[0].text;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            const error = new Error('AI 응답의 JSON 파싱 실패');
            error.details = { parseError: e.message, content: content.substring(0, 500) };
            throw error;
        }
    }
    
    const error = new Error('AI 응답에서 JSON 형식을 찾을 수 없습니다.');
    error.details = { content: content.substring(0, 500) };
    throw error;
}

function extractMinPrice(priceRange) {
    if (!priceRange) return 0;
    const match = priceRange.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}


function getPriceRange(combinations) {
    if (!combinations || combinations.length === 0) return '-';
    
    let minTotal = 0;
    let maxTotal = 0;
    
    combinations.forEach(combo => {
        combo.treatments?.forEach(t => {
            const priceStr = t.price || '';
            const matches = priceStr.match(/(\d+)/g);
            if (matches) {
                minTotal += parseInt(matches[0]) || 0;
                maxTotal += parseInt(matches[matches.length - 1]) || parseInt(matches[0]) || 0;
            }
        });
    });
    
    if (minTotal === 0) return '-';
    if (minTotal === maxTotal) return `약 ${minTotal}만원`;
    return `${minTotal}~${maxTotal}만원`;
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
    
    // 새 응답 형식과 기존 형식 모두 지원
    const analysis = typeof response.analysis === 'object' ? response.analysis : { summary: response.analysis };
    const comparison = response.comparison || { recommendation: response.recommendation };
    const timeline = typeof response.timeline === 'object' ? response.timeline : { summary: response.timeline };
    const priceGuide = response.priceGuide || {};
    const tips = response.expertTips || response.tips || [];
    const checkList = response.hospitalChecklist || response.checkList || [];
    
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
            
            ${response.requestAnalysis ? `
            <div class="report-section">
                <h3 class="report-section-title">📋 요청사항 분석</h3>
                <div class="request-analysis-box">
                    ${response.requestAnalysis.included?.length ? `
                    <div class="included-section">
                        <h4 class="subsection-title included">✅ 포함된 고민</h4>
                        <div class="concern-list">
                            ${response.requestAnalysis.included.map(item => `
                                <div class="concern-item included">
                                    <div class="concern-header">
                                        <span class="concern-name">${item.concern}</span>
                                        ${item.relatedTreatments?.length ? `
                                        <span class="related-treatments">${item.relatedTreatments.join(', ')}</span>
                                        ` : ''}
                                    </div>
                                    <p class="concern-reason">${item.reason}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${response.requestAnalysis.excluded?.length ? `
                    <div class="excluded-section">
                        <h4 class="subsection-title excluded">⏸️ 이번에 제외된 고민</h4>
                        <div class="concern-list">
                            ${response.requestAnalysis.excluded.map(item => `
                                <div class="concern-item excluded">
                                    <div class="concern-header">
                                        <span class="concern-name">${item.concern}</span>
                                    </div>
                                    <p class="concern-reason">${item.reason}</p>
                                    ${item.suggestion ? `<p class="concern-suggestion">💡 ${item.suggestion}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${response.requestAnalysis.priorityExplanation ? `
                    <div class="priority-explanation">
                        <h4 class="subsection-title">🎯 우선순위 결정 이유</h4>
                        <p>${response.requestAnalysis.priorityExplanation}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div class="report-section">
                <h3 class="report-section-title">🔍 피부 분석</h3>
                <div class="analysis-box">
                    <p>${analysis.summary || ''}</p>
                    ${analysis.mainConcerns?.length ? `
                    <div class="concern-tags">
                        <strong>핵심 고민:</strong>
                        ${analysis.mainConcerns.map(c => `<span class="concern-tag">${c}</span>`).join('')}
                    </div>
                    ` : ''}
                    ${analysis.approach ? `<p class="approach"><strong>접근 방향:</strong> ${analysis.approach}</p>` : ''}
                    ${analysis.expectedDuration ? `<p class="duration">📅 예상 관리 기간: <strong>${analysis.expectedDuration}</strong></p>` : ''}
                </div>
            </div>
            
            ${timeline.summary || timeline.milestones ? `
            <div class="report-section">
                <h3 class="report-section-title">📅 전체 플랜 타임라인</h3>
                <div class="timeline-box">
                    ${timeline.summary ? `<p>${timeline.summary}</p>` : ''}
                    ${timeline.milestones?.length ? `
                    <div class="milestones">
                        ${timeline.milestones.map((m, i) => `
                            <div class="milestone">
                                <span class="milestone-dot"></span>
                                <span>${m}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div class="report-section">
                <h3 class="report-section-title">
                    🎯 맞춤 시술 조합 
                    <span class="badge">3가지 제안</span>
                </h3>
                
                <div class="combinations-grid">
                ${response.combinations?.map((combo, i) => `
                    <div class="combination-card ${i === 0 ? 'recommended' : ''}">
                        <div class="combination-header">
                            <div class="combination-title">
                                <span class="num">${i + 1}</span>
                                ${combo.name}
                                ${combo.badge ? `<span class="combo-badge">${combo.badge}</span>` : ''}
                            </div>
                            <div class="combination-price-wrap">
                                <div class="combination-price">${combo.totalPrice}</div>
                                ${combo.budgetUsage ? `<div class="budget-usage">예산의 ${combo.budgetUsage}</div>` : ''}
                            </div>
                        </div>
                        <div class="combination-desc">
                            <p>${combo.concept || ''}</p>
                            ${combo.targetPerson ? `<p class="target-person">👤 ${combo.targetPerson}</p>` : ''}
                            ${combo.expectedResult ? `<div class="expected-result">✨ <strong>기대효과:</strong> ${combo.expectedResult}</div>` : ''}
                        </div>
                        <div class="combination-treatments">
                            ${combo.treatments?.map(t => `
                                <div class="treatment-item">
                                    <div class="treatment-info">
                                        <div class="treatment-header">
                                            <span class="treatment-name">${t.name}</span>
                                            ${t.category ? `<span class="treatment-category">${t.category}</span>` : ''}
                                        </div>
                                        <div class="treatment-detail">${t.reason || ''}</div>
                                        ${t.effect ? `<div class="treatment-effect">→ ${t.effect}</div>` : ''}
                                        <div class="treatment-meta">
                                            ${t.painLevel ? `<span>통증: ${t.painLevel}</span>` : ''}
                                            ${t.downtime ? `<span>회복: ${t.downtime}</span>` : ''}
                                            ${t.duration ? `<span>지속: ${t.duration}</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="treatment-price-info">
                                        <div class="treatment-price">${t.price || ''}</div>
                                        <div class="treatment-sessions">${t.sessions || ''}</div>
                                        ${t.priceNote ? `<div class="price-note">${t.priceNote}</div>` : ''}
                                    </div>
                                </div>
                            `).join('') || ''}
                        </div>
                        ${combo.schedule ? `
                            <div class="schedule-guide">
                                <div class="guide-title">📅 시술 스케줄</div>
                                <div class="guide-content">
                                    ${combo.schedule.total ? `<p><strong>총 기간:</strong> ${combo.schedule.total}</p>` : ''}
                                    ${combo.schedule.steps?.length ? `
                                    <ul class="schedule-steps">
                                        ${combo.schedule.steps.map(s => `<li>${s}</li>`).join('')}
                                    </ul>
                                    ` : ''}
                                    ${combo.schedule.interval ? `<p class="interval">⏱️ ${combo.schedule.interval}</p>` : ''}
                                </div>
                            </div>
                        ` : (combo.order ? `
                            <div class="order-guide">
                                <div class="guide-title">📅 순서</div>
                                <div class="guide-content">${combo.order}</div>
                            </div>
                        ` : '')}
                        ${combo.synergy ? `
                            <div class="synergy-box">
                                <div class="guide-title">🔗 시너지 효과</div>
                                <div class="guide-content">${combo.synergy}</div>
                            </div>
                        ` : ''}
                        ${combo.maintenance || combo.maintenancePlan ? `
                            <div class="maintenance-guide">
                                <div class="guide-title">🔄 유지 관리</div>
                                <div class="guide-content">${combo.maintenance || combo.maintenancePlan}</div>
                            </div>
                        ` : ''}
                    </div>
                `).join('') || ''}
                </div>
            </div>
            
            ${response.overallRecommendation ? `
            <div class="report-section">
                <h3 class="report-section-title">🎯 종합 추천</h3>
                <div class="recommendation-box overall">
                    <p>${response.overallRecommendation.summary || ''}</p>
                    ${response.overallRecommendation.suggestedOrder ? `<p class="suggested-order">📋 <strong>추천 진행 순서:</strong> ${response.overallRecommendation.suggestedOrder}</p>` : ''}
                    ${response.overallRecommendation.budgetTip ? `<p class="budget-tip">💡 ${response.overallRecommendation.budgetTip}</p>` : ''}
                </div>
            </div>
            ` : (comparison.recommendation ? `
            <div class="report-section">
                <h3 class="report-section-title">🎯 종합 추천</h3>
                <div class="recommendation-box">
                    <p>${comparison.recommendation}</p>
                    ${comparison.budgetTip ? `<p class="budget-tip">💡 ${comparison.budgetTip}</p>` : ''}
                </div>
            </div>
            ` : '')}
            
            ${response.treatmentDetails?.length ? `
            <div class="report-section">
                <h3 class="report-section-title">📖 추천 시술 상세 가이드</h3>
                <p class="section-desc">추천된 모든 시술에 대한 상세 정보입니다. 병원 상담 전 미리 알아두시면 도움이 됩니다.</p>
                <div class="treatment-details-grid">
                    ${response.treatmentDetails.map((detail, idx) => `
                        <div class="treatment-detail-card">
                            <div class="detail-card-header">
                                <span class="detail-number">${idx + 1}</span>
                                <div class="detail-title-wrap">
                                    <h4 class="detail-name">${detail.name}</h4>
                                    ${detail.fullName && detail.fullName !== detail.name ? `<span class="detail-fullname">${detail.fullName}</span>` : ''}
                                </div>
                                ${detail.priceRange ? `<span class="detail-price">${detail.priceRange}</span>` : ''}
                            </div>
                            
                            ${detail.priceNote || detail.sessions ? `
                            <div class="detail-price-info">
                                ${detail.sessions ? `<span class="price-info-item">📅 ${detail.sessions}</span>` : ''}
                                ${detail.priceNote ? `<span class="price-info-item">💡 ${detail.priceNote}</span>` : ''}
                            </div>
                            ` : ''}
                            
                            ${detail.description ? `
                            <div class="detail-description">
                                <p>${detail.description}</p>
                            </div>
                            ` : ''}
                            
                            ${detail.idealFor ? `
                            <div class="detail-ideal">
                                <span class="ideal-label">✨ 이런 분께 추천</span>
                                <span class="ideal-text">${detail.idealFor}</span>
                            </div>
                            ` : ''}
                            
                            ${detail.expectedEffects?.length ? `
                            <div class="detail-section effects">
                                <h5>🎯 기대 효과</h5>
                                <ul>
                                    ${detail.expectedEffects.map(e => `<li>${e}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            
                            <div class="detail-pros-cons">
                                ${detail.pros?.length ? `
                                <div class="detail-section pros">
                                    <h5>👍 장점</h5>
                                    <ul>
                                        ${detail.pros.map(p => `<li>${p}</li>`).join('')}
                                    </ul>
                                </div>
                                ` : ''}
                                
                                ${detail.cons?.length ? `
                                <div class="detail-section cons">
                                    <h5>👎 단점</h5>
                                    <ul>
                                        ${detail.cons.map(c => `<li>${c}</li>`).join('')}
                                    </ul>
                                </div>
                                ` : ''}
                            </div>
                            
                            ${detail.tips?.length ? `
                            <div class="detail-section tips">
                                <h5>💡 시술 팁</h5>
                                <ul>
                                    ${detail.tips.map(t => `<li>${t}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            
                            ${detail.warnings?.length ? `
                            <div class="detail-section warnings">
                                <h5>⚠️ 주의사항</h5>
                                <ul>
                                    ${detail.warnings.map(w => `<li>${w}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            
                            ${detail.notFor ? `
                            <div class="detail-notfor">
                                <span class="notfor-label">🚫 이런 분은 피하세요</span>
                                <span class="notfor-text">${detail.notFor}</span>
                            </div>
                            ` : ''}
                            
                            ${detail.recoveryGuide ? `
                            <div class="detail-recovery">
                                <span class="recovery-label">🩹 회복 가이드</span>
                                <p>${detail.recoveryGuide}</p>
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
                    ${priceGuide.negotiationTip ? `<p>💬 <strong>협상 팁:</strong> ${priceGuide.negotiationTip}</p>` : ''}
                    ${priceGuide.packageTip ? `<p>📦 <strong>패키지 팁:</strong> ${priceGuide.packageTip}</p>` : ''}
                </div>
            </div>
            ` : ''}
            
            ${response.precautions ? `
            <div class="report-section">
                <h3 class="report-section-title">⚠️ 시술 전후 주의사항</h3>
                <div class="precautions-grid">
                    <div class="precaution-box before">
                        <h4>🔸 시술 전 주의사항</h4>
                        <ul>
                            ${response.precautions.before?.map(item => `<li>${item}</li>`).join('') || ''}
                        </ul>
                    </div>
                    <div class="precaution-box after">
                        <h4>🔹 시술 후 관리법</h4>
                        <ul>
                            ${response.precautions.after?.map(item => `<li>${item}</li>`).join('') || ''}
                        </ul>
                    </div>
                    ${response.precautions.avoid?.length ? `
                    <div class="precaution-box avoid">
                        <h4>🚫 피해야 할 것</h4>
                        <ul>
                            ${response.precautions.avoid?.map(item => `<li>${item}</li>`).join('') || ''}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                ${response.precautions.emergency ? `
                <div class="emergency-box">
                    <strong>🚨 이상 반응 시:</strong> ${response.precautions.emergency}
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${checkList?.length ? `
            <div class="report-section">
                <h3 class="report-section-title">📋 병원 방문 전 체크리스트</h3>
                <div class="checklist-box">
                    <p class="checklist-intro">상담 시 아래 내용을 꼭 확인하세요:</p>
                    <ul class="checklist">
                        ${checkList.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}
            
            ${tips?.length ? `
            <div class="report-section">
                <h3 class="report-section-title">💡 전문가 꿀팁</h3>
                <ul class="report-tips">
                    ${tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${response.closing ? `
            <div class="report-section">
                <div class="report-closing">
                    <p>${response.closing}</p>
                </div>
            </div>
            ` : ''}
            
            <div class="report-disclaimer">
                <strong>📌 안내:</strong> 본 상담 결과는 True Korea 피부과 가이드의 196개 시술 데이터베이스를 기반으로 AI가 분석한 참고 정보입니다. 
                실제 시술 전 반드시 피부과 전문의 상담을 받으시기 바랍니다. 
                표시된 가격은 최소 기준이며, 병원 및 시술 범위에 따라 달라질 수 있습니다.
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
