// main.js - El Director de Orquesta Unificado

let dataStore = { 'videojuegos': null, 'deseados': null, 'jugados': null, 'consolas': null };
let currentPlatform = "TODAS";
let currentSection = 'videojuegos'; 
let currentFormat = "all";
let currentSearch = '';
let currentPlayedYear = 'all'; 
let currentComplete = 'all'; 
let currentPriority = 'all';
let currentConsoleComplete = 'all'; // Para Caja, Manual, Suelta...
let currentConsoleMod = 'all';      // Para Original, Modificada...

// 1. Carga de datos optimizada
async function loadTabData(sectionId) {
    if (dataStore[sectionId]) return dataStore[sectionId];
    const urls = { 
        'videojuegos': CSV_URL_JUEGOS, 
        'deseados': CSV_URL_DESEADOS, 
        'jugados': CSV_URL_JUGADOS,
        'consolas': CSV_URL_CONSOLAS 
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
                }).filter(item => {
                    // CORRECCIÓN: Filtro genérico para validar que la fila tenga nombre
                    const nombre = item["Nombre Juego"] || item["Nombre Consola"];
                    return nombre && nombre.trim() !== "";
                });
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
    currentSearch = "";
    currentComplete = "all";
    currentPriority = "all";

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = "";

    const consoleContainer = document.getElementById('consoleSelector');
    if (consoleContainer) consoleContainer.innerHTML = ""; 

    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.add('active');
    
    try {
        const data = await loadTabData(sectionId);
        createFilters(data, 'global-platform-filters');
        applyFilters();
    } catch (error) { 
        console.error("Error al cambiar sección:", error); 
    }
}

