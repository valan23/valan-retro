// main.js - El Director de Orquesta Optimizado

// 1. Almacén central de datos (Caché)
let dataStore = {
    'videojuegos': null,
    'deseados': null,
    'jugados': null
};

let currentPlatform = "TODAS";
let currentSection = 'videojuegos';

/**
 * CARGADOR INDIVIDUAL (Carga bajo demanda)
 */
async function loadTabData(sectionId) {
    if (dataStore[sectionId]) return dataStore[sectionId];

    const urls = {
        'videojuegos': CSV_URL_JUEGOS,
        'deseados': CSV_URL_DESEADOS,
        'jugados': CSV_URL_JUGADOS
    };

    return new Promise((resolve, reject) => {
        Papa.parse(urls[sectionId], {
            download: true,
            header: true,
            worker: false, // Lo ponemos en false para máxima compatibilidad en iPhone/Vivaldi
            skipEmptyLines: true,
            complete: (results) => {
                // Filtramos y limpiamos los nombres de las columnas manualmente
                // Esto soluciona el problema de los espacios en blanco sin usar funciones pesadas
                const cleanData = results.data.map(row => {
                    const newRow = {};
                    for (let key in row) {
                        newRow[key.trim()] = row[key];
                    }
                    return newRow;
                }).filter(j => j["Nombre Juego"] && j["Nombre Juego"].trim() !== "");

                dataStore[sectionId] = cleanData;
                resolve(cleanData);
            },
            error: (err) => {
                console.error("Error en PapaParse:", err);
                reject(err);
            }
        });
    });
}

/**
 * INICIALIZACIÓN (Carga solo la pestaña activa inicialmente)
 */
async function init() {
    try {
        // Cargamos solo Videojuegos al entrar para ganar velocidad
        const games = await loadTabData('videojuegos');
        
        createFilters(games, 'platform-filters');
        renderGames(games);

        // OPCIONAL: Carga las otras pestañas en silencio después de 3 segundos
        // Esto hace que cuando el usuario haga clic en Diario, ya esté cargado
        /*
       setTimeout(() => {
           loadTabData('deseados');
           loadTabData('jugados');
       }, 3000);
       */

    } catch (error) {
        console.error("Error crítico en la carga inicial:", error);
    }
}

window.onload = init;

/**
 * LÓGICA DE NAVEGACIÓN (Actualizada para carga inteligente)
 */
async function switchSection(sectionId, btn) {
    currentSection = sectionId;
    currentPlatform = "TODAS"; 

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById('section-' + sectionId);
    if (targetSection) targetSection.classList.add('active');
    
    try {
        // Pedimos los datos (si ya están en dataStore, será instantáneo)
        const data = await loadTabData(sectionId);
        
        if(sectionId === 'videojuegos') {
            createFilters(data, 'platform-filters');
            renderGames(data); 
        } else if(sectionId === 'deseados') {
            createFilters(data, 'platform-filters-wishlist');
            renderWishlist(data); 
        } else if(sectionId === 'jugados') {
            createFilters(data, 'platform-filters-played');
            renderPlayed(data); 
        }
    } catch (error) {
        console.error(`Error al cargar la sección ${sectionId}:`, error);
    }
}

/**
 * LÓGICA DE FILTRADO (Usa el dataStore)
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
    
    // Obtenemos los datos actuales desde el Almacén Central
    const targetData = dataStore[currentSection];
    let renderFunc;

    if (currentSection === 'videojuegos') renderFunc = renderGames;
    else if (currentSection === 'deseados') renderFunc = renderWishlist;
    else if (currentSection === 'jugados') renderFunc = renderPlayed;

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
 * HELPERS
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
