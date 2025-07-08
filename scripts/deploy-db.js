// A script to deploy database migrations to Supabase
import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Check if required environment variables are set
const requiredVars = [
  "SUPABASE_DB_URL",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_ID",
];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.error("Please check your .env file");
  process.exit(1);
}

// Run the command with the environment variables from .env
try {
  console.log("Deploying database migrations...");
  execSync(`supabase db push --db-url "${process.env.SUPABASE_DB_URL}"`, {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Database migrations deployed successfully!");
} catch (error) {
  console.error("Failed to deploy database migrations:", error.message);
  process.exit(1);
}
