function renderGames(games) {
    const container = document.getElementById('game-grid');
    if (!container) return;

    // Sincronización de filtros
    if (typeof renderFormatFilters === 'function') {
        // Usamos window.dataStore para asegurar acceso global
        const fullData = (window.dataStore && window.dataStore['videojuegos']) ? window.dataStore['videojuegos'] : games;
        renderFormatFilters(fullData, 'format-buttons-container-games', 'game');
    }

    container.innerHTML = "";

    if (!games || games.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 40px; color: #888;'>No se encontraron juegos con estos filtros.</p>";
        return;
    }

    // Renderizado directo (más fiable para debuguear)
    const html = games.map(j => createCardHTML(j)).join('');
    container.innerHTML = html;
}

function createCardHTML(j) {
    try {
        const plat = j["Plataforma"] || "";
        // Verificación de seguridad para AppUtils
        if (typeof AppUtils === 'undefined') return "";

        const carpeta = AppUtils.getPlatformFolder(plat);
        const portada = j["Portada"] ? j["Portada"].trim() : "";
        const fotoUrl = AppUtils.isValid(portada) ? `images/covers/${carpeta}/${portada}` : `images/covers/default.webp`;
        
        const styleRegion = AppUtils.getRegionStyle(j["Región"]);
        const colorComp = AppUtils.getCompletitudStyle(j["Completitud"]);
        const colorRareza = typeof AppUtils.getRarezaColor === 'function' ? AppUtils.getRarezaColor(j["Rareza"]) : "#ccc";
        
        const esDigital = (j["Formato"] || "").toString().toUpperCase().includes("DIGITAL");
        const esEspecial = AppUtils.isValid(j["Edición"]) && j["Edición"].toUpperCase() !== "ESTÁNDAR";

        return `
        <div class="card ${getBrandClass(plat)} ${esDigital ? 'digital-variant' : 'physical-variant'}">
            <div class="platform-icon-card">${getPlatformIcon(plat)}</div>
            <div class="completitud-badge" style="background-color: ${colorComp};">
                ${(j["Completitud"] || "???").toUpperCase()}
            </div>
            <div class="card-header-info">
                <span class="year-badge">${j["Año"] || "????"}</span>
                <div class="region-badge" style="background: ${styleRegion.bg}; border-color: ${styleRegion.border}; color: ${styleRegion.text};">
                    ${getFlag(j["Región"])} <span>${j["Región"] || "N/A"}</span>
                </div>
                <span class="rarity-text" style="color: ${colorRareza};">💎 ${j["Rareza"] || "COMÚN"}</span>
            </div>
            <div class="title-container">
                <div class="game-title">${j["Nombre Juego"]}</div>
                ${AppUtils.isValid(j["Nombre Japones"]) ? `<div class="jp-title">${j["Nombre Japones"]}</div>` : ''}
                ${esEspecial ? `<div class="edition-text"><i class="fa-solid fa-star"></i> ${j["Edición"]}</div>` : ''}
            </div>
            <div class="cover-container">
                <div class="format-tag ${esDigital ? 'tag-digital' : 'tag-fisico'}">${esDigital ? 'Digital' : 'Físico'}</div>
                <img src="${fotoUrl}" loading="lazy" onerror="this.src='images/covers/default.webp'">
            </div>
            <div class="status-grid">
                ${esDigital ? '<div class="digital-notice">CONTENIDO DIGITAL</div>' : 
                    [{l: 'Caja', v: j["Estado Caja"]}, {l: 'Inserto', v: j["Estado Inserto"]}, {l: 'Portada', v: j["Estado Portada"]}, {l: 'Manual', v: j["Estado Manual"]}, {l: 'Juego', v: j["Estado Juego"]}, {l: 'Obi', v: j["Estado Spinecard"]}, {l: 'Extras', v: j["Estado Extras"]}]
                    .filter(i => AppUtils.isValid(i.v)).map(i => `
                    <div class="status-row"><span>${i.l}</span><b>${typeof AppUtils.formatEstado === 'function' ? AppUtils.formatEstado(i.v) : i.v}</b></div>`).join('')}
            </div>
            <div class="card-footer">
                <div class="rev-date">${j["Fecha revision"] || 'Sin fecha'}</div>
                <div class="price-tag">💸 ${j["Tasación Actual"] || "S/T"}</div>
            </div>
        </div>`;
    } catch (e) { 
        console.error("Error renderizando carta:", e);
        return ""; 
    }
}
