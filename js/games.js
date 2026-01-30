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
        const colorComp = AppUtils.getCompletitudStyle(j["Completitud"]);
        const colorRareza = typeof AppUtils.getRarezaColor === 'function' ? AppUtils.getRarezaColor(j["Rareza"]) : "#ccc";
        
        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";

        // Mimetizamos el estilo de la Wishlist usando flexbox y estilos directos
        return `
        <div class="card ${getBrandClass(plat)}" style="display: flex; flex-direction: column; min-height: 520px; position: relative;">
            
            <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                ${getPlatformIcon(plat)}
            </div>

            <div style="position: absolute; top: 0; right: 0; background: ${colorComp}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 14px; border-bottom-left-radius: 8px; z-index: 10;">
                ${(j["Completitud"] || "???").toUpperCase()}
            </div>
            
            <div style="margin-top: 45px; padding: 0 12px;">
                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; min-height: 2.4em; display: flex; align-items: center; padding: 0;">
                    ${j["Nombre Juego"]}
                </div>
                <div style="display: flex; gap: 8px; align-items: center; margin-top: 5px;">
                    <span style="font-size: 0.7em; color: #888; font-weight: bold;">${j["Año"] || "????"}</span>
                    <div style="font-size: 0.6em; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text};">
                         ${getFlag(j["Región"])} ${j["Región"] || "N/A"}
                    </div>
                    <span style="font-size: 0.65em; font-weight: 800; color: ${colorRareza};">💎 ${j["Rareza"] || "COMÚN"}</span>
                </div>
            </div>

            <div style="height: 160px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 5px; right: 5px; font-size: 0.6em; padding: 2px 6px; border-radius: 3px; background: ${esDigital ? '#00f2ff33' : '#9500ff33'}; color: ${esDigital ? '#00f2ff' : '#9500ff'}; border: 1px solid currentColor;">
                    ${esDigital ? 'DIGITAL' : 'FÍSICO'}
                </div>
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

            <div style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.65em; color: #555;">Rev: ${j["Fecha revision"] || '--/--'}</span>
                <div style="color: var(--cyan); font-weight: 900; font-size: 0.85em;">💸 ${j["Tasación Actual"] || "S/T"}</div>
            </div>
        </div>`;
    } catch (e) { 
        console.error("Error en card games:", e);
        return ""; 
    }
}
