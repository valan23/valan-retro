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
                <p>Tu lista de deseos está vacía o cargando...</p>
            </div>`;
        return;
    }

    container.innerHTML = games.map(j => {
        // Usamos las mismas funciones globales de main.js (getPlatformIcon)
        const platformIcon = getPlatformIcon(j["Plataforma"]);

        return `
        <div class="card wishlist-card" style="border: 1px dashed #444; background: rgba(255, 255, 255, 0.02); min-height: auto;">
            
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div class="platform-icon-card" style="background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px;">
                    ${platformIcon}
                </div>
                <span style="font-size: 0.75em; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                    ${j["Plataforma"] || "Consola"}
                </span>
            </div>

            <div style="flex: 1; display: flex; align-items: center; border-left: 2px solid #00f2ff; padding-left: 15px; min-height: 60px; margin-bottom: 10px;">
                <span class="game-title" style="
                    margin: 0; 
                    line-height: 1.3; 
                    font-family: 'Segoe UI', sans-serif; 
                    font-weight: 700; 
                    font-size: 1.1em; 
                    color: #00f2ff;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                ">
                    ${j["Nombre Juego"]}
                </span>
            </div>

            <div style="text-align: right; opacity: 0.2;">
                <i class="fa-solid fa-heart" style="font-size: 0.8em; color: #00f2ff;"></i>
            </div>
        </div>`;
    }).join('');
}
