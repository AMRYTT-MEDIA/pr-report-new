const { createServer } = require("http");
const { parse } = require("url");

const next = require("next");

const port = process.env.PORT || 5000;
const hostname = "0.0.0.0";

const app = next({ dev: false, port, hostname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
