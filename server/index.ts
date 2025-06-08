import express from "express";
import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = parseInt(process.env.PORT || "5000", 10);

async function startServer() {
  const app = express();

  if (isProduction) {
    // Production: serve built static files
    app.use(express.static(path.join(__dirname, "../dist")));
    
    // Handle SPA routing - send all requests to index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist/index.html"));
    });
  } else {
    // Development: use Vite dev server
    const vite = await createServer({
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      server: {
        middlewareMode: true,
      },
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (!isProduction) {
      console.log(`  ➜  Local:   http://localhost:${port}/`);
    }
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
  process.exit(1);
});