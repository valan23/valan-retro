// main.js - El Director de Orquesta Optimizado

let dataStore = { 'videojuegos': null, 'deseados': null, 'jugados': null };
let currentPlatform = "TODAS";
let currentSection = 'videojuegos';
let currentFormat = "all"; // Añadido para seguimiento global del filtro de formato

async function loadTabData(sectionId) {
    if (dataStore[sectionId]) return dataStore[sectionId];
    const urls = { 'videojuegos': CSV_URL_JUEGOS, 'deseados': CSV_URL_DESEADOS, 'jugados': CSV_URL_JUGADOS };

    return new Promise((resolve, reject) => {
        Papa.parse(urls[sectionId], {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const cleanData = results.data.map(row => {
                    const newRow = {};
                    for (let key in row) { newRow[key.trim()] = row[key]; }
                    return newRow;
                }).filter(j => j["Nombre Juego"] && j["Nombre Juego"].trim() !== "");
                dataStore[sectionId] = cleanData;
                resolve(cleanData);
            },
            error: (err) => reject(err)
        });
    });
}

async function init() {
    try {
        const games = await loadTabData('videojuegos');
        createFilters(games, 'platform-filters');
        renderGames(games);
    } catch (error) { console.error("Error inicial:", error); }
}
window.onload = init;

async function switchSection(sectionId, btn) {
    currentSection = sectionId;
    currentPlatform = "TODAS"; 
    currentFormat = "all"; 

    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    document.getElementById('section-' + sectionId).classList.add('active');
    
    try {
        const data = await loadTabData(sectionId);
        
        // Renderizamos filtros y juegos
        const filterId = sectionId === 'videojuegos' ? 'platform-filters' : 
                         (sectionId === 'deseados' ? 'platform-filters-wishlist' : 'platform-filters-played');
        
        createFilters(data, filterId);
        applyFilters(); // Centralizamos el renderizado inicial aquí
        
        document.getElementById('searchInput').value = "";
    } catch (error) { console.error(error); }
}

function createFilters(games, containerId) {
    const counts = games.reduce((acc, game) => {
        const p = game["Plataforma"];
        if (p) acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});

    const container = document.getElementById(containerId);
    if (!container) return;
    
    // El prefijo nos ayuda a saber en qué sección estamos
    const prefix = containerId.includes('wishlist') ? 'wish' : (containerId.includes('played') ? 'played' : 'main');

    // Construimos la lista de marcas estilo "Navbar"
    let html = `
        <div class="brand-icon ${currentPlatform === 'TODAS' ? 'active' : ''}" onclick="showBrand('TODAS', this)">
            <i class="fa-solid fa-house" style="margin-bottom:5px; font-size:14px;"></i>
            <span>TODAS</span>
        </div>`;

    for (const [brandName, data] of Object.entries(BRANDS_CONFIG)) {
        // Solo mostramos la marca si hay juegos de sus plataformas en esta sección
        const hasGames = data.platforms.some(p => counts[p] > 0);
        
        if (hasGames) {
            const isActive = Array.isArray(currentPlatform) && currentPlatform.join() === data.platforms.join();
            html += `
                <div class="brand-icon ${isActive ? 'active' : ''}" onclick="showBrand('${brandName}', this)">
                    <img src="${data.logo}" class="brand-logo-img">
                    <span>${brandName}</span>
                </div>`;
        }
    }
    
    container.innerHTML = html;

    // Aprovechamos para renderizar los botones de formato (Físico/Digital)
    const formatContainerId = containerId.replace('platform-filters', 'format-buttons-container');
    renderFormatFilters(games, formatContainerId);
}

function showBrand(brand, element) {
    // 1. UI: Gestionar clase activa
    element.parentElement.querySelectorAll('.brand-icon').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    // 2. Lógica: Actualizar plataforma actual
    if (brand === 'TODAS') { 
        currentPlatform = "TODAS"; 
    } else {
        // Pasamos el array de plataformas de esa marca (definido en config.js)
        currentPlatform = BRANDS_CONFIG[brand].platforms; 
    }
    
    applyFilters();
}

