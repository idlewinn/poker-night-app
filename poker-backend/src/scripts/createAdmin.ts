import db from '../database/db';

// Script to create an admin user for testing
// This would normally be done through Google OAuth, but for testing we'll create one manually

const createAdminUser = () => {
  const adminData = {
    google_id: 'admin-test-123',
    email: 'admin@pokernight.com',
    name: 'Admin User',
    avatar_url: null as string | null,
    role: 'admin' as 'admin'
  };

  const sql = `
    INSERT OR REPLACE INTO users (google_id, email, name, avatar_url, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    adminData.google_id,
    adminData.email,
    adminData.name,
    adminData.avatar_url,
    adminData.role
  ], function(err) {
    if (err) {
      console.error('Error creating admin user:', err.message);
    } else {
      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminData.email);
      console.log('Role:', adminData.role);
      console.log('Google ID:', adminData.google_id);
    }
    
    // Close database connection
    db.close((closeErr) => {
      if (closeErr) {
        console.error('Error closing database:', closeErr.message);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
  });
};

// Create a test player user as well
const createPlayerUser = () => {
  const playerData = {
    google_id: 'player-test-456',
    email: 'player@pokernight.com',
    name: 'Test Player',
    avatar_url: null as string | null,
    role: 'player' as 'player'
  };

  const sql = `
    INSERT OR REPLACE INTO users (google_id, email, name, avatar_url, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    playerData.google_id,
    playerData.email,
    playerData.name,
    playerData.avatar_url,
    playerData.role
  ], function(err) {
    if (err) {
      console.error('Error creating player user:', err.message);
    } else {
      console.log('✅ Player user created successfully!');
      console.log('Email:', playerData.email);
      console.log('Role:', playerData.role);
      console.log('Google ID:', playerData.google_id);
    }
    
    // Now create admin user
    createAdminUser();
  });
};

console.log('🔧 Creating test users...');
createPlayerUser();
