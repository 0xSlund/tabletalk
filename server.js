import express from "express";
import cors from "cors";
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
app.use(cors());
app.use(express.json());

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
