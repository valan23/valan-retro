/**
 * wishlist_games.js - Optimizado 2026
 */
const TASA_CAMBIO_YEN = 180;

// --- FUNCIONES DE APOYO (DEFINIDAS PARA EVITAR ERRORES) ---
function obtenerValorEnEuros(precioStr) {
    if (!precioStr || precioStr.toUpperCase() === "NA") return Infinity;
    const num = parseFloat(precioStr.toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(num)) return Infinity;

    const esTiendaJaponesa = precioStr.includes('¥') || 
                             precioStr.toLowerCase().includes('surugaya') || 
                             precioStr.toLowerCase().includes('mercari');

    return esTiendaJaponesa ? (num / TASA_CAMBIO_YEN) : num;
}

function getColorForPrioridad(prioridad) {
    const p = prioridad ? prioridad.toString().toUpperCase() : "";
    if (p.includes("IMPRESCINDIBLE")) return "#FF4500"; 
    if (p.includes("PREFERIDO"))      return "#FFD700"; 
    if (p.includes("DESEADO"))        return "#00D4FF"; 
    return "#555";
}

function getColorForRareza(rareza) {
    const r = rareza ? rareza.toString().toUpperCase() : "";
    if (r.includes("LEGENDARIO")) return "#EFC36C"; 
    if (r.includes("ÉPICO"))      return "#A335EE"; 
    if (r.includes("RARO"))       return "#0070DD"; 
    if (r.includes("INUSUAL"))    return "#1EFF00"; 
    if (r.includes("COMÚN"))      return "#FFFFFF"; 
    return "#888";
}

