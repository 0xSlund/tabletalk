import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ----------------------------------------
// Security middleware
// ----------------------------------------

// Set common secure HTTP headers
app.use(helmet());

// Basic rate-limiting to mitigate brute-force & DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Restrict CORS to configured origins (comma-separated list in env)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true, // allow all in dev if none specified
    credentials: true
  })
);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "dist")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Handle all routes by serving the index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Error loading application");
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, "dist")}`);
});
