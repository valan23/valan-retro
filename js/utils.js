/**
 * utils.js - Funciones globales compartidas
 */
const TASA_CAMBIO_YEN = 180;

const AppUtils = {
    isValid: (val) => val && val.toString().trim() !== "" && val.toString().toUpperCase() !== "NA",

    // CORREGIDO: Ahora busca la carpeta real definida en la marca
    getPlatformFolder: (platformName) => {
        if (!platformName || typeof BRANDS_CONFIG === 'undefined') return "otros";
        for (const brand in BRANDS_CONFIG) {
            if (BRANDS_CONFIG[brand].platforms.includes(platformName)) {
                return BRANDS_CONFIG[brand].folder;
            }
        }
        // Fallback: si no la encuentra, limpia el nombre
        return platformName.toLowerCase().replace(/\s+/g, '');
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
        // Detecta si es moneda japonesa
        const esTiendaJaponesa = precioStr.includes('¥') || pLow.includes('surugaya') || pLow.includes('mercari') || pLow.includes('yen');
        
        return esTiendaJaponesa ? (num / TASA_CAMBIO_YEN) : num;
    },

    // CORREGIDO: Usamos los colores de rareza que definiste en el otro archivo para ser consistentes
    getRarezaColor: (rareza) => {
        if (typeof RAREZA_COLORS === 'undefined') return "#aaa";
        const r = (rareza || "").toUpperCase().trim();
        return RAREZA_COLORS[r] || RAREZA_COLORS["DEFAULT"];
    },

    formatEstado: (estado) => {
        if (!estado) return "-";
        return estado.toString().toUpperCase();
    },

    // CORREGIDO: Ahora detecta la clase CSS basándose en tu BRANDS_CONFIG
    getBrandClass: (platformName) => {
        if (!platformName || typeof BRANDS_CONFIG === 'undefined') return "otros";
        for (const brand in BRANDS_CONFIG) {
            if (BRANDS_CONFIG[brand].platforms.includes(platformName)) {
                return BRANDS_CONFIG[brand].class;
            }
        }
        return "otros";
    },

    getPlatformIcon: (platformName) => {
        if (!platformName || typeof BRANDS_CONFIG === 'undefined') return '';
        for (const brand in BRANDS_CONFIG) {
            if (BRANDS_CONFIG[brand].icons?.[platformName]) {
                return `<img src="${BRANDS_CONFIG[brand].icons[platformName]}" alt="${platformName}" style="height: 20px; width: auto; object-fit: contain;">`;
            }
        }
        return `<span class="platform-tag">${platformName}</span>`;
    },

    getFlag: (region) => {
        if (!region) return '<span class="fi fi-xx"></span>';
        const codes = { 
            "ESP": "es", "JAP": "jp", "USA": "us", "EU": "eu", 
            "UK": "gb", "ITA": "it", "GER": "de", "AUS": "au", 
            "ASIA": "hk", "KOR": "kr" 
        };
        const r = region.toUpperCase().trim();
        let code = "xx";
        for (let key in codes) { 
            if (r.includes(key)) {
                code = codes[key];
                break; 
            }
        }
        return `<span class="fi fi-${code}"></span>`;
    }
};
