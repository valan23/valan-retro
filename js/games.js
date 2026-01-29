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
        
        // --- Lógica de Carpetas e Imágenes ---
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const valorPlataforma = j["Plataforma"] ? j["Plataforma"].trim() : "";
        const carpetaSistema = platformMap[valorPlataforma] || valorPlataforma.toLowerCase().replace(/\s+/g, '');
        const fotoUrl = isValid(j["Portada"]) ? `images/covers/${carpetaSistema}/${j["Portada"].trim()}` : `images/covers/default.webp`;

        // --- Estilos desde config.js ---
        const styleRegion = getRegionStyle(j["Región"]);
        const colorCompletitud = getCompletitudStyle(j["Completitud"]);
        const brandClass = typeof getBrandClass === 'function' ? getBrandClass(valorPlataforma) : "";
        
        // --- Rareza y Formato ---
        const rarezaTexto = (j["Rareza"] || "COMÚN").toString().toUpperCase().trim();
        const rarezaPorcentaje = { "LEGENDARIO": 100, "ÉPICO": 80, "RARO": 60, "INUSUAL": 40, "COMÚN": 20 }[rarezaTexto] || 20;
        const colorRareza = typeof getColorForRareza === 'function' ? getColorForRareza(rarezaTexto) : "#fff";

        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const edicionRaw = j["Edición"] || "";
        const esEdicionEspecial = isValid(edicionRaw) && edicionRaw.toUpperCase() !== "ESTÁNDAR";

        return `
        <div class="card ${brandClass} ${esDigital ? 'digital-variant' : 'physical-variant'}" style="position: relative;">
            
            <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                ${typeof getPlatformIcon === 'function' ? getPlatformIcon(j["Plataforma"]) : ''}
            </div>

            <div style="position: absolute; top: 0; right: 0; background-color: ${colorCompletitud}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; border-bottom-left-radius: 8px; z-index: 10; text-transform: uppercase;">
                ${j["Completitud"] || "???"}
            </div>

            <div style="margin-top: 45px;"></div>

            <div style="display: flex; align-items: center; width: 100%; gap: 10px; margin-bottom: 15px; padding: 0 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee;">
                        ${j["Año"] || "????"}
                    </span>
                    <div style="display: inline-flex; align-items: center; gap: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; padding: 2px 6px; border-radius: 4px;">
                        ${typeof getFlag === 'function' ? getFlag(j["Región"]) : ''} 
                        <span style="font-size: 0.7em; font-weight: bold; color: ${styleRegion.text};">${j["Región"] || "N/A"}</span>
                    </div>
                </div>
                <div style="flex-grow: 1;"></div>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                     <div style="font-size: 0.75em; font-weight: 800; color: ${colorRareza};">💎 ${rarezaTexto}</div>
                     <div style="width: 60px; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 2px;">
                         <div style="width: ${rarezaPorcentaje}%; height: 100%; background-color: ${colorRareza}; shadow: 0 0 5px ${colorRareza};"></div>
                     </div>
                </div>
            </div>

            <div style="margin-bottom: 12px; padding: 0 12px;">
                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                    ${j["Nombre Juego"]}
                </div>
                ${esEdicionEspecial ? `<div style="font-size: 0.7em; color: #aaa; margin-top: 4px;"><i class="fa-solid fa-star" style="color: #EFC36C;"></i> ${edicionRaw}</div>` : ''}
            </div>

            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 160px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);"> 
                <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0px 5px 8px rgba(0,0,0,0.5));">
            </div>

            <div style="margin: 0 12px; flex-grow: 1;">
                ${esDigital ? `
                    <div style="padding: 15px; text-align: center; color: #00d4ff; font-size: 0.7em; border: 1px dashed rgba(0,212,255,0.3); border-radius: 6px;">CONTENIDO DIGITAL</div>
                ` : `
                    <div class="details-grid">
                        ${[
                            { label: 'Caja', val: j["Estado Caja"] },
                            { label: 'Manual', val: j["Estado Manual"] },
                            { label: 'Juego', val: j["Estado Juego"] },
                            { label: 'Obi', val: j["Estado Spinecard"] }
                        ].filter(item => isValid(item.val)).map(item => `
                            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0; font-size: 0.8em;">
                                <span style="color: #888;">${item.label}:</span>
                                <span style="font-weight: bold;">${formatEstado(item.val)}</span>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <div style="padding: 12px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 10px;">
                <div style="font-size: 0.6em; color: #555; font-style: italic;">
                    REV: ${j["Fecha revision"] || '--/--'}
                </div>
                <div style="background: rgba(0,255,136,0.15); padding: 4px 10px; border-radius: 4px; color: #00ff88; font-weight: 900; font-size: 0.85em;">
                    ${j["Tasación Actual"] || "S/T"}
                </div>
            </div>
        </div>`;
    } catch (e) {
        console.error("Error en createCardHTML:", e);
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
