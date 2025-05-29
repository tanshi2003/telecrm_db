const db = require('../config/db');

const migration = `
-- Add manager_id column to campaigns table
ALTER TABLE campaigns
ADD COLUMN manager_id INT,
ADD FOREIGN KEY (manager_id) REFERENCES users(id);

-- Make admin_id nullable
ALTER TABLE campaigns
MODIFY COLUMN admin_id INT NULL;
`;

db.query(migration, (err, results) => {
    if (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
    console.log('Migration completed successfully');
    process.exit(0);
}); 