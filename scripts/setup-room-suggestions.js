import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ESM module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL and key must be set in .env file");
  process.exit(1);
}

// Initialize Supabase client - using service key is better for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Parse SQL file to extract insert values
function parseInsertStatements(sql) {
  const categoryData = {};

  // Extract all INSERT statements
  const insertRegex =
    /INSERT INTO room_name_suggestions \(category, text(?:, food_mode)?\) VALUES\s*([^;]+);/g;
  let match;

  while ((match = insertRegex.exec(sql)) !== null) {
    const valuesSection = match[1];

    // Extract each row of values
    const valuesRegex = /\('([^']+)', '([^']+)'(?:, '([^']+)')?\)/g;
    let valuesMatch;

    while ((valuesMatch = valuesRegex.exec(valuesSection)) !== null) {
      const category = valuesMatch[1];
      const text = valuesMatch[2];
      const foodMode = valuesMatch[3] || null;

      if (!categoryData[category]) {
        categoryData[category] = [];
      }

      categoryData[category].push({
        category,
        text,
        food_mode: foodMode,
      });
    }
  }

  return categoryData;
}

async function setupRoomSuggestions() {
  try {
    console.log("Setting up room suggestions...");

    // Read the SQL file
    const sqlFilePath = path.join(
      __dirname,
      "../supabase/migrations/room_name_suggestions.sql"
    );
    const sql = await fs.promises.readFile(sqlFilePath, "utf8");

    // 1. Try to access the table to check if it exists
    console.log("Checking if table exists...");
    try {
      const { data, error } = await supabase
        .from("room_name_suggestions")
        .select("count(*)")
        .limit(1);

      if (error) {
        console.log("Table does not exist, creating it...");
        // Table doesn't exist, let's create it
        console.log(`
          Please create the table manually in the Supabase dashboard with this structure:
          
          CREATE TABLE room_name_suggestions (
            id SERIAL PRIMARY KEY,
            category TEXT NOT NULL,
            text TEXT NOT NULL,
            food_mode TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        const proceed = await askQuestion(
          "Have you created the table? (yes/no): "
        );
        if (proceed.toLowerCase() !== "yes") {
          console.log("Exiting. Please create the table first.");
          process.exit(1);
        }
      } else {
        console.log("Table exists, continuing...");
      }
    } catch (e) {
      console.error("Error accessing room_name_suggestions table:", e);
      console.log(`
        Please create the table manually in the Supabase dashboard with this structure:
        
        CREATE TABLE room_name_suggestions (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          text TEXT NOT NULL,
          food_mode TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      process.exit(1);
    }

    // 2. Clear existing data - only do this if requested
    console.log("Clearing existing data...");
    const { error: deleteError } = await supabase
      .from("room_name_suggestions")
      .delete()
      .neq("id", 0); // This condition matches everything

    if (deleteError) {
      console.error("Error clearing existing data:", deleteError);
    } else {
      console.log("Successfully cleared existing data");
    }

    // 3. Parse the SQL to extract the data for each category
    console.log("Parsing SQL data...");
    const categoryData = parseInsertStatements(sql);
    console.log(`Found ${Object.keys(categoryData).length} categories`);

    // 4. Insert the data for each category
    for (const [category, items] of Object.entries(categoryData)) {
      console.log(
        `Inserting ${items.length} items for category ${category}...`
      );

      // Insert in batches of 50 to avoid request size limitations
      const batchSize = 50;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from("room_name_suggestions")
          .insert(batch);

        if (insertError) {
          console.error(`Error inserting batch for ${category}:`, insertError);
        } else {
          console.log(
            `Successfully inserted batch ${
              Math.floor(i / batchSize) + 1
            }/${Math.ceil(items.length / batchSize)} for ${category}`
          );
        }
      }
    }

    console.log("Successfully set up room suggestions!");

    // Verify the suggestions were inserted
    const { data, error } = await supabase
      .from("room_name_suggestions")
      .select("category, count(*)")
      .group("category");

    if (error) {
      throw new Error(`Query Error: ${error.message}`);
    }

    console.log("Suggestion counts by category:");
    data.forEach((row) => {
      console.log(`${row.category}: ${row.count} suggestions`);
    });
  } catch (error) {
    console.error("Error setting up room suggestions:", error);
  }
}

// Helper function to ask user questions
function askQuestion(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

setupRoomSuggestions();
