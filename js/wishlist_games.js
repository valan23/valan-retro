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

        // --- LÓGICA DE PRECIOS ---
        const listaPrecios = [
            { nombre: 'Nuevo', valor: j["Precio Nuevo"], eur: obtenerValorEnEuros(j["Precio Nuevo"]), color: '#D4BD66' },
            { nombre: 'Wallapop', valor: j["Precio Wallapop"], eur: obtenerValorEnEuros(j["Precio Wallapop"]), color: '#2E9E7F' },
            { nombre: 'eBay', valor: j["Precio Ebay"], eur: obtenerValorEnEuros(j["Precio Ebay"]), color: '#e53238' },
            { nombre: 'Surugaya', valor: j["Precio Surugaya"], eur: obtenerValorEnEuros(j["Precio Surugaya"]), color: '#5da9ff' },
            { nombre: 'Mercari', valor: j["Precio Mercari"], eur: obtenerValorEnEuros(j["Precio Mercari"]), color: '#59C0C2' }
        ];

        const preciosValidos = listaPrecios.filter(p => isValid(p.valor));
        const precioMinimoEur = Math.min(...preciosValidos.map(p => p.eur));

        return `
        <div class="card" style="position: relative; padding-bottom: 50px; display: flex; flex-direction: column; overflow: hidden; min-height: 420px;">
            
            <div style="position: absolute; top: 0; right: 0; background-color: ${colorPrioridad}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; border-bottom-left-radius: 8px; z-index: 10;">
                ${(j["Prioridad"] || "MEDIA").toUpperCase()}
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding-left: 5px;">
                <div class="platform-icon-card" style="font-size: 1.2em;">${getPlatformIcon(j["Plataforma"])}</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="year-tag" style="background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee;">${j["Año"] || "????"}</span>
                    <div class="region-badge-container" style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px;">
                        ${getFlag(j["Región"])} <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 160px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 15px; padding: 10px;"> 
                <img src="${fotoUrl}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px; filter: drop-shadow(0px 8px 12px rgba(0,0,0,0.6));">
            </div>

            <div style="border-left: 3px solid #555; padding-left: 12px; margin-bottom: 12px; min-height: 55px; display: flex; flex-direction: column; justify-content: center;">
                <div class="game-title" style="line-height: 1.3; font-family: 'Segoe UI', sans-serif; font-weight: 600; font-size: 1.1em; color: #F7E2B7;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? `<div style="font-family: 'MS Mincho', serif; font-size: 0.85em; color: #aaa; margin-top: 8px;">${j["Nombre Japones"]}</div>` : ''}
            </div>

            <div class="wishlist-prices-table" style="width: 100%; margin-top: 5px; font-family: 'Segoe UI', sans-serif; font-size: 0.75em; min-height: 110px; display: flex; flex-direction: column; gap: 2px;">
                ${preciosValidos.map(p => {
                    const esElMasBarato = p.eur === precioMinimoEur && p.eur !== Infinity;
                    const colorDestaque = "#00f2ff"; // Cian vibrante

                    return `
                    <div style="display: grid; grid-template-columns: 20px 1fr 85px; align-items: center; 
                                padding: 4px 0; border-left: ${esElMasBarato ? `3px solid ${colorDestaque}` : '3px solid transparent'}; 
                                padding-left: 8px; transition: none;">
                        
                        <div style="display: flex; justify-content: center; align-items: center; color: ${colorDestaque};">
                            ${esElMasBarato ? '❗' : ''}
                        </div>

                        <div style="color: ${p.color}; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 5px;">
                            ${p.nombre}:
                        </div>

                        <div style="color: ${esElMasBarato ? colorDestaque : '#eee'}; font-weight: ${esElMasBarato ? '900' : '500'}; text-align: right; white-space: nowrap; font-size: ${esElMasBarato ? '1.1em' : '1em'};">
                            ${p.valor}
                        </div>
                    </div>`;
                }).join('')}
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: flex-end; position: absolute; bottom: 12px; left: 15px; right: 15px;">
                <i class="fa-solid fa-heart" style="color: #00f2ff; font-size: 0.9em; opacity: 0.6;"></i>
            </div>
        </div>`;
    }).join('');
}
