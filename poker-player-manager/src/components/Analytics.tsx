import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';

// Type assertion for Recharts components
const BarChartComponent = BarChart as any;
const BarComponent = Bar as any;
const LineComponent = Line as any;
const ComposedChartComponent = ComposedChart as any;
const XAxisComponent = XAxis as any;
const YAxisComponent = YAxis as any;
const CartesianGridComponent = CartesianGrid as any;
const TooltipComponent = Tooltip as any;
const ResponsiveContainerComponent = ResponsiveContainer as any;
const PieChartComponent = PieChart as any;
const PieComponent = Pie as any;
const CellComponent = Cell as any;
const ReferenceLineComponent = ReferenceLine as any;
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Trophy,
  Target,
  BarChart3
} from 'lucide-react';
import { Session, Player } from '../types/index';

interface AnalyticsProps {
  sessions: Session[];
  players: Player[];
}

interface PlayerPerformance {
  playerId: number;
  playerName: string;
  sessionsPlayed: number;
  totalProfit: number;
  averageProfit: number;
  winRate: number;
  bestSession: number;
  worstSession: number;
  totalBuyIn: number;
  totalCashOut: number;
}

interface SessionAnalytics {
  sessionId: number;
  sessionName: string;
  date: string;
  playerCount: number;
  totalBuyIn: number;
  totalCashOut: number;
  biggestWinner: string;
  biggestLoser: string;
  biggestWin: number;
  biggestLoss: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

function Analytics({ sessions, players }: AnalyticsProps): React.JSX.Element {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('all');

  // Filter sessions to only include those the user created (owned sessions)
  const ownedSessions = useMemo(() => {
    return sessions.filter(session => 
      session.players && session.players.length > 0
    );
  }, [sessions]);

  // Calculate player performance data
  const playerPerformanceData = useMemo((): PlayerPerformance[] => {
    const performanceMap = new Map<number, PlayerPerformance>();

    // Initialize all players
    players.forEach(player => {
      performanceMap.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        sessionsPlayed: 0,
        totalProfit: 0,
        averageProfit: 0,
        winRate: 0,
        bestSession: 0,
        worstSession: 0,
        totalBuyIn: 0,
        totalCashOut: 0
      });
    });

    // Calculate stats from sessions
    ownedSessions.forEach(session => {
      session.players?.forEach(sessionPlayer => {
        if (sessionPlayer.status === 'In') {
          const performance = performanceMap.get(sessionPlayer.player_id);
          if (performance) {
            const profit = sessionPlayer.cash_out - sessionPlayer.buy_in;
            
            performance.sessionsPlayed++;
            performance.totalProfit += profit;
            performance.totalBuyIn += sessionPlayer.buy_in;
            performance.totalCashOut += sessionPlayer.cash_out;
            
            if (profit > performance.bestSession) {
              performance.bestSession = profit;
            }
            if (profit < performance.worstSession) {
              performance.worstSession = profit;
            }
          }
        }
      });
    });

    // Calculate derived stats
    performanceMap.forEach(performance => {
      if (performance.sessionsPlayed > 0) {
        performance.averageProfit = performance.totalProfit / performance.sessionsPlayed;
        
        // Calculate win rate
        let wins = 0;
        ownedSessions.forEach(session => {
          const sessionPlayer = session.players?.find(sp => 
            sp.player_id === performance.playerId && sp.status === 'In'
          );
          if (sessionPlayer && (sessionPlayer.cash_out - sessionPlayer.buy_in) > 0) {
            wins++;
          }
        });
        performance.winRate = (wins / performance.sessionsPlayed) * 100;
      }
    });

    return Array.from(performanceMap.values())
      .filter(p => p.sessionsPlayed > 0)
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }, [ownedSessions, players]);

  // Calculate session analytics
  const sessionAnalyticsData = useMemo((): SessionAnalytics[] => {
    return ownedSessions.map(session => {
      const inPlayers = session.players?.filter(sp => sp.status === 'In') || [];
      const totalBuyIn = inPlayers.reduce((sum, sp) => sum + sp.buy_in, 0);
      const totalCashOut = inPlayers.reduce((sum, sp) => sum + sp.cash_out, 0);
      
      let biggestWinner = '';
      let biggestLoser = '';
      let biggestWin = 0;
      let biggestLoss = 0;

      inPlayers.forEach(sp => {
        const profit = sp.cash_out - sp.buy_in;
        const player = players.find(p => p.id === sp.player_id);
        
        if (profit > biggestWin) {
          biggestWin = profit;
          biggestWinner = player?.name || 'Unknown';
        }
        if (profit < biggestLoss) {
          biggestLoss = profit;
          biggestLoser = player?.name || 'Unknown';
        }
      });

      return {
        sessionId: session.id,
        sessionName: session.name || 'Poker Night',
        date: new Date(session.scheduledDateTime || session.createdAt).toLocaleDateString(),
        playerCount: inPlayers.length,
        totalBuyIn,
        totalCashOut,
        biggestWinner,
        biggestLoser,
        biggestWin,
        biggestLoss
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ownedSessions, players]);

  // Prepare chart data based on selected player
  const chartData = useMemo(() => {
    if (selectedPlayerId === 'all') {
      // Show session-by-session data for all players
      return sessionAnalyticsData.map(session => ({
        session: session.sessionName,
        date: session.date,
        totalBuyIn: session.totalBuyIn,
        totalProfit: session.totalCashOut - session.totalBuyIn,
        playerCount: session.playerCount
      }));
    } else {
      // Show session-by-session performance for selected player
      const playerId = parseInt(selectedPlayerId);
      return ownedSessions
        .filter(session => session.players?.some(sp => sp.player_id === playerId && sp.status === 'In'))
        .map(session => {
          const sessionPlayer = session.players?.find(sp => sp.player_id === playerId && sp.status === 'In');
          const profit = sessionPlayer ? sessionPlayer.cash_out - sessionPlayer.buy_in : 0;
          
          return {
            session: session.name || 'Poker Night',
            date: new Date(session.scheduledDateTime || session.createdAt).toLocaleDateString(),
            profit,
            buyIn: sessionPlayer?.buy_in || 0,
            cashOut: sessionPlayer?.cash_out || 0,
            cumulativeProfit: 0 // Will be calculated below
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item, index, array) => ({
          ...item,
          cumulativeProfit: array.slice(0, index + 1).reduce((sum, session) => sum + session.profit, 0)
        }));
    }
  }, [selectedPlayerId, sessionAnalyticsData, ownedSessions]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const totalSessions = ownedSessions.length;
    const totalPlayers = playerPerformanceData.length;
    const totalBuyIn = sessionAnalyticsData.reduce((sum, s) => sum + s.totalBuyIn, 0);
    const averagePlayersPerSession = totalSessions > 0 
      ? sessionAnalyticsData.reduce((sum, s) => sum + s.playerCount, 0) / totalSessions 
      : 0;
    
    const mostProfitablePlayer = playerPerformanceData[0];
    const mostActivePlayer = playerPerformanceData.length > 0
      ? playerPerformanceData.reduce((prev, current) =>
          current.sessionsPlayed > prev.sessionsPlayed ? current : prev
        )
      : null;

    return {
      totalSessions,
      totalPlayers,
      totalBuyIn,
      averagePlayersPerSession: Math.round(averagePlayersPerSession * 10) / 10,
      mostProfitablePlayer,
      mostActivePlayer
    };
  }, [ownedSessions.length, playerPerformanceData, sessionAnalyticsData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const selectedPlayerData = selectedPlayerId !== 'all' 
    ? playerPerformanceData.find(p => p.playerId === parseInt(selectedPlayerId))
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Player Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Performance insights for your poker sessions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="player-select" className="text-sm font-medium text-gray-700">
            View:
          </label>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Players</SelectItem>
              {playerPerformanceData.map(player => (
                <SelectItem key={player.playerId} value={player.playerId.toString()}>
                  {player.playerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      {selectedPlayerId === 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalSessions}</div>
              <div className="text-xs text-gray-600">Total Sessions</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{overallStats.totalPlayers}</div>
              <div className="text-xs text-gray-600">Active Players</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(overallStats.totalBuyIn)}</div>
              <div className="text-xs text-gray-600">Total Buy-ins</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{overallStats.averagePlayersPerSession}</div>
              <div className="text-xs text-gray-600">Avg Players/Session</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected Player Statistics */}
      {selectedPlayerData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{selectedPlayerData.sessionsPlayed}</div>
              <div className="text-xs text-gray-600">Sessions Played</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className={`h-6 w-6 mx-auto mb-2 ${
                selectedPlayerData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
              <div className={`text-2xl font-bold ${
                selectedPlayerData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(selectedPlayerData.totalProfit)}
              </div>
              <div className="text-xs text-gray-600">Total Profit</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{selectedPlayerData.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-600">Win Rate</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className={`h-6 w-6 mx-auto mb-2 ${
                selectedPlayerData.bestSession >= 0 ? 'text-yellow-600' : 'text-gray-400'
              }`} />
              <div className={`text-2xl font-bold ${
                selectedPlayerData.bestSession >= 0 ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {formatCurrency(selectedPlayerData.bestSession)}
              </div>
              <div className="text-xs text-gray-600">Best Session</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {selectedPlayerId === 'all' ? 'Total Buy-in by Session' : 'Player Performance Over Time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainerComponent width="100%" height={300}>
              {selectedPlayerId === 'all' ? (
                <BarChartComponent data={chartData}>
                  <CartesianGridComponent strokeDasharray="3 3" />
                  <XAxisComponent
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxisComponent tick={{ fontSize: 12 }} />
                  <TooltipComponent
                    formatter={(value: any) => [
                      formatCurrency(value as number),
                      'Total Buy-in'
                    ]}
                  />
                  <BarComponent dataKey="totalBuyIn" fill="#10b981" name="totalBuyIn" />
                </BarChartComponent>
              ) : (
                <ResponsiveContainerComponent width="100%" height={300}>
                  <ComposedChartComponent data={chartData}>
                    <CartesianGridComponent strokeDasharray="3 3" />
                    <XAxisComponent
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxisComponent
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 10', 'dataMax + 10']}
                    />
                    {/* Zero reference line */}
                    <ReferenceLineComponent
                      y={0}
                      stroke="#ef4444"
                      strokeDasharray="2 2"
                      strokeWidth={2}
                    />
                    <TooltipComponent
                      formatter={(value: any, name: any) => [
                        formatCurrency(value as number),
                        name === 'profit' ? 'Session Profit' : 'Cumulative Profit'
                      ]}
                    />
                    {/* Session profit bars */}
                    <BarComponent
                      dataKey="profit"
                      name="profit"
                    >
                      {chartData.map((entry, index) => {
                        const profit = 'profit' in entry ? entry.profit : 0;
                        return (
                          <CellComponent key={`cell-${index}`} fill={profit >= 0 ? '#10b981' : '#ef4444'} />
                        );
                      })}
                    </BarComponent>
                    {/* Cumulative profit line */}
                    <LineComponent
                      type="monotone"
                      dataKey="cumulativeProfit"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="cumulativeProfit"
                    />
                  </ComposedChartComponent>
                </ResponsiveContainerComponent>
              )}
            </ResponsiveContainerComponent>
          </CardContent>
        </Card>

        {/* Player Performance Ranking */}
        {selectedPlayerId === 'all' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playerPerformanceData.slice(0, 8).map((player, index) => (
                  <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={index < 3 ? 'default' : 'secondary'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' : ''
                        }`}
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium text-sm">{player.playerName}</div>
                        <div className="text-xs text-gray-600">
                          {player.sessionsPlayed} sessions • {player.winRate.toFixed(1)}% win rate
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${
                      player.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <div className="font-bold text-sm">{formatCurrency(player.totalProfit)}</div>
                      <div className="text-xs">{formatCurrency(player.averageProfit)}/session</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Win Rate Distribution */}
        {selectedPlayerId === 'all' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Win Rate Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainerComponent width="100%" height={300}>
                <PieChartComponent>
                  <PieComponent
                    data={[
                      { name: 'High Performers (>60%)', value: playerPerformanceData.filter(p => p.winRate > 60).length, color: '#10b981' },
                      { name: 'Good Players (40-60%)', value: playerPerformanceData.filter(p => p.winRate >= 40 && p.winRate <= 60).length, color: '#f59e0b' },
                      { name: 'Struggling (<40%)', value: playerPerformanceData.filter(p => p.winRate < 40).length, color: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }: any) => `${name}: ${value}`}
                  >
                    {[0, 1, 2].map((index) => (
                      <CellComponent key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </PieComponent>
                  <TooltipComponent />
                </PieChartComponent>
              </ResponsiveContainerComponent>
            </CardContent>
          </Card>
        )}

        {/* Session Highlights */}
        {selectedPlayerId === 'all' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Session Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overallStats.mostProfitablePlayer && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Most Profitable Player</span>
                    </div>
                    <div className="text-sm text-green-700">
                      {overallStats.mostProfitablePlayer.playerName} • {formatCurrency(overallStats.mostProfitablePlayer.totalProfit)}
                    </div>
                  </div>
                )}

                {overallStats.mostActivePlayer && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Most Active Player</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      {overallStats.mostActivePlayer.playerName} • {overallStats.mostActivePlayer.sessionsPlayed} sessions
                    </div>
                  </div>
                )}

                {sessionAnalyticsData.length > 0 && sessionAnalyticsData[0] && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Latest Session</span>
                    </div>
                    <div className="text-sm text-purple-700">
                      {sessionAnalyticsData[0].sessionName} • {sessionAnalyticsData[0].playerCount} players • {sessionAnalyticsData[0].date}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Analytics;
