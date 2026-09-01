const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;

// ==========================================
// APEX OS CONFIG
// ==========================================

const APP_NAME = "APEX OS";
const VERSION = "2.0.0";

const DATA_DIR = path.join(__dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// ==========================================
// CREATE DATA DIRECTORY
// ==========================================

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==========================================
// DEFAULT SETTINGS
// ==========================================

const DEFAULT_SETTINGS = {
    theme: "dark",
    notifications: true,
    sound: true,
    wallpaper: "apex",
    language: "English"
};

// ==========================================
// CREATE SETTINGS FILE
// ==========================================

if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(DEFAULT_SETTINGS, null, 2)
    );
}

// ==========================================
// SETTINGS FUNCTIONS
// ==========================================

function getSettings() {
    try {
        const data = fs.readFileSync(SETTINGS_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(settings) {
    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(settings, null, 2)
    );
}

// ==========================================
// JSON RESPONSE
// ==========================================

function sendJSON(res, statusCode, data) {

    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end(JSON.stringify(data, null, 2));
}

// ==========================================
// HTML RESPONSE
// ==========================================

function sendHTML(res, statusCode, html) {

    res.writeHead(statusCode, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache"
    });

    res.end(html);
}

// ==========================================
// READ REQUEST BODY
// ==========================================

function readBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new Error("Invalid JSON"));
            }

        });

        req.on("error", error => {
            reject(error);
        });

    });
}

// ==========================================
// APEX OS APPLICATIONS
// ==========================================

const APPS = [

    {
        id: "browser",
        name: "Browser",
        category: "Internet"
    },

    {
        id: "youtube",
        name: "YouTube",
        category: "Entertainment"
    },

    {
        id: "instagram",
        name: "Instagram",
        category: "Social"
    },

    {
        id: "settings",
        name: "Settings",
        category: "System"
    },

    {
        id: "files",
        name: "Files",
        category: "System"
    },

    {
        id: "gallery",
        name: "Gallery",
        category: "Media"
    },

    {
        id: "camera",
        name: "Camera",
        category: "Media"
    },

    {
        id: "clock",
        name: "Clock",
        category: "System"
    },

    {
        id: "calendar",
        name: "Calendar",
        category: "Productivity"
    },

    {
        id: "calculator",
        name: "Calculator",
        category: "Productivity"
    },

    {
        id: "media",
        name: "Media Player",
        category: "Entertainment"
    }

];

// ==========================================
// SERVER
// ==========================================

const server = http.createServer(async (req, res) => {

    const parsedURL = url.parse(req.url, true);
    const pathname = parsedURL.pathname;

    // ======================================
    // CORS
    // ======================================

    if (req.method === "OPTIONS") {

        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });

        res.end();

        return;
    }

    // ======================================
    // APEX OS FRONTEND
    // ======================================

    if (
        req.method === "GET" &&
        pathname === "/"
    ) {

        const indexFile = path.join(
            __dirname,
            "index.html"
        );

        fs.readFile(
            indexFile,
            "utf8",
            (error, content) => {

                if (error) {

                    sendHTML(
                        res,
                        500,
                        `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>APEX OS</title>
                        </head>
                        <body>
                            <h1>APEX OS</h1>
                            <p>index.html was not found.</p>
                        </body>
                        </html>
                        `
                    );

                    return;
                }

                sendHTML(
                    res,
                    200,
                    content
                );

            }
        );

        return;
    }

    // ======================================
    // BACKEND STATUS
    // ======================================

    if (
        req.method === "GET" &&
        pathname === "/api/status"
    ) {

        sendJSON(res, 200, {

            success: true,

            backend: APP_NAME,

            status: "online",

            version: VERSION,

            uptime: process.uptime(),

            serverTime: new Date().toISOString()

        });

        return;
    }

    // ======================================
    // SYSTEM INFORMATION
    // ======================================

    if (
        req.method === "GET" &&
        pathname === "/api/system"
    ) {

        sendJSON(res, 200, {

            success: true,

            system: {

                name: APP_NAME,

                version: VERSION,

                backend: "Node.js",

                platform: process.platform,

                architecture: process.arch,

                status: "online"

            }

        });

        return;
    }

    // ======================================
    // APPLICATION LIST
    // ======================================

    if (
        req.method === "GET" &&
        pathname === "/api/apps"
    ) {

        sendJSON(res, 200, {

            success: true,

            count: APPS.length,

            apps: APPS

        });

        return;
    }

    // ======================================
    // GET SETTINGS
    // ======================================

    if (
        req.method === "GET" &&
        pathname === "/api/settings"
    ) {

        sendJSON(res, 200, {

            success: true,

            settings: getSettings()

        });

        return;
    }

    // ======================================
    // SAVE SETTINGS
    // ======================================

    if (
        req.method === "POST" &&
        pathname === "/api/settings"
    ) {

        try {

            const incomingSettings =
                await readBody(req);

            const currentSettings =
                getSettings();

            const updatedSettings = {

                ...currentSettings,

                ...incomingSettings

            };

            saveSettings(
                updatedSettings
            );

            sendJSON(res, 200, {

                success: true,

                message: "APEX OS settings saved",

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

    // ======================================
    // API INFORMATION
    // ======================================

    if (
        req.method === "GET" &&
        pathname === "/api"
    ) {

        sendJSON(res, 200, {

            success: true,

            name: APP_NAME,

            version: VERSION,

            endpoints: [

                "GET /api/status",

                "GET /api/system",

                "GET /api/apps",

                "GET /api/settings",

                "POST /api/settings"

            ]

        });

        return;
    }

    // ======================================
    // 404
    // ======================================

    sendJSON(res, 404, {

        success: false,

        error: "Not Found",

        path: pathname

    });

});

// ==========================================
// START SERVER
// ==========================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `${APP_NAME} backend running`
        );

        console.log(
            `Port: ${PORT}`
        );

    }
);

// ==========================================
// ERROR HANDLING
// ==========================================

server.on("error", error => {

    console.error(
        "Server error:",
        error
    );

});
