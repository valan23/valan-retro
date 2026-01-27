/**
 * wishlist_games.js - Versión Actualizada con Formato y Ediciones
 */

function obtenerValorEnEuros(precioStr) {
    if (!precioStr) return Infinity;
    const num = parseFloat(precioStr.replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(num)) return Infinity;
    if (precioStr.includes('¥') || precioStr.toLowerCase().includes('surugaya') || precioStr.toLowerCase().includes('mercari')) {
        return num / 180; 
    }
    return num;
}

function getColorForPrioridad(prioridad) {
    const p = prioridad ? prioridad.toString().toUpperCase() : "";
    if (p.includes("IMPRESCINDIBLE")) return "#FF4500"; 
    if (p.includes("PREFERIDO"))      return "#FFD700"; 
    if (p.includes("DESEADO"))         return "#00D4FF"; 
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

function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    // --- 1. LLAMADA AL FILTRO DE FORMATO ---
    // Pasamos los juegos, el ID del contenedor de botones y el prefijo 'wishlist'
    renderFormatFilters(games, 'format-buttons-container-wishlist', 'wishlist');

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    // --- 2. RENDERIZADO DE LAS TARJETAS ---
    container.innerHTML = games.map(j => {
        try {
            const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
            const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
            const carpetaSistema = platformMap[valorExcel] || valorExcel.toLowerCase().replace(/\s+/g, '');
            const fotoUrl = isValid(j["Portada"]) ? `images/covers/${carpetaSistema}/${j["Portada"].trim()}` : `images/covers/default.webp`;

            const style = getRegionStyle(j["Región"]);
            
            // --- LÓGICA DE FORMATO Y EDICIÓN ---
            const campoFormato = j["Formato"] || "Físico";
            const esDigital = campoFormato.toString().toUpperCase().includes("DIGITAL");
            
            const edicionRaw = j["Edición"] || "";
            const esEdicionEspecial = isValid(edicionRaw) && edicionRaw.toUpperCase() !== "ESTÁNDAR";

            // --- CÁLCULO DE PRECIOS ---
            const listaPrecios = [
                { nombre: 'Nuevo', valor: j["Precio Nuevo"], eur: obtenerValorEnEuros(j["Precio Nuevo"]), color: '#D4BD66' },
                { nombre: 'CeX', valor: j["Precio Cex"], eur: obtenerValorEnEuros(j["Precio Cex"]), color: '#ff0000' }, 
                { nombre: 'Wallapop', valor: j["Precio Wallapop"], eur: obtenerValorEnEuros(j["Precio Wallapop"]), color: '#2E9E7F' },
                { nombre: 'eBay', valor: j["Precio Ebay"], eur: obtenerValorEnEuros(j["Precio Ebay"]), color: '#0064d2' },
                { nombre: 'Surugaya', valor: j["Precio Surugaya"], eur: obtenerValorEnEuros(j["Precio Surugaya"]), color: '#5da9ff' },
                { nombre: 'Mercari', valor: j["Precio Mercari"], eur: obtenerValorEnEuros(j["Precio Mercari"]), color: '#59C0C2' }
            ];

            const preciosValidos = listaPrecios.filter(p => isValid(p.valor));
            const precioMinimoEur = preciosValidos.length > 0 ? Math.min(...preciosValidos.map(p => p.eur)) : Infinity;

            const priorTexto = (j["Prioridad"] || "DESEADO").trim().toUpperCase();
            const colorPrioridad = getColorForPrioridad(priorTexto);
            
            const rarezaTexto = (j["Rareza"] || "COMÚN").trim().toUpperCase();
            const rarezaPorcentaje = { "LEGENDARIO": 100, "ÉPICO": 80, "RARO": 60, "INUSUAL": 40, "COMÚN": 20 }[rarezaTexto] || 20;

            return `
            <div class="card" style="position: relative; padding-bottom: 55px; display: flex; flex-direction: column; overflow: hidden; min-height: 480px; background: #1e1e24; border: 1px solid #3d3d4a;">
                
                <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10; background: transparent; width: auto; height: 28px; display: flex; align-items: center;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>

                <div style="position: absolute; top: 0; right: 0; background-color: ${colorPrioridad}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 14px; border-bottom-left-radius: 8px; z-index: 10; display: flex; align-items: center; box-shadow: -2px 2px 5px rgba(0,0,0,0.4);">
                    ${priorTexto}
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
                         <div style="font-family: 'Segoe UI', sans-serif; font-size: 0.75em; font-weight: 800; color: ${getColorForRareza(rarezaTexto)}; display: flex; align-items: center; gap: 4px;">
                            <span style="filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">💎</span>
                            <span style="letter-spacing: 0.5px;">${rarezaTexto}</span>
                        </div>
                        <div style="width: 75px; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                             <div style="width: ${rarezaPorcentaje}%; height: 100%; background-color: ${getColorForRareza(rarezaTexto)}; box-shadow: 0 0 8px ${getColorForRareza(rarezaTexto)}cc;"></div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 12px; padding: 5px 0 5px 12px; border-left: 2px solid ${esDigital ? '#00d4ff' : '#555'}; margin-right: 12px;">
                    <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${j["Nombre Juego"]}
                    </div>
                    
                    ${esEdicionEspecial ? `
                        <div style="font-size: 0.75em; color: #aaa; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-star" style="color: #EFC36C; font-size: 0.8em;"></i>
                            <span style="text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${edicionRaw}</span>
                        </div>
                    ` : ''}

                    ${isValid(j["Nombre Japones"]) ? 
                        `<div style="font-family: 'MS Mincho', serif; font-size: 0.65em; color: #888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${j["Nombre Japones"]}</div>` 
                        : ''}
                </div>

                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 160px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);"> 
                    
                    <div style="position: absolute; top: 8px; right: 8px; background: ${esDigital ? '#00d4ff' : '#555'}; color: ${esDigital ? '#000' : '#fff'}; font-size: 0.55em; font-weight: 900; padding: 2px 6px; border-radius: 4px; z-index: 5; letter-spacing: 0.5px;">
                        ${esDigital ? '<i class="fa-solid fa-cloud"></i> DIGITAL' : '<i class="fa-solid fa-compact-disc"></i> FÍSICO'}
                    </div>

                    <img src="${fotoUrl}" style="max-width: 95%; max-height: 95%; object-fit: contain; filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.5)); ${esDigital ? 'opacity: 0.7;' : ''}">
                </div>

                <div class="details-grid" style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 6px; font-size: 0.75em; display: flex; flex-direction: column; gap: 2px;">
                   ${preciosValidos.slice(0, 6).map(p => {
                       const esElMasBarato = p.eur === precioMinimoEur && p.eur !== Infinity;
                       const bgStyle = esElMasBarato 
                           ? `background: linear-gradient(90deg, rgba(149, 0, 255, 0.3) 0%, rgba(149, 0, 255, 0.05) 100%); 
                              border: 1px solid rgba(149, 0, 255, 0.5); 
                              border-radius: 4px;` 
                           : `border-bottom: 1px solid rgba(255,255,255,0.03);`;

                       return `
                       <div style="display: flex; justify-content: space-between; align-items: center; ${bgStyle} padding: 4px 8px;">
                           <span style="color: ${esElMasBarato ? '#fff' : p.color}; font-weight: ${esEdicionEspecial && p.nombre === 'Nuevo' ? '900' : (esElMasBarato ? '800' : '600')}; display: flex; align-items: center; gap: 5px;">
                               ${esElMasBarato ? '⭐ ' : ''} ${p.nombre}
                           </span>
                           <span style="color: ${esElMasBarato ? '#00ff88' : '#eee'}; font-weight: 900;">
                               ${p.valor}
                           </span>
                       </div>`;
                   }).join('')}
                </div>

                <div class="card-footer" style="position: absolute; bottom: 12px; left: 15px; right: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.65em; color: #666; font-style: italic;">
                        <i class="fa-regular fa-calendar-check"></i> ${isValid(j["Fecha revision"]) ? j["Fecha revision"] : 'Sin fecha'}
                    </div>
                    ${isValid(j["Link"]) ? `
                       <a href="${j["Link"].trim()}" target="_blank" style="text-decoration: none; background: rgba(149, 0, 255, 0.2); border: 1px solid #9500ff; padding: 4px 10px; border-radius: 20px; color: #fff; font-size: 0.65em; font-weight: bold;">
                           MEJOR PRECIO
                       </a>
                    ` : ''}
                </div>
            </div>`;
        } catch (e) {
            console.error("Error renderizando wishlist:", e, j);
            return "";
        }
    }).join('');
}
