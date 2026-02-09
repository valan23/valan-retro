/**
 * utils.js - Funciones globales compartidas
 */
const TASA_CAMBIO_YEN = 180;

const AppUtils = {
    isValid: (val) => val && val.toString().trim() !== "" && val.toString().toUpperCase() !== "NA",

    // CORREGIDO: Ahora busca la carpeta real definida en la marca
    getPlatformFolder: (platform) => {
        if (!platform) return "otros";
        
        // 1. Mapeo manual: Nombre en CSV -> Nombre de tu Carpeta
        const folderMap = { 
            "Famicom": "fc", 
            "Famicom Disk System": "fds", 
            "Super Famicom": "sfc",
            "Nintendo 64": "n64",
            "Game Boy": "gb",
            "Game Boy Color": "gbc",
            "Game Boy Advance": "gba",
            "Game Cube": "gc",
            "Nintendo DS": "nds",
            "Nintendo 3DS": "3ds",
            "Switch": "switch",
            "Master System": "sms",
            "Mega Drive": "smd",
            "Game Gear": "gg",
            "PlayStation": "psx",
            "PlayStation 2": "ps2",
            "PlayStation 4": "ps4",
            "PlayStation 5": "ps5",
            "Xbox 360": "x360",
            "Dreamcast": "dc"
        };

        const p = platform.trim();
        
        // 2. Si existe en el mapa, devolvemos la carpeta corta
        if (folderMap[p]) return folderMap[p];

        // 3. Si no existe (ej. "Windows"), lo limpia automáticamente:
        // Quita espacios, pone minúsculas y quita caracteres raros
        return p.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[^a-z0-9]/g, '');
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

    getEdicionIcon: (edicionTexto) => {
        if (!edicionTexto) return '<i class="fa-solid fa-star"></i>';
        const upperEd = edicionTexto.toUpperCase().trim();
        
        // Mapeo de nombres a imágenes
        const iconos = {
            "STEAM": "images/icons/steam.png",
            "GAME PASS": "images/icons/xboxgamepass.png",
            "XBOX GAME PASS": "images/icons/xboxgamepass.png",
            "PS PLUS": "images/icons/psplus.png",
            "PLAYSTATION PLUS": "images/icons/psplus.png",
            "NINTENDO SWITCH ONLINE": "images/icons/nso.png",
            "NSO": "images/icons/nso.png",
            "RETROARCH": "images/icons/retroarch.png",
            "EPIC GAMES": "images/icons/epicgames.png",
            "BATTLE.NET": "images/icons/battlenet.png",
            "GOG": "images/icons/gogcom.png"
        };

        if (iconos[upperEd]) {
            return `<img src="${iconos[upperEd]}" style="height: 14px; width: auto; object-fit: contain;">`;
        }

        // Si no es un servicio conocido, ponemos un icono genérico según palabras clave
        if (upperEd.includes("STEAM")) return '<i class="fa-brands fa-steam"></i>';
        if (upperEd.includes("XBOX")) return '<i class="fa-brands fa-xbox"></i>';
        if (upperEd.includes("PLAYSTATION")) return '<i class="fa-brands fa-playstation"></i>';
        
        return '<i class="fa-solid fa-star"></i>'; // Por defecto
    },
        return `<span class="fi fi-${code}"></span>`;
    }
};