// --- RENDERIZADO PRINCIPAL ---
function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    if (typeof renderFormatFilters === 'function') {
        renderFormatFilters(games, 'format-buttons-container-wishlist', 'wishlist');
    }

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    // COLOR ÚNICO PARA TEXTOS SECUNDARIOS (Consistente con games.js)
    const secondaryTextColor = "#ced4da";

    container.innerHTML = games.map(j => {
        try {
            const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
            const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
            const carpetaSistema = platformMap[valorExcel] || valorExcel.toLowerCase().replace(/\s+/g, '');
            const fotoUrl = isValid(j["Portada"]) ? `images/covers/${carpetaSistema}/${j["Portada"].trim()}` : `images/covers/default.webp`;

            const style = typeof getRegionStyle === 'function' ? getRegionStyle(j["Región"]) : {bg: 'rgba(255,255,255,0.1)', text: '#eee', border: 'transparent'};
            const brandClass = typeof getBrandClass === 'function' ? getBrandClass(valorExcel) : "";
            
            const campoFormato = j["Formato"] || "Físico";
            const esDigital = campoFormato.toString().toUpperCase().includes("DIGITAL");
            
            const edicionRaw = j["Edición"] || "";
            const esEdicionEspecial = isValid(edicionRaw) && edicionRaw.toUpperCase() !== "ESTÁNDAR";

            const priorTexto = (j["Prioridad"] || "DESEADO").trim().toUpperCase();
            const colorPrioridad = getColorForPrioridad(priorTexto);
            const rarezaTexto = (j["Rareza"] || "COMÚN").trim().toUpperCase();
            const colorRareza = getColorForRareza(rarezaTexto);

            // Precios
            const listaPrecios = [
                { nombre: 'Nuevo', valor: j["Precio Nuevo"], eur: obtenerValorEnEuros(j["Precio Nuevo"]), color: '#D4BD66' },
                { nombre: 'CeX', valor: j["Precio Cex"], eur: obtenerValorEnEuros(j["Precio Cex"]), color: '#ff4444' }, 
                { nombre: 'Wallapop', valor: j["Precio Wallapop"], eur: obtenerValorEnEuros(j["Precio Wallapop"]), color: '#2E9E7F' },
                { nombre: 'eBay', valor: j["Precio Ebay"], eur: obtenerValorEnEuros(j["Precio Ebay"]), color: '#0064d2' },
                { nombre: 'Surugaya', valor: j["Precio Surugaya"], eur: obtenerValorEnEuros(j["Precio Surugaya"]), color: '#5da9ff' },
                { nombre: 'Mercari', valor: j["Precio Mercari"], eur: obtenerValorEnEuros(j["Precio Mercari"]), color: '#59C0C2' }
            ];

            const preciosValidos = listaPrecios.filter(p => isValid(p.valor));
            const precioMinimoEur = preciosValidos.length > 0 ? Math.min(...preciosValidos.map(p => p.eur)) : Infinity;

            return `
            <div class="card ${brandClass} ${esDigital ? 'digital-variant' : 'physical-variant'}" style="display: flex; flex-direction: column; min-height: 520px; position: relative;">
                
                <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                    ${typeof getPlatformIcon === 'function' ? getPlatformIcon(j["Plataforma"]) : ''}
                </div>

                <div style="position: absolute; top: 0; right: 0; background-color: ${colorPrioridad}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 14px; border-bottom-left-radius: 8px; z-index: 10; box-shadow: -2px 2px 5px rgba(0,0,0,0.4);">
                    ${priorTexto}
                </div>

                <div style="margin-top: 45px;"></div>

                <div style="display: flex; align-items: center; width: 100%; gap: 10px; margin-bottom: 15px; padding: 0 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 600;">
                            ${j["Año"] || "????"}
                        </span>
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px;">
                            ${typeof getFlag === 'function' ? getFlag(j["Región"]) : ''} 
                            <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                        </div>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <div style="font-size: 0.7em; font-weight: 800; color: ${colorRareza}; display: flex; align-items: center; gap: 3px;">
                        <span style="filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">💎</span>
                        <span>${rarezaTexto}</span>
                    </div>
                </div>

                <div style="margin-bottom: 12px; padding: 0 12px;">
                    <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                        ${j["Nombre Juego"]}
                    </div>
                    
                    ${isValid(j["Nombre Japones"]) ? `
                        <div style="font-size: 0.7em; color: ${secondaryTextColor}; margin-top: 3px; font-family: 'Noto Sans JP', sans-serif; opacity: 0.8;">
                            ${j["Nombre Japones"]}
                        </div>
                    ` : ''}

                    ${esEdicionEspecial ? `<div style="font-size: 0.7em; color: ${secondaryTextColor}; margin-top: 4px; opacity: 0.7;"><i class="fa-solid fa-star" style="color: #EFC36C;"></i> ${edicionRaw}</div>` : ''}
                </div>

                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 150px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px;"> 
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.5));">
                </div>

                <div style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 4px; flex-grow: 1;">
                    ${preciosValidos.length > 0 ? preciosValidos.map(p => {
                        const esElMasBarato = p.eur === precioMinimoEur && p.eur !== Infinity;
                        return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 4px; margin-bottom: 2px; ${esElMasBarato ? 'background: rgba(149, 0, 255, 0.15); border: 1px solid rgba(149, 0, 255, 0.3);' : ''}">
                            <span style="color: ${p.color}; font-size: 0.75em; font-weight: 700;">
                                ${esElMasBarato ? '⭐ ' : ''}${p.nombre}
                            </span>
                            <span style="color: ${esElMasBarato ? '#00ff88' : '#eee'}; font-size: 0.8em; font-weight: 800;">
                                ${p.valor}
                            </span>
                        </div>`;
                    }).join('') : '<div style="text-align:center; padding:10px; font-size:0.7em; color:#666;">Sin precios registrados</div>'}
                </div>

                <div style="padding: 12px; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.65em; color: ${secondaryTextColor}; font-style: italic; opacity: 0.8;">
                        <i class="fa-regular fa-calendar-check"></i> ${isValid(j["Fecha revision"]) ? j["Fecha revision"] : '--/--'}
                    </div>
                    ${isValid(j["Link"]) ? `
                       <a href="${j["Link"].trim()}" target="_blank" style="text-decoration: none; background: #9500ff; padding: 4px 10px; border-radius: 4px; color: #fff; font-size: 0.65em; font-weight: bold; text-transform: uppercase;">
                           Ver Oferta
                       </a>
                    ` : ''}
                </div>
            </div>`;
        } catch (e) {
            console.error("Error wishlist:", e);
            return "";
        }
    }).join('');
}
