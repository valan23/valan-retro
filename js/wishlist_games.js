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

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
        const carpetaSistema = platformMap[valorExcel] || valorExcel.toLowerCase().replace(/\s+/g, '');
        const fotoUrl = isValid(j["Portada"]) ? `images/covers/${carpetaSistema}/${j["Portada"].trim()}` : `images/covers/default.webp`;
        
        const style = getRegionStyle(j["Región"]);
        const colorPrioridad = getColorForPrioridad(j["Prioridad"]);

        const listaPrecios = [
            { nombre: 'Nuevo', valor: j["Precio Nuevo"], eur: obtenerValorEnEuros(j["Precio Nuevo"]), color: '#D4BD66' },
            { nombre: 'CeX', valor: j["Precio Cex"], eur: obtenerValorEnEuros(j["Precio Cex"]), color: '#ff0000' }, 
            { nombre: 'Wallapop', valor: j["Precio Wallapop"], eur: obtenerValorEnEuros(j["Precio Wallapop"]), color: '#2E9E7F' },
            { nombre: 'eBay', valor: j["Precio Ebay"], eur: obtenerValorEnEuros(j["Precio Ebay"]), color: '#0064d2' },
            { nombre: 'Surugaya', valor: j["Precio Surugaya"], eur: obtenerValorEnEuros(j["Precio Surugaya"]), color: '#5da9ff' },
            { nombre: 'Mercari', valor: j["Precio Mercari"], eur: obtenerValorEnEuros(j["Precio Mercari"]), color: '#59C0C2' }
        ];

        const preciosValidos = listaPrecios.filter(p => isValid(p.valor));
        const precioMinimoEur = Math.min(...preciosValidos.map(p => p.eur));

        return `
        <div class="card" style="position: relative; padding-bottom: 55px; display: flex; flex-direction: column; overflow: hidden; min-height: 420px;">
            
            <div style="position: absolute; top: 0; right: 0; background-color: ${colorPrioridad}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; border-bottom-left-radius: 8px; z-index: 10;">
                ${(j["Prioridad"] || "MEDIA").toUpperCase()}
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding-left: 0;">
                <div class="platform-icon-card" style="font-size: 1.2em; height: 24px; display: flex; align-items: center; margin: 0; padding: 0;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>
                <div style="display: flex; align-items: center; gap: 8px; height: 22px; margin: 0; padding: 0;">
                    <span class="year-tag" style="background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 500; margin: 0; line-height: 1;">
                        ${j["Año"] || "????"}
                    </span>
                    <div class="region-badge-container" style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px; margin: 0; line-height: 1;">
                        ${getFlag(j["Región"])} 
                        <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">
                            ${j["Región"] || "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 160px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 15px; padding: 10px;"> 
                <img src="${fotoUrl}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px; filter: drop-shadow(0px 8px 12px rgba(0,0,0,0.6));">
            </div>

            <div style="border-left: 3px solid #555; padding-left: 12px; margin-bottom: 12px; height: 65px; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
                <div class="game-title" style="line-height: 1.2; font-family: 'Segoe UI', sans-serif; font-weight: 600; font-size: 1.1em; color: #EFC36C; letter-spacing: 0.2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? 
                    `<div style="font-family: 'MS Mincho', serif; font-size: 0.85em; color: #aaa; margin-top: 4px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${j["Nombre Japones"]}</div>` 
                    : `<div style="height: 14px;"></div>`
                }
            </div>

            <div class="details-grid" style="font-family: 'Segoe UI', sans-serif; font-size: 0.72em; line-height: 1.5; height: 140px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; display: grid !important; grid-template-columns: 1fr 1fr; gap: 6px; align-content: start; overflow: hidden;">
                ${preciosValidos.map(p => {
                    const esElMasBarato = p.eur === precioMinimoEur && p.eur !== Infinity;
                    const accentColor = "#9500ff";
                    
                    // Sombreado púrpura sutil para el fondo de la celda si es el más barato
                    const bgStyle = esElMasBarato 
                        ? `background: linear-gradient(135deg, rgba(149, 0, 255, 0.25) 0%, rgba(149, 0, 255, 0.05) 100%); border-radius: 4px; box-shadow: 0 0 5px rgba(149, 0, 255, 0.2);` 
                        : `background: transparent;`;

                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; ${bgStyle} padding: 2px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="color: ${p.color}; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%;">
                            ${esElMasBarato ? '❗' : ''}${p.nombre}
                        </span>
                        <span style="color: ${esElMasBarato ? '#d199ff' : '#eee'}; font-weight: ${esElMasBarato ? '900' : '500'}; text-align: right;">
                            ${p.valor}
                        </span>
                    </div>`;
                }).join('')}
            </div>

            <div style="position: absolute; bottom: 12px; left: 15px; right: 15px; height: 45px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                <div style="font-size: 0.65em; color: #777; font-style: italic; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-regular fa-calendar-check" style="opacity: 0.6;"></i>
                    ${isValid(j["Fecha revision"]) ? j["Fecha revision"] : 'Sin fecha'}
                </div>
                ${isValid(j["Link"]) ? `
                    <a href="${j["Link"].trim()}" target="_blank" style="text-decoration: none; display: flex; align-items: center; gap: 6px; background: rgba(149, 0, 255, 0.2); border: 1px solid #9500ff; padding: 5px 12px; border-radius: 20px; color: #fff; font-size: 0.7em; font-weight: bold; transition: all 0.2s ease;">
                        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.9em;"></i> MEJOR PRECIO
                    </a>
                ` : '<span style="font-size: 0.65em; color: #444; font-style: italic;">Sin enlace</span>'}
            </div>
        </div>`;
    }).join('');
}
