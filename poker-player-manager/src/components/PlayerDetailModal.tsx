import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Player, Session } from '../types/index';

interface PlayerDetailModalProps {
  open: boolean;
  onClose: () => void;
  player: Player | null;
  sessions: Session[];
}

interface PlayerStats {
  sessionsPlayed: number;
  totalProfit: number;
  averageProfitPerSession: number;
  bestSession: number;
  worstSession: number;
  winRate: number;
}

function PlayerDetailModal({ open, onClose, player, sessions }: PlayerDetailModalProps): React.JSX.Element {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculatePlayerStats = (): PlayerStats => {
    if (!player) {
      return {
        sessionsPlayed: 0,
        totalProfit: 0,
        averageProfitPerSession: 0,
        bestSession: 0,
        worstSession: 0,
        winRate: 0
      };
    }

    // Find all sessions where this player participated and has financial data
    const playerSessions = sessions.filter(session =>
      session.players?.some(sp =>
        sp.player_id === player.id &&
        sp.status === 'In' // Include all sessions where they played, including $0 cash-outs
      )
    );

    if (playerSessions.length === 0) {
      return {
        sessionsPlayed: 0,
        totalProfit: 0,
        averageProfitPerSession: 0,
        bestSession: 0,
        worstSession: 0,
        winRate: 0
      };
    }

    // Calculate profits for each session
    const sessionProfits = playerSessions.map(session => {
      const sessionPlayer = session.players?.find(sp => sp.player_id === player.id);
      if (!sessionPlayer) return 0;
      return sessionPlayer.cash_out - sessionPlayer.buy_in;
    });

    const totalProfit = sessionProfits.reduce((sum, profit) => sum + profit, 0);
    const averageProfitPerSession = totalProfit / sessionProfits.length;
    const bestSession = Math.max(...sessionProfits);
    const worstSession = Math.min(...sessionProfits);
    const winningSessions = sessionProfits.filter(profit => profit > 0).length;
    const winRate = (winningSessions / sessionProfits.length) * 100;

    return {
      sessionsPlayed: sessionProfits.length,
      totalProfit,
      averageProfitPerSession,
      bestSession,
      worstSession,
      winRate
    };
  };

  if (!player) return <></>;

  const stats = calculatePlayerStats();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <User className="h-6 w-6 text-primary" />
            {player.name}
          </DialogTitle>
          {player.email && (
            <p className="text-sm text-muted-foreground">{player.email}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {stats.sessionsPlayed}
                </div>
                <div className="text-xs text-gray-600">
                  Sessions Played
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className={`h-6 w-6 mx-auto mb-2 ${
                  stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <div className={`text-2xl font-bold ${
                  stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.totalProfit)}
                </div>
                <div className="text-xs text-gray-600">
                  Total Profit
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className={`h-6 w-6 mx-auto mb-2 ${
                  stats.averageProfitPerSession >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <div className={`text-2xl font-bold ${
                  stats.averageProfitPerSession >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.averageProfitPerSession)}
                </div>
                <div className="text-xs text-gray-600">
                  Avg Per Session
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {stats.winRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">
                  Win Rate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Details */}
          {stats.sessionsPlayed > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Best Session</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(stats.bestSession)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Worst Session</span>
                    </div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(stats.worstSession)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant={stats.totalProfit >= 0 ? 'default' : 'destructive'}
                  className={`text-sm px-4 py-2 ${
                    stats.totalProfit >= 0 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {stats.totalProfit >= 0 ? '🎉 Profitable Player' : '📉 Needs Improvement'}
                </Badge>
              </div>
            </div>
          )}

          {/* No Data State */}
          {stats.sessionsPlayed === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No completed sessions yet</p>
              <p className="text-sm text-gray-400">
                Statistics will appear once {player.name} completes some poker sessions.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerDetailModal;
