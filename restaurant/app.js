// ===== State =====
let map = null;
let markers = [];
let activeFilters = { cuisine: '한식', awards: ['Michelin', 'Blue Ribbon', 'Culinary Class Wars'] };

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderList();
    setupFilters();
    setupViewTabs();
    setupModal();
});

// ===== Update Stats =====
function updateStats() {
    const michelin = RESTAURANTS.filter(r => r.categories.includes('Michelin')).length;
    const blueribbon = RESTAURANTS.filter(r => r.categories.includes('Blue Ribbon')).length;
    const ccw = RESTAURANTS.filter(r => r.categories.includes('Culinary Class Wars')).length;
    
    document.getElementById('michelinCount').textContent = michelin;
    document.getElementById('blueribbonCount').textContent = blueribbon;
    document.getElementById('ccwCount').textContent = ccw;
}

// ===== Cuisine Grouping =====
function getCuisineGroup(cuisine) {
    if (!cuisine) return '기타';
    if (cuisine.includes('한식') || cuisine === '모던 한식') return '한식';
    if (cuisine.includes('프렌치') || cuisine.includes('프랑스')) return '프렌치';
    if (cuisine.includes('일식') || cuisine === '스시' || cuisine === '야키토리') return '일식';
    if (cuisine.includes('이탈리안')) return '이탈리안';
    if (cuisine.includes('중식')) return '중식';
    if (cuisine.includes('컨템포러리')) return '컨템포러리';
    return '기타';
}

// ===== Filter =====
function filterRestaurants() {
    return RESTAURANTS.filter(r => {
        // Cuisine filter (null = 전체)
        if (activeFilters.cuisine !== null) {
            if (getCuisineGroup(r.cuisine) !== activeFilters.cuisine) return false;
        }
        
        // Award filter (체크된 것 중 하나라도 있으면 OK)
        if (activeFilters.awards.length > 0) {
            const hasAward = activeFilters.awards.some(award => r.categories.includes(award));
            if (!hasAward) return false;
        } else {
            // 아무것도 체크 안되면 아무것도 안보임
            return false;
        }
        
        return true;
    });
}

// ===== Render List =====
function renderList() {
    const filtered = filterRestaurants();
    const container = document.getElementById('tableBody');
    
    document.getElementById('filteredCount').textContent = filtered.length;
    
    if (filtered.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#94a3b8;">검색 결과가 없습니다</td></tr>';
        return;
    }
    
    container.innerHTML = filtered.map((r, i) => `
        <tr onclick="openModal('${r.id}')">
            <td class="cell-rank">${i + 1}</td>
            <td>
                <div class="cell-photo">
                    ${r.photos && r.photos.length > 0 
                        ? `<img src="${r.photos[0]}" alt="${r.name}">`
                        : '📷'}
                </div>
            </td>
            <td class="cell-name">${r.name}</td>
            <td class="cell-cuisine">${r.cuisine || '-'}</td>
            <td class="cell-location">
                <div>${r.district || '서울'}</div>
            </td>
            <td>
                <div class="cell-awards">
                    ${r.tags.map(t => `<span class="tag ${t.class}">${t.label}</span>`).join('')}
                </div>
            </td>
            <td class="cell-rating">${r.rating || '-'}</td>
            <td class="cell-reviews">${r.reviews ? r.reviews.toLocaleString() : '-'}</td>
        </tr>
    `).join('');
}

// ===== Filters =====
function setupFilters() {
    // Cuisine: 토글 방식 (하나만 선택, 다시 클릭하면 해제)
    document.querySelectorAll('#cuisineFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cuisine = btn.dataset.cuisine;
            
            if (btn.classList.contains('active')) {
                // 이미 선택된 거 클릭하면 해제 (전체 보기)
                btn.classList.remove('active');
                activeFilters.cuisine = null;
            } else {
                // 다른 거 클릭하면 선택
                document.querySelectorAll('#cuisineFilters .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.cuisine = cuisine;
            }
            
            renderList();
            if (map) updateMapMarkers();
        });
    });
    
    // Award: 체크박스 방식
    document.querySelectorAll('#awardFilters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const award = checkbox.dataset.award;
            if (checkbox.checked) {
                if (!activeFilters.awards.includes(award)) {
                    activeFilters.awards.push(award);
                }
            } else {
                activeFilters.awards = activeFilters.awards.filter(a => a !== award);
            }
            renderList();
            if (map) updateMapMarkers();
        });
    });
}

