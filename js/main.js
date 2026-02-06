// main.js - El Director de Orquesta Unificado

let dataStore = { 'videojuegos': null, 'deseados': null, 'jugados': null };
let currentPlatform = "TODAS";
let currentSection = 'videojuegos'; 
let currentFormat = "all";
let currentSearch = '';
let currentPlayedYear = 'all'; 

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
        createFilters(games, 'global-platform-filters');
        applyFilters(); 
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
    currentPlayedYear = "all";

    // UI de las pestañas
    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Visibilidad de contenedores de las secciones
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.add('active');
    
    try {
        const data = await loadTabData(sectionId);
        createFilters(data, 'global-platform-filters');
        
        if (document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = "";
            currentSearch = "";
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

    let html = `
    <div class="brand-icon ${currentPlatform === 'TODAS' ? 'active' : ''}" onclick="showBrand('TODAS', this)">
        <i class="fa-solid fa-house" style="margin-bottom:6px; font-size:18px;"></i> 
        <span>TODAS</span>
    </div>`;

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
}

// 5. Lógica de Marcas y Consolas
function showBrand(brand, element) {
    element.parentElement.querySelectorAll('.brand-icon').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    if (brand === 'TODAS') { 
        currentPlatform = "TODAS"; 
        const consoleContainer = document.getElementById('consoleSelector');
        if (consoleContainer) consoleContainer.innerHTML = ""; 
    } else {
        currentPlatform = BRANDS_CONFIG[brand].platforms; 
        createConsoleFilters(brand);
    }
    applyFilters();
}

function createConsoleFilters(brandName) {
    const container = document.getElementById('consoleSelector');
    if (!container) return;
    const brandData = BRANDS_CONFIG[brandName];
    const currentGames = dataStore[currentSection] || [];
    const counts = currentGames.reduce((acc, game) => {
        const p = game["Plataforma"];
        acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});

    let html = `<div class="console-icon active" onclick="filterBySpecificConsole('ALL_BRAND', this, '${brandName}')">
                    <i class="fa-solid fa-layer-group" style="margin-bottom:4px; font-size:14px;"></i> 
                    <span>TODAS</span>
                </div>`;

    brandData.platforms.forEach(plat => {
        if (counts[plat] > 0) {
            const icon = brandData.icons[plat] || "";
            html += `<div class="console-icon" onclick="filterBySpecificConsole('${plat}', this)">
                        <img src="${icon}" class="console-logo-img" alt="${plat}">
                        <span>${plat}</span>
                    </div>`;
        }
    });
    container.innerHTML = html;
}

function filterBySpecificConsole(platform, element, brandName = null) {
    element.parentElement.querySelectorAll('.console-icon').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    currentPlatform = (platform === 'ALL_BRAND') ? BRANDS_CONFIG[brandName].platforms : platform;
    applyFilters();
}

// 6. EL CEREBRO: Aplicación de Filtros Unificada
function applyFilters() {
    const dataToFilter = dataStore[currentSection];
    if (!dataToFilter) return;

    // 1. Primero filtramos por todo EXCEPTO el formato
    // (Para que los contadores de formato nos digan cuántos hay en ese año/consola/búsqueda)
    const filteredByYearAndPlatform = dataToFilter.filter(game => {
        const matchesSearch = game["Nombre Juego"].toLowerCase().includes(currentSearch.toLowerCase());
        
        let matchesPlatform = (currentPlatform === "TODAS") || 
            (Array.isArray(currentPlatform) ? currentPlatform.includes(game["Plataforma"]) : game["Plataforma"] === currentPlatform);
        
        let matchesYear = true;
        if (currentSection === 'jugados' && currentPlayedYear !== 'all') {
            const fecha = game["Ultima fecha"] || game["Ultima Fecha"] || game["Última Fecha"] || game["Año"] || "";
            matchesYear = String(fecha).includes(currentPlayedYear);
        }

        return matchesSearch && matchesPlatform && matchesYear;
    });

    // 2. Actualizamos los botones de formato con estos datos ya filtrados por AÑO
    // Ahora los números de Físico/Digital cambiarán al pulsar un año
    renderUniversalFormatFilters(filteredByYearAndPlatform);

    // 3. Por último, aplicamos el filtro de formato para mostrar los juegos finales
    const finalFiltered = filteredByYearAndPlatform.filter(game => {
        if (currentFormat === "all") return true;
        const esDigital = String(game["Formato"] || "").toUpperCase().includes("DIGITAL");
        return (currentFormat === "digital") ? esDigital : !esDigital;
    });

    // 4. Renderizamos la rejilla
    if (currentSection === 'videojuegos') renderGames(finalFiltered);
    else if (currentSection === 'deseados') renderWishlist(finalFiltered);
    else if (currentSection === 'jugados') renderPlayed(finalFiltered);
}

// 7. Render de Filtros Profesionales (Navbar superior)
// main.js - Línea 228 aproximadamente
function renderUniversalFormatFilters(dataForCounters) { // <--- Asegúrate que aquí diga dataForCounters
    const container = document.getElementById('nav-format-filter');
    if (!container) return;

    // Usamos el mismo nombre que pusimos arriba en el paréntesis
    const total = dataForCounters.length; 
    const digital = dataForCounters.filter(g => {
        const formato = String(g["Formato"] || "").toUpperCase();
        return formato.includes("DIGITAL");
    }).length;
    const fisico = total - digital;

    container.innerHTML = `
        <button class="year-btn ${currentFormat === 'all' ? 'active' : ''}" onclick="setFormatFilter('all')">
            TODOS <span>${total}</span>
        </button>
        <button class="year-btn ${currentFormat === 'fisico' ? 'active' : ''}" onclick="setFormatFilter('fisico')">
            FÍSICO <span>${fisico}</span>
        </button>
        <button class="year-btn ${currentFormat === 'digital' ? 'active' : ''}" onclick="setFormatFilter('digital')">
            DIGITAL <span>${digital}</span>
        </button>
    `;

    // Lógica para mostrar/ocultar el grupo de año
    const yearGroup = document.getElementById('year-filter-group');
    if (yearGroup) {
        if (currentSection === 'jugados') {
            yearGroup.style.display = 'flex';
            if (typeof updateYearButtons === 'function') {
                // Aquí también pasamos dataForCounters
                updateYearButtons(dataForCounters); 
            }
        } else {
            yearGroup.style.display = 'none';
        }
    }
}

function setFormatFilter(format) {
    currentFormat = format;
    applyFilters();
}

// Listener del buscador
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        applyFilters();
    });
});
