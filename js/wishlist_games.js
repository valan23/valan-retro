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
        // 1. Mapeo idéntico a games.js
        const platformMap = {
            "Famicom": "fc",
            "Famicom Disk System": "fds",
            "Super Famicom": "sfc",
        };
        
        const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
        
        const carpetaSistema = Object.keys(platformMap).find(
            key => key.toUpperCase() === valorExcel.toUpperCase()
        ) ? platformMap[Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase())] 
          : valorExcel.toLowerCase().replace(/\s+/g, '');

        const nombrePortada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = isValid(nombrePortada) 
            ? `images/covers/${carpetaSistema}/${nombrePortada}` 
            : `images/covers/default.webp`;

        const style = getRegionStyle(j["Región"]);
        
        // Colores y Prioridad
        const wishColor = "#00f2ff"; 
        const colorPrioridad = getColorForPrioridad(j["Prioridad"]);
        const textoPrioridad = (j["Prioridad"] || "Media").toUpperCase();

        return `
        <div class="card" style="position: relative; display: flex; flex-direction: column; min-height: 250px; padding-bottom: 20px;">
            
            <div class="grade-badge" style="background-color: ${colorPrioridad}; font-size: 0.65em; line-height: 1.1; text-align: center; display: flex; align-items: center; justify-content: center; padding: 4px;">
                ${textoPrioridad}
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; padding-right: 45px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="platform-icon-card">${getPlatformIcon(j["Plataforma"])}</div>
                    <span class="year-tag">${j["Año"] || ""}</span>
                </div>
                
                <div class="region-badge-container" style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px; width: fit-content;">
                    ${getFlag(j["Región"])} 
                    <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-grow: 1;">
                <div style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; max-width: 85px;"> 
                    <img src="${fotoUrl}" 
                         style="max-width: 85px; max-height: 110px; width: auto; height: auto; object-fit: contain; border-radius: 4px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.4));"
                         onerror="if (this.src.indexOf('default.webp') === -1) { this.src='images/covers/default.webp'; } else { this.onerror=null; this.src=''; }">
                </div>
                
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; border-left: 2px solid #555; padding-left: 15px; min-height: 90px;">
                    <span class="game-title" style="margin: 0; line-height: 1.2; font-family: 'Segoe UI', sans-serif; font-weight: 700; font-size: 1.1em; color: #fff; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                        ${j["Nombre Juego"]}
                    </span>
                    
                    ${isValid(j["Nombre Japones"]) ? `
                        <span style="display: block; font-family: 'MS Mincho', 'Sawarabi Mincho', serif; font-size: 0.8em; color: #aaa; margin-top: 4px; line-height: 1.2;">
                            ${j["Nombre Japones"]}
                        </span>
                    ` : ''}
                </div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: flex-end;">
                <i class="fa-solid fa-heart" style="color: ${wishColor}; font-size: 0.9em; opacity: 0.6;"></i>
            </div>
        </div>`;
    }).join('');
}
