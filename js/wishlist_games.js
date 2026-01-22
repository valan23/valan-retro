/**
 * wishlist_games.js - Renderizado con Badge de Prioridad
 */

function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 50px; color: #888;">
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 3em; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No hay juegos en tu lista de deseos con estos filtros.</p>
            </div>`;
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
        
        const style = getRegionStyle(j["Región"]);
        const wishColor = "#00f2ff"; 
        const colorPrioridad = getColorForPrioridad(j["Prioridad"]);
        const textoPrioridad = (j["Prioridad"] || "MEDIA").toUpperCase();

        return `
        <div class="card" style="position: relative; padding-bottom: 50px; display: flex; flex-direction: column; overflow: hidden; min-height: 420px;">
            
            <div style="position: absolute; top: 0; right: 0; background-color: ${colorPrioridad}; 
                        color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; 
                        border-bottom-left-radius: 8px; box-shadow: -2px 2px 5px rgba(0,0,0,0.3); 
                        z-index: 10; white-space: nowrap;">
                ${textoPrioridad}
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding-left: 5px;">
                <div class="platform-icon-card" style="font-size: 1.2em;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="year-tag" style="margin: 0; background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 500;">
                        ${j["Año"] || "????"}
                    </span>
                    <div class="region-badge-container" style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px;">
                        ${getFlag(j["Región"])} 
                        <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 160px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 15px; padding: 10px;"> 
                <img src="${fotoUrl}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px; filter: drop-shadow(0px 8px 12px rgba(0,0,0,0.6));">
            </div>

            <div style="border-left: 3px solid #555; padding-left: 12px; margin-bottom: 12px; min-height: 55px; display: flex; flex-direction: column; justify-content: center;">
                <div class="game-title" style="margin: 0; line-height: 1.3; font-family: 'Segoe UI', sans-serif; font-weight: 600; font-size: 1.1em; color: #F7E2B7;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? `
                    <div style="font-family: 'MS Mincho', 'Sawarabi Mincho', serif; font-size: 0.85em; color: #aaa; margin-top: 8px; line-height: 1.1;">
                        ${j["Nombre Japones"]}
                    </div>
                ` : ''}
            </div>

            <div class="details-grid" style="font-family: 'Segoe UI', sans-serif; font-size: 0.8em; line-height: 1.6; min-height: 100px; align-content: start;">
                ${isValid(j["Precio Oficial"]) ? `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0;">
                        <span style="color: #ADADAD; font-weight: 500;">Oficial:</span> 
                        <span style="font-weight: bold; color: #00ff88;">${j["Precio Oficial"]}</span>
                    </div>` : ''}
    
                ${isValid(j["Precio Wallapop"]) ? `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0;">
                        <span style="color: #61cec2; font-weight: bold;">Wallapop:</span> 
                        <span style="font-weight: bold; color: #00ff88;">${j["Precio Wallapop"]}</span>
                    </div>` : ''}
    
                ${isValid(j["Precio Ebay"]) ? `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0;">
                        <span style="color: #e53238; font-weight: bold;">eBay:</span> 
                        <span style="font-weight: bold; color: #00ff88;">${j["Precio Ebay"]}</span>
                    </div>` : ''}
    
                ${isValid(j["Precio Surugaya"]) ? `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0;">
                        <span style="color: #5da9ff; font-weight: bold;">Surugaya:</span> 
                        <span style="font-weight: bold; color: #00ff88;">${j["Precio Surugaya"]}</span>
                    </div>` : ''}
    
                ${isValid(j["Precio Mercari"]) ? `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0;">
                        <span style="color: #ff4a4a; font-weight: bold;">Mercari:</span> 
            <span style="font-weight: bold; color: #00ff88;">${j["Precio Mercari"]}</span>
                    </div>` : ''}
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: flex-end; position: absolute; bottom: 12px; left: 15px; right: 15px;">
                <i class="fa-solid fa-heart" style="color: ${wishColor}; font-size: 0.9em; opacity: 0.6;"></i>
            </div>
        </div>`;
    }).join('');
}