function filterByPlatform(p, btn) {
    currentPlatform = p;
    btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

function applyFilters() {
    const q = document.getElementById('searchInput')?.value.toLowerCase() || "";
    const targetData = dataStore[currentSection];
    if (!targetData) return;

    const filtered = targetData.filter(j => {
        // 1. Filtro de Plataforma (soporta Selección Única o Array de Marca)
        let matchesP = (currentPlatform === "TODAS") || 
                       (Array.isArray(currentPlatform) ? currentPlatform.includes(j["Plataforma"]) : j["Plataforma"] === currentPlatform);
        
        // 2. Filtro de Búsqueda por Texto
        let matchesS = (j["Nombre Juego"] || "").toLowerCase().includes(q);
        
        // 3. Filtro de Formato (Físico/Digital)
        let matchesF = true;
        const formatVal = (j["Formato"] || "").toString().toUpperCase();
        if (currentFormat === 'digital') matchesF = formatVal.includes("DIGITAL");
        else if (currentFormat === 'fisico') matchesF = !formatVal.includes("DIGITAL");

        return matchesP && matchesS && matchesF;
    });

    // Renderizado según sección
    if (currentSection === 'videojuegos') {
        renderGames(filtered); // Esta función usa 'game-grid'
    } else if (currentSection === 'deseados') {
        renderWishlist(filtered); // Esta usa 'wishlist-grid'
    } else if (currentSection === 'jugados') {
        renderPlayed(filtered); // Esta usa 'played-grid'
    }
}

function filterGames() { applyFilters(); }

function renderFormatFilters(games, containerId, sectionPrefix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const counts = {
        all: games.length,
        fisico: games.filter(g => !String(g["Formato"]).toUpperCase().includes("DIGITAL")).length,
        digital: games.filter(g => String(g["Formato"]).toUpperCase().includes("DIGITAL")).length
    };

    container.innerHTML = `
        <button class="format-btn ${currentFormat === 'all' ? 'active' : ''}" data-format="all"><i class="fa-solid fa-layer-group"></i> Todos (${counts.all})</button>
        <button class="format-btn ${currentFormat === 'fisico' ? 'active' : ''}" data-format="fisico"><i class="fa-solid fa-floppy-disk"></i> Físico (${counts.fisico})</button>
        <button class="format-btn ${currentFormat === 'digital' ? 'active' : ''}" data-format="digital"><i class="fa-solid fa-cloud-download"></i> Digital (${counts.digital})</button>
    `;

    container.querySelectorAll('.format-btn').forEach(btn => {
        btn.onclick = () => {
            currentFormat = btn.dataset.format;
            container.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        };
    });
}

// Helpers universales
function getFlag(region) {
    if (!region) return '<span class="fi fi-xx"></span>';
    const codes = { "ESP": "es", "JAP": "jp", "USA": "us", "EU": "eu", "UK": "gb", "ITA": "it", "GER": "de", "AUS": "au", "ASIA": "hk" };
    const r = region.toUpperCase();
    let code = "xx";
    for (let key in codes) { if (r.includes(key)) code = codes[key]; }
    return `<span class="fi fi-${code}"></span>`;
}

function getPlatformIcon(platformName) {
    if (!platformName) return '';
    for (const brand in BRANDS_CONFIG) {
        if (BRANDS_CONFIG[brand].icons?.[platformName]) {
            return `<img src="${BRANDS_CONFIG[brand].icons[platformName]}" alt="${platformName}" style="height: 20px; width: auto;">`;
        }
    }
    return `<span class="platform-tag">${platformName}</span>`;
}

function getBrandClass(plataformaStr) {
    const p = (plataformaStr || "").toUpperCase();
    if (p.includes("PC ENGINE") || p.includes("TURBOGRAFX") || p.includes("WONDERSWAN") || p.includes("3DO")) return "otros";
    if (p.includes("NINTENDO") || p.includes("FAMICOM") || p.includes("BOY") || p.includes("CUBE") || p.includes("WII") || p.includes("SWITCH")) return "nintendo";
    if (p.includes("SEGA") || p.includes("MEGA") || p.includes("MASTER SYSTEM") || p.includes("GEAR") || p.includes("32X") || p.includes("SATURN") || p.includes("DREAMCAST")) return "sega";
    if (p.includes("PLAYSTATION") || p.includes("PS")) return "sony";
    if (p.includes("XBOX")) return "xbox";
    if (p.includes("PC") || p.includes("STEAM") || p.includes("GOG") || p.includes("EPIC") || p.includes("DOS") || p.includes("BATTLE") || p.includes("WINDOWS")) return "pc";
    return "otros";
}
