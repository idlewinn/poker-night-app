import db from '../database/index';

// Script to generate realistic test metrics data for poker sessions
async function generateTestMetrics(): Promise<void> {
  console.log('🎯 Generating test metrics data...');
  
  try {
    // Get all sessions to add metrics for
    const sessions = await db.all('SELECT * FROM sessions ORDER BY id');
    console.log(`Found ${sessions.length} sessions to generate metrics for`);

    // Get all users
    const users = await db.all('SELECT * FROM users');
    console.log(`Found ${users.length} users`);

    if (sessions.length === 0) {
      console.log('❌ No sessions found. Please run the seed script first.');
      return;
    }

    // Sample player emails for testing
    const testEmails = [
      'alice@example.com',
      'bob@example.com', 
      'charlie@example.com',
      'diana@example.com',
      'eve@example.com',
      'frank@example.com',
      'grace@example.com',
      'henry@example.com'
    ];

    for (const session of sessions) {
      console.log(`\n📊 Generating metrics for session: ${session.name || 'Poker Night'} (ID: ${session.id})`);
      
      // Generate 5-15 invite page views
      const viewCount = Math.floor(Math.random() * 11) + 5; // 5-15 views
      console.log(`  📱 Generating ${viewCount} invite page views...`);
      
      for (let i = 0; i < viewCount; i++) {
        const email = testEmails[Math.floor(Math.random() * testEmails.length)];
        const hoursAgo = Math.floor(Math.random() * 72) + 1; // 1-72 hours ago
        const createdAt = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString();
        
        await db.run(`
          INSERT INTO user_metrics (
            user_id, session_id, player_email, event_type, event_data, 
            ip_address, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          session.created_by || 1,
          session.id,
          email,
          'invite_page_view',
          JSON.stringify({ 
            source: Math.random() > 0.5 ? 'mobile' : 'desktop',
            referrer: Math.random() > 0.7 ? 'direct' : 'link'
          }),
          `192.168.1.${Math.floor(Math.random() * 255)}`,
          Math.random() > 0.5 ? 
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' :
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt
        ]);
      }

      // Generate 3-8 status responses
      const responseCount = Math.floor(Math.random() * 6) + 3; // 3-8 responses
      console.log(`  ✅ Generating ${responseCount} status responses...`);
      
      const statuses = ['In', 'Out', 'Maybe', 'Attending but not playing'];
      
      for (let i = 0; i < responseCount; i++) {
        const email = testEmails[Math.floor(Math.random() * testEmails.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const hoursAgo = Math.floor(Math.random() * 48) + 1; // 1-48 hours ago
        const createdAt = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString();
        
        await db.run(`
          INSERT INTO user_metrics (
            user_id, session_id, player_email, event_type, event_data, 
            ip_address, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          session.created_by || 1,
          session.id,
          email,
          'status_response',
          JSON.stringify({ 
            status: status,
            previous_status: 'Invited',
            response_time_hours: hoursAgo
          }),
          `192.168.1.${Math.floor(Math.random() * 255)}`,
          Math.random() > 0.5 ? 
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' :
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt
        ]);
      }

      // Generate session creation event
      const sessionCreatedAt = new Date(session.created_at || Date.now()).toISOString();
      await db.run(`
        INSERT INTO user_metrics (
          user_id, session_id, event_type, event_data, 
          ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        session.created_by || 1,
        session.id,
        'session_created',
        JSON.stringify({ 
          session_name: session.name || 'Poker Night',
          scheduled_datetime: session.scheduled_datetime,
          player_count: Math.floor(Math.random() * 8) + 4 // 4-12 players
        }),
        `192.168.1.${Math.floor(Math.random() * 255)}`,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionCreatedAt
      ]);

      // Generate some user login events
      const loginCount = Math.floor(Math.random() * 3) + 1; // 1-3 logins
      for (let i = 0; i < loginCount; i++) {
        const hoursAgo = Math.floor(Math.random() * 24) + 1; // 1-24 hours ago
        const createdAt = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString();
        
        await db.run(`
          INSERT INTO user_metrics (
            user_id, event_type, event_data, 
            ip_address, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          session.created_by || 1,
          'user_login',
          JSON.stringify({ 
            login_method: 'google_oauth',
            session_duration_estimate: Math.floor(Math.random() * 120) + 30 // 30-150 minutes
          }),
          `192.168.1.${Math.floor(Math.random() * 255)}`,
          Math.random() > 0.5 ? 
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' :
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt
        ]);
      }

      console.log(`  ✅ Generated metrics for session ${session.id}`);
    }

    // Generate some additional random events
    console.log('\n🎲 Generating additional random events...');
    
    const additionalEvents = ['player_added', 'session_viewed', 'seating_chart_generated'];
    for (let i = 0; i < 10; i++) {
      const eventType = additionalEvents[Math.floor(Math.random() * additionalEvents.length)];
      const sessionId = sessions[Math.floor(Math.random() * sessions.length)].id;
      const hoursAgo = Math.floor(Math.random() * 168) + 1; // 1-168 hours ago (1 week)
      const createdAt = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString();
      
      await db.run(`
        INSERT INTO user_metrics (
          user_id, session_id, event_type, event_data, 
          ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        1, // Default user
        sessionId,
        eventType,
        JSON.stringify({ 
          action: eventType,
          timestamp: createdAt,
          random_data: Math.floor(Math.random() * 1000)
        }),
        `192.168.1.${Math.floor(Math.random() * 255)}`,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt
      ]);
    }

    console.log('\n🎉 Test metrics generation completed successfully!');
    console.log('\n📊 Summary:');
    
    // Show summary of generated data
    const totalMetrics = await db.get('SELECT COUNT(*) as count FROM user_metrics');
    console.log(`  📈 Total metrics events: ${totalMetrics.count}`);
    
    const eventTypes = await db.all(`
      SELECT event_type, COUNT(*) as count 
      FROM user_metrics 
      GROUP BY event_type 
      ORDER BY count DESC
    `);
    
    console.log('  📋 Event breakdown:');
    eventTypes.forEach(type => {
      console.log(`    ${type.event_type}: ${type.count} events`);
    });
    
    console.log('\n✨ You can now view metrics for your sessions!');
    console.log('   Go to your sessions page and click "View Metrics" on any session you own.');
    
  } catch (error) {
    console.error('❌ Error generating test metrics:', error);
    throw error;
  }
  
  process.exit(0);
}

// Run the script
generateTestMetrics();
