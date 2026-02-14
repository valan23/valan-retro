// main.js - El Director de Orquesta Unificado

let dataStore = { 'videojuegos': null, 'deseados': null, 'jugados': null, 'consolas': null };
let currentPlatform = "TODAS";
let currentSection = 'videojuegos'; 
let currentFormat = "all";
let currentSearch = '';
let currentPlayedYear = 'all'; 
let currentComplete = 'all'; 
let currentPriority = 'all';
let currentConsoleComplete = 'all'; 
let currentConsoleMod = 'all';      

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

// 3. Cambio de Sección
async function switchSection(sectionId, btn) {
    currentSection = sectionId;
    currentPlatform = "TODAS"; 
    currentFormat = "all"; 
    currentPlayedYear = "all";
    currentSearch = "";
    currentComplete = "all";
    currentPriority = "all";
    currentConsoleComplete = "all";
    currentConsoleMod = "all";

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

// 5. EL CEREBRO: Aplicación de Filtros Unificada
function applyFilters() {
    const dataToFilter = dataStore[currentSection];
    if (!dataToFilter) return;

    // --- PASO 1: FILTRO BASE (Plataforma y Búsqueda) ---
    const baseFiltered = dataToFilter.filter(item => {
        const colNombre = (currentSection === 'consolas') ? "Nombre Consola" : "Nombre Juego";
        const matchesSearch = (item[colNombre] || "").toLowerCase().includes(currentSearch.toLowerCase());
        
        let matchesPlatform = (currentPlatform === "TODAS") || 
            (Array.isArray(currentPlatform) ? currentPlatform.includes(item["Plataforma"]) : item["Plataforma"] === currentPlatform);
        
        return matchesSearch && matchesPlatform;
    });

    // --- PASO 2: ACTUALIZAR VISIBILIDAD DE GRUPOS ---
    renderConsoleHardwareFilters(baseFiltered);
    renderUniversalFormatFilters(baseFiltered);
    renderUniversalCompleteFilters(baseFiltered);
    renderWishlistPriorityFilters(baseFiltered);

    // --- PASO 3: FILTRADO FINAL SEGÚN SECCIÓN ---
    const finalFiltered = baseFiltered.filter(item => {
        if (currentSection === 'consolas') {
            // Lógica Hardware
            let matchesComp = (currentConsoleComplete === 'all') || 
                String(item["Completitud"] || "").toUpperCase().includes(currentConsoleComplete);

            let matchesMod = true;
            if (currentConsoleMod !== 'all') {
                const val = String(item["Modificada"] || "No").toUpperCase();
                if (currentConsoleMod === 'HACK MOD') matchesMod = val.includes("HACK");
                else matchesMod = (val === currentConsoleMod);
            }
            return matchesComp && matchesMod;
        } else {
            // Lógica Juegos
            let matchesFormat = true;
            if (currentFormat !== "all") {
                const esDigital = String(item["Formato"] || "").toUpperCase().includes("DIGITAL");
                matchesFormat = (currentFormat === "digital") ? esDigital : !esDigital;
            }

            let matchesComplete = (currentComplete === "all") || 
                (String(item["Completitud"] || "").trim().toUpperCase() === currentComplete.toUpperCase());

            let matchesPriority = (currentSection !== 'deseados' || currentPriority === 'all') || 
                String(item["Prioridad"] || "").toUpperCase().includes(currentPriority.toUpperCase());

            let matchesYear = (currentSection !== 'jugados' || currentPlayedYear === 'all') || 
                String(item["Ultima fecha"] || item["Ultima Fecha"] || item["Año"] || "").includes(currentPlayedYear);

            return matchesFormat && matchesComplete && matchesPriority && matchesYear;
        }
    });

    // --- PASO 4: RENDERIZADO FINAL ---
    if (currentSection === 'videojuegos') renderGames(finalFiltered);
    else if (currentSection === 'deseados') renderWishlist(finalFiltered);
    else if (currentSection === 'jugados') renderPlayed(finalFiltered);
    else if (currentSection === 'consolas') renderConsolas(finalFiltered);
}

// 6. FUNCIONES DE RENDERIZADO DE FILTROS (PILLS)

function renderConsoleHardwareFilters(dataForCounters) {
    const groupHardwareMod = document.getElementById('group-hardware-filters');
    const groupHardwareStatus = document.getElementById('group-hardware-status');

    if (currentSection !== 'consolas') {
        if (groupHardwareMod) groupHardwareMod.style.display = 'none';
        if (groupHardwareStatus) groupHardwareStatus.style.display = 'none';
        return;
    }

    if (groupHardwareMod) groupHardwareMod.style.display = 'flex';
    if (groupHardwareStatus) groupHardwareStatus.style.display = 'flex';

    // Filtro Modificación
    const modOptions = [
        { id: 'all', label: 'TODAS' },
        { id: 'NO', label: 'ORIGINAL' },
        { id: 'ADAPTACIÓN', label: 'ADAPTACIÓN' },
        { id: 'HACK MOD', label: 'HACK MOD' }
    ];

    document.getElementById('nav-console-mod-filter').innerHTML = modOptions.map(opt => {
        const count = (opt.id === 'all') ? dataForCounters.length : 
            dataForCounters.filter(c => {
                const val = String(c["Modificada"] || "No").toUpperCase();
                return opt.id === 'HACK MOD' ? val.includes("HACK") : val === opt.id;
            }).length;
        return `<button class="year-btn ${currentConsoleMod === opt.id ? 'active' : ''}" onclick="setConsoleModFilter('${opt.id}')">${opt.label} <span>${count}</span></button>`;
    }).join('');

    // Filtro Completitud Hardware
    const statusOptions = ['all', ...Object.keys(HARDWARE_COMPLETITUD)];
    document.getElementById('nav-console-status-filter').innerHTML = statusOptions.map(opt => {
        const label = opt === 'all' ? 'TODAS' : opt;
        const count = (opt === 'all') ? dataForCounters.length : 
            dataForCounters.filter(c => String(c["Completitud"] || "").toUpperCase().includes(opt)).length;
        return `<button class="year-btn ${currentConsoleComplete === opt ? 'active' : ''}" onclick="setConsoleCompleteFilter('${opt}')">${label} <span>${count}</span></button>`;
    }).join('');
}

function renderUniversalFormatFilters(dataForCounters) {
    const container = document.getElementById('nav-format-filter');
    const groupFormat = document.getElementById('group-formato');
    const yearGroup = document.getElementById('year-filter-group');

    if (currentSection === 'consolas') {
        if (groupFormat) groupFormat.style.display = 'none';
        if (yearGroup) yearGroup.style.display = 'none';
        return;
    }

    if (groupFormat) groupFormat.style.display = 'flex';
    if (yearGroup) {
        yearGroup.style.display = (currentSection === 'jugados') ? 'flex' : 'none';
        if (currentSection === 'jugados' && typeof updateYearButtons === 'function') updateYearButtons(dataForCounters);
    }

    const total = dataForCounters.length; 
    const digital = dataForCounters.filter(g => String(g["Formato"] || "").toUpperCase().includes("DIGITAL")).length;
    const fisico = total - digital;

    container.innerHTML = `
        <button class="year-btn ${currentFormat === 'all' ? 'active' : ''}" onclick="setFormatFilter('all')">TODOS <span>${total}</span></button>
        <button class="year-btn ${currentFormat === 'fisico' ? 'active' : ''}" onclick="setFormatFilter('fisico')">FÍSICO <span>${fisico}</span></button>
        <button class="year-btn ${currentFormat === 'digital' ? 'active' : ''}" onclick="setFormatFilter('digital')">DIGITAL <span>${digital}</span></button>`;
}

function renderUniversalCompleteFilters(dataForCounters) {
    const container = document.getElementById('nav-status-filter');
    const groupComplete = document.getElementById('group-estado'); 
    
    if (currentSection !== 'videojuegos') {
        if (groupComplete) groupComplete.style.display = 'none';
        return;
    }
    if (groupComplete) groupComplete.style.display = 'flex';

    const types = [
        { id: 'all', label: 'TODOS' },
        { id: 'Nuevo', label: 'NUEVO' },
        { id: 'Full', label: 'FULL' },
        { id: 'Básico', label: 'BÁSICO' },
        { id: 'Incompleto', label: 'INCOMPLETO' },
        { id: 'Suelto', label: 'SUELTO' },
        { id: 'Repro', label: 'REPRO' },
        { id: 'Digital', label: 'DIGITAL' }
    ];

    container.innerHTML = types.map(type => {
        let count = (type.id === 'all') ? dataForCounters.length : 
            dataForCounters.filter(g => String(g["Completitud"] || "").trim().toUpperCase() === type.id.toUpperCase()).length;
        return `<button class="year-btn ${currentComplete === type.id ? 'active' : ''}" onclick="setCompleteFilter('${type.id}')">${type.label} <span>${count}</span></button>`;
    }).join('');
}

function renderWishlistPriorityFilters(dataForCounters) {
    const container = document.getElementById('nav-priority-filter');
    const groupPriority = document.getElementById('group-prioridad'); 
    if (currentSection !== 'deseados') {
        if (groupPriority) groupPriority.style.display = 'none';
        return;
    }
    if (groupPriority) groupPriority.style.display = 'flex';

    const levels = [{ id: 'all', label: 'TODAS' }, { id: 'MUY ALTA', label: 'MUY ALTA' }, { id: 'ALTA', label: 'ALTA' }, { id: 'NORMAL', label: 'NORMAL' }];
    container.innerHTML = levels.map(lv => {
        let count = (lv.id === 'all') ? dataForCounters.length : 
            dataForCounters.filter(g => String(g["Prioridad"] || "").toUpperCase().includes(lv.id)).length;
        return `<button class="year-btn ${currentPriority === lv.id ? 'active' : ''}" onclick="setPriorityFilter('${lv.id}')">${lv.label} <span>${count}</span></button>`;
    }).join('');
}

// 7. SETTERS Y LISTENERS
function setPriorityFilter(val) { currentPriority = val; applyFilters(); }
function setFormatFilter(val) { currentFormat = val; applyFilters(); }
function setCompleteFilter(val) { currentComplete = val; applyFilters(); }
function setConsoleModFilter(val) { currentConsoleMod = val; applyFilters(); }
function setConsoleCompleteFilter(val) { currentConsoleComplete = val; applyFilters(); }

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        applyFilters();
    });
});
