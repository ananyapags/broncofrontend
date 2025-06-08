import { createServer } from "vite";
import path from "path";

async function startDevServer() {
  const server = await createServer({
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    server: {
      host: "0.0.0.0",
      port: 5000,
    },
  });

  await server.listen();
  server.printUrls();
}

startDevServer().catch((err) => {
  console.error("Error starting dev server:", err);
  process.exit(1);
});