// ===== App State =====
let currentView = 'concern';
let currentCategory = 'all';
let currentConcern = null;
let currentBudget = 'all';
let treatments = [];

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    treatments = DB_EXTENDED.treatments;
    
    // Update DB count
    document.getElementById('dbCount').textContent = `${treatments.length}개 시술`;
    
    // Setup views
    setupViewTabs();
    setupSearch();
    setupConcernView();
    setupFilterView();
    setupCardsView();
    setupTableView();
    setupModal();
});

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
            // Reset to current view
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
    const budgetBtns = document.querySelectorAll('.budget-btn');
    
    concernCards.forEach(card => {
        card.addEventListener('click', () => {
            const concern = card.dataset.concern;
            currentConcern = concern;
            currentBudget = 'all';
            
            // Update UI
            concernGrid.classList.add('hidden');
            concernResult.classList.remove('hidden');
            document.getElementById('concernTitle').textContent = card.querySelector('.concern-title').textContent + ' 고민 해결';
            
            // Reset budget buttons
            budgetBtns.forEach(b => b.classList.remove('active'));
            budgetBtns[0].classList.add('active');
            
            // Render treatments
            renderConcernTreatments();
        });
    });
    
    backBtn.addEventListener('click', () => {
        concernGrid.classList.remove('hidden');
        concernResult.classList.add('hidden');
        currentConcern = null;
    });
    
    budgetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            budgetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBudget = btn.dataset.budget;
            renderConcernTreatments();
        });
    });
}

function renderConcernTreatments() {
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
    
    const keywords = concernMap[currentConcern] || [];
    
    let filtered = treatments.filter(t => {
        const searchText = `${t.category} ${t.subcategory} ${t.tags.join(' ')} ${t.effects.primary.join(' ')} ${t.mechanism.keywords.join(' ')}`.toLowerCase();
        return keywords.some(k => searchText.includes(k.toLowerCase()));
    });
    
    // Budget filter
    if (currentBudget !== 'all') {
        filtered = filtered.filter(t => {
            const price = extractPrice(t.pricing.average);
            if (currentBudget === 'low') return price <= 30;
            if (currentBudget === 'mid') return price > 30 && price <= 100;
            if (currentBudget === 'high') return price > 100;
            return true;
        });
    }
    
    renderTreatmentCards(filtered, 'concernTreatments');
}

// ===== View 2: 맞춤 필터 =====
function setupFilterView() {
    const budgetRange = document.getElementById('budgetRange');
    const painRange = document.getElementById('painRange');
    const categorySelect = document.getElementById('categorySelect');
    const checkboxes = document.querySelectorAll('.checkbox-group input');
    const resetBtn = document.getElementById('resetFilters');
    
    // Populate categories
    const categories = [...new Set(treatments.map(t => t.category))];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
    
    // Event listeners
    budgetRange.addEventListener('input', () => {
        const val = budgetRange.value;
        document.getElementById('budgetValue').textContent = val >= 200 ? '0 ~ 200+' : `0 ~ ${val}만원`;
        applyFilters();
    });
    
    painRange.addEventListener('input', () => {
        document.getElementById('painValue').textContent = painRange.value;
        applyFilters();
    });
    
    categorySelect.addEventListener('change', applyFilters);
    checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));
    
    resetBtn.addEventListener('click', () => {
        budgetRange.value = 200;
        painRange.value = 5;
        categorySelect.value = 'all';
        checkboxes.forEach(cb => cb.checked = true);
        document.getElementById('budgetValue').textContent = '0 ~ 200+';
        document.getElementById('painValue').textContent = '5';
        applyFilters();
    });
    
    // Initial render
    applyFilters();
}

function applyFilters() {
    const budget = parseInt(document.getElementById('budgetRange').value);
    const pain = parseFloat(document.getElementById('painRange').value);
    const category = document.getElementById('categorySelect').value;
    const downtimeChecks = [...document.querySelectorAll('.checkbox-group input:checked')].map(cb => cb.value);
    
    let filtered = treatments.filter(t => {
        // Budget
        const price = extractPrice(t.pricing.average);
        if (budget < 200 && price > budget) return false;
        
        // Pain
        if (t.recovery.painLevel > pain) return false;
        
        // Category
        if (category !== 'all' && t.category !== category) return false;
        
        // Downtime
        const downtime = t.recovery.downtime.toLowerCase();
        let downtimeMatch = false;
        if (downtimeChecks.includes('없음') && (downtime.includes('없음') || downtime === '')) downtimeMatch = true;
        if (downtimeChecks.includes('1~3일') && (downtime.includes('1') || downtime.includes('2') || downtime.includes('3'))) downtimeMatch = true;
        if (downtimeChecks.includes('1주일') && (downtime.includes('7') || downtime.includes('주') || downtime.includes('14'))) downtimeMatch = true;
        if (downtimeChecks.length === 3) downtimeMatch = true;
        if (!downtimeMatch) return false;
        
        return true;
    });
    
    document.getElementById('filterCount').textContent = `${filtered.length}개 시술`;
    renderTreatmentCards(filtered, 'filterResults');
}

// ===== View 3: 카드 뷰 =====
function setupCardsView() {
    const tabsContainer = document.getElementById('categoryTabs');
    const categories = ['전체', ...new Set(treatments.map(t => t.category))];
    
    categories.forEach((cat, i) => {
        const btn = document.createElement('button');
        btn.className = `category-tab ${i === 0 ? 'active' : ''}`;
        btn.textContent = cat;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = cat === '전체' ? 'all' : cat;
            renderCardsView(currentCategory);
        });
        tabsContainer.appendChild(btn);
    });
    
    renderCardsView('all');
}

function renderCardsView(category) {
    const filtered = category === 'all' 
        ? treatments 
        : treatments.filter(t => t.category === category);
    
    renderTreatmentCards(filtered, 'cardsGrid');
}

// ===== View 4: 테이블 뷰 =====
function setupTableView() {
    const categorySelect = document.getElementById('tableCategorySelect');
    const sortSelect = document.getElementById('tableSortSelect');
    
    // Populate categories
    const categories = [...new Set(treatments.map(t => t.category))];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
    
    categorySelect.addEventListener('change', renderTableView);
    sortSelect.addEventListener('change', renderTableView);
    
    renderTableView();
}

function renderTableView() {
    const category = document.getElementById('tableCategorySelect').value;
    const sort = document.getElementById('tableSortSelect').value;
    
    let filtered = category === 'all' 
        ? [...treatments] 
        : treatments.filter(t => t.category === category);
    
    // Sort
    filtered.sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'price') return extractPrice(a.pricing.average) - extractPrice(b.pricing.average);
        if (sort === 'pain') return a.recovery.painLevel - b.recovery.painLevel;
        if (sort === 'duration') return a.effects.duration?.localeCompare(b.effects.duration) || 0;
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
