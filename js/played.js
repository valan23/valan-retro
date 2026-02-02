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
        const plataforma = j["Plataforma"] || "";
        const carpeta = AppUtils.getPlatformFolder(plataforma);
        const fotoUrl = AppUtils.isValid(j["Portada"]) ? `images/covers/${carpeta}/${j["Portada"].trim()}` : `images/covers/default.webp`;
    
        const styleRegion = AppUtils.getRegionStyle(j["Región"]);
        const nota = parseFloat(j["Nota"]) || 0;
        const hue = Math.min(Math.max(nota * 12, 0), 120);

        const tiempoJuego = j["Tiempo Juego"] || "0";
        const horas = tiempoJuego.toString().replace("h", "").trim();

        const proceso = (j["Proceso Juego"] || "Terminado").toUpperCase();
        let colorProceso = "#2E9E7F"; 
        if (proceso.includes("COMPLETADO") || proceso.includes("100%")) colorProceso = "#10C809";
        if (proceso.includes("EN PROCESO") || proceso.includes("JUGANDO")) colorProceso = "#46A68B";
        if (proceso.includes("JUGADO")) colorProceso = "#BBF041";
        if (proceso.includes("PROBADO")) colorProceso = "#F0CA41";
        if (proceso.includes("SIN JUGAR")) colorProceso = "#8F8F8F";
        if (proceso.includes("ABANDONADO")) colorProceso = "#D63B18";

        return `
        <div class="card ${getBrandClass(plataforma)}" style="display: flex; flex-direction: column; position: relative; min-height: 520px; overflow: hidden;">
    
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
        
                <div class="icon-gradient-area">
                    <div class="platform-icon-card" style="margin: 0; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.6));">
                        ${getPlatformIcon(plataforma)}
                    </div>
                </div>

                <div style="background: hsl(${hue}, 100%, 40%); color: #fff; font-weight: 900; width: 60px; display: flex; align-items: center; justify-content: center; font-size: 1.1em; border-bottom-left-radius: 12px; box-shadow: -2px 0 10px rgba(0,0,0,0.3);">
                    ${nota.toFixed(1)}
                </div>
            </div>

            <div style="position: absolute; top: 55px; left: 18px; z-index: 10; display: flex; gap: 5px; align-items: center; flex-wrap: wrap;">
                <div style="background: rgba(0,0,0,0.7); color: #fff; font-size: 0.6em; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                    ${j["Año"] || "????"}
                </div>

                <div style="background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text}; font-size: 0.55em; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 3px;">
                    ${getFlag(j["Región"])} <span>${(j["Región"] || "N/A").toUpperCase()}</span>
                </div>

                <div style="background: ${colorProceso}; color: #fff; font-size: 0.55em; font-weight: 900; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    ${proceso}
                </div>
            </div>
        
            <div style="margin-top: 100px; padding: 0 15px; z-index: 2;">
                <div class="game-title" style="font-size: 1.15em; color: #EFC36C; font-weight: 700; line-height: 1.2; min-height: 2.4em; display: flex; align-items: center; padding: 0;">
                    ${j["Nombre Juego"]}
                </div>
            </div>

            <div style="height: 160px; margin: 10px 15px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
            </div>

            <div style="margin: 0 15px 15px; background: rgba(255,255,255,0.03); border-left: 3px solid #EFC36C; border-radius: 4px; padding: 12px; flex-grow: 1; font-size: 0.82em; color: #bbb; font-style: italic; line-height: 1.4; display: flex; align-items: center;">
                "${j["Comentario"] || "Sin comentarios."}"
            </div>

            <div style="height: 50px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: stretch; justify-content: space-between;">
                    
                    <div style="background: ${esDigital ? '#00f2ff' : '#EFC36C'}; color: #000; font-weight: 900; font-size: 0.65em; padding: 0 15px; display: flex; align-items: center; border-top-right-radius: 12px;">
                        <i class="fa-solid ${esDigital ? 'fa-cloud-download' : 'fa-compact-disc'}" style="margin-right: 5px;"></i>
                        ${esDigital ? 'DIG' : 'FIS'}
                    </div>

                    <div style="display: flex; gap: 10px; align-items: center; padding: 0 10px;">
                        <div style="text-align: center;">
                            <div style="font-size: 0.5em; color: #555; font-weight: 800;">INICIO</div>
                            <div style="font-size: 0.65em; color: #888; font-weight: 600;">${j["Primera fecha"] || '--/--'}</div>
                        </div>
                        <div style="color: #444; font-size: 0.8em;">➔</div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.5em; color: #555; font-weight: 800;">FIN</div>
                            <div style="font-size: 0.65em; color: #EFC36C; font-weight: 700;">${j["Ultima fecha"] || '--/--'}</div>
                        </div>
                    </div>

                    <div style="background: rgba(46, 158, 127, 0.15); border-left: 1px solid rgba(46, 158, 127, 0.3); padding: 0 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 65px;">
                        <span style="font-size: 0.5em; color: #2e9e7f; font-weight: 900;">TIME</span>
                        <span style="font-size: 0.9em; color: #fff; font-weight: 900; line-height: 1;">${horas}<small style="font-size: 0.6em; margin-left: 1px;">h</small></span>
                    </div>
                </div>
        </div>`;
    } catch (e) { return ""; }
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
