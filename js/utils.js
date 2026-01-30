/**
 * utils.js - Funciones globales compartidas
 */
const TASA_CAMBIO_YEN = 180;

const AppUtils = {
    isValid: (val) => val && val.toString().trim() !== "" && val.toString().toUpperCase() !== "NA",

    getPlatformFolder: (platform) => {
        const platformMap = { "Famicom": "fc", "Famicom Disk System": "fds", "Super Famicom": "sfc" };
        const p = platform ? platform.trim() : "";
        return platformMap[p] || p.toLowerCase().replace(/\s+/g, '');
    },

    getRegionStyle: (region) => {
        const def = { bg: "rgba(255,255,255,0.1)", text: "#ccc", border: "transparent" };
        if (!region || typeof REGION_COLORS === 'undefined') return def;
        const r = region.toUpperCase().trim();
        return REGION_COLORS[r] || def;
    },

    getCompletitudStyle: (valor) => {
        if (!valor || typeof COMPLETITUD_COLORS === 'undefined') return "#555";
        const v = valor.toUpperCase().trim();
        if (COMPLETITUD_COLORS[v]) return COMPLETITUD_COLORS[v].color;
        for (let key in COMPLETITUD_COLORS) {
            if (v.includes(key)) return COMPLETITUD_COLORS[key].color;
        }
        return "#555";
    },

    obtenerValorEnEuros: (precioStr) => {
        if (!AppUtils.isValid(precioStr)) return Infinity;
        const numStr = precioStr.toString().replace(/[^\d,.]/g, '').replace(',', '.');
        const num = parseFloat(numStr);
        if (isNaN(num)) return Infinity;

        const pLow = precioStr.toLowerCase();
        const esTiendaJaponesa = precioStr.includes('¥') || pLow.includes('surugaya') || pLow.includes('mercari');
        
        return esTiendaJaponesa ? (num / TASA_CAMBIO_YEN) : num;
    },

    // --- FUNCIONES AÑADIDAS PARA EVITAR EL SYNTAX ERROR ---
    getRarezaColor: (rareza) => {
        const r = (rareza || "").toUpperCase();
        if (r.includes("MUY RARA")) return "#ff4500"; // Naranja rojizo
        if (r.includes("RARA")) return "#ffa500";     // Naranja
        if (r.includes("ÉPICA")) return "#bf00ff";    // Púrpura
        return "#aaa";                                // Gris estándar
    },

    formatEstado: (estado) => {
        if (!estado) return "-";
        return estado.toString().toUpperCase();
    }
};
