/**
 * wishlist_games.js - Especialista en renderizar la lista de deseos
 */

function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 50px; color: #888;">
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 3em; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No hay juegos en tu lista de deseos.</p>
            </div>`;
        return;
    }

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        // Mapeo para las carpetas de imágenes (Igual que en games.js)
        const platformMap = {
            "NES": "fc", "FAMICOM": "fc", "NINTENDO": "fc",
            "SUPER NINTENDO": "sfc", "SNES": "sfc"
        };
        
        const plataformaCSV = j["Plataforma"] ? j["Plataforma"].toUpperCase() : "";
        const carpetaSistema = platformMap[plataformaCSV] || plataformaCSV.toLowerCase().replace(/\s+/g, '');

        const fotoUrl = isValid(j["Portada"]) 
            ? `images/covers/${carpetaSistema}/${j["Portada"]}` 
            : `images/covers/default.webp`;

        // Usamos el color de acento de los deseados para la decoración
        const wishColor = "#00f2ff"; 

        return `
        <div class="card" style="position: relative; display: flex; flex-direction: column; min-height: 250px;">
            
            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; padding-right: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="platform-icon-card">${getPlatformIcon(j["Plataforma"])}</div>
                    <span class="year-tag">${j["Año"] || ""}</span>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; flex-grow: 1;">
                <div style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; max-width: 85px;"> 
                    <img src="${fotoUrl}" 
                         style="max-width: 85px; max-height: 110px; width: auto; height: auto; object-fit: contain; border-radius: 4px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.4));"
                         onerror="if (this.src.indexOf('default.webp') === -1) { this.src='images/covers/default.webp'; } else { this.onerror=null; this.src=''; }">
                </div>
                
                <div style="flex: 1; display: flex; align-items: center; border-left: 2px solid ${wishColor}; padding-left: 15px; min-height: 90px;">
                    <span class="game-title" style="margin: 0; line-height: 1.25; font-family: 'Segoe UI', sans-serif; font-weight: 700; font-size: 1.1em; color: #fff; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                        ${j["Nombre Juego"]}
                    </span>
                </div>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: flex-end;">
                <i class="fa-solid fa-heart" style="color: ${wishColor}; font-size: 0.9em; opacity: 0.6;"></i>
            </div>
        </div>`;
    }).join('');
}
