/**
 * played.js - Registro de actividad y puntuaciones
 */

function renderPlayed(games) {
    const container = document.getElementById('played-grid');
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Aún no has registrado juegos jugados.</p>";
        return;
    }

    const isValid = (val) => val && val.trim() !== "" && val.toUpperCase() !== "NA";

    container.innerHTML = games.map(j => {
        try {
            const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
            const valorExcel = j["Plataforma"] ? j["Plataforma"].trim() : "";
            const carpetaSistema = platformMap[valorExcel] || valorExcel.toLowerCase().replace(/\s+/g, '');
            const fotoUrl = isValid(j["Portada"]) ? `images/covers/${carpetaSistema}/${j["Portada"].trim()}` : `images/covers/default.webp`;

            const style = getRegionStyle(j["Región"]);
            
            // Lógica de Formato y Edición
            const campoFormato = j["Formato"] || "Físico";
            const esDigital = campoFormato.toString().toUpperCase().includes("DIGITAL");
            const edicionRaw = j["Edición"] || "";
            const esEdicionEspecial = isValid(edicionRaw) && edicionRaw.toUpperCase() !== "ESTÁNDAR";

            // --- LÓGICA DE NOTA (Badge superior) ---
            const nota = j["Nota"] || "—";
            const colorNota = getColorForNota(nota);

            // --- LÓGICA DE PROCESO (Barra de progreso) ---
            const proceso = (j["Proceso Juego"] || "Probado").trim().toUpperCase();
            const procesoMap = { 
                "COMPLETADO": { p: 100, c: "#00ff88" }, 
                "JUGADO": { p: 75, c: "#00d4ff" }, 
                "EN PROCESO": { p: 50, c: "#ffd700" }, 
                "PROBADO": { p: 25, c: "#aaa" }, 
                "ABANDONADO": { p: 10, c: "#ff4d4d" } 
            };
            const stat = procesoMap[proceso] || { p: 0, c: "#555" };

            return `
            <div class="card" style="position: relative; padding-bottom: 55px; display: flex; flex-direction: column; overflow: hidden; min-height: 500px; background: #1e1e24; border: 1px solid #3d3d4a;">
                
                <div class="platform-icon-card" style="position: absolute; top: 12px; left: 12px; z-index: 10;">
                    ${getPlatformIcon(j["Plataforma"])}
                </div>

                <div style="position: absolute; top: 0; right: 0; background-color: ${colorNota}; color: #000; font-weight: 900; font-size: 1.1em; padding: 8px 15px; border-bottom-left-radius: 12px; z-index: 10; box-shadow: -2px 2px 10px rgba(0,0,0,0.5);">
                    ${nota}
                </div>

                <div style="margin-top: 45px;"></div>

                <div style="display: flex; align-items: center; width: 100%; gap: 10px; margin-bottom: 15px; padding: 0 12px;">
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

                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 90px;">
                         <div style="font-family: 'Segoe UI', sans-serif; font-size: 0.65em; font-weight: 800; color: ${stat.c}; letter-spacing: 0.5px;">
                            ${proceso}
                        </div>
                        <div style="width: 80px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                             <div style="width: ${stat.p}%; height: 100%; background-color: ${stat.c}; box-shadow: 0 0 8px ${stat.c}cc;"></div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 12px; padding: 5px 0 5px 12px; border-left: 2px solid ${esDigital ? '#00d4ff' : '#555'}; margin-right: 12px;">
                    <div class="game-title" style="font-size: 1.1em; color: #EFC36C; font-weight: 700; line-height: 1.2;">
                        ${j["Nombre Juego"]}
                    </div>
                    ${esEdicionEspecial ? `
                        <div style="font-size: 0.75em; color: #aaa; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-star" style="color: #EFC36C; font-size: 0.8em;"></i>
                            <span style="text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${edicionRaw}</span>
                        </div>
                    ` : ''}
                </div>

                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: calc(100% - 24px); margin-left: 12px; height: 150px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);"> 
                    <div style="position: absolute; top: 8px; right: 8px; background: ${esDigital ? '#00d4ff' : '#555'}; color: ${esDigital ? '#000' : '#fff'}; font-size: 0.55em; font-weight: 900; padding: 2px 6px; border-radius: 4px; z-index: 5;">
                        ${esDigital ? 'DIGITAL' : 'FÍSICO'}
                    </div>
                    <img src="${fotoUrl}" style="max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0px 5px 10px rgba(0,0,0,0.5));">
                </div>

                <div style="margin: 0 12px 12px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; flex-grow: 1;">
                    <div style="font-size: 0.6em; color: #666; text-transform: uppercase; margin-bottom: 4px; font-weight: bold;">Reseña Personal</div>
                    <div style="font-size: 0.78em; color: #ddd; line-height: 1.4; font-style: italic;">
                        "${j["Comentarios"] || "Sin comentarios registrados."}"
                    </div>
                </div>

                <div class="card-footer" style="position: absolute; bottom: 12px; left: 15px; right: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="font-size: 0.6em; color: #666;">
                            <i class="fa-regular fa-calendar"></i> ${j["Primera Fecha"] || "—"}
                        </div>
                        <div style="font-size: 0.6em; color: #888; font-weight: bold;">
                            <i class="fa-solid fa-flag-checkered"></i> ${j["Ultima Fecha"] || "—"}
                        </div>
                    </div>
                    
                    <div style="background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); padding: 4px 10px; border-radius: 6px; display: flex; align-items: center; gap: 5px;">
                        <i class="fa-regular fa-clock" style="color: #00ff88; font-size: 0.8em;"></i>
                        <span style="color: #fff; font-size: 0.85em; font-weight: 900;">${j["Duración"] || "0"}h</span>
                    </div>
                </div>
            </div>`;
        } catch (e) {
            console.error("Error en played.js:", e, j);
            return "";
        }
    }).join('');
}
