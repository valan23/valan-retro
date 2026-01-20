/* --- CONFIGURACIÓN DE RUTAS --- */
// Tu hoja principal (Videojuegos)
const CSV_URL_JUEGOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRU7IaxX65IH0Ph-KEl06nrFvuyL2w6oBt7vxaJ96XDLjsO9CDpzYVwl3VDIvx5IG20KXSb6XhF7buX/pub?gid=600973717&single=true&output=csv";

// TU NUEVA HOJA (Juegos Deseados)
// Nota: He usado el ID de tu Google Sheets. 
// IMPORTANTE: Asegúrate de que el gid=XXXXXXXX sea el que corresponde a la pestaña "DeseadosJuegos"
const CSV_URL_DESEADOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRU7IaxX65IH0Ph-KEl06nrFvuyL2w6oBt7vxaJ96XDLjsO9CDpzYVwl3VDIvx5IG20KXSb6XhF7buX/pub?gid=1483244243&single=true&output=csv";

/* --- CONFIGURACIÓN DE MARCAS Y PLATAFORMAS --- */
const BRANDS_CONFIG = {
    "SEGA": { 
        logo: "images/icons/SEGA_logo.png", 
        class: "sega", 
        platforms: ["Master System", "Mega Drive", "Game Gear", "Mega CD", "Saturn", "32X", "Dreamcast"],
        icons: {
            "Master System": "images/icons/sms.png",
            "Mega Drive": "images/icons/smd.png",
            "Game Gear": "images/icons/gg.png",
            "Mega CD": "images/icons/mcd.png",
            "Saturn": "images/icons/ss.png",
            "32X": "images/icons/32x.png",
            "Dreamcast": "images/icons/dc.png"
        }
    },
    "NINTENDO": { 
        logo: "images/icons/NINTENDO_logo.png", 
        class: "nintendo", 
        platforms: ["Famicom", "Famicom Disk System", "Game Boy", "Super Famicom", "Virtual Boy", "Nintendo 64", "Game Boy Color", "Game Boy Advance", "Game Cube", "Nintendo DS", "Wii", "Nintendo 3DS", "Wii U", "Switch", "Switch 2"],
        icons: {
            "Famicom": "images/icons/fc.png",
            "Famicom Disk System": "images/icons/fds.png",
            "Game Boy": "images/icons/gb.png",
            "Super Famicom": "images/icons/sfc.png",
            "Virtual Boy": "images/icons/vb.png",
            "Nintendo 64": "images/icons/n64.png",
            "Game Boy Color": "images/icons/gbc.png",
            "Game Boy Advance": "images/icons/gba.png",
            "Game Cube": "images/icons/gc.png",
            "Nintendo DS": "images/icons/nds.png",
            "Wii": "images/icons/wii.png",
            "Nintendo 3DS": "images/icons/3ds.png",
            "Wii U": "images/icons/wiiu.png",
            "Switch": "images/icons/switch.png",
            "Switch 2": "images/icons/switch2.png"
        }
    },
    "SONY": { 
        logo: "images/icons/PLAYSTATION_logo.png", 
        class: "sony", 
        platforms: ["PlayStation", "PlayStation 2", "PlayStation Vita", "PlayStation 4", "PlayStation 5"],
        icons: {
            "PlayStation": "images/icons/psx.png",
            "PlayStation 2": "images/icons/ps2.png",
            "PlayStation Vita": "images/icons/psvita.png",
            "PlayStation 4": "images/icons/ps4.png",
            "PlayStation 5": "images/icons/ps5.png"
        }
    },
    "MICROSOFT": { 
        logo: "images/icons/MICROSOFT_logo.png", 
        class: "microsoft", 
        platforms: ["Xbox 360", "Xbox One", "Xbox Series X/S"],
        icons: {
            "Xbox 360": "images/icons/x360.png",
            "Xbox One": "images/icons/xone.png",
            "Xbox Series X/S": "images/icons/xsx.png",
        }
    },
    "OTROS": { 
        logo: "images/icons/OTROS_logo.png", 
        class: "otros", 
        platforms: ["PC Engine", "3DO", "WonderSwan Color"],
        icons: {
            "PC Engine": "images/icons/pce.png",
            "3DO": "images/icons/3do.png",
            "WonderSwan Color": "images/icons/wsc.png",
        }
    }
};

/* --- ESTILOS DE REGIÓN --- */
const REGION_COLORS = {
    "JAP": { bg: "rgba(255, 0, 0, 0.2)", text: "#ffffff", border: "rgba(255, 0, 0, 0.5)" },
    "ESP": { bg: "rgba(255, 183, 0, 0.2)", text: "#ffffff", border: "rgba(255, 183, 0, 0.5)" },
    "EU": { bg: "rgba(0, 0, 255, 0.2)", text: "#ffffff", border: "rgba(0, 0, 255, 0.5)" },
    "USA": { bg: "rgba(0, 255, 255, 0.2)", text: "#ffffff", border: "rgba(0, 255, 255, 0.5)" },
    "UK":  { bg: "rgba(128, 0, 128, 0.2)", text: "#ffffff", border: "rgba(128, 0, 128, 0.5)" },
    "ITA": { bg: "rgba(144, 238, 144, 0.2)", text: "#ffffff", border: "rgba(144, 238, 144, 0.5)" },
    "AUS": { bg: "rgba(0, 100, 0, 0.2)", text: "#ffffff", border: "rgba(0, 100, 0, 0.5)" },
    "GER": { bg: "rgba(255, 100, 255, 0.2)", text: "#ffffff", border: "rgba(255, 100, 255, 0.5)" },
    "ASIA": { bg: "rgba(255, 255, 0, 0.2)", text: "#ffffff", border: "rgba(255, 255, 0, 0.5)" }
};

/* --- ESTILOS DE COMPLETITUD --- */
const COMPLETITUD_COLORS = {
    "NUEVO": { color: "#bf00ff", label: "NUEVO" },
    "COMPLETO": { color: "#00ff88", label: "COMPLETO" },
    "CASI COMPLETO": { color: "#ffff00", label: "CASI COMPLETO" },
    "INCOMPLETO": { color: "#ffaa00", label: "INCOMPLETO" },
    "SUELTO": { color: "#ff4d4d", label: "SUELTO" },
    "REPRO": { color: "#bbbbbb", label: "REPRO" }
};
