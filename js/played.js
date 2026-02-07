/**
 * played.js - Diario de Juegos Finalizados
 */

function renderPlayed(games) {
    const container = document.getElementById('played-grid');
    if (!container) return;

    // 1. ACTUALIZACIÓN DINÁMICA DE FORMATOS
    if (typeof renderFormatFilters === 'function') {
        renderFormatFilters(games, 'format-buttons-container-played', 'played');
    }

    // 2. ACTUALIZACIÓN DINÁMICA DE AÑOS
    updateYearButtons(games);

    // 3. Aplicar el filtro de año local
    const filteredByYear = games.filter(j => {
        if (currentPlayedYear === 'all') return true;
        // Buscamos el año de finalización (4 dígitos) en cualquier campo de fecha
        const fechaVal = j["Ultima fecha"] || j["Ultima Fecha"] || j["Última Fecha"] || j["Año"] || "";
        return String(fechaVal).includes(currentPlayedYear);
    });

    // 4. Renderizado final
    container.innerHTML = filteredByYear.map(j => {
        try {
            if (typeof AppUtils === 'undefined') return "";

            const toRgba = (hex, alpha = 0.15) => {
                if (!hex || typeof hex !== 'string' || hex[0] !== '#') return `rgba(255,255,255,${alpha})`;
                const r = parseInt(hex.slice(1, 3), 16),
                      g = parseInt(hex.slice(3, 5), 16),
                      b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            const plat = j["Plataforma"] || "";
            const carpeta = AppUtils.getPlatformFolder(plat);
            const portada = (j["Portada"] || "").trim();
            const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;
            
            const styleRegion = AppUtils.getRegionStyle(j["Región"]);
            const nota = parseFloat(String(j["Nota"]).replace(',', '.')) || 0;
            const hue = Math.min(Math.max(nota * 12, 0), 120);

            const tiempoJuego = j["Tiempo Juego"] || j["Tiempo"] || "0";
            const horas = tiempoJuego.toString().replace("h", "").trim();
            const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
            const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";

            const proceso = (j["Proceso Juego"] || j["Estado"] || "Terminado").toUpperCase();
            let colorProceso = "#2E9E7F"; 
            if (proceso.includes("COMPLETADO") || proceso.includes("100%")) colorProceso = "#9825DA";
            if (proceso.includes("PROCESO") || proceso.includes("JUGANDO")) colorProceso = "#4242C9";
            if (proceso.includes("ABANDONADO")) colorProceso = "#FF4D4D";

            const fInicio = j["Primera fecha"] || j["Primera Fecha"] || "--/--";
            const fFin = j["Ultima fecha"] || j["Ultima Fecha"] || j["Última Fecha"] || "--/--";

            return `
            <div class="card ${AppUtils.getBrandClass(plat)}" style="display: flex; flex-direction: column; position: relative; min-height: 520px; overflow: hidden; border-radius: 12px;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                    <div class="icon-gradient-area">
                        <div class="card-platform-box">
                            ${AppUtils.getPlatformIcon(plat)}
                        </div>
                    </div>
                    <div style="flex: 0 0 40%; display: flex; flex-direction: column; align-items: stretch; overflow: hidden;">
                        <div style="flex: 1; background: ${toRgba(colorProceso, 0.2)}; color: ${colorProceso}; font-size: 0.55em; font-weight: 900; display: flex; align-items: center; justify-content: center; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            ${proceso}
                        </div>
                        <div style="flex: 1.5; background: hsla(${hue}, 80%, 45%, 0.15); color: hsl(${hue}, 80%, 60%); font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 1.2em;">
                            ${nota.toFixed(1)}
                        </div>
                    </div>
                </div>

                <div style="margin-top: 55px; padding: 0 12px;">
                    ${esEspecial ? `<div style="color: var(--cyan); font-size: 0.65em; font-weight: 800; text-transform: uppercase; margin-bottom: 2px;"><i class="fa-solid fa-star"></i> ${j["Edición"]}</div>` : `<div style="height: 12px;"></div>`}
                    <div class="game-title" style="font-size: 1.1em; color: var(--accent); font-weight: 700; line-height: 1.2; padding: 0;">
                        ${j["Nombre Juego"]}
                    </div>
                    <div style="font-size: 0.7em; color: #888; font-family: 'Noto Sans JP', sans-serif; min-height: 1.2em; margin-top: 2px;">
                        ${j["Nombre Japones"] || ""}
                    </div>
                    
                    <div style="margin-top: 8px; line-height: 1.2; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <div style="font-size: 0.6em; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text}; font-weight: bold;">
                            ${AppUtils.getFlag(j["Región"])} ${j["Región"] || "N/A"}
                        </div>
                        <span style="font-size: 0.7em; color: #888; font-weight: bold;">${j["Año"] || "????"}</span>
                        <span style="font-size: 0.7em; color: #555;">| <i>${j["Desarrolladora"] || "---"}</i></span>
                    </div>
                </div>

                <div style="height: 150px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
                </div>

                <div style="margin: 0 12px 15px; background: rgba(255,255,255,0.03); border-left: 3px solid var(--accent); border-radius: 4px; padding: 10px; flex-grow: 1; font-size: 0.75em; color: #bbb; font-style: italic; line-height: 1.4; display: flex; align-items: center;">
                    "${j["Comentario"] || "Sin comentarios."}"
                </div>

                <div style="height: 55px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: stretch; background: rgba(0,0,0,0.1);">
                    <div style="flex: 0.8; background: ${esDigital ? 'rgba(0, 242, 255, 0.1)' : 'rgba(239, 195, 108, 0.1)'}; color: ${esDigital ? 'var(--cyan)' : 'var(--accent)'}; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <i class="fa-solid ${esDigital ? 'fa-cloud-download' : 'fa-compact-disc'}" style="font-size: 0.9em;"></i>
                        <span style="font-size: 0.55em; font-weight: 900;">${esDigital ? 'DIGITAL' : 'FÍSICO'}</span>
                    </div>

                    <div style="flex: 1.4; display: flex; gap: 8px; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.05); padding: 0 5px;">
                        <div style="text-align: center;">
                            <div style="font-size: 0.45em; color: #555; font-weight: 800;">INICIO</div>
                            <div style="font-size: 0.6em; color: #888;">${fInicio}</div>
                        </div>
                        <div style="color: #333; font-size: 0.7em;">➔</div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.45em; color: #555; font-weight: 800;">FIN</div>
                            <div style="font-size: 0.6em; color: var(--accent); font-weight: 700;">${fFin}</div>
                        </div>
                    </div>

                    <div style="flex: 0.8; background: rgba(46, 158, 127, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <span style="font-size: 0.5em; color: #2e9e7f; font-weight: 900;">TIEMPO</span>
                        <span style="font-size: 0.9em; color: #fff; font-weight: 900; line-height: 1;">${horas}<small style="font-size: 0.6em;">h</small></span>
                    </div>
                </div>
            </div>`;
        } catch (e) { 
            console.error("Error en card played:", e);
            return ""; 
        }
    }).join('');
}

function updateYearButtons(filteredGames) {
    const container = document.getElementById('nav-year-filter'); 
    if (!container) return;

    // Calculamos los años disponibles en el set de datos actual
    const counts = { all: filteredGames.length };
    filteredGames.forEach(j => {
        const fecha = j["Ultima fecha"] || j["Ultima Fecha"] || j["Última Fecha"] || j["Año"] || "";
        const match = String(fecha).match(/\d{4}/);
        if (match) {
            const y = match[0];
            counts[y] = (counts[y] || 0) + 1;
        }
    });

    const years = Object.keys(counts).filter(y => y !== 'all').sort((a, b) => b - a);

    // IMPORTANTE: Se añade "this" en el onclick para pasar el elemento a filterByYear
    container.innerHTML = `
        <button class="year-btn ${currentPlayedYear === 'all' ? 'active' : ''}" 
                onclick="filterByYear('all', this)">
            TODOS <span>${counts.all}</span>
        </button>
        ${years.map(y => `
            <button class="year-btn ${currentPlayedYear === y ? 'active' : ''}" 
                    onclick="filterByYear('${y}', this)">
                ${y} <span>${counts[y]}</span>
            </button>
        `).join('')}
    `;
}

function filterByYear(year, element) {
    // 1. Guardar el año seleccionado en la variable global
    currentPlayedYear = year; 

    // 2. Gestión visual: Quitar 'active' de otros botones de año
    // Solo buscamos dentro de la barra de años para no afectar a los de Formato
    const container = document.getElementById('nav-year-filter');
    if (container) {
        container.querySelectorAll('.year-btn').forEach(btn => btn.classList.remove('active'));
    }

    // 3. Activar el botón pulsado (si existe el elemento)
    if (element) {
        element.classList.add('active');
    }

    // 4. Llamar al filtro global de main.js
    // Esto hará que applyFilters recalcule todo y actualice los botones de Físico/Digital
    if (typeof applyFilters === 'function') {
        applyFilters(); 
    }
}
