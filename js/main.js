// main.js - El Director de Orquesta Unificado

let dataStore = { 'videojuegos': null, 'deseados': null, 'jugados': null };
let currentPlatform = "TODAS";
let currentSection = 'videojuegos';
let currentFormat = "all";

// 1. Carga de datos optimizada
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

// 2. Inicialización
async function init() {
    try {
        const games = await loadTabData('videojuegos');
        // Usamos el ID global que definimos en el HTML de la Navbar
        createFilters(games, 'global-platform-filters');
        renderGames(games);
    } catch (error) { 
        console.error("Error inicial:", error); 
    }
}
window.onload = init;

// 3. Cambio de Sección (Pestañas)
async function switchSection(sectionId, btn) {
    currentSection = sectionId;
    currentPlatform = "TODAS"; 
    currentFormat = "all"; 

    // UI de las pestañas
    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Visibilidad de contenedores
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.add('active');
    
    try {
        const data = await loadTabData(sectionId);
        
        // Actualizamos las marcas en la Navbar fija
        createFilters(data, 'global-platform-filters');
        
        // Limpiamos buscador y aplicamos filtros
        if (document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = "";
        }
        applyFilters();
    } catch (error) { 
        console.error("Error al cambiar sección:", error); 
    }
}

// 4. Generación de Filtros de Marcas
function createFilters(games, containerId) {
    const counts = games.reduce((acc, game) => {
        const p = game["Plataforma"];
        if (p) acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});

    const container = document.getElementById(containerId);
    if (!container) return;

    // Botón "TODAS"
    let html = `
    <div class="brand-icon ${currentPlatform === 'TODAS' ? 'active' : ''}" onclick="showBrand('TODAS', this)">
        <i class="fa-solid fa-house" style="margin-bottom:6px; font-size:18px;"></i> 
        <span>TODAS</span>
    </div>`;

    // Botones de marcas configuradas
    for (const [brandName, data] of Object.entries(BRANDS_CONFIG)) {
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

    // Renderizar botones de formato (Físico/Digital) debajo de la sección activa
    const formatSuffix = currentSection === 'videojuegos' ? 'games' : (currentSection === 'deseados' ? 'wishlist' : 'played');
    const formatContainerId = `format-buttons-container-${formatSuffix}`;
    renderFormatFilters(games, formatContainerId);
}

// 5. Lógica de Filtrado de Marcas
function showBrand(brand, element) {
    // UI: Marcamos la marca activa
    element.parentElement.querySelectorAll('.brand-icon').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    if (brand === 'TODAS') { 
        currentPlatform = "TODAS"; 
        // Si elige TODAS, vaciamos la barra de consolas
        const consoleContainer = document.getElementById('consoleSelector');
        if (consoleContainer) consoleContainer.innerHTML = ""; 
    } else {
        currentPlatform = BRANDS_CONFIG[brand].platforms; 
        // --- AQUÍ LA MAGIA ---
        // Generamos los iconos de consolas para esta marca
        createConsoleFilters(brand);
    }
    
    applyFilters();
}

// Nueva función para llenar la barra de consolas
function createConsoleFilters(brandName) {
    const container = document.getElementById('consoleSelector');
    if (!container) return;

    const brandData = BRANDS_CONFIG[brandName];
    if (!brandData) return;

    // Obtenemos los juegos de la sección actual para saber si tenemos juegos de esa consola
    const currentGames = dataStore[currentSection] || [];
    const counts = currentGames.reduce((acc, game) => {
        const p = game["Plataforma"];
        acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});

    // Botón "TODAS las de esta marca"
    let html = `
    <div class="console-icon active" onclick="filterBySpecificConsole('ALL_BRAND', this, '${brandName}')">
        <i class="fa-solid fa-layer-group" style="margin-bottom:4px; font-size:14px;"></i> 
        <span>TODAS</span>
    </div>`;

    // Generamos botones para cada consola de la marca
    brandData.platforms.forEach(plat => {
        // Solo mostramos la consola si tenemos juegos de ella en la sección actual
        if (counts[plat] > 0) {
            const icon = brandData.icons[plat] || "";
            html += `
                <div class="console-icon" onclick="filterBySpecificConsole('${plat}', this)">
                    <img src="${icon}" class="console-logo-img" alt="${plat}">
                    <span>${plat}</span>
                </div>`;
        }
    });

    container.innerHTML = html;
}

function filterBySpecificConsole(platform, element, brandName = null) {
    // UI: Activar icono
    element.parentElement.querySelectorAll('.console-icon').forEach(i => i.classList.remove('active'));
    element.classList.add('active');

    if (platform === 'ALL_BRAND') {
        currentPlatform = BRANDS_CONFIG[brandName].platforms;
    } else {
        currentPlatform = platform; // Filtramos por una sola consola
    }

    applyFilters();
}

// 6. Aplicación de Filtros (Cerebro del filtrado)
function applyFilters() {
    const q = document.getElementById('searchInput')?.value.toLowerCase() || "";
    const targetData = dataStore[currentSection];
    if (!targetData) return;

    const filtered = targetData.filter(j => {
        // Filtro de Plataforma
        let matchesP = (currentPlatform === "TODAS") || 
                       (Array.isArray(currentPlatform) ? currentPlatform.includes(j["Plataforma"]) : j["Plataforma"] === currentPlatform);
        
        // Filtro de Búsqueda
        let matchesS = (j["Nombre Juego"] || "").toLowerCase().includes(q);
        
        // Filtro de Formato
        let matchesF = true;
        const formatVal = (j["Formato"] || "").toString().toUpperCase();
        if (currentFormat === 'digital') matchesF = formatVal.includes("DIGITAL");
        else if (currentFormat === 'fisico') matchesF = !formatVal.includes("DIGITAL");

        return matchesP && matchesS && matchesF;
    });

    // Ejecutar renderizado según sección activa
    if (currentSection === 'videojuegos') renderGames(filtered);
    else if (currentSection === 'deseados') renderWishlist(filtered);
    else if (currentSection === 'jugados') renderPlayed(filtered);
}

function filterGames() { applyFilters(); }

// 7. Filtros de Formato
function renderFormatFilters(games, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const counts = {
        all: games.length,
        fisico: games.filter(g => !String(g["Formato"]).toUpperCase().includes("DIGITAL")).length,
        digital: games.filter(g => String(g["Formato"]).toUpperCase().includes("DIGITAL")).length
    };

    container.innerHTML = `
        <button class="format-btn ${currentFormat === 'all' ? 'active' : ''}" data-format="all">
            <i class="fa-solid fa-layer-group"></i> Todos (${counts.all})
        </button>
        <button class="format-btn ${currentFormat === 'fisico' ? 'active' : ''}" data-format="fisico">
            <i class="fa-solid fa-floppy-disk"></i> Físico (${counts.fisico})
        </button>
        <button class="format-btn ${currentFormat === 'digital' ? 'active' : ''}" data-format="digital">
            <i class="fa-solid fa-cloud-download"></i> Digital (${counts.digital})
        </button>
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

// 8. Helpers (Banderas e Iconos)
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
