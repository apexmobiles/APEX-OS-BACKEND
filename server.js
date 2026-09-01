const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/api/status") {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      name: "APEX OS Backend",
      status: "online"
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: "Not Found"
  }));
});

server.listen(PORT, () => {
  console.log(`APEX OS Backend running on port ${PORT}`);
});
