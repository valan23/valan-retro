/**
 * played.js - Registro de juegos terminados con Filtros Combinados, Footer y Badges de Formato
 */

// VARIABLES DE ESTADO GLOBAL PARA FILTROS
let selectedYear = 'all';
let selectedFormat = 'all';

// 1. Función auxiliar para colores de estado (Proceso Juego)
function getColorForProceso(proceso) {
    const p = proceso ? proceso.toString().toUpperCase().trim() : "";
    const colores = {
        "COMPLETADO": { border: "#00ff88", bg: "rgba(0, 255, 136, 0.15)", text: "#00ff88" },
        "EN PROCESO": { border: "#00d4ff", bg: "rgba(0, 212, 255, 0.15)", text: "#00d4ff" },
        "JUGADO":     { border: "#FFD700", bg: "rgba(255, 215, 0, 0.15)", text: "#FFD700" },
        "ABANDONADO": { border: "#ff4444", bg: "rgba(255, 68, 68, 0.15)", text: "#ff4444" },
        "PROBADO":    { border: "#a335ee", bg: "rgba(163, 53, 238, 0.15)", text: "#a335ee" },
        "SIN JUGAR":  { border: "#888888", bg: "rgba(136, 136, 136, 0.15)", text: "#888888" }
    };
    return colores[p] || { border: "#EFC36C", bg: "rgba(239, 195, 108, 0.15)", text: "#EFC36C" };
}

// 2. Función Principal de Renderizado
function renderPlayed(games) {
    const container = document.getElementById('played-grid');
    if (!container) return;

    // --- ACTIVAR FILTROS ---
    renderFormatFilters(games, 'format-buttons-container-played', 'played');
    updateYearFilters(games);

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        try {
            const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
            const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
            const carpetaSistema = platformMap[valorExcel] || valorExcel.toLowerCase().replace(/\s+/g, '');
            
            const nombrePortada = j["Portada"] ? j["Portada"].trim() : "";
            const fotoUrl = isValid(nombrePortada) ? `images/covers/${carpetaSistema}/${nombrePortada}` : `images/covers/default.webp`;

            const brandClass = getBrandClass(valorExcel);
            const style = getRegionStyle(j["Región"]);
            const campoFormato = j["Formato"] || "Físico";
            const esDigital = campoFormato.toString().toUpperCase().includes("DIGITAL");

            const notaRaw = parseFloat(j["Nota"]);
            const nota = isNaN(notaRaw) ? 0 : notaRaw;
            const colorNota = getColorForNota(nota);

            // Variables de datos
            const primeraFecha = j["Primera fecha"] || j["Primera Fecha"] || "---";
            const ultimaFecha = j["Ultima fecha"] || j["Ultima Fecha"] || "---";
            const tiempoJuego = j["Tiempo Juego"] || j["Tiempo juego"] || "--h";
            const procesoJuego = j["Proceso Juego"] || j["Proceso juego"] || "---";
            const colorStatus = getColorForProceso(procesoJuego);

            return `
            <div class="card ${brandClass} ${esDigital ? 'digital-variant' : 'physical-variant'}">
                
                <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>

                <div style="position: absolute; top: 0; right: 0; background-color: ${colorNota}; color: #000; font-weight: 900; font-size: 0.85em; padding: 6px 15px; border-bottom-left-radius: 8px; z-index: 10; box-shadow: -2px 2px 8px rgba(0,0,0,0.4);">
                    ${nota.toFixed(1)}
                </div>

                <div style="margin-top: 45px;"></div>

                <div style="display: flex; align-items: center; width: 100%; gap: 10px; margin-bottom: 12px; padding: 0 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="year-label" style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 600;">
                            ${j["Año"] || "????"}
                        </span>
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px;">
                            ${getFlag(j["Región"])} 
                            <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                        </div>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <div style="background: ${colorStatus.bg}; border: 1px solid ${colorStatus.border}; color: ${colorStatus.text}; font-size: 0.6em; font-weight: 800; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${procesoJuego}
                    </div>
                </div>

                <div style="margin-bottom: 12px; padding: 5px 0 5px 12px; border-left: 3px solid ${colorNota}; margin-right: 12px;">
                    <div class="game-title" style="font-size: 1.15em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                        ${j["Nombre Juego"]}
                    </div>
                </div>

                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 160px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px;"> 
                    
                    <div style="position: absolute; top: 8px; right: 8px; padding: 2px 8px; border-radius: 4px; font-size: 0.6em; font-weight: 800; text-transform: uppercase; z-index: 5; background: ${esDigital ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; color: ${esDigital ? '#00d4ff' : '#aaa'}; border: 1px solid ${esDigital ? '#00d4ff' : 'rgba(255,255,255,0.2)'};">
                        ${esDigital ? '<i class="fa-solid fa-cloud" style="margin-right: 3px;"></i> Digital' : '<i class="fa-solid fa-compact-disc" style="margin-right: 3px;"></i> Físico'}
                    </div>

                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0px 5px 15px rgba(0,0,0,0.5));">
                </div>

                <div style="margin: 0 12px 15px 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 12px; flex-grow: 1; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="font-size: 0.75em; color: #ccc; line-height: 1.5; font-style: italic;">
                        <i class="fa-solid fa-quote-left" style="font-size: 0.7em; color: #EFC36C; margin-right: 5px; opacity: 0.5;"></i>
                        ${j["Comentario"] || "Sin comentarios disponibles."}
                    </div>
                </div>

                <div class="card-footer" style="padding: 10px 12px; background: rgba(0,0,0,0.25); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column; flex: 1;">
                        <span style="font-size: 0.55em; color: #777; text-transform: uppercase;">Inicio</span>
                        <span style="font-size: 0.7em; color: #aaa; font-weight: 600;">${primeraFecha}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; flex: 1; text-align: center; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 0.55em; color: #777; text-transform: uppercase;">Fin</span>
                        <span style="font-size: 0.7em; color: #EFC36C; font-weight: 700;">${ultimaFecha}</span>
                    </div>

                    <div style="display: flex; flex-direction: column; flex: 1; text-align: right;">
                        <span style="font-size: 0.55em; color: #777; text-transform: uppercase;">Tiempo</span>
                        <span style="font-size: 0.7em; color: #00ff88; font-weight: 800; display: flex; align-items: center; justify-content: flex-end; gap: 3px;">
                            <i class="fa-regular fa-clock" style="font-size: 0.9em;"></i> ${tiempoJuego} h
                        </span>
                    </div>
                </div>
            </div>`;
        } catch (e) {
            console.error("Error en played.js:", e);
            return "";
        }
    }).join('');

    setupFormatFilterEvents();
}

