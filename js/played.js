/**
 * played.js - Registro de juegos terminados con Gradientes de Marca
 */

function renderPlayed(games) {
    const container = document.getElementById('played-grid');
    if (!container) return;

    renderFormatFilters(games, 'format-buttons-container-played', 'played');

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

            const nota = parseFloat(j["Nota"]) || 0;
            const colorNota = getColorForNota(nota);

            // Variables de datos
            const primeraFecha = j["Primera fecha"] || j["Primera Fecha"] || "---";
            const ultimaFecha = j["Ultima fecha"] || j["Ultima Fecha"] || "---";
            const proceso = j["Proceso"] || "Finalizado";

            return `
            <div class="card ${brandClass} ${esDigital ? 'digital-variant' : ''}">
                
                <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>

                <div style="position: absolute; top: 0; right: 0; background-color: ${colorNota}; color: #000; font-weight: 900; font-size: 0.85em; padding: 6px 15px; border-bottom-left-radius: 8px; z-index: 10; box-shadow: -2px 2px 8px rgba(0,0,0,0.4);">
                    ${nota.toFixed(1)}
                </div>

                <div style="margin-top: 45px;"></div>

                <div style="display: flex; align-items: center; width: 100%; gap: 10px; margin-bottom: 12px; padding: 0 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 600;">
                            ${j["Año"] || "????"}
                        </span>
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px;">
                            ${getFlag(j["Región"])} 
                            <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">${j["Región"] || "N/A"}</span>
                        </div>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <div style="background: rgba(239, 195, 108, 0.15); border: 1px solid #EFC36C; color: #EFC36C; font-size: 0.6em; font-weight: 800; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">
                        ${proceso}
                    </div>
                </div>

                <div style="margin-bottom: 12px; padding: 5px 0 5px 12px; border-left: 3px solid ${colorNota}; margin-right: 12px;">
                    <div class="game-title" style="font-size: 1.15em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                        ${j["Nombre Juego"]}
                    </div>
                </div>

                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 170px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px;"> 
                    <img src="${fotoUrl}" loading="lazy" style="max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0px 5px 15px rgba(0,0,0,0.5));">
                </div>

                <div style="margin: 0 12px 15px 12px; background: rgba(0,0,0,0.25); border-radius: 6px; padding: 12px; flex-grow: 1; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="font-size: 0.75em; color: #ccc; line-height: 1.5; font-style: italic;">
                        <i class="fa-solid fa-quote-left" style="font-size: 0.7em; color: #EFC36C; margin-right: 5px; opacity: 0.5;"></i>
                        ${j["Comentario"] || "Sin comentarios disponibles."}
                    </div>
                </div>

                <div class="card-footer" style="padding: 10px 12px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 0.55em; color: #777; text-transform: uppercase;">Inicio</span>
                        <span style="font-size: 0.7em; color: #aaa; font-weight: 600;">${primeraFecha}</span>
                    </div>
                    <div style="text-align: center; opacity: 0.3; font-size: 0.8em; color: #EFC36C;">
                        <i class="fa-solid fa-arrow-right-long"></i>
                    </div>
                    <div style="display: flex; flex-direction: column; text-align: right;">
                        <span style="font-size: 0.55em; color: #777; text-transform: uppercase;">Fin</span>
                        <span style="font-size: 0.7em; color: #EFC36C; font-weight: 700;">${ultimaFecha}</span>
                    </div>
                </div>
            </div>`;
        } catch (e) {
            console.error("Error en played.js:", e);
            return "";
        }
    }).join('');
}
/**
 * HELPERS DE APOYO (Para evitar que falle el renderizado)
 */

function renderStars(nota) {
    const totalStars = 5;
    const filledStars = Math.round(nota / 2);
    let html = '';
    for (let i = 1; i <= totalStars; i++) {
        html += `<i class="fa-solid fa-star" style="color: ${i <= filledStars ? '#FFD700' : 'rgba(255,255,255,0.1)'}; font-size: 0.8em;"></i>`;
    }
    return html;
}

function getColorForNota(valor) {
    const n = parseFloat(valor);
    if (isNaN(n)) return '#333';
    let r = n < 5 ? 255 : Math.round(255 - ((n - 5) * 51));
    let g = n < 5 ? Math.round(68 + (n * 37.4)) : 255;
    return `rgb(${r}, ${g}, 68)`;
}

// ... (Aquí puedes mantener tu lógica de updateYearFilters que ya tenías)
