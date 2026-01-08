import express from "express";
import { routes } from "./routes.js";
import { apiKeyAuth, rateLimiter } from "../auth/simple-middleware.js";

export function startHttpServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint (no auth required)
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "0.1.0"
    });
  });

  // Apply middleware to protected routes
  app.use(rateLimiter);
  app.use(apiKeyAuth);

  app.post("/demo/validate", routes["/validate"]);
  app.post("/demo/breaking", routes["/breaking"]);

  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`Demo HTTP server on :${port}`)
  );
}
