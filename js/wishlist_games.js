function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

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
            if (typeof AppUtils === 'undefined') return "";

            const plataforma = j["Plataforma"] || "";
            const carpeta = AppUtils.getPlatformFolder(plataforma);
            const portadaNombre = j["Portada"] ? j["Portada"].trim() : "";
            const fotoUrl = AppUtils.isValid(portadaNombre) 
                ? `images/covers/${carpeta}/${portadaNombre}` 
                : `images/covers/default.webp`;

            // --- LÓGICA DE PRIORIDAD ---
            const priorTexto = (j["Prioridad"] || "DESEADO").trim().toUpperCase();
            let colorPrioridad = "#333"; // Color por defecto (Gris)

            if (priorTexto.includes("CRÍTICO")) colorPrioridad = "#D63B18";    // Rojo intenso
            else if (priorTexto.includes("PRINCIPAL")) colorPrioridad = "#00A3D9";     // Azul/Cian
            else if (priorTexto.includes("BONUS")) colorPrioridad = "#EFC36C"; // Dorado/Amarillo
            
            // Si es Principal o Bonus, el texto negro suele leerse mejor que blanco
            const colorTextoPrior = (priorTexto.includes("PRINCIPAL") || priorTexto.includes("BONUS")) ? "#000" : "#fff";
            // ---------------------------

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
            <div class="card ${typeof getBrandClass === 'function' ? getBrandClass(plataforma) : ''}" style="display: flex; flex-direction: column; min-height: 520px; position: relative; overflow: hidden;">
                
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                    <div class="icon-gradient-area">
                        <div class="platform-icon-card" style="margin: 0; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.6));">
                            ${typeof getPlatformIcon === 'function' ? getPlatformIcon(plataforma) : ''}
                        </div>
                    </div>
                    
                    <div style="background: ${colorPrioridad}; color: ${colorTextoPrior}; font-weight: 900; font-size: 0.7em; padding: 0 15px; display: flex; align-items: center; border-bottom-left-radius: 12px; box-shadow: -2px 0 10px rgba(0,0,0,0.3); transition: all 0.3s ease;">
                        ${priorTexto}
                    </div>
                </div>
                
                <div style="margin-top: 55px; padding: 0 12px;">
                    <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; min-height: 2.4em; display: flex; align-items: center; padding: 0;">
                        ${j["Nombre Juego"]}
                    </div>
                </div>

                <div style="height: 150px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
                </div>

                <div style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 6px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
                    ${listaPrecios.map(p => `
                        <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-radius: 4px; ${p.eur === precioMin && p.eur !== Infinity ? 'background: rgba(149,0,255,0.15); border: 1px solid rgba(149,0,255,0.3);' : 'background: rgba(255,255,255,0.02);'}">
                            <span style="color: ${p.c}; font-size: 0.75em; font-weight: 700;">${p.eur === precioMin && p.eur !== Infinity ? '⭐ ' : ''}${p.n}</span>
                            <span style="color: #eee; font-size: 0.8em; font-weight: 800;">${p.v}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 10px; height: 50px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: stretch; justify-content: space-between;">
                    
                    <div style="background: ${esDigital ? '#00f2ff' : '#EFC36C'}; color: #000; font-weight: 900; font-size: 0.65em; padding: 0 15px; display: flex; align-items: center; border-top-right-radius: 12px;">
                        <i class="fa-solid ${esDigital ? 'fa-cloud-download' : 'fa-compact-disc'}" style="margin-right: 6px;"></i>
                        ${esDigital ? 'DIGITAL' : 'FÍSICO'}
                    </div>

                    <div style="padding: 5px 12px; display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
                        ${AppUtils.isValid(j["Link"]) ? 
                            `<a href="${j["Link"]}" target="_blank" style="background: #9500ff; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 0.6em; font-weight: 900; text-decoration: none; margin-bottom: 2px;">OFERTA</a>` : ''
                        }
                        <div style="font-size: 0.55em; color: #666; font-weight: bold; text-transform: uppercase;">Act: ${j["Fecha revision"] || '--/--'}</div>
                    </div>
                </div>
            </div>`;
        } catch (e) { 
            console.error("Error en card wishlist:", e);
            return ""; 
        }
    }).join('');
}
