const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");


// ================================
// CREATE DATA FOLDER
// ================================

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}


// ================================
// DEFAULT SETTINGS
// ================================

const defaultSettings = {
    theme: "dark",
    notifications: true,
    wallpaper: "apex",
    sound: true
};


// ================================
// CREATE SETTINGS FILE
// ================================

if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(defaultSettings, null, 2)
    );
}


// ================================
// READ SETTINGS
// ================================

function getSettings() {
    try {
        return JSON.parse(
            fs.readFileSync(SETTINGS_FILE, "utf8")
        );
    } catch {
        return defaultSettings;
    }
}


// ================================
// SAVE SETTINGS
// ================================

function saveSettings(settings) {
    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(settings, null, 2)
    );
}


// ================================
// JSON RESPONSE
// ================================

function sendJSON(res, status, data) {

    res.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end(JSON.stringify(data));
}


// ================================
// READ POST BODY
// ================================

function readBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {

                resolve(
                    body ? JSON.parse(body) : {}
                );

            } catch {

                reject(
                    new Error("Invalid JSON")
                );

            }

        });

        req.on("error", reject);

    });

}


// ================================
// APEX APPS
// ================================

const apps = [
    {
        id: "browser",
        name: "Browser"
    },
    {
        id: "youtube",
        name: "YouTube"
    },
    {
        id: "instagram",
        name: "Instagram"
    },
    {
        id: "settings",
        name: "Settings"
    },
    {
        id: "files",
        name: "Files"
    },
    {
        id: "gallery",
        name: "Gallery"
    },
    {
        id: "camera",
        name: "Camera"
    },
    {
        id: "clock",
        name: "Clock"
    },
    {
        id: "calendar",
        name: "Calendar"
    },
    {
        id: "calculator",
        name: "Calculator"
    },
    {
        id: "media",
        name: "Media Player"
    }
];


// ================================
// SERVER
// ================================

const server = http.createServer(async (req, res) => {

    // --------------------------------
    // CORS PREFLIGHT
    // --------------------------------

    if (req.method === "OPTIONS") {

        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });

        res.end();

        return;
    }


    // --------------------------------
    // HOME
    // --------------------------------

    if (req.method === "GET" && req.url === "/") {

        sendJSON(res, 200, {
            success: true,
            name: "APEX OS Backend",
            version: "1.0.0",
            message: "APEX OS backend is running"
        });

        return;
    }


    // --------------------------------
    // STATUS
    // --------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/status"
    ) {

        sendJSON(res, 200, {
            success: true,
            name: "APEX OS Backend",
            status: "online",
            uptime: process.uptime(),
            time: new Date().toISOString()
        });

        return;
    }


    // --------------------------------
    // SYSTEM
    // --------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/system"
    ) {

        sendJSON(res, 200, {

            success: true,

            system: {
                name: "APEX OS",
                version: "2.0",
                backend: "Node.js",
                status: "online"
            }

        });

        return;
    }


    // --------------------------------
    // APPS
    // --------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/apps"
    ) {

        sendJSON(res, 200, {
            success: true,
            apps: apps
        });

        return;
    }


    // --------------------------------
    // GET SETTINGS
    // --------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/settings"
    ) {

        sendJSON(res, 200, {
            success: true,
            settings: getSettings()
        });

        return;
    }


    // --------------------------------
    // SAVE SETTINGS
    // --------------------------------

    if (
        req.method === "POST" &&
        req.url === "/api/settings"
    ) {

        try {

            const newSettings = await readBody(req);

            const currentSettings = getSettings();

            const updatedSettings = {
                ...currentSettings,
                ...newSettings
            };

            saveSettings(updatedSettings);

            sendJSON(res, 200, {
                success: true,
                message: "Settings saved",
                settings: updatedSettings
            });

        } catch (error) {

            sendJSON(res, 400, {
                success: false,
                error: error.message
            });

        }

        return;
    }


    // --------------------------------
    // 404
    // --------------------------------

    sendJSON(res, 404, {
        success: false,
        error: "Not Found"
    });

});


// ================================
// START SERVER
// ================================

server.listen(PORT, () => {

    console.log(
        `APEX OS Backend running on port ${PORT}`
    );

});
