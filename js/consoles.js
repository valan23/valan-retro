/**
 * consoles.js - Renderizado de la Colección de Hardware
 */

function renderConsolas(consolas) {
    const container = document.getElementById('consolas-grid');
    if (!container) return;
    
    container.innerHTML = "";
    if (!consolas || consolas.length === 0) {
        container.innerHTML = `
            <div style='grid-column: 1/-1; text-align:center; padding: 60px 20px;'>
                <i class="fa-solid fa-microchip" style="font-size: 3rem; color: #333; margin-bottom: 20px; display: block;"></i>
                <p style='color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;'>No hay consolas en esta categoría</p>
            </div>`;
        return;
    }

    const html = consolas.map(c => createConsoleCardHTML(c)).join('');
    container.innerHTML = html;
}

function createConsoleCardHTML(c) {
    try {
        if (typeof AppUtils === 'undefined') return "";

        // --- PREPARACIÓN DE DATOS ---
        const plat = c["Plataforma"] || "";
        const carpeta = AppUtils.getPlatformFolder(plat);
        const portada = c["Portada"] ? c["Portada"].trim() : "";
        const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;

        const styleRegion = AppUtils.getRegionStyle(c["Región"]);
        const version = c["Versión"] || "";
        const esVersionEspecial = AppUtils.isValid(version) && version.toUpperCase() !== "ESTÁNDAR";
        const modelo = c["Modelo"] || "";

        // Manejo de Completitud de Hardware (con fallback por si falla la función)
        const completitud = (c["Completitud"] || "SUELTA").toUpperCase();
        const colorCompBase = (typeof AppUtils.getHardwareCompletitudStyle === 'function') 
            ? AppUtils.getHardwareCompletitudStyle(completitud) 
            : "#888";

        // Estado numérico seguro
        const estadoRaw = c["Estado General"] || "0";
        const estadoNum = Math.round(parseFloat(estadoRaw.toString().replace(',', '.'))) || 0;

        // Nuevos campos para el centro del footer
        const salidaVideo = c["Salida Vídeo"] || c["Salida Video"] || "RF/AV";
        const mejorVideo = c["Mejor Vídeo"] || c["Mejor Video"] || "N/A";

        // Helpers de estilo
        const toRgba = (hex, alpha = 0.15) => {
            if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(255,255,255,${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const getScoreColor = (val) => {
            if (val < 5) return "#ff4444"; 
            if (val < 8) return "#ffbb33"; 
            return "#00c851"; 
        };
        const colorEstado = getScoreColor(estadoNum);

        // Modificaciones
        const modCampo = c["Modificada"] || "No";
        const colorMod = (typeof AppUtils.getHardwareModStyle === 'function') ? AppUtils.getHardwareModStyle(modCampo) : "#666";
        const iconoMod = (typeof AppUtils.getHardwareModIcon === 'function') ? AppUtils.getHardwareModIcon(modCampo) : "• ";

        return `
        <div class="card ${AppUtils.getBrandClass(plat)}" style="display: flex; flex-direction: column; position: relative; min-height: 520px; overflow: hidden; border-radius: 12px;">

            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                <div class="icon-gradient-area">
                    <div class="card-platform-box">${AppUtils.getPlatformIcon(plat)}</div>
                </div>

                <div style="flex: 0 0 40%; display: flex; flex-direction: column; align-items: stretch; border-left: 1px solid rgba(255,255,255,0.05);">
                    <div style="flex: 1; background: ${toRgba(colorCompBase, 0.25)}; color: ${colorCompBase}; font-size: 0.55em; font-weight: 900; display: flex; align-items: center; justify-content: center; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${completitud}
                    </div>
                    <div style="flex: 1.5; background: ${toRgba(colorEstado, 0.15)}; color: ${colorEstado}; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 1.2em;">
                        ${estadoNum}
                    </div>
                </div>
            </div>

            <div style="margin-top: 45px; padding: 15px 15px 0 15px;">
                ${esVersionEspecial ? 
                    `<div style="color: var(--cyan); font-size: 0.6rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">
                        <i class="fa-solid fa-microchip"></i> ${version}
                    </div>` : '<div style="height:12px"></div>'
                }

                <div class="game-title" style="padding:0; line-height: 1.1; margin-bottom: 4px; font-size: 1.2rem;">${c["Nombre Consola"]}</div>
                
                <div style="font-size: 0.7rem; color: #666; min-height: 14px; font-weight: 600; text-transform: uppercase;">
                    ${modelo}
                </div>

                <div style="margin-top: 8px; line-height: 1.2; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <div style="font-size: 0.6em; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text}; font-weight: bold;">
                        ${AppUtils.getFlag(c["Región"])} ${c["Región"] || "N/A"}
                    </div>
                    <span style="font-size: 0.7em; color: #888; font-weight: bold;">Fab: ${c["Año Fabricación"] || "????"}</span>
                    <span style="font-size: 0.7em; color: #555; font-weight: 800; text-transform: uppercase;">Nº Serie: ${c["Número Serie"] || "S/N"}</span>
                </div>
            </div>

            <div style="height: 160px; margin: 15px 15px; background: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.03);">
                <img src="${fotoUrl}" loading="lazy" style="max-width: 95%; max-height: 95%; object-fit: contain;" onerror="this.src='images/covers/default.webp'">
            </div>

            <div style="margin: 0 15px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; flex-grow: 1; display: flex; flex-direction: column; gap: 10px; border: 1px solid rgba(255,255,255,0.02);">
                
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 0.5rem; color: #555; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Accesorios Originales</span>
                    <span style="font-size: 0.65rem; color: #bbb; line-height: 1.2;">${c["Accesorios originales"] || c["Accesorios Originales"] || "Ninguno"}</span>
                </div>

                <div style="display: flex; flex-direction: column; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px;">
                    <span style="font-size: 0.5rem; color: #555; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Observaciones</span>
                    <span style="font-size: 0.65rem; color: #999; line-height: 1.3; font-style: italic;">
                        ${c["Observaciones"] || "Sin notas adicionales."}
                    </span>
                </div>
            </div>

            <div style="margin-top: 15px; height: 55px; border-top: 1px solid rgba(255,255,255,0.03); display: flex; align-items: stretch; background: rgba(0,0,0,0.1);">
                
                <div style="flex: 1; border-right: 1px solid rgba(255,255,255,0.05); background: ${toRgba(colorMod, 0.15)}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 5px;">
                    <span style="font-size: 0.45rem; color: #555; font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">MOD</span>
                    <div style="color: ${colorMod}; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 0.55rem; font-weight: 900; text-align: center; line-height: 1; text-transform: uppercase;">
                            ${iconoMod}${modCampo.toUpperCase() === "NO" ? "ORIGINAL" : modCampo.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div style="flex: 1.2; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); padding: 0 4px;">
                    <span style="font-size: 0.45rem; color: #555; font-weight: 800; text-transform: uppercase; margin-bottom: 1px;">Output Vídeo</span>
                    <span style="font-size: 0.6rem; color: #eee; font-weight: 800; line-height: 1;">${salidaVideo}</span>
                    <div style="margin-top: 2px; padding: 1px 4px; background: rgba(0, 200, 81, 0.1); border-radius: 3px; display: flex; align-items: center; gap: 2px;">
                        <i class="fa-solid fa-up-long" style="font-size: 0.4rem; color: #00c851;"></i>
                        <span style="font-size: 0.45rem; color: #00c851; font-weight: 900; text-transform: uppercase;">TOP: ${mejorVideo}</span>
                    </div>
                </div>

                <div style="flex: 1; background: rgba(46, 158, 127, 0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 2px;">
                    <span style="font-size: 0.45rem; color: #2e9e7f; font-weight: 800; text-transform: uppercase;">Valor Est.</span>
                    <span style="font-size: 0.7rem; color: #fff; font-weight: 900;">${c["Tasación Actual"] || "---"}</span>
                    <span style="font-size: 0.4rem; color: #555;">${c["Fecha revisión"] || c["Fecha Revisión"] || ""}</span>
                </div>
            </div>
        </div>`;
    } catch (e) { 
        console.error("Error en card consolas:", e);
        return ""; 
    }
}
