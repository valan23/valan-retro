let allGames = [];
let currentPlatform = "TODAS";

// Inicialización
Papa.parse(CSV_URL, {
    download: true, header: true, skipEmptyLines: true,
    transformHeader: h => h.trim(),
    complete: function(results) {
        allGames = results.data.filter(j => j["Nombre Juego"] && j["Nombre Juego"].trim() !== "");
        createFilters(allGames);
        renderGames(allGames);
    }
});

// --- Funciones de Lógica ---
function createFilters(games) {
    const counts = games.reduce((acc, game) => {
        const p = game["Plataforma"];
        if (p) acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});

    const container = document.getElementById('platform-filters');
    
    let html = `<div class="brand-selector" style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">`;

    // --- BOTÓN TODAS ---
    html += `
        <div class="brand-icon active" onclick="showBrand('TODAS', this)" 
             style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px;">
            <i class="fa-solid fa-house" style="font-size: 1.5em; min-width: 30px; text-align: center;"></i>
            <span style="font-weight: 600; font-size: 1em;">TODAS</span>
        </div>`;

    // --- BOTONES DE MARCAS ---
    for (const [brandName, data] of Object.entries(BRANDS_CONFIG)) {
        html += `
            <div class="brand-icon ${data.class}" onclick="showBrand('${brandName}', this)" 
                 style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px;">
                <img src="${data.logo}" alt="" class="brand-logo-img" 
                     style="height: 25px; width: auto; max-width: 100px; object-fit: contain;">
                <span style="font-weight: 600; font-size: 1em;">${brandName}</span>
            </div>`;
    }
    
    html += `</div>`; 

    // El resto de la función (subgrupos) se mantiene igual
    for (const [brandName, data] of Object.entries(BRANDS_CONFIG)) {
        html += `<div id="group-${brandName}" class="platform-subgroup">`;
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

function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No se encontraron juegos.</p>";
        return;
    }

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        const colorB = getColorForNota(j["Estado General"]);
        const notaG = (j["Estado General"] === "PEND" || !j["Estado General"]) ? "?" : j["Estado General"];
        const style = getRegionStyle(j["Región"]);
        const colorCompletitud = getCompletitudStyle(j["Completitud"]);

        return `
        <div class="card" style="position: relative; padding-bottom: 50px;">
            <div class="grade-badge" style="background-color: ${colorB}">${notaG}</div>
    
            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; padding-right: 35px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="platform-icon-card">
                        ${getPlatformIcon(j["Plataforma"])}
                    </div>
                    <span class="year-tag">${j["Año"] || ""}</span>
                </div>

                <div class="region-badge-container" style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px; width: fit-content;">
                    ${getFlag(j["Región"])} 
                    <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">
                        ${j["Región"] || "N/A"}
                    </span>
                </div>
            </div>

            <div style="
                height: 64px; /* Aumentamos ligeramente de 60 a 64 */
                display: flex; 
                align-items: center; 
                overflow: hidden; 
                margin-bottom: 5px; 
                border-left: 2px solid #555;
                padding-left: 12px;
                padding-bottom: 4px; /* Espacio extra para que no se corten las letras como la 'g' o 'y' */
            ">
                <span class="game-title" style="
                    margin: 0; 
                    line-height: 1.3; /* Un poco más de espacio entre líneas para evitar recortes */
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
                    font-weight: 600; 
                    font-size: 1.05em; 
                    letter-spacing: 0.3px; 
                    color: #eeeeee;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-transform: none;
                ">
                    ${j["Nombre Juego"]}
                </span>
            </div>

            ${isValid(j["Edición"]) && !["ESTÁNDAR", "ESTANDAR"].includes(j["Edición"].toUpperCase()) ? `
                <div class="edition-text" style="
                    font-family: 'Segoe UI', Roboto, sans-serif;
                    font-size: 0.75em; 
                    font-style: italic; 
                    color: #aaa; 
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    line-height: 1.2;
                    min-height: 1.2em; /* Mantiene la altura aunque sea 1 línea */
                    margin-bottom: 15px;">
                    <i class="fa-solid fa-star" style="color: #ffd700; font-size: 0.9em;"></i>
                    ${j["Edición"]}
                </div>` : `
                <div style="margin-bottom: 15px; height: 1.2em;"></div> 
                `}

            <div class="details-grid" style="font-family: 'Segoe UI', Roboto, sans-serif; font-size: 0.8em; letter-spacing: 0.3px; line-height: 1.4; margin-top: 10px;">
                ${isValid(j["Estado Caja"]) ? `<div><span style="color: #aaa;">📦Caja:</span> ${formatEstado(j["Estado Caja"])}</div>` : ''}
                ${isValid(j["Estado Inserto"]) ? `<div><span style="color: #aaa;">📂Inserto:</span> ${formatEstado(j["Estado Inserto"])}</div>` : ''}
                ${isValid(j["Estado Manual"]) ? `<div><span style="color: #aaa;">📖Manual:</span> ${formatEstado(j["Estado Manual"])}</div>` : ''}
                ${isValid(j["Estado Juego"]) ? `<div><span style="color: #aaa;">💾Juego:</span> ${formatEstado(j["Estado Juego"])}</div>` : ''}
                ${isValid(j["Estado Portada"]) ? `<div><span style="color: #aaa;">🖼️Portada:</span> ${formatEstado(j["Estado Portada"])}</div>` : ''}
                ${isValid(j["Estado Spinecard"]) ? `<div><span style="color: #aaa;">🔖Obi:</span> ${formatEstado(j["Estado Spinecard"])}</div>` : ''}
                ${isValid(j["Estado Extras"]) ? `<div><span style="color: #aaa;">🎁Extras:</span> ${formatEstado(j["Estado Extras"])}</div>` : ''}
            </div>

            <div class="card-footer" style="position: absolute; bottom: 12px; left: 15px; right: 15px; display: flex; justify-content: space-between; align-items: center;">
                <div class="completitud-text" style="
                    font-family: 'Segoe UI', Roboto, sans-serif; 
                    font-size: 0.75em; 
                    letter-spacing: 0.5px; 
                    text-transform: uppercase; 
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: ${colorCompletitud};">
                    <span style="font-size: 1.1em;">●</span> ${j["Completitud"] || "DESCONOCIDO"}
                </div>
                <div class="price-tag" style="position: static; margin: 0; font-weight: bold;">
                    ${j["Tasación Actual"] || "S/T"}
                </div>
            </div>
        </div>`;
    }).join('');
}

