/**
 * wishlist_games.js - Gestión de la Lista de Deseos
 */
function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    // Sincronización segura con dataStore
    if (typeof renderFormatFilters === 'function') {
        const fullData = (window.dataStore && window.dataStore['deseados']) ? window.dataStore['deseados'] : games;
        renderFormatFilters(fullData, 'format-buttons-container-wishlist', 'wishlist');
    }

    if (!games || games.length === 0) {
        container.innerHTML = "<div style='grid-column:1/-1; text-align:center; padding:50px; color:#888;'>No hay juegos que coincidan con los filtros.</div>";
        return;
    }

    container.innerHTML = games.map(j => {
        try {
            // Verificamos que AppUtils exista antes de usarlo
            if (typeof AppUtils === 'undefined') {
                console.error("Error: utils.js no ha cargado correctamente.");
                return "";
            }

            const plataforma = j["Plataforma"] || "";
            const carpeta = AppUtils.getPlatformFolder(plataforma);
            
            // Limpieza de nombre de portada y validación
            const portadaNombre = j["Portada"] ? j["Portada"].trim() : "";
            const fotoUrl = AppUtils.isValid(portadaNombre) 
                ? `images/covers/${carpeta}/${portadaNombre}` 
                : `images/covers/default.webp`;

            const priorTexto = (j["Prioridad"] || "DESEADO").trim().toUpperCase();
            
            const listaPrecios = [
                { n: 'Nuevo', v: j["Precio Nuevo"], c: '#D4BD66' },
                { n: 'CeX', v: j["Precio Cex"], c: '#ff4444' },
                { n: 'Wallapop', v: j["Precio Wallapop"], c: '#2E9E7F' },
                { n: 'eBay', v: j["Precio Ebay"], c: '#0064d2' },
                { n: 'Surugaya', v: j["Precio Surugaya"], c: '#5da9ff' },
                { n: 'Mercari', v: j["Precio Mercari"], c: '#59C0C2' }
            ].filter(p => AppUtils.isValid(p.v)).map(p => ({...p, eur: AppUtils.obtenerValorEnEuros(p.v)}));

            const precioMin = listaPrecios.length ? Math.min(...listaPrecios.map(p => p.eur)) : Infinity;

            return `
            <div class="card ${typeof getBrandClass === 'function' ? getBrandClass(plataforma) : ''}" style="display: flex; flex-direction: column; min-height: 520px; position: relative;">
                <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                    ${typeof getPlatformIcon === 'function' ? getPlatformIcon(plataforma) : ''}
                </div>
                <div style="position: absolute; top: 0; right: 0; background: #555; color: #fff; font-weight: 900; font-size: 0.65em; padding: 6px 14px; border-bottom-left-radius: 8px; z-index: 10;">${priorTexto}</div>
                
                <div style="margin-top: 45px; padding: 0 12px;">
                    <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; min-height: 2.4em; display: flex; align-items: center;">${j["Nombre Juego"]}</div>
                </div>

                <div style="height: 150px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
                </div>

                <div style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 6px; flex-grow: 1;">
                    ${listaPrecios.map(p => `
                        <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-radius: 4px; margin-bottom: 2px; ${p.eur === precioMin && p.eur !== Infinity ? 'background: rgba(149,0,255,0.2); border: 1px solid rgba(149,0,255,0.3);' : ''}">
                            <span style="color: ${p.c}; font-size: 0.75em; font-weight: 700;">${p.eur === precioMin && p.eur !== Infinity ? '⭐ ' : ''}${p.n}</span>
                            <span style="color: #eee; font-size: 0.8em; font-weight: 800;">${p.v}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.65em; color: #888;">Act: ${j["Fecha revision"] || '--/--'}</span>
                    ${AppUtils.isValid(j["Link"]) ? `<a href="${j["Link"]}" target="_blank" style="background: #9500ff; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.65em; font-weight: bold; text-decoration: none;">OFERTA</a>` : ''}
                </div>
            </div>`;
        } catch (e) { 
            console.error("Error en card:", e);
            return ""; 
        }
    }).join('');
}
