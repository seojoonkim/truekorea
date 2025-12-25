// ===== App State =====
let currentView = 'concern';
let currentCategory = 'all';
let currentConcern = null;
let currentBudget = 'all';
let treatments = [];
let tableSort = { column: 'name', direction: 'asc' };
let selectedTableCategories = [];

// ===== Concern Map =====
const concernMap = {
    '처진피부': ['리프팅', '타이트닝', 'HIFU', 'RF', '실리프팅'],
    '주름': ['주름', '보톡스', '필러', '리프팅'],
    '탄력': ['탄력', 'RF', '콜라겐', '스킨부스터', '리프팅'],
    '모공': ['모공', 'MRF', '피지', '필링', '레이저'],
    '기미': ['기미', '색소', '미백', '토닝', '피코'],
    '여드름': ['여드름', '트러블', '피지', 'PDT'],
    '볼륨': ['볼륨', '필러', '스컬트라', '엘란쎄'],
    '흉터': ['흉터', '프랙셔널', '재생', 'MRF'],
    '제모': ['제모'],
    '바디': ['바디', '지방', '셀룰라이트', '엠스컬프']
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
            const searchText = `${t.category} ${t.subcategory} ${t.tags.join(' ')} ${t.effects.primary.join(' ')} ${t.mechanism.keywords.join(' ')}`.toLowerCase();
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
            
            // Update tab active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update view panel
            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`view-${view}`).classList.add('active');
            
            currentView = view;
        });
    });
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
            t.mechanism.simple.includes(query) ||
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
        const searchText = `${t.category} ${t.subcategory} ${t.tags.join(' ')} ${t.effects.primary.join(' ')} ${t.mechanism.keywords.join(' ')}`.toLowerCase();
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
    const painRange = document.getElementById('painRange');
    const checkboxList = document.getElementById('categoryCheckboxList');
    const downtimeChecks = document.querySelectorAll('input[name="downtime"]');
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
    
    painRange.addEventListener('input', () => {
        document.getElementById('painValue').textContent = painRange.value;
        applyFilters();
    });
    
    checkboxList.addEventListener('change', applyFilters);
    downtimeChecks.forEach(cb => cb.addEventListener('change', applyFilters));
    
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
        painRange.value = 5;
        document.getElementById('budgetDisplay').textContent = '전체';
        document.getElementById('painValue').textContent = '5';
        downtimeChecks.forEach(cb => cb.checked = true);
        document.querySelectorAll('input[name="filterCategory"]').forEach(cb => cb.checked = true);
        applyFilters();
    });
    
    applyFilters();
}

