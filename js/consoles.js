function createConsoleCardHTML(c) {
    try {
        if (typeof AppUtils === 'undefined') return "";

        // --- DATOS ---
        const plat = c["Plataforma"] || "";
        const carpeta = AppUtils.getPlatformFolder(plat);
        const portada = c["Portada"] ? c["Portada"].trim() : "";
        const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;
        const styleRegion = AppUtils.getRegionStyle(c["Región"]);
        const completitud = (c["Completitud"] || "SUELTA").toUpperCase();
        const colorCompBase = AppUtils.getHardwareCompletitudStyle(completitud);
        const estadoNum = Math.round(parseFloat(c["Estado General"])) || 0;
        
        // Lógica de Modificación
        const esMod = (c["Modificada"] || "No").toUpperCase() === "SÍ";
        const tipoMod = c["Tipo Mod"] || "Original";

        const toRgba = (hex, alpha = 0.15) => {
            if (!hex || !hex.startsWith('#')) return `rgba(255,255,255,${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const getScoreColor = (val) => {
            if (val < 5) return "#ff4444"; 
            if (val < 8) return "#ffbb33"; 
            return "#00c851"; 
        };
        const colorEstado = getScoreColor(estadoNum);

        return `
        <div class="card ${AppUtils.getBrandClass(plat)}" style="display: flex; flex-direction: column; position: relative; min-height: 500px; overflow: hidden; border-radius: 12px;">
            
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 45px; z-index: 10; display: flex; align-items: stretch;">
                <div class="icon-gradient-area">
                    <div class="card-platform-box">${AppUtils.getPlatformIcon(plat)}</div>
                </div>
                <div style="flex: 0 0 40%; display: flex; flex-direction: column; align-items: stretch; border-left: 1px solid rgba(255,255,255,0.05);">
                    <div style="flex: 1; background: ${toRgba(colorCompBase, 0.25)}; color: ${colorCompBase}; font-size: 0.55em; font-weight: 900; display: flex; align-items: center; justify-content: center; text-transform: uppercase;">
                        ${completitud}
                    </div>
                    <div style="flex: 1.5; background: ${toRgba(colorEstado, 0.15)}; color: ${colorEstado}; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 1.2em;">
                        ${estadoNum}
                    </div>
                </div>
            </div>

            <div style="margin-top: 45px; padding: 15px;">
                <div class="game-title" style="padding:0; line-height: 1.1; margin-bottom: 2px; font-size: 1.2rem;">${c["Nombre Consola"]}</div>
                <div style="font-size: 0.7rem; color: var(--cyan); font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">
                    ${c["Modelo"] || ""} ${c["Versión"] ? `• ${c["Versión"]}` : ""}
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="font-size: 0.6em; padding: 2px 6px; border-radius: 4px; background: ${styleRegion.bg}; border: 1px solid ${styleRegion.border}; color: ${styleRegion.text}; font-weight: bold;">
                        ${AppUtils.getFlag(c["Región"])} ${c["Región"]}
                    </div>
                    <span style="font-size: 0.7em; color: #888;">Fabricación: <b>${c["Año Fabricación"] || "---"}</b></span>
                </div>
            </div>

            <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 10px; background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);">
                <img src="${fotoUrl}" loading="lazy" style="max-width: 85%; max-height: 140px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));" onerror="this.src='images/covers/default.webp'">
            </div>

            <div style="margin: 0 15px 15px; font-size: 0.65rem; color: #777; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">
                <b style="color: #aaa; text-transform: uppercase; font-size: 0.5rem; display: block; margin-bottom: 2px;">Accesorios Incluidos:</b>
                ${c["Accesorios originales"] || "Solo consola"}
            </div>

            <div style="height: 55px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: stretch; background: rgba(0,0,0,0.2);">
                <div style="flex: 1.2; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 5px;">
                    <span style="font-size: 0.45rem; color: #555; font-weight: 800; text-transform: uppercase;">Hardware</span>
                    <span style="font-size: 0.6rem; color: ${esMod ? 'var(--cyan)' : '#888'}; font-weight: 900; text-align: center; line-height: 1;">
                        ${esMod ? `<i class="fa-solid fa-microchip"></i> ${tipoMod}` : 'ORIGINAL'}
                    </span>
                </div>
                <div style="flex: 1; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 0.45rem; color: #555; font-weight: 800; text-transform: uppercase;">Nº Serie</span>
                    <span style="font-size: 0.5rem; color: #aaa; font-family: monospace; letter-spacing: -0.5px;">${c["Número Serie"] || "S/N"}</span>
                </div>
                <div style="flex: 1; background: rgba(46, 158, 127, 0.05); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 0.45rem; color: #2e9e7f; font-weight: 800; text-transform: uppercase;">Valor Est.</span>
                    <span style="font-size: 0.75rem; color: #fff; font-weight: 900;">${c["Tasación"] || "---"}</span>
                </div>
            </div>
        </div>`;
    } catch (e) { 
        console.error("Error:", e); return ""; 
    }
}
