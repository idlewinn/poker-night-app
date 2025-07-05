import db from '../database/index';

export interface MetricEvent {
  userId?: number;
  playerEmail?: string;
  sessionId?: number;
  eventType: string;
  eventData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface MetricsSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: { [key: string]: number };
  recentActivity: any[];
}

export interface SessionMetrics {
  sessionId: number;
  inviteViews: number;
  responses: number;
  responseRate: number;
  avgResponseTime: number;
  statusBreakdown: { [key: string]: number };
  timeline: any[];
}

export class MetricsService {
  // Track a user event
  static async trackEvent(event: MetricEvent): Promise<void> {
    try {
      const sql = `
        INSERT INTO user_metrics (user_id, player_email, session_id, event_type, event_data, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const eventDataJson = event.eventData ? JSON.stringify(event.eventData) : null;
      
      console.log('📊 Attempting to track event:', {
        eventType: event.eventType,
        sessionId: event.sessionId,
        playerEmail: event.playerEmail,
        userId: event.userId,
        eventData: eventDataJson
      });

      const result = await db.run(sql, [
        event.userId || null,
        event.playerEmail || null,
        event.sessionId || null,
        event.eventType,
        eventDataJson,
        event.ipAddress || null,
        event.userAgent || null
      ]);

      console.log(`✅ Successfully tracked event: ${event.eventType} for ${event.userId ? `user ${event.userId}` : `email ${event.playerEmail}`}`, result);
    } catch (error) {
      console.error('❌ Error tracking metric event:', error);
      console.error('Event details:', event);
      // Don't throw - metrics shouldn't break the main functionality
    }
  }

  // Get overall metrics summary
  static async getMetricsSummary(userId?: number): Promise<MetricsSummary> {
    try {
      const whereClause = userId ? 'WHERE user_id = ?' : '';
      const params = userId ? [userId] : [];

      // Total events
      const totalResult = await db.get(`SELECT COUNT(*) as count FROM user_metrics ${whereClause}`, params);
      const totalEvents = totalResult?.count || 0;

      // Unique users
      const uniqueUsersResult = await db.get(`
        SELECT COUNT(DISTINCT COALESCE(user_id, player_email)) as count 
        FROM user_metrics ${whereClause}
      `, params);
      const uniqueUsers = uniqueUsersResult?.count || 0;

      // Events by type
      const eventTypesResult = await db.all(`
        SELECT event_type, COUNT(*) as count 
        FROM user_metrics ${whereClause}
        GROUP BY event_type 
        ORDER BY count DESC
      `, params);
      
      const eventsByType: { [key: string]: number } = {};
      eventTypesResult.forEach(row => {
        eventsByType[row.event_type] = row.count;
      });

      // Recent activity (last 50 events)
      const recentActivity = await db.all(`
        SELECT event_type, event_data, created_at, user_id, player_email, session_id
        FROM user_metrics ${whereClause}
        ORDER BY created_at DESC 
        LIMIT 50
      `, params);

      return {
        totalEvents,
        uniqueUsers,
        eventsByType,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventsByType: {},
        recentActivity: []
      };
    }
  }

  // Get session-specific metrics
  static async getSessionMetrics(sessionId: number): Promise<SessionMetrics> {
    try {
      // Invite page views
      const inviteViewsResult = await db.get(`
        SELECT COUNT(*) as count 
        FROM user_metrics 
        WHERE session_id = ? AND event_type = 'invite_page_view'
      `, [sessionId]);
      const inviteViews = inviteViewsResult?.count || 0;

      // Status responses
      const responsesResult = await db.get(`
        SELECT COUNT(*) as count 
        FROM user_metrics 
        WHERE session_id = ? AND event_type = 'status_response'
      `, [sessionId]);
      const responses = responsesResult?.count || 0;

      // Response rate
      const responseRate = inviteViews > 0 ? (responses / inviteViews) * 100 : 0;

      // Average response time (time between invite view and first response)
      // Use different date functions for SQLite vs PostgreSQL
      const isPostgreSQL = process.env.DATABASE_URL?.startsWith('postgresql');
      const dateDiffQuery = isPostgreSQL
        ? `EXTRACT(EPOCH FROM (response.created_at - view.created_at)) / 60` // PostgreSQL: seconds to minutes
        : `(JULIANDAY(response.created_at) - JULIANDAY(view.created_at)) * 24 * 60`; // SQLite: days to minutes

      const avgResponseTimeResult = await db.get(`
        SELECT AVG(${dateDiffQuery}) as avg_minutes
        FROM user_metrics view
        JOIN user_metrics response ON (
          view.session_id = response.session_id AND
          (view.user_id = response.user_id OR view.player_email = response.player_email)
        )
        WHERE view.session_id = ?
          AND view.event_type = 'invite_page_view'
          AND response.event_type = 'status_response'
          AND response.created_at > view.created_at
      `, [sessionId]);
      const avgResponseTime = avgResponseTimeResult?.avg_minutes || 0;

      // Status breakdown from responses
      const statusBreakdownResult = await db.all(`
        SELECT JSON_EXTRACT(event_data, '$.status') as status, COUNT(*) as count
        FROM user_metrics 
        WHERE session_id = ? AND event_type = 'status_response'
        GROUP BY JSON_EXTRACT(event_data, '$.status')
      `, [sessionId]);
      
      const statusBreakdown: { [key: string]: number } = {};
      statusBreakdownResult.forEach(row => {
        if (row.status) {
          statusBreakdown[row.status] = row.count;
        }
      });

      // Timeline of events
      const timeline = await db.all(`
        SELECT event_type, event_data, created_at, user_id, player_email
        FROM user_metrics 
        WHERE session_id = ?
        ORDER BY created_at ASC
      `, [sessionId]);

      return {
        sessionId,
        inviteViews,
        responses,
        responseRate: Math.round(responseRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        statusBreakdown,
        timeline
      };
    } catch (error) {
      console.error('Error getting session metrics:', error);
      return {
        sessionId,
        inviteViews: 0,
        responses: 0,
        responseRate: 0,
        avgResponseTime: 0,
        statusBreakdown: {},
        timeline: []
      };
    }
  }

  // Track common events with helper methods
  static async trackInvitePageView(sessionId: number, playerEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.trackEvent({
      sessionId,
      playerEmail,
      eventType: 'invite_page_view',
      eventData: { timestamp: new Date().toISOString() },
      ipAddress,
      userAgent
    });
  }

  static async trackStatusResponse(sessionId: number, playerEmail: string, status: string, userId?: number): Promise<void> {
    await this.trackEvent({
      userId,
      sessionId,
      playerEmail,
      eventType: 'status_response',
      eventData: { 
        status, 
        timestamp: new Date().toISOString() 
      }
    });
  }

  static async trackUserLogin(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.trackEvent({
      userId,
      eventType: 'user_login',
      eventData: { timestamp: new Date().toISOString() },
      ipAddress,
      userAgent
    });
  }

  static async trackSessionCreated(userId: number, sessionId: number): Promise<void> {
    await this.trackEvent({
      userId,
      sessionId,
      eventType: 'session_created',
      eventData: { timestamp: new Date().toISOString() }
    });
  }

  static async trackPlayerAdded(userId: number, playerEmail?: string): Promise<void> {
    await this.trackEvent({
      userId,
      playerEmail,
      eventType: 'player_added',
      eventData: { timestamp: new Date().toISOString() }
    });
  }
}

export default MetricsService;