function applyFilters() {
    const budgetMin = parseInt(document.getElementById('budgetMin').value);
    const budgetMax = parseInt(document.getElementById('budgetMax').value);
    const pain = parseFloat(document.getElementById('painRange').value);
    const selectedCategories = [...document.querySelectorAll('input[name="filterCategory"]:checked')].map(cb => cb.value);
    const downtimeChecks = [...document.querySelectorAll('input[name="downtime"]:checked')].map(cb => cb.value);
    
    let filtered = treatments.filter(t => {
        // Budget (min ~ max)
        const price = extractPrice(t.pricing.average);
        if (price < budgetMin) return false;
        if (budgetMax < 200 && price > budgetMax) return false;
        
        // Pain
        if (t.recovery.painLevel > pain) return false;
        
        // Category
        if (!selectedCategories.includes(t.category)) return false;
        
        // Downtime
        const downtime = t.recovery.downtime.toLowerCase();
        let downtimeMatch = false;
        if (downtimeChecks.includes('없음') && (downtime.includes('없음') || downtime === '')) downtimeMatch = true;
        if (downtimeChecks.includes('1~3일') && (downtime.includes('1') || downtime.includes('2') || downtime.includes('3'))) downtimeMatch = true;
        if (downtimeChecks.includes('1주일') && (downtime.includes('7') || downtime.includes('주') || downtime.includes('14'))) downtimeMatch = true;
        if (downtimeChecks.length === 3) downtimeMatch = true;
        if (downtimeChecks.length === 0) downtimeMatch = false;
        if (!downtimeMatch) return false;
        
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
    const tablePainRange = document.getElementById('tablePainRange');
    const tableDowntimeChecks = document.querySelectorAll('input[name="tableDowntime"]');
    
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
    
    // Pain range
    tablePainRange.addEventListener('input', () => {
        document.getElementById('tablePainValue').textContent = tablePainRange.value;
        renderTableView();
    });
    
    // Downtime checkboxes
    tableDowntimeChecks.forEach(cb => cb.addEventListener('change', renderTableView));
    
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
        tablePainRange.value = 5;
        document.getElementById('tableBudgetDisplay').textContent = '전체';
        document.getElementById('tablePainValue').textContent = '5';
        tableDowntimeChecks.forEach(cb => cb.checked = true);
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
    const pain = parseFloat(document.getElementById('tablePainRange').value);
    const downtimeChecks = [...document.querySelectorAll('input[name="tableDowntime"]:checked')].map(cb => cb.value);
    
    let filtered = treatments.filter(t => {
        // Category
        if (!selectedTableCategories.includes(t.category)) return false;
        
        // Budget
        const price = extractPrice(t.pricing.average);
        if (price < budgetMin) return false;
        if (budgetMax < 200 && price > budgetMax) return false;
        
        // Pain
        if (t.recovery.painLevel > pain) return false;
        
        // Downtime
        const downtime = t.recovery.downtime.toLowerCase();
        let downtimeMatch = false;
        if (downtimeChecks.includes('없음') && (downtime.includes('없음') || downtime === '')) downtimeMatch = true;
        if (downtimeChecks.includes('1~3일') && (downtime.includes('1') || downtime.includes('2') || downtime.includes('3'))) downtimeMatch = true;
        if (downtimeChecks.includes('1주일') && (downtime.includes('7') || downtime.includes('주') || downtime.includes('14'))) downtimeMatch = true;
        if (downtimeChecks.length === 3) downtimeMatch = true;
        if (downtimeChecks.length === 0) downtimeMatch = false;
        if (!downtimeMatch) return false;
        
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
            <div class="card-desc">${t.mechanism.simple}</div>
            <div class="card-tags">
                ${t.effects.primary.slice(0, 3).map(e => `<span class="card-tag">${e}</span>`).join('')}
            </div>
            <div class="card-stats">
                <div class="stat-item">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">${t.pricing.average}</div>
                    <div class="stat-label">가격</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">⏱</div>
                    <div class="stat-value">${t.effects.duration || '-'}</div>
                    <div class="stat-label">지속</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">😣</div>
                    <div class="stat-value">${t.recovery.painLevel}/5</div>
                    <div class="stat-label">통증</div>
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
    
    closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.classList.add('hidden');
    });
}

function showModal(t) {
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${t.name}</h2>
            <p class="modal-subtitle">${t.nameEn} · ${t.brand}</p>
            <span class="modal-badge">${t.category} / ${t.subcategory}</span>
        </div>
        
        <div class="modal-section">
            <h3 class="modal-section-title">원리</h3>
            <div class="modal-mechanism">
                ${t.mechanism.detailed || t.mechanism.simple}
            </div>
        </div>
        
        <div class="modal-section">
            <h3 class="modal-section-title">효과</h3>
            <div class="modal-effects">
                ${t.effects.primary.map(e => `<span class="modal-effect-tag">${e}</span>`).join('')}
                ${t.effects.secondary.map(e => `<span class="modal-effect-tag" style="background: var(--bg-tertiary); color: var(--text-secondary);">${e}</span>`).join('')}
            </div>
        </div>
        
        <div class="modal-section">
            <h3 class="modal-section-title">시술 정보</h3>
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
                <div class="modal-stat">
                    <div class="modal-stat-label">다운타임</div>
                    <div class="modal-stat-value">${t.recovery.downtime || '없음'}</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-label">효과 지속</div>
                    <div class="modal-stat-value">${t.effects.duration}</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-label">통증</div>
                    <div class="modal-stat-value">${t.recovery.painLevel}/5 (${t.recovery.painDescription})</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-label">가격</div>
                    <div class="modal-stat-value">${t.pricing.range}</div>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h3 class="modal-section-title">적합한 대상</h3>
            <div class="modal-mechanism">
                <strong>연령대:</strong> ${t.suitability.idealAge}<br>
                <strong>추천:</strong> ${t.suitability.bestFor.join(', ')}<br>
                ${t.suitability.notRecommended.length ? `<strong>비추천:</strong> ${t.suitability.notRecommended.join(', ')}` : ''}
            </div>
        </div>
        
        ${t.pros.length || t.cons.length ? `
        <div class="modal-section">
            <h3 class="modal-section-title">장단점</h3>
            <div class="modal-pros-cons">
                <div class="modal-pros">
                    <h4>👍 장점</h4>
                    <ul class="modal-list">
                        ${t.pros.map(p => `<li>• ${p}</li>`).join('')}
                    </ul>
                </div>
                <div class="modal-cons">
                    <h4>👎 단점</h4>
                    <ul class="modal-list">
                        ${t.cons.map(c => `<li>• ${c}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
        ` : ''}
        
        ${Object.keys(t.comparison.vs).length || t.comparison.bestWith.length ? `
        <div class="modal-section">
            <h3 class="modal-section-title">비교 & 조합</h3>
            <div class="modal-comparison">
                ${Object.entries(t.comparison.vs).map(([k, v]) => `<p><strong>vs ${k}:</strong> ${v}</p>`).join('')}
                ${t.comparison.bestWith.length ? `<p><strong>🤝 함께 하면 좋은 시술:</strong> ${t.comparison.bestWith.join(', ')}</p>` : ''}
            </div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('modalOverlay').classList.remove('hidden');
}

// ===== Utilities =====
function extractPrice(priceStr) {
    if (!priceStr) return 0;
    const match = priceStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}
