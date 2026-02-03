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
            
            // --- NUEVAS DEFINICIONES PARA EVITAR EL ERROR ---
            const edicion = j["Edición"] || "";
            const esEspecial = AppUtils.isValid(edicion);
            const region = j["Región"] || "N/A";
            const styleRegion = (typeof REGION_COLORS !== 'undefined' && REGION_COLORS[region]) 
                ? REGION_COLORS[region] 
                : { bg: "rgba(255,255,255,0.1)", text: "#fff", border: "rgba(255,255,255,0.2)" };

            // Función local para banderas si no existe la global
            const getFlag = (reg) => {
                const flags = { "JAP": "🇯🇵", "ESP": "🇪🇸", "USA": "🇺🇸", "EU": "🇪🇺", "UK": "🇬🇧" };
                return flags[reg] || "🌐";
            };

            // --- LÓGICA DE PRIORIDAD ---
            const priorTexto = (j["Prioridad"] || "DESEADO").trim().toUpperCase();
            let colorPrioridad = "#333"; 
            if (priorTexto.includes("CRÍTICO")) colorPrioridad = "#FF4D4D";
            else if (priorTexto.includes("PRINCIPAL")) colorPrioridad = "#00FF88";
            else if (priorTexto.includes("BONUS")) colorPrioridad = "#00D4FF";
            
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

            return `
            <div class="card ${typeof getBrandClass === 'function' ? getBrandClass(plataforma) : ''}" style="display: flex; flex-direction: column; min-height: 520px; position: relative; overflow: hidden;">
                
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                    <div class="icon-gradient-area">
                        <div class="platform-icon-card" style="margin: 0; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.6));">
                            ${typeof getPlatformIcon === 'function' ? getPlatformIcon(plataforma) : ''}
                        </div>
                    </div>
                    
                    <div style="background: ${colorPrioridad}; color: #000; font-weight: 900; font-size: 0.7em; padding: 0 15px; display: flex; align-items: center; border-bottom-left-radius: 12px; box-shadow: -2px 0 10px rgba(0,0,0,0.3);">
                        ${priorTexto}
                    </div>
                </div>
                
                <div style="margin-top: 55px; padding: 0 12px;">
                    ${esEspecial ? 
                        `<div style="color: #00d4ff; font-size: 0.65em; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">
                            <i class="fa-solid fa-star" style="font-size: 0.9em;"></i> ${edicion}
                        </div>` : 
                        `<div style="height: 12px;"></div>`
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
                             ${getFlag(region)} ${region}
                        </div>
                    </div>
                </div>

                <div style="height: 150px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
                    ${AppUtils.isValid(j["Link"]) ? 
                        `<a href="${j["Link"]}" target="_blank" style="position: absolute; bottom: 5px; right: 5px; background: #9500ff; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.6em; font-weight: 900; text-decoration: none; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">OFERTA <i class="fa-solid fa-external-link" style="margin-left:3px;"></i></a>` : ''
                    }
                </div>

                <div style="margin: 0 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 6px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
                    ${listaPrecios.map(p => `
                        <div style="display: flex; justify-content: space-between; padding: 3px 8px; border-radius: 4px; ${p.v === precioMinObj.v ? 'background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.2);' : ''}">
                            <span style="color: ${p.c}; font-size: 0.7em; font-weight: 700; text-transform: uppercase;">${p.n}</span>
                            <span style="color: #eee; font-size: 0.75em; font-weight: 800;">${p.v}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 15px; height: 55px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: stretch; background: rgba(0,0,0,0.2);">
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.5em; color: #888; text-transform: uppercase; font-weight: 800;">Formato</span>
                        <span style="font-size: 0.7em; color: ${esDigital ? '#00d4ff' : '#EFC36C'}; font-weight: 800;">
                            <i class="fa-solid ${esDigital ? 'fa-cloud' : 'fa-compact-disc'}" style="font-size: 0.9em;"></i> ${j["Formato"] || 'FÍSICO'}
                        </span>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.5em; color: #888; text-transform: uppercase; font-weight: 800;">Rareza</span>
                        <span style="font-size: 0.7em; color: #fff; font-weight: 800;">
                             <i class="fa-solid fa-star" style="color: #ffd700; font-size: 0.8em;"></i> ${j["Rareza"] || '---'}
                        </span>
                    </div>

                    <div style="flex: 1.2; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(149,0,255,0.05);">
                        <span style="font-size: 0.5em; color: #888; text-transform: uppercase; font-weight: 800;">Mínimo</span>
                        <span style="font-size: 0.85em; color: #fff; font-weight: 900; letter-spacing: -0.5px;">${precioMinObj.v}</span>
                        <span style="font-size: 0.45em; color: #555; font-weight: 700; margin-top: 1px;">ACT: ${j["Fecha revision"] || '--/--'}</span>
                    </div>
                </div>
            </div>`;
        } catch (e) { 
            console.error("Error en card wishlist:", e);
            return ""; 
        }
    }).join('');
}
