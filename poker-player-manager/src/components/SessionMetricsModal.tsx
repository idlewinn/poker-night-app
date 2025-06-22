import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Users,
  Eye,
  MessageSquare,
  Clock,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { Session } from '../types/index';
import { api } from '../services/api';

interface SessionMetrics {
  sessionId: number;
  inviteViews: number;
  responses: number;
  responseRate: number;
  avgResponseTime: number;
  statusBreakdown: { [key: string]: number };
  timeline: Array<{
    event_type: string;
    event_data: any;
    created_at: string;
    user_id?: number;
    player_email?: string;
  }>;
}

interface SessionMetricsModalProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
}

function SessionMetricsModal({ open, onClose, session }: SessionMetricsModalProps): React.JSX.Element {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && session) {
      fetchMetrics();
    }
  }, [open, session]);

  const fetchMetrics = async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/metrics/sessions/${session.id}`);
      setMetrics(response);
    } catch (err: any) {
      console.error('Error fetching session metrics:', err);
      setError('Failed to load session metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else if (minutes < 1440) {
      return `${Math.round(minutes / 60)} hours`;
    } else {
      return `${Math.round(minutes / 1440)} days`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In': return 'bg-green-100 text-green-800';
      case 'Out': return 'bg-red-100 text-red-800';
      case 'Maybe': return 'bg-yellow-100 text-yellow-800';
      case 'Attending but not playing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventType = (eventType: string) => {
    switch (eventType) {
      case 'invite_page_view': return 'Invite Viewed';
      case 'status_response': return 'Status Updated';
      case 'session_created': return 'Session Created';
      default: return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Session Metrics: {session?.name || 'Poker Night'}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading metrics...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {metrics && !loading && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Invite Views</p>
                      <p className="text-2xl font-bold">{metrics.inviteViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Responses</p>
                      <p className="text-2xl font-bold">{metrics.responses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                      <p className="text-2xl font-bold">{metrics.responseRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                      <p className="text-lg font-bold">{formatResponseTime(metrics.avgResponseTime)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            {Object.keys(metrics.statusBreakdown).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Response Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(metrics.statusBreakdown).map(([status, count]) => (
                      <Badge key={status} className={getStatusColor(status)}>
                        {status}: {count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            {metrics.timeline.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {metrics.timeline.slice(0, 20).map((event, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatEventType(event.event_type)}</span>
                            {event.event_data?.status && (
                              <Badge variant="outline" className="text-xs">
                                {event.event_data.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {event.player_email && (
                              <span>{event.player_email} • </span>
                            )}
                            {new Date(event.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {metrics.timeline.length > 20 && (
                      <div className="text-center text-sm text-muted-foreground">
                        ... and {metrics.timeline.length - 20} more events
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Data Message */}
            {metrics.inviteViews === 0 && metrics.responses === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No metrics data available yet. Metrics will appear once players start viewing invites and responding.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SessionMetricsModal;