// ===== View Tabs =====
function setupViewTabs() {
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.view === 'list') {
                document.getElementById('listView').style.display = 'flex';
                document.getElementById('mapView').classList.remove('active');
            } else {
                document.getElementById('listView').style.display = 'none';
                document.getElementById('mapView').classList.add('active');
                initMap();
            }
        });
    });
}

// ===== Map =====
function initMap() {
    if (map) return;
    
    map = L.map('map').setView([37.5400, 127.0000], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO'
    }).addTo(map);
    
    updateMapMarkers();
}

function updateMapMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    
    const filtered = filterRestaurants();
    
    filtered.forEach(r => {
        if (!r.lat || !r.lng) return;
        
        // 색상: 다중 카테고리면 첫 번째 기준
        let color = '#4338ca';
        if (r.categories.includes('Michelin')) color = '#f59e0b';
        else if (r.categories.includes('Blue Ribbon')) color = '#3b82f6';
        
        const marker = L.circleMarker([r.lat, r.lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.9
        }).addTo(map);
        
        marker.bindPopup(`
            <div style="min-width:160px;font-family:Pretendard,sans-serif;">
                <strong style="font-size:13px;">${r.name}</strong><br>
                <span style="font-size:11px;color:#666;">${r.cuisine}</span><br>
                ${r.rating ? `<span style="color:#f59e0b;font-size:12px;">⭐ ${r.rating}</span>` : ''}
                <br>
                <button onclick="openModal('${r.id}')" style="margin-top:6px;padding:4px 10px;background:#4338ca;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">상세</button>
            </div>
        `);
        
        markers.push(marker);
    });
}

// ===== Modal =====
function setupModal() {
    document.getElementById('modal').addEventListener('click', e => {
        if (e.target.id === 'modal') closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}

function openModal(id) {
    const r = RESTAURANTS.find(x => x.id === id);
    if (!r) return;
    
    document.getElementById('modalName').textContent = r.name;
    document.getElementById('modalTags').innerHTML = r.tags.map(t => 
        `<span class="tag ${t.class}">${t.label}</span>`
    ).join('');
    document.getElementById('modalRating').textContent = r.rating ? `⭐ ${r.rating}` : '';
    document.getElementById('modalReviews').textContent = r.reviews ? `📝 ${r.reviews.toLocaleString()} 리뷰` : '';
    document.getElementById('modalCuisine').textContent = r.cuisine;
    document.getElementById('modalAddress').textContent = r.address || '-';
    document.getElementById('modalDistrict').textContent = r.district || '서울';
    document.getElementById('modalPhone').textContent = r.phone || '-';
    document.getElementById('modalChef').textContent = r.chef || '-';
    
    // Photos
    if (r.photos && r.photos.length > 0) {
        document.getElementById('modalPhotos').innerHTML = r.photos.map(p => 
            `<img src="${p}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;margin:4px;">`
        ).join('');
    } else {
        document.getElementById('modalPhotos').innerHTML = '<span>📷 사진 데이터 수집 예정</span>';
    }
    
    // Reviews
    if (r.reviewsList && r.reviewsList.length > 0) {
        document.getElementById('modalReviews').innerHTML = r.reviewsList.slice(0, 3).map(rev => `
            <div style="background:#f8fafc;padding:10px;border-radius:8px;margin-bottom:8px;text-align:left;">
                <strong style="font-size:12px;">${rev.author}</strong>
                <span style="color:#f59e0b;font-size:11px;margin-left:8px;">⭐ ${rev.rating}</span>
                <p style="font-size:12px;color:#4b5563;margin-top:4px;">${rev.text}</p>
            </div>
        `).join('');
    } else {
        document.getElementById('modalReviews').innerHTML = '<span>💬 리뷰 데이터 수집 예정</span>';
    }
    
    const gmapsUrl = r.url || `https://www.google.com/maps/search/${encodeURIComponent(r.name + ' 서울')}`;
    document.getElementById('modalGmaps').href = gmapsUrl;
    
    const websiteBtn = document.getElementById('modalWebsite');
    if (r.website) {
        websiteBtn.href = r.website;
        websiteBtn.style.display = 'block';
    } else {
        websiteBtn.style.display = 'none';
    }
    
    document.getElementById('modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = '';
}
