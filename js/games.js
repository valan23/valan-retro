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

        const styleRegion = getRegionStyle(j["Región"]);
        const colorCompletitud = getCompletitudStyle(j["Completitud"]);
        const brandClass = typeof getBrandClass === 'function' ? getBrandClass(valorPlataforma) : "";
        
        const rarezaTexto = (j["Rareza"] || "COMÚN").toString().toUpperCase().trim();
        const rarezaPorcentaje = { "LEGENDARIO": 100, "ÉPICO": 80, "RARO": 60, "INUSUAL": 40, "COMÚN": 20 }[rarezaTexto] || 20;
        const colorRareza = getColorForRareza(rarezaTexto);

        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const edicionRaw = j["Edición"] || "";
        const esEdicionEspecial = isValid(edicionRaw) && edicionRaw.toUpperCase() !== "ESTÁNDAR";

        return `
        <div class="card ${brandClass} ${esDigital ? 'digital-variant' : 'physical-variant'}">
            
            <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                ${typeof getPlatformIcon === 'function' ? getPlatformIcon(j["Plataforma"]) : ''}
            </div>

            <div style="position: absolute; top: 0; right: 0; background-color: ${colorCompletitud}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; border-bottom-left-radius: 8px; z-index: 10;">
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
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                     <div style="font-size: 0.75em; font-weight: 800; color: ${colorRareza}; display: flex; align-items: center; gap: 4px;">
                        <span style="filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">💎</span>
                        <span>${rarezaTexto}</span>
                    </div>
                    <div style="width: 75px; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                         <div style="width: ${rarezaPorcentaje}%; height: 100%; background-color: ${colorRareza}; box-shadow: 0 0 8px ${colorRareza}cc;"></div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 12px; padding: 0 12px; margin-right: 12px;">
                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? `<div style="font-size: 0.65em; color: #888; margin-top: 2px; font-family: 'Noto Sans JP', sans-serif;">${j["Nombre Japones"]}</div>` : ''}
                ${esEdicionEspecial ? `<div style="font-size: 0.75em; color: #aaa; margin-top: 4px;"><i class="fa-solid fa-star" style="color: #EFC36C;"></i> ${edicionRaw}</div>` : ''}
            </div>

            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 170px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);"> 
                <img src="${fotoUrl}" loading="lazy" decoding="async" style="max-width: 95%; max-height: 95%; object-fit: contain; filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.5));">
            </div>

            <div class="details-grid" style="margin: 0 12px; flex-grow: 1;">
                ${esDigital ? `
                    <div style="margin: 0 12px; background: rgba(0, 212, 255, 0.05); border: 1px dashed rgba(0, 212, 255, 0.2); border-radius: 6px; padding: 15px; text-align: center; color: #00d4ff; font-size: 0.7em; font-weight: bold; letter-spacing: 1px;">
                        CONTENIDO DIGITAL
                    </div>
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
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0;">
                            <span style="color: #999; font-size: 0.9em;">${item.label}:</span>
                            <span style="font-weight: bold;">${formatEstado(item.val)}</span>
                        </div>
                    `).join('')}
                `}
            </div>

            <div class="card-footer">
                <div style="font-size: 0.65em; color: #666; font-style: italic;">
                    <i class="fa-regular fa-calendar-check"></i> ${isValid(j["Fecha revision"]) ? j["Fecha revision"] : 'Pendiente'}
                </div>
                <div class="price-tag">
                    <span style="font-size: 1.1em;">💸</span>
                    <span>${j["Tasación Actual"] || "S/T"}</span>
                </div>
            </div>
        </div>`;
    } catch (e) {
        console.error("Error renderizando card:", e);
        return "";
    }
}

// --- HELPERS MEJORADOS ---

function getRegionStyle(region) {
    if (!region) return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
    const r = region.toUpperCase().trim();
    // Busca en el objeto REGION_COLORS de config.js
    return REGION_COLORS[r] || { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
}

function getCompletitudStyle(valor) {
    if (!valor) return "#333";
    const v = valor.toUpperCase().trim();
    // Busca en el objeto COMPLETITUD_COLORS de config.js
    if (COMPLETITUD_COLORS[v]) return COMPLETITUD_COLORS[v].color;
    
    // Búsqueda parcial por si acaso (ej: "COMPLETO (SIN OBI)")
    for (let key in COMPLETITUD_COLORS) {
        if (v.includes(key)) return COMPLETITUD_COLORS[key].color;
    }
    return "#555";
}

function formatEstado(valor) {
    if (!valor || valor.toUpperCase() === "NA") return "";
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    // Color según nota (0 rojo - 10 verde)
    const hue = Math.min(Math.max(num * 12, 0), 120); 
    return `<span style="color: hsl(${hue}, 100%, 50%);">${num}/10</span>`;
}
