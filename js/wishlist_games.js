// wishlist_games.js - Gestión de Lista de Deseos

function renderWishlist(games) {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    container.innerHTML = "";

    if (!games || games.length === 0) {
        container.innerHTML = `
            <div style='grid-column:1/-1; text-align:center; padding:60px; color:#555;'>
                <i class="fa-solid fa-heart-crack" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <p style="font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">La lista de deseos está vacía o filtrada</p>
            </div>`;
        return;
    }

    const html = games.map(j => createWishlistCardHTML(j)).join('');
    container.innerHTML = html;
}

function createWishlistCardHTML(j) {
    try {
        if (typeof AppUtils === 'undefined') return "";

        const plat = j["Plataforma"] || "";
        const carpeta = AppUtils.getPlatformFolder(plat);
        const portada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;
        
        const styleRegion = AppUtils.getRegionStyle(j["Región"]);
        const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";
        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const rawRarezaColor = AppUtils.getRarezaColor(j["Rareza"]);

        // --- LÓGICA DE PRIORIDAD ---
        const priorRaw = (j["Prioridad"] || "NORMAL").trim().toUpperCase();
        let priorIconos = "🔥";
        let colorPrioridad = "#4D94FF";

        if (priorRaw.includes("MUY ALTA") || priorRaw.includes("CRÍTICO")) {
            priorIconos = "🔥🔥🔥";
            colorPrioridad = "#FF4D4D";
        } else if (priorRaw.includes("ALTA") || priorRaw.includes("PRINCIPAL")) {
            priorIconos = "🔥🔥";
            colorPrioridad = "#FFD700";
        }

        // --- LÓGICA DE PRECIOS ---
        const listaPrecios = [
            { n: 'Nuevo', v: j["Precio Nuevo"], c: '#D4BD66' },
            { n: 'CeX', v: j["Precio Cex"], c: '#ff4444' },
            { n: 'Wallapop', v: j["Precio Wallapop"], c: '#2E9E7F' },
            { n: 'eBay', v: j["Precio Ebay"], c: '#0064d2' },
            { n: 'Surugaya', v: j["Precio Surugaya"], c: '#5da9ff' },
            { n: 'Mercari', v: j["Precio Mercari"], c: '#59C0C2' }
        ].filter(p => AppUtils.isValid(p.v));

        // Calcular el precio más bajo (requiere AppUtils.obtenerValorEnEuros)
        let precioMinObj = { v: null };
        if (listaPrecios.length > 0) {
            precioMinObj = listaPrecios.reduce((prev, curr) => {
                const valPrev = AppUtils.obtenerValorEnEuros(prev.v);
                const valCurr = AppUtils.obtenerValorEnEuros(curr.v);
                return valPrev < valCurr ? prev : curr;
            });
        }

        const toRgba = (hex, alpha = 0.15) => {
            if (!hex || hex[0] !== '#') return `rgba(255,255,255,${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        return `
        <div class="card ${getBrandClass(plat)}">
            
            <div style="display: flex; height: 45px; align-items: stretch; position: relative; z-index: 10;">
                <div class="icon-gradient-area" style="flex: 1.2; display: flex; align-items: center; padding-left: 10px;">
                    ${getPlatformIcon(plat)}
                </div>
                <div style="flex: 0.8; background: ${toRgba(colorPrioridad, 0.25)}; border-left: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 0.5rem; color: ${colorPrioridad}; font-weight: 900; text-transform: uppercase;">Prioridad</span>
                    <span style="font-size: 0.8rem; line-height: 1;">${priorIconos}</span>
                </div>
            </div>

            <div style="padding: 15px 15px 0 15px; margin-left: 6px;">
                ${esEspecial ? `<div style="color: var(--cyan); font-size: 0.6rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;"><i class="fa-solid fa-star"></i> ${j["Edición"]}</div>` : '<div style="height:12px"></div>'}
                <div class="game-title" style="padding:0; line-height: 1.1; margin-bottom: 4px; color: #EFC36C;">${j["Nombre Juego"]}</div>
                <div style="font-size: 0.7rem; color: #666; font-family: 'Noto Sans JP', sans-serif; min-height: 14px;">${j["Nombre Japones"] || ""}</div>
                
                <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                    <div style="font-size: 0.55rem; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text}; font-weight: 900; display: flex; align-items: center; gap: 4px;">
                        ${getFlag(j["Región"])} ${j["Región"]}
                    </div>
                    <span style="font-size: 0.7rem; color: #555; font-weight: 800;">${j["Año"] || "????"}</span>
                </div>
            </div>

            <div style="height: 140px; margin: 15px; background: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.03);">
                <img src="${fotoUrl}" loading="lazy" style="max-width: 95%; max-height: 95%; object-fit: contain; opacity: 0.8;" onerror="this.src='images/covers/default.webp'">
            </div>

            <div style="margin: 0 15px; background: rgba(0,0,0,0.25); border-radius: 8px; padding: 10px; flex-grow: 1; display: flex; flex-direction: column; gap: 4px; border: 1px solid rgba(255,255,255,0.02);">
                ${listaPrecios.length > 0 ? listaPrecios.map(p => {
                    const esMinimo = p.v === precioMinObj.v;
                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 4px; ${esMinimo ? 'background: rgba(46, 158, 127, 0.15); border: 1px solid rgba(46, 158, 127, 0.3);' : ''}">
                        <span style="color: ${p.c}; font-size: 0.65rem; font-weight: 800; text-transform: uppercase;">${p.n}</span>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            ${esMinimo ? '<i class="fa-solid fa-tag" style="color: #2e9e7f; font-size: 0.6rem;"></i>' : ''}
                            <span style="color: ${esMinimo ? '#fff' : '#aaa'}; font-size: 0.75rem; font-weight: 900;">${p.v}</span>
                        </div>
                    </div>`;
                }).join('') : `<div style="text-align:center; color:#444; font-size:0.6rem; margin-top:20px;">SIN DATOS DE PRECIO</div>`}
            </div>

            <div style="margin-top: 15px; height: 55px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; align-items: stretch; margin-left: 6px;">
    
                <div style="flex: 1; background: ${bgFormato}; color: ${colorTextoFormato}; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom-left-radius: 11px;">
                    <i class="fa-solid ${esDigital ? 'fa-cloud-download' : 'fa-compact-disc'}" style="font-size: 1em; margin-bottom: 2px;"></i>
                    <span style="font-size: 0.6em; font-weight: 900;">${esDigital ? 'DIGITAL' : 'FÍSICO'}</span>
                </div>

                <div style="flex: 1; background: rgba(255,255,255,0.02); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2px;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 0.5em; color: #555; font-weight: 800; text-transform: uppercase;">1ª Fecha / Últ.</span>
                        <span style="font-size: 0.65em; color: #aaa; font-weight: 700;">${j["Primera fecha"] || '--/--'}</span>
                        <span style="font-size: 0.65em; color: #eee; font-weight: 800; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 1px; padding-top: 1px;">${j["Ultima fecha"] || '--/--'}</span>
                    </div>
                </div>

                <div style="flex: 1; background: rgba(46, 158, 127, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 4px;">
                    ${AppUtils.isValid(j["Link"]) ? 
                        `<a href="${j["Link"]}" target="_blank" style="background: #2e9e7f; color: #fff; padding: 3px 0; border-radius: 4px; font-size: 0.55em; font-weight: 900; text-decoration: none; width: 90%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-bottom: 4px;">
                            COMPRAR <i class="fa-solid fa-external-link" style="font-size: 0.8em;"></i>
                        </a>` : 
                        `<span style="color: #444; font-size: 0.5em; font-weight: bold; margin-bottom: 4px;">SIN LINK</span>`
                    }
                    <div style="font-size: 0.55em; color: #555; font-weight: bold;">${j["Fecha revision"] || '--/--'}</div>
                </div>
            </div>
        </div>`;
    } catch (e) {
        console.error("Error en card wishlist:", e);
        return "";
    }
}
