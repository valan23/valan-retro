/**
 * played.js - Diario de Juegos Finalizados
 */
let currentPlayedYear = 'all';

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
        const fecha = j["Ultima fecha"] || j["Año"] || "";
        return String(fecha).includes(currentPlayedYear);
    });

    // 4. Renderizado final
   container.innerHTML = filteredByYear.map(j => {
    try {
        const toRgba = (hex, alpha = 0.15) => {
            if (!hex || typeof hex !== 'string' || hex[0] !== '#') return `rgba(255,255,255,${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16),
                  g = parseInt(hex.slice(3, 5), 16),
                  b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        const plataforma = j["Plataforma"] || "";
        const carpeta = AppUtils.getPlatformFolder(plataforma);
        const fotoUrl = AppUtils.isValid(j["Portada"]) ? `images/covers/${carpeta}/${j["Portada"].trim()}` : `images/covers/default.webp`;
        
        const styleRegion = AppUtils.getRegionStyle(j["Región"]);
        const nota = parseFloat(j["Nota"]) || 0;
        // Color dinámico según la nota (de rojo a verde)
        const hue = Math.min(Math.max(nota * 12, 0), 120);

        const tiempoJuego = j["Tiempo Juego"] || "0";
        const horas = tiempoJuego.toString().replace("h", "").trim();
        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";

        const proceso = (j["Proceso Juego"] || "Terminado").toUpperCase();
        let colorProceso = "#2E9E7F"; 
        if (proceso.includes("COMPLETADO") || proceso.includes("100%")) colorProceso = "#9825DA";
        if (proceso.includes("EN PROCESO") || proceso.includes("JUGANDO")) colorProceso = "#4242C9";
        if (proceso.includes("JUGADO")) colorProceso = "#42A5C9";
        if (proceso.includes("PROBADO")) colorProceso = "#87B7CC";
        if (proceso.includes("ABANDONADO")) colorProceso = "#CCCCCC";

        return `
        <div class="card ${getBrandClass(plataforma)}" style="display: flex; flex-direction: column; position: relative; min-height: 520px; overflow: hidden; border-radius: 12px;">
    
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                <div class="icon-gradient-area" style="flex: 0 0 60%; border-top-left-radius: 11px; display: flex; align-items: center; justify-content: center;">
                    <div class="platform-icon-card" style="margin: 0; filter: none;">
                        ${getPlatformIcon(plataforma)}
                    </div>
                </div>
                <div style="flex: 0 0 40%; display: flex; flex-direction: column; align-items: stretch; border-top-right-radius: 11px; overflow: hidden;">
                    <div style="flex: 1; background: ${toRgba(colorProceso, 0.15)}; color: ${colorProceso}; font-size: 0.5em; font-weight: 900; display: flex; align-items: center; justify-content: center; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        ${proceso}
                    </div>
                    <div style="flex: 1.5; background: hsla(${hue}, 80%, 45%, 0.15); color: hsl(${hue}, 80%, 60%); font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 1.2em;">
                        ${nota.toFixed(1)}
                    </div>
                </div>
            </div>

            <div style="margin-top: 55px; padding: 0 12px;">
                ${esEspecial ? 
                    `<div style="color: var(--cyan); font-size: 0.65em; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px;">
                        <i class="fa-solid fa-star" style="font-size: 0.9em;"></i> ${j["Edición"]}
                    </div>` : 
                    `<div style="height: 12px;"></div>`
                }

                <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2; display: flex; align-items: center; padding: 0;">
                    ${j["Nombre Juego"]}
                </div>

                <div style="font-size: 0.7em; color: #888; font-family: 'Noto Sans JP', sans-serif; min-height: 1.2em; margin-top: 2px;">
                    ${j["Nombre Japones"] || ""}
                </div>
                
                <div style="margin-top: 8px; line-height: 1.2;">
                    <div style="display: inline-flex; align-items: center; gap: 8px; vertical-align: middle;">
                        <div style="font-size: 0.6em; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text}; font-weight: bold; white-space: nowrap;">
                            ${getFlag(j["Región"])} ${j["Región"] || "N/A"}
                        </div>
                        <span style="font-size: 0.7em; color: #888; font-weight: bold; white-space: nowrap;">
                            ${j["Año"] || "????"}
                        </span>
                    </div>
                    <span style="font-size: 0.7em; color: #555; word-wrap: break-word;">
                        <span style="color: #ccc; margin: 0 6px;">|</span>
                        ${j["Desarrolladora"] || "Unknown"}
                    </span>
                </div>
            </div>

            <div style="height: 150px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
            </div>

            <div style="margin: 0 12px 15px; background: rgba(255,255,255,0.03); border-left: 3px solid #EFC36C; border-radius: 4px; padding: 10px; flex-grow: 1; font-size: 0.75em; color: #bbb; font-style: italic; line-height: 1.4; display: flex; align-items: center;">
                "${j["Comentario"] || "Sin comentarios."}"
            </div>

            <div style="height: 55px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: stretch; overflow: hidden;">
                <div style="flex: 1; background: ${esDigital ? 'rgba(0, 242, 255, 0.1)' : 'rgba(239, 195, 108, 0.1)'}; color: ${esDigital ? '#00f2ff' : '#EFC36C'}; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <i class="fa-solid ${esDigital ? 'fa-cloud-download' : 'fa-compact-disc'}" style="font-size: 1em; margin-bottom: 2px;"></i>
                    <span style="font-size: 0.6em; font-weight: 900;">${esDigital ? 'DIGITAL' : 'FÍSICO'}</span>
                </div>

                <div style="flex: 1; display: flex; gap: 5px; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.05); padding: 0 5px;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.45em; color: #555; font-weight: 800;">INICIO</div>
                        <div style="font-size: 0.6em; color: #888;">${j["Primera fecha"] || '--/--'}</div>
                    </div>
                    <div style="color: #333; font-size: 0.7em;">➔</div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.45em; color: #555; font-weight: 800;">FIN</div>
                        <div style="font-size: 0.6em; color: #EFC36C; font-weight: 700;">${j["Ultima fecha"] || '--/--'}</div>
                    </div>
                </div>

                <div style="flex: 1; background: rgba(46, 158, 127, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 65px;">
                    <span style="font-size: 0.5em; color: #2e9e7f; font-weight: 900;">TIEMPO</span>
                    <span style="font-size: 0.9em; color: #fff; font-weight: 900; line-height: 1;">${horas}<small style="font-size: 0.6em; margin-left: 1px;">h</small></span>
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
    const container = document.getElementById('year-buttons-container');
    if (!container) return;

    const counts = { all: filteredGames.length };
    filteredGames.forEach(j => {
        const fecha = j["Ultima fecha"] || j["Año"] || "";
        const match = String(fecha).match(/\d{4}/);
        if (match) {
            const y = match[0];
            counts[y] = (counts[y] || 0) + 1;
        }
    });

    const years = Object.keys(counts).filter(y => y !== 'all').sort((a, b) => b - a);

    container.innerHTML = `
        <button class="year-btn ${currentPlayedYear === 'all' ? 'active' : ''}" onclick="filterByYear('all')">
            Todos (${counts.all})
        </button>
        ${years.map(y => `
            <button class="year-btn ${currentPlayedYear === y ? 'active' : ''}" onclick="filterByYear('${y}')">
                ${y} (${counts[y]})
            </button>
        `).join('')}
    `;
}

function filterByYear(year) {
    currentPlayedYear = year;
    if (typeof applyFilters === 'function') {
        applyFilters();
    }
}