// --- Helpers (Flag, Color, Filtros) ---
function showBrand(brand, element) {
    document.querySelectorAll('.brand-icon').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.platform-subgroup').forEach(g => g.classList.remove('show'));
    if (brand === 'TODAS') { currentPlatform = "TODAS"; applyFilters(); }
    else document.getElementById(`group-${brand}`)?.classList.add('show');
}

function filterByPlatform(p, btn) {
    currentPlatform = p;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
}

function applyFilters() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allGames.filter(j => {
        const matchesP = (currentPlatform === "TODAS" || j["Plataforma"] === currentPlatform);
        const matchesS = (j["Nombre Juego"] || "").toLowerCase().includes(q);
        return matchesP && matchesS;
    });
    renderGames(filtered);
}

function filterGames() { applyFilters(); }

function getFlag(region) {
    if (!region) return '<span class="fi fi-xx"></span>';
    const codes = { "ESP": "es", "JAP": "jp", "USA": "us", "EU": "eu", "UK": "gb", "ITA": "it", "GER": "de", "AUS": "au", "ASIA": "hk"};
    const r = region.toUpperCase();
    let code = "xx";
    for (let key in codes) { if (r.includes(key)) code = codes[key]; }
    return `<span class="fi fi-${code}"></span>`;
}

function getColorForNota(valor) {
    const n = parseFloat(valor);
    if (isNaN(n)) return '#333';
    let r = n < 5 ? 255 : Math.round(255 - ((n - 5) * 51));
    let g = n < 5 ? Math.round(68 + (n * 37.4)) : 255;
    return `rgb(${r}, ${g}, 68)`;
}

function formatEstado(valor) {
    if (!valor || valor.toUpperCase() === "NA") return null;
    const v = valor.toUpperCase().trim();

    // Caso: FALTA (Rojo)
    if (v === "FALTA") {
        return `<span style="color: #ff4d4d; font-weight: bold;">FALTA</span>`;
    }
    
    // Caso: PENDIENTE o ? (Amarillo)
    if (v === "?" || v === "PEND") {
        return `<span style="color: #ffff00; font-weight: bold;">?</span>`;
    }

    // Caso: Tiene valor numérico (Verde)
    // Usamos el color verde que definiste para "Completo" para mantener coherencia
    return `<span style="color: #00ff88; font-weight: bold;">${v}/10</span>`;
}

function getRegionStyle(region) {
    if (!region) return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
    
    const r = region.toUpperCase();
    for (let key in REGION_COLORS) {
        if (r.includes(key)) return REGION_COLORS[key];
    }
    
    return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
}

function getPlatformIcon(platformName) {
    // Recorremos cada marca (Sega, Nintendo, etc.) en nuestro config
    for (const brand in BRANDS_CONFIG) {
        const icons = BRANDS_CONFIG[brand].icons;
        if (icons && icons[platformName]) {
            return `<img src="${icons[platformName]}" alt="${platformName}" style="height: 20px; width: auto; object-fit: contain;">`;
        }
    }
    // Si no encuentra icono, devuelve el texto por defecto
    return `<span class="platform-tag">${platformName}</span>`;
}

function getCompletitudStyle(valor) {
    if (!valor) return "#ccc";
    const v = valor.toUpperCase();
    
    if (v.includes("NUEVO")) return COMPLETITUD_COLORS["NUEVO"].color;
    if (v.includes("CASI COMPLETO")) return COMPLETITUD_COLORS["CASI COMPLETO"].color;
    if (v.includes("COMPLETO")) return COMPLETITUD_COLORS["COMPLETO"].color;
    if (v.includes("INCOMPLETO")) return COMPLETITUD_COLORS["INCOMPLETO"].color;
    if (v.includes("SUELTO") || v.includes("CARTUCHO")) return COMPLETITUD_COLORS["SUELTO"].color;
    if (v.includes("REPRO")) return COMPLETITUD_COLORS["REPRO"].color;
    
    return "#ccc"; // Color por defecto si no coincide
}
