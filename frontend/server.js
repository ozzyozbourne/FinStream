import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const buildPath = path.join(__dirname, "build");

// Environment-specific base path, default "/"
const base = process.env.PUBLIC_URL || "/";

// Mount static files at that base
app.use(base, express.static(buildPath));

// SPA fallback for React router
app.get(`${base}*`, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(80, () => {
    console.log(`Serving build at ${base} on port 80`);
});


#server.js
