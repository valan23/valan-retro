// main.js - El Director de Orquesta
let allGames = [];
let wishlistGames = [];
let playedGames = []; 
let currentPlatform = "TODAS";
let currentSection = 'videojuegos';

/**
 * INICIALIZACIÓN (Esperamos a que el DOM esté listo)
 */
async function init() {
    const loadCSV = (url) => {
        return new Promise((resolve, reject) => {
            Papa.parse(url, {
                download: true, 
                header: true, 
                skipEmptyLines: true,
                transformHeader: h => h.trim(),
                complete: (results) => resolve(results.data),
                error: (err) => reject(err)
            });
        });
    };

    try {
        const [dataJuegos, dataDeseados, dataJugados] = await Promise.all([
            loadCSV(CSV_URL_JUEGOS),
            loadCSV(CSV_URL_DESEADOS),
            loadCSV(CSV_URL_JUGADOS) 
        ]);

        allGames = dataJuegos.filter(j => j["Nombre Juego"] && j["Nombre Juego"].trim() !== "");
        wishlistGames = dataDeseados.filter(j => j["Nombre Juego"] && j["Nombre Juego"].trim() !== "");
        playedGames = dataJugados.filter(j => j["Nombre Juego"] && j["Nombre Juego"].trim() !== ""); 

        // Renderizado inicial según la sección activa
        if (currentSection === 'videojuegos') {
            createFilters(allGames, 'platform-filters');
            renderGames(allGames);
        }

    } catch (error) {
        console.error("Error crítico al cargar las hojas de Google Sheets:", error);
    }
}

// Arrancamos cuando la ventana esté lista
window.onload = init;

/**
 * LÓGICA DE NAVEGACIÓN
 */
function switchSection(sectionId, btn) {
    currentSection = sectionId;
    currentPlatform = "TODAS"; 

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById('section-' + sectionId);
    if (targetSection) targetSection.classList.add('active');
    
    if(sectionId === 'videojuegos') {
        createFilters(allGames, 'platform-filters');
        renderGames(allGames); 
    } else if(sectionId === 'deseados') {
        createFilters(wishlistGames, 'platform-filters-wishlist');
        renderWishlist(wishlistGames); 
    } else if(sectionId === 'jugados') {
        createFilters(playedGames, 'platform-filters-played');
        renderPlayed(playedGames); 
    }
}

/**
 * LÓGICA DE FILTRADO (Dinamizada)
 */
function createFilters(games, containerId) {
    const counts = games.reduce((acc, game) => {
        const p = game["Plataforma"];
        if (p) acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});

    const container = document.getElementById(containerId);
    if (!container) return;
    
    const prefix = containerId === 'platform-filters' ? 'main' : 
                   containerId === 'platform-filters-wishlist' ? 'wish' : 'played';

    let html = `<div class="brand-selector" style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">`;

    html += `
        <div class="brand-icon active" onclick="showBrand('TODAS', this, '${prefix}')" 
             style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px;">
            <i class="fa-solid fa-house" style="font-size: 1.5em; min-width: 30px; text-align: center;"></i>
            <span style="font-weight: 600; font-size: 1em;">TODAS</span>
        </div>`;

    for (const [brandName, data] of Object.entries(BRANDS_CONFIG)) {
        const hasGamesInBrand = data.platforms.some(p => counts[p] > 0);
        if (hasGamesInBrand) {
            html += `
                <div class="brand-icon ${data.class}" onclick="showBrand('${brandName}', this, '${prefix}')" 
                     style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px;">
                    <img src="${data.logo}" alt="" class="brand-logo-img" 
                         style="height: 25px; width: auto; max-width: 100px; object-fit: contain;">
                    <span style="font-weight: 600; font-size: 1em;">${brandName}</span>
                </div>`;
        }
    }
    html += `</div>`; 

    for (const [brandName, data] of Object.entries(BRANDS_CONFIG)) {
        html += `<div id="group-${prefix}-${brandName}" class="platform-subgroup">`;
        data.platforms.forEach(p => {
            if (counts[p]) {
                const icon = data.icons?.[p] ? `<img src="${data.icons[p]}" class="btn-console-icon">` : '';
                html += `<button class="filter-btn ${data.class}" onclick="filterByPlatform('${p}', this)">
                            ${icon} <span>${p} (${counts[p]})</span>
                         </button>`;
            }
        });
        html += `</div>`;
    }
    container.innerHTML = html;
}

function showBrand(brand, element, prefix) {
    element.parentElement.querySelectorAll('.brand-icon').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    const container = element.closest('.filter-container');
    container.querySelectorAll('.platform-subgroup').forEach(g => g.classList.remove('show'));
    
    if (brand === 'TODAS') { 
        currentPlatform = "TODAS"; 
        applyFilters(); 
    } else {
        const targetGroup = document.getElementById(`group-${prefix}-${brand}`);
        if (targetGroup) targetGroup.classList.add('show');
        currentPlatform = BRANDS_CONFIG[brand].platforms; 
        applyFilters();
    }
}

function filterByPlatform(p, btn) {
    currentPlatform = p;
    btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const q = searchInput ? searchInput.value.toLowerCase() : "";
    
    let targetData, renderFunc;

    if (currentSection === 'videojuegos') {
        targetData = allGames;
        renderFunc = renderGames;
    } else if (currentSection === 'deseados') {
        targetData = wishlistGames;
        renderFunc = renderWishlist;
    } else if (currentSection === 'jugados') {
        targetData = playedGames;
        renderFunc = renderPlayed;
    }

    if (!targetData || !renderFunc) return;

    const filtered = targetData.filter(j => {
        let matchesP = false;
        if (currentPlatform === "TODAS") {
            matchesP = true;
        } else if (Array.isArray(currentPlatform)) {
            matchesP = currentPlatform.includes(j["Plataforma"]);
        } else {
            matchesP = (j["Plataforma"] === currentPlatform);
        }
        const matchesS = (j["Nombre Juego"] || "").toLowerCase().includes(q);
        return matchesP && matchesS;
    });

    renderFunc(filtered);
}

function filterGames() { applyFilters(); }

/**
 * HELPERS COMPARTIDOS
 */
function getFlag(region) {
    if (!region) return '<span class="fi fi-xx"></span>';
    const codes = { 
        "ESP": "es", "JAP": "jp", "USA": "us", "EU": "eu", 
        "UK": "gb", "ITA": "it", "GER": "de", "AUS": "au", "ASIA": "hk"
    };
    const r = region.toUpperCase();
    let code = "xx";
    for (let key in codes) { if (r.includes(key)) code = codes[key]; }
    return `<span class="fi fi-${code}"></span>`;
}

function getPlatformIcon(platformName) {
    if (!platformName) return '';
    for (const brand in BRANDS_CONFIG) {
        const icons = BRANDS_CONFIG[brand].icons;
        if (icons && icons[platformName]) {
            return `<img src="${icons[platformName]}" alt="${platformName}" style="height: 20px; width: auto; object-fit: contain;">`;
        }
    }
    return `<span class="platform-tag">${platformName}</span>`;
}
