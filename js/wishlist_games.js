/**
 * wishlist_games.js - Versión Corregida: Ratio 180 y Sin Solapamientos
 */

function obtenerValorEnEuros(precioStr) {
    if (!precioStr) return Infinity;
    // Limpiamos el string: quitamos todo lo que no sea número, coma o punto
    const num = parseFloat(precioStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(num)) return Infinity;
    
    // Ratio actualizado a 1€ ≈ 180¥
    if (precioStr.includes('¥') || precioStr.toLowerCase().includes('surugaya') || precioStr.toLowerCase().includes('mercari')) {
        return num / 180; 
    }
    return num;
}

function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No hay juegos en la lista de deseos.</p>";
        return;
    }

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        // Lógica de carpetas para portadas
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
        const carpetaSistema = Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase()) 
            ? platformMap[Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase())] 
            : valorExcel.toLowerCase().replace(/\s+/g, '');

        const nombrePortada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = isValid(nombrePortada) ? `images/covers/${carpetaSistema}/${nombrePortada}` : `images/covers/default.webp`;

        // Estilos específicos de Wishlist
        const style = getRegionStyle(j["Región"]);
        const prioridadColor = j["Prioridad"] === "Alta" ? "#ff4d4d" : (j["Prioridad"] === "Media" ? "#ffcc00" : "#00ff88");

        return `
        <div class="card" style="position: relative; padding-bottom: 55px; display: flex; flex-direction: column; overflow: hidden; min-height: 460px; background: #1e1e24; border: 1px solid #3d3d4a;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
                <div class="platform-icon-card" style="font-size: 1.3em; padding: 10px 0 0 12px; opacity: 0.9;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>
                <div style="background-color: ${prioridadColor}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; border-bottom-left-radius: 8px; text-transform: uppercase;">
                    PRIORIDAD ${j["Prioridad"] || "---"}
                </div>
            </div>

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

                <div style="text-align: right;">
                    <div style="font-size: 0.6em; color: #888; text-transform: uppercase; font-weight: 800;">Target</div>
                    <div style="font-size: 0.9em; color: #00ff88; font-weight: bold;">${j["Precio Objetivo"] || "---"}</div>
                </div>
            </div>

            <div style="margin-bottom: 12px; padding: 5px 0 5px 12px; border-left: 2px solid #444;">
                <div class="game-title" style="font-size: 1.15em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? 
                    `<div style="font-family: 'MS Mincho', serif; font-size: 0.85em; color: #888; margin-top: 2px;">${j["Nombre Japones"]}</div>` 
                    : ''}
            </div>

            <div style="display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 170px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);"> 
                <img src="${fotoUrl}" style="max-width: 95%; max-height: 95%; object-fit: contain; opacity: 0.7; filter: grayscale(0.3) drop-shadow(0px 5px 10px rgba(0,0,0,0.5));">
            </div>

            <div class="details-grid" style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 10px; font-size: 0.72em; display: grid; grid-template-columns: 1fr; gap: 4px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: #999;">Notas:</span>
                    <span style="color: #eee;">${j["Notas de búsqueda"] || "Sin notas"}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #999;">Estado deseado:</span>
                    <span style="color: #eee; font-weight: bold;">${j["Estado Deseado"] || "Cualquiera"}</span>
                </div>
            </div>

            <div class="card-footer" style="position: absolute; bottom: 12px; left: 15px; right: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                <div style="font-size: 0.65em; color: #666;">
                    <i class="fa-solid fa-hourglass-half"></i> Añadido: ${j["Fecha añadido"] || "---"}
                </div>
                <div class="price-tag" style="background: #2a2a35; color: #EFC36C;">Wishlist</div>
            </div>
        </div>`;
    }).join('');
}