// 4. Generación de Filtros de Marcas
function createFilters(data, containerId) {
    const counts = data.reduce((acc, item) => {
        const p = item["Plataforma"];
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

    for (const [brandName, brandConfig] of Object.entries(BRANDS_CONFIG)) {
        const hasItems = brandConfig.platforms.some(p => counts[p] > 0);
        if (hasItems) {
            const isActive = Array.isArray(currentPlatform) && currentPlatform.join() === brandConfig.platforms.join();
            html += `
                <div class="brand-icon ${isActive ? 'active' : ''}" onclick="showBrand('${brandName}', this)">
                    <img src="${brandConfig.logo}" class="brand-logo-img">
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
    const currentData = dataStore[currentSection] || [];
    const counts = currentData.reduce((acc, item) => {
        const p = item["Plataforma"];
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

    // 1. Filtro base (Plataforma, búsqueda y año)
    const baseFiltered = dataToFilter.filter(item => {
        // CORRECCIÓN: Buscador dinámico según columna
        const colNombre = (currentSection === 'consolas') ? "Nombre Consola" : "Nombre Juego";
        const matchesSearch = (item[colNombre] || "").toLowerCase().includes(currentSearch.toLowerCase());
        
        let matchesPlatform = (currentPlatform === "TODAS") || 
            (Array.isArray(currentPlatform) ? currentPlatform.includes(item["Plataforma"]) : item["Plataforma"] === currentPlatform);
        
        let matchesYear = true;
        if (currentSection === 'jugados' && currentPlayedYear !== 'all') {
            const fecha = item["Ultima fecha"] || item["Ultima Fecha"] || item["Última Fecha"] || item["Año"] || "";
            matchesYear = String(fecha).includes(currentPlayedYear);
        }
        return matchesSearch && matchesPlatform && matchesYear;
    });

    // 2. Actualizar botones de la interfaz
    renderUniversalFormatFilters(baseFiltered);
    renderUniversalCompleteFilters(baseFiltered);
    renderWishlistPriorityFilters(baseFiltered); 
    renderConsoleHardwareFilters(baseFiltered);

    // 3. Aplicar filtros secundarios (Formato, Completitud y Prioridad)
    const finalFiltered = baseFiltered.filter(item => {
        // Filtro Formato (No aplica a consolas)
        let matchesFormat = true;
        if (currentSection !== 'consolas' && currentFormat !== "all") {
            const esDigital = String(item["Formato"] || "").toUpperCase().includes("DIGITAL");
            matchesFormat = (currentFormat === "digital") ? esDigital : !esDigital;
        }

        // Filtro Completitud
        let matchesComplete = true;
        if (currentComplete !== "all") {
            const valorCSV = String(item["Completitud"] || "").trim().toUpperCase();
            matchesComplete = (valorCSV === currentComplete.toUpperCase());
        }

        // Filtro Prioridad (Solo Wishlist)
        let matchesPriority = true;
        if (currentSection === 'deseados' && currentPriority !== 'all') {
            const priorRaw = String(item["Prioridad"] || "NORMAL").toUpperCase();
            matchesPriority = priorRaw.includes(currentPriority.toUpperCase());
        }

        if (currentSection === 'consolas') {
        // Filtro de Completitud de Consola
        let matchesConsoleComplete = true;
        if (currentConsoleComplete !== "all") {
            matchesConsoleComplete = String(item["Completitud"] || "").toUpperCase() === currentConsoleComplete.toUpperCase();
        }

        // Filtro de Modificación
        let matchesMod = true;
        if (currentConsoleMod !== "all") {
            const esModificada = String(item["Modificada"] || "No").toUpperCase() !== "NO";
            matchesMod = (currentConsoleMod === "si") ? esModificada : !esModificada;
        }
        return matchesConsoleComplete && matchesMod;
    }

        return matchesFormat && matchesComplete && matchesPriority;
    });

    // 4. Renderizado Final
    if (currentSection === 'videojuegos') renderGames(finalFiltered);
    else if (currentSection === 'deseados') renderWishlist(finalFiltered);
    else if (currentSection === 'jugados') renderPlayed(finalFiltered);
    else if (currentSection === 'consolas') renderConsolas(finalFiltered);
}

function renderUniversalFormatFilters(dataForCounters) {
    const container = document.getElementById('nav-format-filter');
    const groupFormat = document.getElementById('group-formato'); // Asumiendo que existe este ID de contenedor
    if (!container) return;

    // Ocultar si estamos en consolas
    if (currentSection === 'consolas') {
        if (groupFormat) groupFormat.style.display = 'none';
        container.innerHTML = "";
        return;
    }
    if (groupFormat) groupFormat.style.display = 'flex';

    const total = dataForCounters.length; 
    const digital = dataForCounters.filter(g => 
        String(g["Formato"] || "").toUpperCase().includes("DIGITAL")
    ).length;
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

    const yearGroup = document.getElementById('year-filter-group');
    if (yearGroup) {
        yearGroup.style.display = (currentSection === 'jugados') ? 'flex' : 'none';
        if (currentSection === 'jugados' && typeof updateYearButtons === 'function') {
            updateYearButtons(dataForCounters); 
        }
    }
}

function renderUniversalCompleteFilters(dataForCounters) {
    const container = document.getElementById('nav-status-filter');
    const groupComplete = document.getElementById('group-estado'); 
    if (!container) return;

    // En consolas de momento no mostramos este filtro de completitud de juegos
    if (currentSection !== 'videojuegos') {
        if (groupComplete) groupComplete.style.display = 'none';
        return;
    }
    if (groupComplete) groupComplete.style.display = 'flex';

    const types = [
        { id: 'all', label: 'TODOS' },
        { id: 'A Estrenar', label: 'NUEVO' },
        { id: 'Íntegro', label: 'ÍNTEGRO' },
        { id: 'Completo', label: 'COMPLETO' },
        { id: 'Incompleto', label: 'INCOMPLETO' },
        { id: 'Suelto', label: 'SUELTO' },
        { id: 'Repro', label: 'REPRO' },
        { id: 'Digital', label: 'DIGITAL' }
    ];

    container.innerHTML = types.map(type => {
        let count = (type.id === 'all') ? dataForCounters.length : 
            dataForCounters.filter(g => String(g["Completitud"] || "").trim().toUpperCase() === type.id.toUpperCase()).length;

        return `
            <button class="year-btn ${currentComplete === type.id ? 'active' : ''}" onclick="setCompleteFilter('${type.id}')">
                ${type.label} <span>${count}</span>
            </button>
        `;
    }).join('');
}

function renderWishlistPriorityFilters(dataForCounters) {
    const container = document.getElementById('nav-priority-filter');
    const groupPriority = document.getElementById('group-prioridad'); 
    if (!container) return;

    if (currentSection !== 'deseados') {
        if (groupPriority) groupPriority.style.display = 'none';
        return;
    }
    if (groupPriority) groupPriority.style.display = 'flex';

    const levels = [
        { id: 'all', label: 'TODAS' },
        { id: 'MUY ALTA', label: 'MUY ALTA' },
        { id: 'ALTA', label: 'ALTA' },
        { id: 'NORMAL', label: 'NORMAL' }
    ];

    container.innerHTML = levels.map(lv => {
        let count = (lv.id === 'all') ? dataForCounters.length : 
            dataForCounters.filter(g => String(g["Prioridad"] || "").toUpperCase().includes(lv.id)).length;

        return `
            <button class="year-btn ${currentPriority === lv.id ? 'active' : ''}" onclick="setPriorityFilter('${lv.id}')">
                ${lv.label} <span>${count}</span>
            </button>
        `;
    }).join('');
}

function setPriorityFilter(value) {
    currentPriority = value;
    applyFilters();
}

function setFormatFilter(format) {
    currentFormat = format;
    if (format === 'digital') currentComplete = 'all';
    applyFilters();
}

function setCompleteFilter(value) {
    currentComplete = value;
    applyFilters();
}

function renderConsoleHardwareFilters(dataForCounters) {
    const groupHardware = document.getElementById('group-hardware-filters'); // Necesitarás este ID en tu HTML
    if (!groupHardware) return;

    if (currentSection !== 'consolas') {
        groupHardware.style.display = 'none';
        return;
    }
    groupHardware.style.display = 'flex';

    // Generar HTML para Modificación
    const modCount = {
        all: dataForCounters.length,
        si: dataForCounters.filter(c => String(c["Modificada"] || "No").toUpperCase() !== "NO").length,
        no: dataForCounters.filter(c => String(c["Modificada"] || "No").toUpperCase() === "NO").length
    };

    // Puedes inyectar el HTML en contenedores específicos dentro de groupHardware
    document.getElementById('nav-console-mod-filter').innerHTML = `
        <button class="year-btn ${currentConsoleMod === 'all' ? 'active' : ''}" onclick="setConsoleModFilter('all')">TODAS <span>${modCount.all}</span></button>
        <button class="year-btn ${currentConsoleMod === 'no' ? 'active' : ''}" onclick="setConsoleModFilter('no')">ORIGINAL <span>${modCount.no}</span></button>
        <button class="year-btn ${currentConsoleMod === 'si' ? 'active' : ''}" onclick="setConsoleModFilter('si')">MOD <span>${modCount.si}</span></button>
    `;
}

// Funciones para cambiar el estado
function setConsoleModFilter(val) {
    currentConsoleMod = val;
    applyFilters();
}

function setConsoleCompleteFilter(val) {
    currentConsoleComplete = val;
    applyFilters();
}

// Listener del buscador
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        applyFilters();
    });
});
