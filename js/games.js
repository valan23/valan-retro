// games.js - Renderizado de Colección

function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!games || games.length === 0) {
        container.innerHTML = `
            <div style='grid-column: 1/-1; text-align:center; padding: 60px 20px;'>
                <i class="fa-solid fa-ghost" style="font-size: 3rem; color: #333; margin-bottom: 20px; display: block;"></i>
                <p style='color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;'>No hay juegos que coincidan</p>
            </div>`;
        return;
    }

    // Usamos DocumentFragment para mejor rendimiento si la lista es enorme
    const html = games.map(j => createCardHTML(j)).join('');
    container.innerHTML = html;
}

function createCardHTML(j) {
    try {
        if (typeof AppUtils === 'undefined') return "";

        // --- PREPARACIÓN DE DATOS ---
        const plat = j["Plataforma"] || "";
        const carpeta = AppUtils.getPlatformFolder(plat);
        const portada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;
        const styleRegion = AppUtils.getRegionStyle(j["Región"]);
        const colorCompBase = AppUtils.getCompletitudStyle(j["Completitud"]);
        const rawRarezaColor = AppUtils.getRarezaColor(j["Rareza"]);
        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";

        // Estilos dinámicos
        const toRgba = (hex, alpha = 0.15) => {
            if (!hex || !hex.startsWith('#')) return `rgba(255,255,255,${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const getStatusGradient = (val) => {
            const v = val ? val.toString().toUpperCase() : "";
            if (v === "PEND" || v === "?" || v === "S/D") return "linear-gradient(90deg, rgba(80,80,80,0.2) 0%, rgba(120,120,120,0.1) 100%)";
            if (v === "FALTA" || v === "0") return "linear-gradient(90deg, rgba(255,0,0,0.2) 0%, rgba(150,0,0,0.05) 100%)";

            const num = parseFloat(v);
            if (!isNaN(num)) {
                let r = num <= 5 ? 255 : Math.floor(255 * (1 - (num - 5) / 5));
                let g = num <= 5 ? Math.floor(255 * (num / 5)) : 255;
                return `linear-gradient(90deg, rgba(${r},${g},0,0.2) 0%, rgba(${r},${g},0,0.05) 100%)`;
            }
            return "linear-gradient(90deg, rgba(239, 195, 108, 0.1) 0%, rgba(239, 195, 108, 0.02) 100%)";
        };

        // --- CONSTRUCCIÓN DEL HTML ---
        return `
        <div class="card ${getBrandClass(plat)}">
            
            <div style="display: flex; height: 45px; align-items: stretch; position: relative; z-index: 10;">
                <div class="icon-gradient-area">
                    ${getPlatformIcon(plataforma)}
                </div>
                <div style="width: 100px; background: ${toRgba(colorCompBase, 0.25)}; color: ${colorCompBase}; font-weight: 900; font-size: 0.7em; display: flex; align-items: center; justify-content: center; border-left: 1px solid rgba(255,255,255,0.05); letter-spacing: 0.5px;">
                    ${(j["Completitud"] || "???").toUpperCase()}
                </div>
            </div>
            
            <div style="padding: 15px 15px 0 15px; margin-left: 6px;">
                ${esEspecial ? 
                    `<div style="color: var(--cyan); font-size: 0.6rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">
                        <i class="fa-solid fa-star"></i> ${j["Edición"]}
                    </div>` : '<div style="height:12px"></div>'
                }
                <div class="game-title" style="padding:0; line-height: 1.1; margin-bottom: 4px;">${j["Nombre Juego"]}</div>
                <div style="font-size: 0.7rem; color: #666; font-family: 'Noto Sans JP', sans-serif; min-height: 14px;">
                    ${j["Nombre Japones"] || ""}
                </div>

                <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                    <div style="font-size: 0.55rem; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text}; font-weight: 900; display: flex; align-items: center; gap: 4px;">
                        ${getFlag(j["Región"])} ${j["Región"]}
                    </div>
                    <span style="font-size: 0.7rem; color: #555; font-weight: 800;">${j["Año"] || "????"}</span>
                    <span style="color: #333;">|</span>
                    <span style="font-size: 0.65rem; color: #555; text-transform: uppercase; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${j["Desarrolladora"] || "Unknown"}
                    </span>
                </div>
            </div>

            <div style="height: 180px; margin: 15px 15px; background: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.03);">
                <img src="${fotoUrl}" loading="lazy" style="max-width: 95%; max-height: 95%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
            </div>

            <div style="margin: 0 15px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px; flex-grow: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; align-content: start; border: 1px solid rgba(255,255,255,0.02);">
                ${esDigital ? 
                    `<div style="color: var(--cyan); font-size: 0.7rem; text-align: center; grid-column: 1/-1; margin: 30px 0; letter-spacing: 2px; font-weight: 900; opacity: 0.6;">LICENCIA DIGITAL</div>` : 
                    [{l: 'Caja', v: j["Estado Caja"]}, {l: 'Port.', v: j["Estado Portada"]}, {l: 'Man.', v: j["Estado Manual"]}, {l: 'Juego', v: j["Estado Juego"]}, {l: 'Ins.', v: j["Estado Inserto"]}, {l: 'Obi', v: j["Estado Spinecard"]}, {l: 'Ext.', v: j["Estado Extras"]}]
                    .filter(i => AppUtils.isValid(i.v)).map(i => `
                        <div style="display: flex; flex-direction: column; padding: 4px 8px; border-radius: 4px; background: ${getStatusGradient(i.v)}; border-left: 2px solid rgba(255,255,255,0.1);">
                            <span style="color: #555; font-size: 0.5rem; font-weight: 800; text-transform: uppercase;">${i.l}</span>
                            <span style="color: #ccc; font-size: 0.7rem; font-weight: 900; text-align: right; margin-top: -2px;">${i.v.toUpperCase()}</span>
                        </div>
                    `).join('')
                }
            </div>

            <div style="margin-top: 15px; height: 50px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; align-items: stretch; margin-left: 6px;">
                <div style="flex: 1; background: ${esDigital ? 'rgba(0, 242, 255, 0.1)' : 'rgba(239, 195, 108, 0.1)'}; color: ${esDigital ? 'var(--cyan)' : 'var(--accent)'}; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid rgba(0,0,0,0.2);">
                    <i class="fa-solid ${esDigital ? 'fa-cloud' : 'fa-compact-disc'}" style="font-size: 0.8rem; margin-bottom: 2px;"></i>
                    <span style="font-size: 0.55rem; font-weight: 900;">${esDigital ? 'DIGITAL' : 'FÍSICO'}</span>
                </div>
                <div style="flex: 1.2; background: ${toRgba(rawRarezaColor, 0.15)}; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid rgba(0,0,0,0.2);">
                    <span style="font-size: 0.7rem; color: ${rawRarezaColor}; font-weight: 900; letter-spacing: 0.5px;">${(j["Rareza"] || "COMÚN").toUpperCase()}</span>
                </div>
                <div style="flex: 1.5; background: rgba(46, 158, 127, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 5px;">
                    <span style="font-size: 0.45rem; color: #2e9e7f; font-weight: 900; text-transform: uppercase;">Valor Est.</span>
                    <span style="font-size: 0.8rem; color: #fff; font-weight: 900;">${j["Tasación Actual"] || "S/T"}</span>
                </div>
            </div>
        </div>`;
    } catch (e) { 
        console.error("Error en card games:", e);
        return ""; 
    }
}
