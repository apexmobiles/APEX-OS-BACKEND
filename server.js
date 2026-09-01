const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// =====================================
// APEX OS
// =====================================

const SYSTEM = {
    name: "APEX OS",
    version: "2.0.0",
    status: "online"
};

// =====================================
// DATA
// =====================================

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_SETTINGS = {
    theme: "dark",
    wallpaper: "apex",
    notifications: true,
    sound: true,
    language: "English"
};

if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(DEFAULT_SETTINGS, null, 2)
    );
}

function getSettings() {
    try {
        return JSON.parse(
            fs.readFileSync(SETTINGS_FILE, "utf8")
        );
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function saveSettings(settings) {
    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(settings, null, 2)
    );
}

// =====================================
// APPS
// =====================================

const APPS = [
    { id: "browser", name: "Browser" },
    { id: "youtube", name: "YouTube" },
    { id: "instagram", name: "Instagram" },
    { id: "settings", name: "Settings" },
    { id: "files", name: "Files" },
    { id: "gallery", name: "Gallery" },
    { id: "camera", name: "Camera" },
    { id: "clock", name: "Clock" },
    { id: "calendar", name: "Calendar" },
    { id: "calculator", name: "Calculator" },
    { id: "media", name: "Media Player" }
];

// =====================================
// JSON RESPONSE
// =====================================

function json(res, status, data) {

    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end(JSON.stringify(data, null, 2));
}

// =====================================
// HTML RESPONSE
// =====================================

function html(res, status, content) {

    res.writeHead(status, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache"
    });

    res.end(content);
}

// =====================================
// REQUEST BODY
// =====================================

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

        req.on("error", reject);
    });
}

// =====================================
// SERVER
// =====================================

const server = http.createServer(async (req, res) => {

    // ---------------------------------
    // OPTIONS
    // ---------------------------------

    if (req.method === "OPTIONS") {

        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });

        res.end();

        return;
    }

    // ---------------------------------
    // FRONTEND
    // ---------------------------------

    if (req.method === "GET" && req.url === "/") {

        const file = path.join(
            __dirname,
            "index.html"
        );

        fs.readFile(file, "utf8", (error, content) => {

            if (error) {

                html(res, 500, `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>APEX OS</title>
</head>

<body style="
background:#05070c;
color:white;
font-family:Arial;
text-align:center;
padding:60px;
">

<h1>APEX OS</h1>

<p>index.html not found.</p>

</body>
</html>
                `);

                return;
            }

            html(res, 200, content);
        });

        return;
    }

    // ---------------------------------
    // STATUS
    // ---------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/status"
    ) {

        json(res, 200, {

            success: true,

            name: SYSTEM.name,

            status: SYSTEM.status,

            version: SYSTEM.version,

            uptime: Math.floor(process.uptime()),

            serverTime: new Date().toISOString()

        });

        return;
    }

    // ---------------------------------
    // SYSTEM
    // ---------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/system"
    ) {

        json(res, 200, {

            success: true,

            system: SYSTEM,

            runtime: {
                platform: process.platform,
                architecture: process.arch,
                node: process.version
            }

        });

        return;
    }

    // ---------------------------------
    // APPS
    // ---------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/apps"
    ) {

        json(res, 200, {

            success: true,

            count: APPS.length,

            apps: APPS

        });

        return;
    }

    // ---------------------------------
    // GET SETTINGS
    // ---------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/settings"
    ) {

        json(res, 200, {

            success: true,

            settings: getSettings()

        });

        return;
    }

    // ---------------------------------
    // SAVE SETTINGS
    // ---------------------------------

    if (
        req.method === "POST" &&
        req.url === "/api/settings"
    ) {

        try {

            const incoming =
                await readBody(req);

            const current =
                getSettings();

            const updated = {
                ...current,
                ...incoming
            };

            saveSettings(updated);

            json(res, 200, {

                success: true,

                message: "Settings saved",

                settings: updated

            });

        } catch (error) {

            json(res, 400, {

                success: false,

                error: error.message

            });

        }

        return;
    }

    // ---------------------------------
    // API INFORMATION
    // ---------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api"
    ) {

        json(res, 200, {

            success: true,

            name: SYSTEM.name,

            version: SYSTEM.version,

            endpoints: [
                "GET /api",
                "GET /api/status",
                "GET /api/system",
                "GET /api/apps",
                "GET /api/settings",
                "POST /api/settings"
            ]

        });

        return;
    }

    // ---------------------------------
    // 404
    // ---------------------------------

    json(res, 404, {

        success: false,

        error: "Not Found",

        path: req.url

    });

});

// =====================================
// START
// =====================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "APEX OS Backend is running"
        );

        console.log(
            `Port: ${PORT}`
        );

    }
);

// =====================================
// SERVER ERROR
// =====================================

server.on("error", error => {

    console.error(
        "APEX OS Server Error:",
        error
    );

});
