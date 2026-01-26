/**
 * games.js - Especialista en renderizar la colección actual
 */

function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No se encontraron juegos.</p>";
        return;
    }

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
        const carpetaSistema = Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase()) 
            ? platformMap[Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase())] 
            : valorExcel.toLowerCase().replace(/\s+/g, '');

        const nombrePortada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = isValid(nombrePortada) ? `images/covers/${carpetaSistema}/${nombrePortada}` : `images/covers/default.webp`;

        const colorCompletitud = getCompletitudStyle(j["Completitud"]);
        const textoBadgeCompletitud = (j["Completitud"] || "???").toUpperCase();
        const style = getRegionStyle(j["Región"]);
        
        // Lógica de Rareza
        const rarezaMap = { "LEGENDARIO": 100, "ÉPICO": 80, "RARO": 60, "INUSUAL": 40, "COMÚN": 20 };
        const rarezaTexto = (j["Rareza"] || "COMÚN").toString().toUpperCase().trim();
        const rarezaPorcentaje = rarezaMap[rarezaTexto] || 20;
        const colorRareza = getColorForRareza(rarezaTexto);

        // --- NUEVA LÓGICA DE FORMATO ---
        const formato = (j["Formato"] || "Físico").toUpperCase().trim();
        const esDigital = formato.includes("DIGITAL");

        return `
        <div class="card" style="position: relative; padding-bottom: 55px; display: flex; flex-direction: column; overflow: hidden; min-height: 460px; background: #1e1e24; border: 1px solid #3d3d4a;">
    
            <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10; background: transparent; width: auto; height: 28px; display: flex; align-items: center;">
                ${getPlatformIcon(j["Plataforma"])}
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
                        ${getFlag(j["Región"])} 
                        <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                    </div>
                </div>
                <div style="flex-grow: 1;"></div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 80px;">
                     <div style="font-family: 'Segoe UI', sans-serif; font-size: 0.75em; font-weight: 800; color: ${colorRareza}; display: flex; align-items: center; gap: 4px;">
                        <span style="filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">💎</span>
                        <span style="letter-spacing: 0.5px;">${rarezaTexto}</span>
                    </div>
                    <div style="width: 75px; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                         <div style="width: ${rarezaPorcentaje}%; height: 100%; background-color: ${colorRareza}; box-shadow: 0 0 8px ${colorRareza}cc;"></div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 12px; padding: 5px 0 5px 12px; border-left: 2px solid ${esDigital ? '#00d4ff' : '#555'}; margin-right: 12px;">
                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? `<div style="font-family: 'MS Mincho', serif; font-size: 0.85em; color: #888; margin-top: 4px;">${j["Nombre Japones"]}</div>` : ''}
            </div>

            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 170px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);"> 
                
                <div style="position: absolute; top: 8px; right: 8px; background: ${esDigital ? '#00d4ff' : '#555'}; color: ${esDigital ? '#000' : '#fff'}; font-size: 0.55em; font-weight: 900; padding: 2px 6px; border-radius: 4px; z-index: 5; letter-spacing: 0.5px;">
                    ${esDigital ? '<i class="fa-solid fa-cloud"></i> DIGITAL' : '<i class="fa-solid fa-compact-disc"></i> FÍSICO'}
                </div>

                <img src="${fotoUrl}" style="max-width: 95%; max-height: 95%; object-fit: contain; filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.5)); ${esDigital ? 'opacity: 0.7;' : ''}">
            </div>

            ${esDigital ? `
                <div style="margin: 0 12px; background: rgba(0, 212, 255, 0.05); border: 1px dashed rgba(0, 212, 255, 0.2); border-radius: 6px; padding: 15px; text-align: center; color: #00d4ff; font-size: 0.7em; font-weight: bold;">
                   BIBLIOTECA VIRTUAL
                </div>
            ` : `
                <div class="details-grid" style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 10px; font-size: 0.72em; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                    ${[
                        { label: '📦Caja', val: j["Estado Caja"] },
                        { label: '📂Inserto', val: j["Estado Inserto"] },
                        { label: '📖Manual', val: j["Estado Manual"] },
                        { label: '💾Juego', val: j["Estado Juego"] },
                        { label: '🖼️Portada', val: j["Estado Portada"] },
                        { label: '🔖Obi', val: j["Estado Spinecard"] },
                        { label: '🎁Extras', val: j["Estado Extras"] }
                    ].filter(item => isValid(item.val)).map(item => `
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <span style="color: #999;">${item.label}:</span>
                            <span style="font-weight: bold;">${formatEstado(item.val)}</span>
                        </div>
                    `).join('')}
                </div>
            `}

            <div class="card-footer" style="position: absolute; bottom: 12px; left: 15px; right: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.65em; color: #666; font-style: italic;">
                    <i class="fa-regular fa-calendar-check"></i> ${isValid(j["Fecha revision"]) ? j["Fecha revision"] : 'Sin fecha'}
                </div>
                <div class="price-tag" style="display: flex; align-items: center; gap: 4px; padding: 5px 10px;">
                    <span style="font-size: 1.1em;">💸</span>
                    <span>${j["Tasación Actual"] || "S/T"}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}
