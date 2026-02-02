function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (!container) return;
    
    if (typeof renderFormatFilters === 'function') {
        const fullData = (window.dataStore && window.dataStore['videojuegos']) ? window.dataStore['videojuegos'] : games;
        renderFormatFilters(fullData, 'format-buttons-container-games', 'game');
    }

    container.innerHTML = "";
    
    if (!games || games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 40px; color: #888;'>No se encontraron juegos con estos filtros.</p>";
        return;
    }

    const html = games.map(j => createCardHTML(j)).join('');
    container.innerHTML = html;
}

function createCardHTML(j) {
    try {
        if (typeof AppUtils === 'undefined') return "";

        const plat = j["Plataforma"] || "";
        const carpeta = AppUtils.getPlatformFolder(plat);
        const portada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;
        
        const styleRegion = AppUtils.getRegionStyle(j["Región"]);
        
        // Función auxiliar para convertir HEX a RGBA con opacidad
        const toRgba = (hex, alpha = 0.15) => {
            if (!hex || !hex.startsWith('#')) return `rgba(255,255,255,${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        // 1. Lógica de Completitud (Header)
        const colorCompBase = AppUtils.getCompletitudStyle(j["Completitud"]);
        const bgCompletitud = toRgba(colorCompBase, 0.15); // Fondo translúcido

        // 2. Lógica de Rareza (Footer)
        const rawRarezaColor = AppUtils.getRarezaColor(j["Rareza"]);
        const bgRareza = toRgba(rawRarezaColor, 0.15); // Fondo translúcido

        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";

        // Estilos de Formato
        const colorTextoFormato = esDigital ? '#00f2ff' : '#EFC36C';
        const bgFormato = esDigital ? 'rgba(0, 242, 255, 0.15)' : 'rgba(239, 195, 108, 0.15)';

        return `
        <div class="card ${getBrandClass(plat)}" style="display: flex; flex-direction: column; min-height: 520px; position: relative; overflow: hidden;">
            
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                <div class="icon-gradient-area">
                    <div class="platform-icon-card" style="margin: 0; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.6));">
                        ${getPlatformIcon(plat)}
                    </div>
                </div>
                <div style="background: ${bgCompletitud}; color: ${colorCompBase}; font-weight: 900; font-size: 0.75em; padding: 0 15px; display: flex; align-items: center; box-shadow: -2px 0 10px rgba(0,0,0,0.3); white-space: nowrap; border-left: 1px solid ${toRgba(colorCompBase, 0.3)};">
                    ${(j["Completitud"] || "???").toUpperCase()}
                </div>
            </div>
            
            <div style="margin-top: 55px; padding: 0 12px;">
                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; min-height: 2.4em; display: flex; align-items: center; padding: 0;">
                    ${j["Nombre Juego"]}
                </div>
                <div style="display: flex; gap: 8px; align-items: center; margin-top: 5px;">
                    <span style="font-size: 0.7em; color: #888; font-weight: bold;">${j["Año"] || "????"}</span>
                    <div style="font-size: 0.6em; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text};">
                         ${getFlag(j["Región"])} ${j["Región"] || "N/A"}
                    </div>
                </div>
            </div>

            <div style="height: 160px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
            </div>

            <div style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px; flex-grow: 1; display: flex; flex-direction: column; gap: 2px;">
                ${esDigital ? 
                    `<div style="color: #00f2ff; font-size: 0.7em; text-align: center; margin-top: 20px; letter-spacing: 1px; font-weight: bold;">CONTENIDO DIGITAL</div>` : 
                    [{l: 'Caja', v: j["Estado Caja"]}, {l: 'Inserto', v: j["Estado Inserto"]}, {l: 'Portada', v: j["Estado Portada"]}, {l: 'Manual', v: j["Estado Manual"]}, {l: 'Juego', v: j["Estado Juego"]}, {l: 'Obi', v: j["Estado Spinecard"]}, {l: 'Extras', v: j["Estado Extras"]}]
                    .filter(i => AppUtils.isValid(i.v)).map(i => `
                        <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.03);">
                            <span style="color: #888; font-size: 0.7em; font-weight: 600;">${i.l}</span>
                            <span style="color: #eee; font-size: 0.75em; font-weight: 800;">${i.v.toUpperCase()}</span>
                        </div>
                    `).join('')
                }
                ${esEspecial ? `<div style="color: var(--accent); font-size: 0.65em; margin-top: 5px; font-weight: bold; text-align: center;"><i class="fa-solid fa-star"></i> ${j["Edición"]}</div>` : ''}
            </div>

            <div style="margin-top: 10px; height: 55px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: stretch;">
                
                <div style="flex: 1; background: ${bgFormato}; color: ${colorTextoFormato}; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <i class="fa-solid ${esDigital ? 'fa-cloud-download' : 'fa-floppy-disk'}" style="font-size: 1em; margin-bottom: 2px;"></i>
                    <span style="font-size: 0.6em; font-weight: 900;">${esDigital ? 'DIGITAL' : 'FÍSICO'}</span>
                </div>
                
                <div style="flex: 1; background: ${bgRareza}; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 0.75em; color: ${bgRareza}; font-weight: 900; line-height: 1;">${(j["Rareza"] || "COMÚN").toUpperCase()}</span>
                </div>

                <div style="flex: 1; background: rgba(46, 158, 127, 0.15); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 0.5em; color: #2e9e7f; font-weight: 900;">VALOR APROX</span>
                    <span style="font-size: 0.85em; color: #fff; font-weight: 900; line-height: 1;">${j["Tasación Actual"] || "S/T"}</span>
                    <div style="font-size: 0.45em; color: #555; margin-top: 2px; font-weight: bold;">${j["Fecha revision"] || '--/--'}</div>
                </div>
            </div>
        </div>`;
    } catch (e) { 
        console.error("Error en card games:", e);
        return ""; 
    }
}
