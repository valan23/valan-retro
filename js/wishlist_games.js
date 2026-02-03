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

            const plat = j["Plataforma"] || "";
            const carpeta = AppUtils.getPlatformFolder(plat);
            const portada = j["Portada"] ? j["Portada"].trim() : "";
            const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;
            
            const toRgba = (hex, alpha = 0.15) => {
                if (!hex || typeof hex !== 'string' || hex[0] !== '#') return `rgba(255,255,255,${alpha})`;
                const r = parseInt(hex.slice(1, 3), 16), 
                      g = parseInt(hex.slice(3, 5), 16), 
                      b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            // --- DEFINICIONES DE ESTADO Y REGIÓN ---
            const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";
            const styleRegion = AppUtils.getRegionStyle(j["Región"]);

            // --- NUEVA LÓGICA DE PRIORIDAD (FUEGOS) ---
            const priorRaw = (j["Prioridad"] || "NORMAL").trim().toUpperCase();
            let priorIconos = "🔥";
            let colorPrioridad = "#4D94FF"; // Azul por defecto (Normal)

            if (priorRaw.includes("MUY ALTA") || priorRaw.includes("CRÍTICO")) {
                priorIconos = "🔥🔥🔥";
                colorPrioridad = "#FF4D4D"; // Rojo
            } else if (priorRaw.includes("ALTA") || priorRaw.includes("PRINCIPAL")) {
                priorIconos = "🔥🔥";
                colorPrioridad = "#FFD700"; // Amarillo
            } else if (priorRaw.includes("NORMAL") || priorRaw.includes("BONUS")) {
                priorIconos = "🔥";
                colorPrioridad = "#4D94FF"; // Azul
            }
            
            // --- CÁLCULO DE MEJOR PRECIO ---
            const listaPrecios = [
                { n: 'Nuevo', v: j["Precio Nuevo"], c: '#D4BD66' },
                { n: 'CeX', v: j["Precio Cex"], c: '#ff4444' },
                { n: 'Wallapop', v: j["Precio Wallapop"], c: '#2E9E7F' },
                { n: 'eBay', v: j["Precio Ebay"], c: '#0064d2' },
                { n: 'Surugaya', v: j["Precio Surugaya"], c: '#5da9ff' },
                { n: 'Mercari', v: j["Precio Mercari"], c: '#59C0C2' }
            ].filter(p => AppUtils.isValid(p.v)).map(p => ({...p, eur: AppUtils.obtenerValorEnEuros(p.v)}));

            const precioMinObj = listaPrecios.length 
                ? listaPrecios.reduce((prev, curr) => (prev.eur < curr.eur) ? prev : curr) 
                : { v: "--", n: "N/A" };

            const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
            const bgFormato = esDigital ? 'rgba(0, 212, 255, 0.15)' : 'rgba(239, 195, 108, 0.15)';
            const colorTextoFormato = esDigital ? '#00d4ff' : '#EFC36C';
            const rawRarezaColor = AppUtils.getRarezaColor(j["Rareza"]);

            return `
            <div class="card ${getBrandClass(plat)}" style="display: flex; flex-direction: column; min-height: 520px; position: relative; overflow: hidden; border-radius: 12px;">
                
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                    <div class="icon-gradient-area" style="flex: 0 0 60%; border-top-left-radius: 11px; display: flex; align-items: center; justify-content: center;">
                        <div class="platform-icon-card" style="margin: 0; filter: none;">
                            ${getPlatformIcon(plat)}
                        </div>
                    </div>
                    
                    <div style="flex: 0 0 40%; background: ${toRgba(colorPrioridad, 0.2)}; color: ${colorPrioridad}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 -1px 0 rgba(255,255,255,0.1); border-left: 1px solid ${toRgba(colorPrioridad, 0.3)}; line-height: 1;">
                        <span style="font-size: 0.85em; margin-bottom: 2px;">${priorIconos}</span>
                        <span style="font-weight: 900; font-size: 0.55em; text-transform: uppercase; letter-spacing: 0.5px;">${priorRaw}</span>
                    </div>
                </div>
                
                <div style="margin-top: 55px; padding: 0 12px;">
                    ${esEspecial ? 
                        `<div style="color: var(--cyan); font-size: 0.65em; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">
                            <i class="fa-solid fa-star" style="font-size: 0.9em;"></i> ${j["Edición"]}
                        </div>` : 
                        `<div style="height: 12px;"></div>` /* Espaciador si no hay edición para mantener alineación */
                    }

                    <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2; display: flex; align-items: center; padding: 0;">
                        ${j["Nombre Juego"]}
                    </div>

                    <div style="font-size: 0.7em; color: #888; font-family: 'Noto Sans JP', sans-serif; min-height: 1.2em; margin-top: 2px;">
                        ${j["Nombre Japones"] || ""}
                    </div>
                    
                    <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
                         <span style="font-size: 0.7em; color: #888; font-weight: bold;">${j["Año"] || "????"}</span>
                         <div style="font-size: 0.6em; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text};">
                              ${getFlag(j["Región"])} ${j["Región"] || "N/A"}
                         </div>
                     </div>
                </div>

                <div style="height: 150px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
                </div>

                <div style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 6px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
                    ${listaPrecios.map(p => `
                        <div style="display: flex; justify-content: space-between; padding: 3px 8px; border-radius: 4px; ${p.v === precioMinObj.v ? 'background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.2);' : ''}">
                            <span style="color: ${p.c}; font-size: 0.7em; font-weight: 700; text-transform: uppercase;">${p.n}</span>
                            <span style="color: #eee; font-size: 0.75em; font-weight: 800;">${p.v}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 10px; height: 55px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: stretch; overflow: hidden; position: relative;">
                    <div style="flex: 1; background: ${bgFormato}; color: ${colorTextoFormato}; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <i class="fa-solid ${esDigital ? 'fa-cloud-download' : 'fa-floppy-disk'}" style="font-size: 1em; margin-bottom: 2px;"></i>
                        <span style="font-size: 0.6em; font-weight: 900;">${esDigital ? 'DIGITAL' : 'FÍSICO'}</span>
                    </div>

                    <div style="flex: 1; background: ${toRgba(rawRarezaColor, 0.15)}; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                        <span style="font-size: 0.7em; color: ${rawRarezaColor}; font-weight: 900; line-height: 1;">${(j["Rareza"] || "COMÚN").toUpperCase()}</span>
                    </div>

                    <div style="flex: 1; background: rgba(149, 0, 255, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative;">
                        ${AppUtils.isValid(j["Link"]) ? 
                            `<a href="${j["Link"]}" target="_blank" style="position: absolute; top: -12px; right: 5px; background: #9500ff; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.55em; font-weight: 900; text-decoration: none; box-shadow: 0 2px 5px rgba(0,0,0,0.5); z-index: 20;">OFERTA <i class="fa-solid fa-external-link"></i></a>` : ''
                        }
                        <div style="font-size: 0.45em; color: #555; margin-top: 2px; font-weight: bold;">${j["Fecha revision"] || '--/--'}</div>
                    </div>
                </div>
            </div>`;
        } catch (e) { 
            console.error("Error en card wishlist:", e);
            return ""; 
        }
    }).join('');
}
