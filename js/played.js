/**
 * played.js - Diario de Juegos Finalizados
 */
let currentPlayedYear = 'all';

function renderPlayed(games) {
    const container = document.getElementById('played-grid');
    if (!container) return;

    // 1. ACTUALIZACIÓN DINÁMICA DE FORMATOS (Físico/Digital)
    // En lugar de enviarle dataStore['jugados'], le enviamos 'games'
    // que ya vienen filtrados por Marca/Consola desde main.js
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
    container.innerHTML = "";
    if (filteredByYear.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 40px; color: #888;'>No hay partidas registradas para este filtro.</p>";
        return;
    }

    container.innerHTML = filteredByYear.map(j => {
        try {
            const plataforma = j["Plataforma"] || "";
            const carpeta = AppUtils.getPlatformFolder(plataforma);
            const fotoUrl = AppUtils.isValid(j["Portada"]) ? `images/covers/${carpeta}/${j["Portada"].trim()}` : `images/covers/default.webp`;
            const nota = parseFloat(j["Nota"]) || 0;
            const hue = Math.min(Math.max(nota * 12, 0), 120);

            return `
            <div class="card ${getBrandClass(plataforma)}" style="display: flex; flex-direction: column; position: relative; min-height: 480px;">
                <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                    ${getPlatformIcon(plataforma)}
                </div>
                <div style="position: absolute; top: 0; right: 0; background: hsl(${hue}, 100%, 40%); color: #fff; font-weight: 900; padding: 8px 15px; border-bottom-left-radius: 12px; z-index: 10; font-size: 1.1em; box-shadow: -2px 2px 10px rgba(0,0,0,0.5);">
                    ${nota.toFixed(1)}
                </div>
                
                <div style="margin-top: 50px; padding: 0 12px;">
                    <div class="game-title" style="font-size: 1.15em; color: #EFC36C; font-weight: 700; line-height: 1.2; min-height: 2.4em; display: flex; align-items: center; padding: 0;">${j["Nombre Juego"]}</div>
                </div>

                <div style="height: 160px; margin: 15px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
                </div>

                <div style="margin: 0 12px 15px; background: rgba(255,255,255,0.05); border-left: 3px solid #EFC36C; border-radius: 4px; padding: 12px; flex-grow: 1; font-size: 0.85em; color: #ddd; font-style: italic; line-height: 1.4;">
                    "${j["Comentario"] || "Sin comentarios."}"
                </div>

                <div style="padding: 10px 12px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; font-size: 0.7em; letter-spacing: 0.5px;">
                    <span style="color: #888;">INICIO: <b style="color: #ccc;">${j["Primera fecha"] || "---"}</b></span>
                    <span style="color: #EFC36C; font-weight: 700;">FIN: <b>${j["Ultima fecha"] || "---"}</b></span>
                </div>
            </div>`;
        } catch (e) { return ""; }
    }).join('');
}

function updateYearButtons(filteredGames) {
    const container = document.getElementById('year-buttons-container');
    if (!container) return;

    // Contar juegos por año BASADO EN EL FILTRO ACTUAL DE CONSOLA
    const counts = { all: filteredGames.length };
    filteredGames.forEach(j => {
        const fecha = j["Ultima fecha"] || j["Año"] || "";
        const match = String(fecha).match(/\d{4}/);
        if (match) {
            const y = match[0];
            counts[y] = (counts[y] || 0) + 1;
        }
    });

    // Ordenar años de más reciente a más antiguo
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
