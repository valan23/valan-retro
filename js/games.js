/**
 * games.js - Renderizado optimizado con carga progresiva y Gradientes Dinámicos
 */

function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (!container) return;

    renderFormatFilters(games, 'format-buttons-container-games', 'game');

    container.innerHTML = "";

    if (games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No se encontraron juegos.</p>";
        return;
    }

    const firstBatch = games.slice(0, 24);
    const firstHtml = firstBatch.map(j => createCardHTML(j)).join('');
    container.innerHTML = firstHtml;

    if (games.length > 24) {
        setTimeout(() => {
            const remainingBatch = games.slice(24);
            const remainingHtml = remainingBatch.map(j => createCardHTML(j)).join('');
            container.insertAdjacentHTML('beforeend', remainingHtml);
        }, 150); 
    }
}

function createCardHTML(j) {
    try {
        const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";
        
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
        const keyMatch = Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase());
        const carpetaSistema = keyMatch ? platformMap[keyMatch] : valorExcel.toLowerCase().replace(/\s+/g, '');

        const nombrePortada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = isValid(nombrePortada) ? `images/covers/${carpetaSistema}/${nombrePortada}` : `images/covers/default.webp`;

        const brandClass = getBrandClass(valorExcel); 
        const campoFormato = j["Formato"] || "Físico"; 
        const esDigital = campoFormato.toString().toUpperCase().includes("DIGITAL");

        const colorCompletitud = getCompletitudStyle(j["Completitud"]);
        const textoBadgeCompletitud = (j["Completitud"] || "???").toUpperCase();
        const style = getRegionStyle(j["Región"]);
        
        const rarezaMap = { "LEGENDARIO": 100, "ÉPICO": 80, "RARO": 60, "INUSUAL": 40, "COMÚN": 20 };
        const rarezaTexto = (j["Rareza"] || "COMÚN").toString().toUpperCase().trim();
        const rarezaPorcentaje = rarezaMap[rarezaTexto] || 20;
        const colorRareza = getColorForRareza(rarezaTexto);
        
        const edicionRaw = j["Edición"] || "";
        const esEdicionEspecial = isValid(edicionRaw) && edicionRaw.toUpperCase() !== "ESTÁNDAR";

        return `
        <div class="card ${brandClass} ${esDigital ? 'digital-variant' : 'physical-variant'}">
            <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                ${typeof getPlatformIcon === 'function' ? getPlatformIcon(j["Plataforma"]) : ''}
            </div>

            <div style="position: absolute; top: 0; right: 0; background-color: ${colorCompletitud}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; border-bottom-left-radius: 8px; z-index: 10;">
                ${textoBadgeCompletitud}
            </div>

            <div style="margin-top: 45px;"></div>

            <div style="display: flex; align-items: center; width: 100%; gap: 10px; margin-bottom: 15px; padding: 0 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 600;">
                        ${j["Año"] || "????"}
                    </span>
                    <div style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px;">
                        ${typeof getFlag === 'function' ? getFlag(j["Región"]) : ''} 
                        <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                    </div>
                </div>
                <div style="flex-grow: 1;"></div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 80px;">
                     <div style="font-size: 0.75em; font-weight: 800; color: ${colorRareza}; display: flex; align-items: center; gap: 4px;">
                        <span style="filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">💎</span>
                        <span style="letter-spacing: 0.5px;">${rarezaTexto}</span>
                    </div>
                    <div style="width: 75px; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                         <div style="width: ${rarezaPorcentaje}%; height: 100%; background-color: ${colorRareza}; box-shadow: 0 0 8px ${colorRareza}cc;"></div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 12px; padding: 5px 12px; margin-right: 12px;">
                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                    ${j["Nombre Juego"]}
                </div>
                ${esEdicionEspecial ? `<div style="font-size: 0.75em; color: #aaa; margin-top: 4px;"><i class="fa-solid fa-star" style="color: #EFC36C;"></i> ${edicionRaw}</div>` : ''}
            </div>

            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 170px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);"> 
                <div style="position: absolute; bottom: 8px; left: 8px; padding: 4px 10px; border-radius: 4px; font-size: 0.6em; font-weight: 900; text-transform: uppercase; z-index: 5; background: ${esDigital ? '#00d4ff' : '#e67e22'}; color: ${esDigital ? '#000' : '#fff'}; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); display: flex; align-items: center; opacity: 0.95;">
                    ${esDigital ? '<i class="fa-solid fa-cloud" style="margin-right: 5px;"></i> Digital' : '<i class="fa-solid fa-floppy-disk" style="margin-right: 5px;"></i> Físico'}
                </div>
                <img src="${fotoUrl}" loading="lazy" decoding="async" style="max-width: 95%; max-height: 95%; object-fit: contain; filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.5));">
            </div>

            ${esDigital ? `
                <div style="margin: 0 12px; background: rgba(0, 212, 255, 0.05); border: 1px dashed rgba(0, 212, 255, 0.2); border-radius: 6px; padding: 15px; text-align: center; color: #00d4ff; font-size: 0.7em; font-weight: bold; letter-spacing: 1px;">
                    CONTENIDO DIGITAL
                </div>
            ` : `
                <div class="details-grid">
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
                </div>
            `}

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

/**
* HELPERS DE RENDERIZADO
*/
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
    if (v === "FALTA") return `<span style="color: #ff4d4d; font-weight: bold;">FALTA</span>`;
    if (v === "?" || v === "PEND") return `<span style="color: #ffff00; font-weight: bold;">?</span>`;
    const num = parseFloat(v);
    const colorDinamico = !isNaN(num) ? getColorForNota(num) : "#00ff88"; 
    return `<span style="color: ${colorDinamico}; font-weight: bold;">${v}/10</span>`;
}

function getRegionStyle(region) {
    if (!region) return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
    const r = region.toUpperCase();
    for (let key in REGION_COLORS) { if (r.includes(key)) return REGION_COLORS[key]; }
    return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
}

function getCompletitudStyle(valor) {
    if (!valor) return "#ccc";
    const v = valor.toUpperCase();
    if (v.includes("DIGITAL")) return "#00d4ff";
    if (v.includes("NUEVO")) return COMPLETITUD_COLORS["NUEVO"].color;
    if (v.includes("CASI COMPLETO")) return COMPLETITUD_COLORS["CASI COMPLETO"].color;
    if (v.includes("COMPLETO")) return COMPLETITUD_COLORS["COMPLETO"].color;
    if (v.includes("INCOMPLETO")) return COMPLETITUD_COLORS["INCOMPLETO"].color;
    if (v.includes("SUELTO") || v.includes("CARTUCHO")) return COMPLETITUD_COLORS["SUELTO"].color;
    if (v.includes("REPRO")) return COMPLETITUD_COLORS["REPRO"].color;
    return "#ccc";
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