// --- LÓGICA DE FILTRADO COMBINADO ---

function applyCombinedFilters() {
    const cards = document.querySelectorAll('#played-grid .card');
    cards.forEach(card => {
        const yearLabel = card.querySelector('.year-label').textContent.trim();
        const isDigital = card.classList.contains('digital-variant');

        const matchesYear = (selectedYear === 'all' || yearLabel.includes(selectedYear));
        let matchesFormat = true;
        if (selectedFormat === 'digital') matchesFormat = isDigital;
        else if (selectedFormat === 'fisico') matchesFormat = !isDigital;

        card.style.display = (matchesYear && matchesFormat) ? 'flex' : 'none';
    });
}

function updateYearFilters(games) {
    const container = document.getElementById('year-buttons-container');
    if (!container) return;

    const counts = { all: games.length };
    games.forEach(j => {
        const fechaRaw = j["Ultima fecha"] || j["Ultima Fecha"] || j["Año"] || "";
        const match = String(fechaRaw).match(/\d{4}/);
        if (match) {
            const year = match[0];
            counts[year] = (counts[year] || 0) + 1;
        }
    });

    const years = Object.keys(counts).filter(y => y !== 'all').sort((a, b) => b - a);
    let buttonsHTML = `<button class="year-btn active" data-year="all">Todos (${counts.all})</button>`;
    years.forEach(year => {
        buttonsHTML += `<button class="year-btn" data-year="${year}">${year} (${counts[year]})</button>`;
    });

    container.innerHTML = buttonsHTML;
    setupYearFilterEvents();
}

function setupYearFilterEvents() {
    const container = document.getElementById('year-buttons-container');
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    newContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.year-btn');
        if (!btn) return;
        selectedYear = btn.getAttribute('data-year');
        document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyCombinedFilters();
    });
}

function setupFormatFilterEvents() {
    const formatContainer = document.getElementById('format-buttons-container-played');
    if (!formatContainer) return;

    formatContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const text = btn.textContent.toUpperCase();
        if (text.includes("DIGITAL")) selectedFormat = 'digital';
        else if (text.includes("FÍSICO") || text.includes("FISICO")) selectedFormat = 'fisico';
        else selectedFormat = 'all';
        applyCombinedFilters();
    });
}

function getColorForNota(valor) {
    const n = parseFloat(valor);
    if (isNaN(n)) return '#333';
    let r = n < 5 ? 255 : Math.round(255 - ((n - 5) * 51));
    let g = n < 5 ? Math.round(68 + (n * 37.4)) : 255;
    return `rgb(${r}, ${g}, 68)`;
}
