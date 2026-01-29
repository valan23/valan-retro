/**
 * games.js - Renderizado vinculado a config.js
 */

function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (!container) return;

    if (typeof renderFormatFilters === 'function') {
        renderFormatFilters(games, 'format-buttons-container-games', 'game');
    }

    container.innerHTML = "";

    if (games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No se encontraron juegos.</p>";
        return;
    }

    // Carga progresiva
    const firstBatch = games.slice(0, 24);
    container.innerHTML = firstBatch.map(j => createCardHTML(j)).join('');

    if (games.length > 24) {
        setTimeout(() => {
            const remainingBatch = games.slice(24);
            container.insertAdjacentHTML('beforeend', remainingBatch.map(j => createCardHTML(j)).join(''));
        }, 150); 
    }
}

function createCardHTML(j) {
    try {
        const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";
        
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const valorPlataforma = j["Plataforma"] ? j["Plataforma"].trim() : "";
        const carpetaSistema = platformMap[valorPlataforma] || valorPlataforma.toLowerCase().replace(/\s+/g, '');
        const fotoUrl = isValid(j["Portada"]) ? `images/covers/${carpetaSistema}/${j["Portada"].trim()}` : `images/covers/default.webp`;

        const styleRegion = typeof getRegionStyle === 'function' ? getRegionStyle(j["Región"]) : {bg: 'rgba(255,255,255,0.1)', text: '#eee', border: 'transparent'};
        const colorCompletitud = typeof getCompletitudStyle === 'function' ? getCompletitudStyle(j["Completitud"]) : "#555";
        const brandClass = typeof getBrandClass === 'function' ? getBrandClass(valorPlataforma) : "";
        
        const rarezaTexto = (j["Rareza"] || "COMÚN").toString().toUpperCase().trim();
        const colorRareza = typeof getColorForRareza === 'function' ? getColorForRareza(rarezaTexto) : "#fff";

        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const edicionRaw = j["Edición"] || "";
        const esEdicionEspecial = isValid(edicionRaw) && edicionRaw.toUpperCase() !== "ESTÁNDAR";

        const secondaryTextColor = "#ced4da";

        return `
        <div class="card ${brandClass} ${esDigital ? 'digital-variant' : 'physical-variant'}" style="display: flex; flex-direction: column; min-height: 520px; position: relative; padding-bottom: 60px;">
            
            <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                ${typeof getPlatformIcon === 'function' ? getPlatformIcon(j["Plataforma"]) : ''}
            </div>

            <div style="position: absolute; top: 0; right: 0; background-color: ${colorCompletitud}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 14px; border-bottom-left-radius: 8px; z-index: 10; box-shadow: -2px 2px 5px rgba(0,0,0,0.4);">
                ${(j["Completitud"] || "???").toUpperCase()}
            </div>

            <div style="margin-top: 45px;"></div>

            <div style="display: flex; align-items: center; width: 100%; gap: 10px; margin-bottom: 15px; padding: 0 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 600;">
                        ${j["Año"] || "????"}
                    </span>
                    <div style="display: inline-flex; align-items: center; gap: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; padding: 2px 6px; border-radius: 4px;">
                        ${typeof getFlag === 'function' ? getFlag(j["Región"]) : ''} 
                        <span style="font-size: 0.7em; font-weight: bold; color: ${styleRegion.text};">${j["Región"] || "N/A"}</span>
                    </div>
                </div>
                <div style="flex-grow: 1;"></div>
                <div style="font-size: 0.7em; font-weight: 800; color: ${colorRareza}; display: flex; align-items: center; gap: 3px;">
                    <span style="filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">💎</span>
                    <span>${rarezaTexto}</span>
                </div>
            </div>

            <div style="margin-bottom: 12px; padding: 0 12px;">
                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? 
                    `<div style="font-size: 0.7em; color: ${secondaryTextColor}; margin-top: 3px; font-family: 'Noto Sans JP', sans-serif; opacity: 0.8;">${j["Nombre Japones"]}</div>` 
                    : ''}
                ${esEdicionEspecial ? `<div style="font-size: 0.7em; color: ${secondaryTextColor}; margin-top: 4px; opacity: 0.7;"><i class="fa-solid fa-star" style="color: #EFC36C;"></i> ${edicionRaw}</div>` : ''}
            </div>

            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 150px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px;"> 
                <div style="position: absolute; bottom: 8px; left: 8px; padding: 4px 10px; border-radius: 4px; font-size: 0.6em; font-weight: 900; text-transform: uppercase; z-index: 5; background: ${esDigital ? '#00d4ff' : '#e67e22'}; color: ${esDigital ? '#000' : '#fff'}; box-shadow: 2px 2px 5px rgba(0,0,0,0.4); display: flex; align-items: center;">
                    ${esDigital ? '<i class="fa-solid fa-cloud" style="margin-right: 4px;"></i> Digital' : '<i class="fa-solid fa-floppy-disk" style="margin-right: 4px;"></i> Físico'}
                </div>
                <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.5));">
            </div>

            <div style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 6px; flex-grow: 1;">
                ${esDigital ? `
                    <div style="padding: 15px; text-align: center; color: #00d4ff; font-size: 0.85em; font-weight: bold;">CONTENIDO DIGITAL</div>
                ` : `
                    ${[
                        { label: '📦Caja', val: j["Estado Caja"] },
                        { label: '📂Inserto', val: j["Estado Inserto"] },
                        { label: '📖Manual', val: j["Estado Manual"] },
                        { label: '💾Juego', val: j["Estado Juego"] },
                        { label: '🖼️Portada', val: j["Estado Portada"] },
                        { label: '🔖Obi', val: j["Estado Spinecard"] },
                        { label: '🎁Extras', val: j["Estado Extras"] }
                    ].filter(item => isValid(item.val)).map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 8px; border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <span style="color: #999; font-size: 0.75em; font-weight: 600;">${item.label}</span>
                            <span style="font-weight: 800; font-size: 0.8em;">${formatEstado(item.val)}</span>
                        </div>
                    `).join('')}
                `}
            </div>

            <div class="card-footer" style="position: absolute; bottom: 12px; left: 15px; right: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.65em; color: ${secondaryTextColor}; font-style: italic; opacity: 0.8;">
                    <i class="fa-regular fa-calendar-check"></i> ${isValid(j["Fecha revision"]) ? j["Fecha revision"] : 'Sin fecha'}
                </div>
                <div class="price-tag" style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 1.1em;">💸</span>
                    <span style="font-weight: 800; font-size: 0.9em;">${j["Tasación Actual"] || "S/T"}</span>
                </div>
            </div>
        </div>`;
    } catch (e) {
        console.error("Error renderizando card:", e);
        return "";
    }
}

// --- HELPERS ---

function getRegionStyle(region) {
    if (!region) return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
    const r = region.toUpperCase().trim();
    return REGION_COLORS[r] || { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
}

function getCompletitudStyle(valor) {
    if (!valor) return "#333";
    const v = valor.toUpperCase().trim();
    if (COMPLETITUD_COLORS[v]) return COMPLETITUD_COLORS[v].color;
    for (let key in COMPLETITUD_COLORS) {
        if (v.includes(key)) return COMPLETITUD_COLORS[key].color;
    }
    return "#555";
}

function formatEstado(valor) {
    if (!valor || valor.toUpperCase() === "NA") return "";
    
    const v = valor.toString().toUpperCase().trim();
    
    // Si la palabra es FALTA o NO, la pintamos en rojo chillón
    if (v === "FALTA" || v === "NO") {
        return `<span style="color: #ff4444; font-weight: 900; letter-spacing: 1px;">FALTA</span>`;
    }
    
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;

    // Color según nota (0 rojo - 120 verde)
    const hue = Math.min(Math.max(num * 12, 0), 120); 
    return `<span style="color: hsl(${hue}, 100%, 50%);">${num}/10</span>`;
}

function getColorForRareza(rareza) {
    const r = rareza ? rareza.toString().toUpperCase() : "";
    if (r.includes("LEGENDARIO")) return "#EFC36C"; 
    if (r.includes("ÉPICO"))      return "#A335EE"; 
    if (r.includes("RARO"))       return "#0070DD"; 
    if (r.includes("INUSUAL"))    return "#1EFF00"; 
    if (r.includes("COMÚN"))      return "#FFFFFF"; 
    return "#888";
}
