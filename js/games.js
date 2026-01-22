/**
* games.js - Especialista en renderizar la colección actual
*/

function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No se encontraron juegos.</p>";
        return;
    }

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
        const carpetaSistema = Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase()) 
            ? platformMap[Object.keys(platformMap).find(key => key.toUpperCase() === valorExcel.toUpperCase())] 
            : valorExcel.toLowerCase().replace(/\s+/g, '');

        const nombrePortada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = isValid(nombrePortada) ? `images/covers/${carpetaSistema}/${nombrePortada}` : `images/covers/default.webp`;

        const colorCompletitud = getCompletitudStyle(j["Completitud"]);
        const textoBadgeCompletitud = (j["Completitud"] || "???").toUpperCase();
        const style = getRegionStyle(j["Región"]);

        return `
        <div class="card" style="position: relative; padding-bottom: 55px; display: flex; flex-direction: column; overflow: hidden; min-height: 420px;">
            
            <div style="position: absolute; top: 0; right: 0; background-color: ${colorCompletitud}; color: #000; font-weight: 900; font-size: 0.65em; padding: 6px 12px; border-bottom-left-radius: 8px; z-index: 10; white-space: nowrap;">
                ${textoBadgeCompletitud}
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding-left: 0;">
                <div class="platform-icon-card" style="font-size: 1.2em; height: 24px; display: flex; align-items: center; margin: 0; padding: 0;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>
                <div style="display: flex; align-items: center; gap: 8px; height: 22px; margin: 0; padding: 0;">
                    <span class="year-tag" style="background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-size: 0.7em; color: #eee; font-weight: 500; margin: 0; line-height: 1;">
                        ${j["Año"] || "????"}
                    </span>
                    <div class="region-badge-container" style="display: inline-flex; align-items: center; gap: 4px; background: ${style.bg}; border: 1px solid ${style.border}; padding: 2px 6px; border-radius: 4px; margin: 0; line-height: 1;">
                        ${getFlag(j["Región"])} 
                        <span style="font-size: 0.7em; font-weight: bold; color: ${style.text};">
                            ${j["Región"] || "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 160px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 15px; padding: 10px;"> 
                <img src="${fotoUrl}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 4px; filter: drop-shadow(0px 8px 12px rgba(0,0,0,0.6));">
            </div>

            <div style="border-left: 3px solid #555; padding-left: 12px; margin-bottom: 12px; height: 65px; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
                <div class="game-title" style="margin: 0; line-height: 1.2; font-family: 'Segoe UI', sans-serif; font-weight: 600; font-size: 1.1em; color: #EFC36C; letter-spacing: 0.2px;">
                    ${j["Nombre Juego"]}
                </div>
                ${isValid(j["Nombre Japones"]) ? 
                    `<div style="font-family: 'MS Mincho', serif; font-size: 0.85em; color: #aaa; margin-top: 4px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${j["Nombre Japones"]}</div>` 
                    : `<div style="height: 14px;"></div>`
                }
            </div>
            
            <div class="details-grid" style="font-family: 'Segoe UI', sans-serif; font-size: 0.72em; line-height: 1.5; height: 80px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px 10px; display: grid !important; grid-template-columns: 1fr 1fr; gap: 4px 10px; align-content: start; overflow: hidden;">
                ${[
                    { label: '📦Caja', val: j["Estado Caja"] },
                    { label: '📂Inserto', val: j["Estado Inserto"] },
                    { label: '📖Manual', val: j["Estado Manual"] },
                    { label: '💾Juego', val: j["Estado Juego"] },
                    { label: '🖼️Portada', val: j["Estado Portada"] },
                    { label: '🔖Obi', val: j["Estado Spinecard"] },
                    { label: '🎁Extra', val: j["Estado Extras"] }
                ].filter(item => isValid(item.val)).slice(0, 6).map(item => `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1px;">
                        <span style="color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.label}:</span>
                        <span style="font-weight: bold; margin-left: 4px;">${formatEstado(item.val)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="card-footer" style="position: absolute; bottom: 12px; left: 15px; right: 15px; height: 45px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-family: 'Segoe UI', sans-serif; font-size: 0.75em; text-transform: uppercase; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 1.1em;">❤️‍🩹</span> 
                        <span>ESTADO:</span>
                        <span style="color: ${getColorForNota(j["Estado General"])};">
                            ${(j["Estado General"] && j["Estado General"] !== "PEND") ? j["Estado General"] + "/10" : "?"}
                        </span>
                    </div>
                    <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${j["Estado General"] * 10}%; height: 100%; background-color: ${getColorForNota(j["Estado General"])};"></div>
                    </div>
                </div>
                <div class="price-tag" style="font-weight: bold; color: #fff; margin: 0;">
                    ${j["Tasación Actual"] || "S/T"}
                </div>
            </div>
        </div>`;
    }).join('');
}

/**
* HELPERS ESPECÍFICOS DE RENDERIZADO
*/

function getColorForNota(valor) {
const n = parseFloat(valor);
if (isNaN(n)) return '#333';
let r = n < 5 ? 255 : Math.round(255 - ((n - 5) * 51));
let g = n < 5 ? Math.round(68 + (n * 37.4)) : 255;
return `rgb(${r}, ${g}, 68)`;
}

function formatEstado(valor) {
if (!valor || valor.toUpperCase() === "NA") return null;
const v = valor.toUpperCase().trim();
if (v === "FALTA") return `<span style="color: #ff4d4d; font-weight: bold;">FALTA</span>`;
if (v === "?" || v === "PEND") return `<span style="color: #ffff00; font-weight: bold;">?</span>`;
// Si es un número, usamos la escala de colores dinámica
const num = parseFloat(v);
const colorDinamico = !isNaN(num) ? getColorForNota(num) : "#00ff88"; // Fallback a verde si no es número
return `<span style="color: ${colorDinamico}; font-weight: bold;">${v}/10</span>`;
}

function getRegionStyle(region) {
if (!region) return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
const r = region.toUpperCase();
for (let key in REGION_COLORS) { if (r.includes(key)) return REGION_COLORS[key]; }
return { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
}

function getCompletitudStyle(valor) {
if (!valor) return "#ccc";
const v = valor.toUpperCase();
if (v.includes("NUEVO")) return COMPLETITUD_COLORS["NUEVO"].color;
if (v.includes("CASI COMPLETO")) return COMPLETITUD_COLORS["CASI COMPLETO"].color;
if (v.includes("COMPLETO")) return COMPLETITUD_COLORS["COMPLETO"].color;
if (v.includes("INCOMPLETO")) return COMPLETITUD_COLORS["INCOMPLETO"].color;
if (v.includes("SUELTO") || v.includes("CARTUCHO")) return COMPLETITUD_COLORS["SUELTO"].color;
if (v.includes("REPRO")) return COMPLETITUD_COLORS["REPRO"].color;
return "#ccc";
}
