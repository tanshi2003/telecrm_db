const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const db = require('../config/db');

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/001_create_calling_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = migrationSQL
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement + ';');
    
    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement.trim());
      await db.query(statement);
    }
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations(); 