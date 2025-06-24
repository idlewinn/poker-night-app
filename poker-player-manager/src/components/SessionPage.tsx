import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  TrendingDown,
  TrendingUp,
  Plus,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings,
  X,
  Monitor,
  Minimize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Session, Player, SessionPlayer, SeatingChart, CreateSeatingChartRequest } from '../types/index';
import { sessionsApi, playersApi, seatingChartsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getStatusPriority } from '../utils/playerSorting';
import { groupAssignmentsByTable } from '../utils/seatingChart';
import SeatingChartModal from './SeatingChartModal';
import SeatingChartList from './SeatingChartList';
import PokerTable from './PokerTable';
import UserMenu from './UserMenu';

interface SessionPageParams extends Record<string, string | undefined> {
  sessionId: string;
  tab?: string;
}

interface EditingFinancials {
  playerId: number;
  buy_in: string;
  cash_out: string;
}

function SessionPage(): React.JSX.Element {
  const { sessionId, tab } = useParams<SessionPageParams>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFinancials, setEditingFinancials] = useState<EditingFinancials | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState<boolean>(false);
  const [seatingCharts, setSeatingCharts] = useState<SeatingChart[]>([]);
  const [seatingChartModalOpen, setSeatingChartModalOpen] = useState<boolean>(false);
  const [generatingChart, setGeneratingChart] = useState<boolean>(false);
  const [deletingChart, setDeletingChart] = useState<boolean>(false);

  // Bomb Pot Timer State with localStorage persistence
  const [bombPotInterval, setBombPotInterval] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('poker-bomb-pot-interval');
      return saved ? parseInt(saved) : 45;
    }
    return 45;
  });

  const [bombPotTimeLeft, setBombPotTimeLeft] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('poker-bomb-pot-time-left');
      const savedTimestamp = localStorage.getItem('poker-bomb-pot-timestamp');
      const savedRunning = localStorage.getItem('poker-bomb-pot-running') === 'true';
      const savedInterval = localStorage.getItem('poker-bomb-pot-interval');

      if (saved && savedTimestamp && savedRunning) {
        const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
        const remaining = Math.max(0, parseInt(saved) - elapsed);
        return remaining;
      } else if (saved) {
        return parseInt(saved);
      } else if (savedInterval) {
        return parseInt(savedInterval) * 60;
      }
    }
    return 45 * 60;
  });

  const [bombPotRunning, setBombPotRunning] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('poker-bomb-pot-running');
      const savedTimeLeft = localStorage.getItem('poker-bomb-pot-time-left');
      const savedTimestamp = localStorage.getItem('poker-bomb-pot-timestamp');

      if (saved === 'true' && savedTimeLeft && savedTimestamp) {
        const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
        const remaining = Math.max(0, parseInt(savedTimeLeft) - elapsed);
        return remaining > 0;
      }
    }
    return false;
  });

  const [bombPotAlert, setBombPotAlert] = useState<boolean>(false);

  const [bombPotEverStarted, setBombPotEverStarted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('poker-bomb-pot-ever-started') === 'true';
    }
    return false;
  });


  const [bombPotTimerModalOpen, setBombPotTimerModalOpen] = useState<boolean>(false);
  const [currentTableIndex, setCurrentTableIndex] = useState<number>(0);

  // Get active tab from URL, default to 'winnings'
  const activeTab = tab || 'winnings';

  // Determine if we're in dashboard view from URL
  const isDashboardView = window.location.pathname.includes('/dashboard');

  // Check if current user is the session owner
  const isSessionOwner = (): boolean => {
    return user?.id === session?.createdBy;
  };

  // Redirect non-owners away from dashboard URLs
  useEffect(() => {
    if (isDashboardView && session && !isSessionOwner()) {
      // Redirect to normal view with same tab
      if (activeTab === 'winnings') {
        navigate(`/sessions/${sessionId}`);
      } else {
        navigate(`/sessions/${sessionId}/${activeTab}`);
      }
    }
  }, [isDashboardView, session, activeTab, sessionId, navigate, user?.id]);

  // Check if session is currently active (within last 8 hours)
  const isSessionActive = (): boolean => {
    if (!session?.scheduledDateTime) return false;
    const sessionDate = new Date(session.scheduledDateTime);
    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    return sessionDate >= eightHoursAgo && sessionDate <= now;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [sessionData, playersData, seatingChartsData] = await Promise.all([
          sessionsApi.getById(parseInt(sessionId)),
          playersApi.getAll(),
          seatingChartsApi.getBySessionId(parseInt(sessionId))
        ]);

        setSession(sessionData);
        setPlayers(playersData);
        setSeatingCharts(seatingChartsData);
      } catch (err) {
        console.error('Failed to fetch session data:', err);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  // Bomb Pot Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (bombPotRunning && bombPotTimeLeft > 0) {
      interval = setInterval(() => {
        setBombPotTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished - trigger alert
            setBombPotAlert(true);
            setBombPotRunning(false);

            // Play sound
            try {
              const audio = new Audio('/api/placeholder/bomb-pot-alert.mp3');
              audio.play().catch(console.error);
            } catch (error) {
              console.error('Failed to play alert sound:', error);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bombPotRunning, bombPotTimeLeft]);

  // Save timer state to localStorage
  useEffect(() => {
    localStorage.setItem('poker-bomb-pot-interval', bombPotInterval.toString());
  }, [bombPotInterval]);

  useEffect(() => {
    localStorage.setItem('poker-bomb-pot-time-left', bombPotTimeLeft.toString());
    localStorage.setItem('poker-bomb-pot-timestamp', Date.now().toString());
  }, [bombPotTimeLeft]);

  useEffect(() => {
    localStorage.setItem('poker-bomb-pot-running', bombPotRunning.toString());
    localStorage.setItem('poker-bomb-pot-timestamp', Date.now().toString());
  }, [bombPotRunning]);

  useEffect(() => {
    localStorage.setItem('poker-bomb-pot-ever-started', bombPotEverStarted.toString());
  }, [bombPotEverStarted]);

  // Handle click outside to exit editing state
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is outside any editing elements
      if (editingFinancials &&
          !target.closest('[data-editing-row]') &&
          !target.closest('[role="listbox"]') &&
          !target.closest('[data-radix-popper-content-wrapper]')) {
        setEditingFinancials(null);
      }
    };

    if (editingFinancials) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {}; // Return empty cleanup function when not editing
  }, [editingFinancials]);

  const handleEditFinancials = (sessionPlayer: SessionPlayer) => {
    // If we're already editing a different player, don't switch
    if (editingFinancials && editingFinancials.playerId !== sessionPlayer.player_id) {
      return;
    }

    setEditingFinancials({
      playerId: sessionPlayer.player_id,
      buy_in: sessionPlayer.buy_in.toString(),
      cash_out: sessionPlayer.cash_out.toString()
    });
  };

  const handleSaveFinancials = async (overrideFinancials?: EditingFinancials) => {
    const financialsToSave = overrideFinancials || editingFinancials;
    if (!financialsToSave || !session) return;

    try {
      setUpdating(true);
      const buy_in = parseFloat(financialsToSave.buy_in) || 0;
      const cash_out = financialsToSave.cash_out === '' ? 0 : parseFloat(financialsToSave.cash_out) || 0;

      // Update via API
      await sessionsApi.updatePlayerFinancials(session.id, financialsToSave.playerId, { buy_in, cash_out });

      // Update local state
      if (session.players) {
        const updatedPlayers = session.players.map(sp =>
          sp.player_id === financialsToSave.playerId
            ? { ...sp, buy_in, cash_out }
            : sp
        );
        setSession({ ...session, players: updatedPlayers });
      }

      setEditingFinancials(null);
    } catch (err) {
      console.error('Failed to update financials:', err);
      setError('Failed to update player financials');
    } finally {
      setUpdating(false);
    }
  };

  const handleFinancialInputBlur = async () => {
    // Auto-save when user taps away from input
    await handleSaveFinancials();
  };



  const handleAddPlayer = async (playerId: number): Promise<void> => {
    if (!session) return;

    try {
      setUpdating(true);
      await sessionsApi.addPlayerToSession(session.id, playerId, 'In');

      // Refresh session data
      const updatedSession = await sessionsApi.getById(session.id);
      setSession(updatedSession);
      setAddPlayerModalOpen(false);
    } catch (err) {
      console.error('Failed to add player:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateSeatingChart = async (request: CreateSeatingChartRequest): Promise<void> => {
    try {
      setGeneratingChart(true);
      const newChart = await seatingChartsApi.create(request);
      setSeatingCharts(prev => [newChart, ...prev]);
      setSeatingChartModalOpen(false);
    } catch (err) {
      console.error('Failed to generate seating chart:', err);
      setError('Failed to generate seating chart');
    } finally {
      setGeneratingChart(false);
    }
  };

  const handleDeleteSeatingChart = async (chartId: number): Promise<void> => {
    try {
      setDeletingChart(true);
      await seatingChartsApi.delete(chartId);
      setSeatingCharts(prev => prev.filter(chart => chart.id !== chartId));
    } catch (err) {
      console.error('Failed to delete seating chart:', err);
      setError('Failed to delete seating chart');
    } finally {
      setDeletingChart(false);
    }
  };

  // Bomb Pot Timer Functions
  const startBombPotTimer = (): void => {
    setBombPotRunning(true);
    setBombPotAlert(false);
    setBombPotEverStarted(true);
  };

  const pauseBombPotTimer = (): void => {
    setBombPotRunning(false);
  };

  const resetBombPotTimer = (): void => {
    // Reset timer to full interval but maintain current running/paused state
    setBombPotTimeLeft(bombPotInterval * 60);
    setBombPotAlert(false);
  };

  const cancelBombPotTimer = (): void => {
    // Cancel timer: reset to full interval AND stop running
    setBombPotRunning(false);
    setBombPotTimeLeft(bombPotInterval * 60);
    setBombPotAlert(false);
    setBombPotEverStarted(false); // Reset to "Timer Ready" state

    // Clear timer state from localStorage
    localStorage.removeItem('poker-bomb-pot-running');
    localStorage.removeItem('poker-bomb-pot-time-left');
    localStorage.removeItem('poker-bomb-pot-timestamp');
    localStorage.removeItem('poker-bomb-pot-ever-started');
  };

  const updateBombPotInterval = (minutes: number): void => {
    setBombPotInterval(minutes);
    if (!bombPotRunning) {
      setBombPotTimeLeft(minutes * 60);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const acknowledgeBombPotAlert = (): void => {
    setBombPotAlert(false);
    // Reset timer and start next countdown
    setBombPotTimeLeft(bombPotInterval * 60);
    setBombPotRunning(true);
  };

  // Dashboard View Functions
  const toggleDashboardView = (): void => {
    if (isDashboardView) {
      // Exit dashboard - go back to normal view with current tab
      if (activeTab === 'winnings') {
        navigate(`/sessions/${sessionId}`);
      } else {
        navigate(`/sessions/${sessionId}/${activeTab}`);
      }
    } else {
      // Enter dashboard - go to dashboard with current tab
      if (activeTab === 'winnings') {
        navigate(`/sessions/${sessionId}/dashboard`);
      } else {
        navigate(`/sessions/${sessionId}/dashboard/${activeTab}`);
      }
    }
    // Reset table index when toggling dashboard view
    setCurrentTableIndex(0);
  };

  // Calculate total buy-ins
  const getTotalBuyIns = (): number => {
    if (!session?.players) return 0;
    return session.players
      .filter(sp => sp.status === 'In')
      .reduce((total, sp) => total + sp.buy_in, 0);
  };

  // Get current seating chart
  const getCurrentSeatingChart = (): SeatingChart | null => {
    return seatingCharts.length > 0 ? seatingCharts[0] || null : null;
  };

  // Handle tab change by navigating to new URL
  const handleTabChange = (value: string): void => {
    const basePath = isDashboardView ? `/sessions/${sessionId}/dashboard` : `/sessions/${sessionId}`;

    if (value === 'winnings') {
      // Default tab - use clean URL without tab parameter
      navigate(basePath);
    } else {
      // Non-default tab - include tab in URL
      navigate(`${basePath}/${value}`);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Generate buy-in options in increments of $25
  const getBuyInOptions = (): number[] => {
    const options = [];
    for (let i = 0; i <= 1000; i += 25) {
      options.push(i);
    }
    return options;
  };

  // Get color class for buy-in amount
  const getBuyInColorClass = (amount: number): string => {
    if (amount === 0) return 'text-gray-600'; // Free/No buy-in
    if (amount >= 25 && amount <= 100) return 'text-green-600 font-medium';
    if (amount >= 125 && amount <= 200) return 'text-yellow-600 font-medium';
    if (amount >= 225 && amount <= 300) return 'text-orange-600 font-medium';
    if (amount >= 325 && amount <= 400) return 'text-red-600 font-medium';
    if (amount >= 425 && amount <= 1000) return 'text-purple-600 font-medium';
    return 'text-gray-600';
  };

  const formatScheduledDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };





  const getSessionPlayers = (): SessionPlayer[] => {
    if (!session?.players) return [];
    // Only show players with "In" status, sorted by status priority
    return session.players
      .filter(player => player.status === 'In')
      .sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));
  };

  const getAvailablePlayersToAdd = (): Player[] => {
    if (!session?.players) return players;

    // Return players who are either:
    // 1. Not in the session at all, OR
    // 2. In the session but not with "In" status
    return players.filter(player => {
      const sessionPlayer = session.players?.find(sp => sp.player_id === player.id);
      return !sessionPlayer || sessionPlayer.status !== 'In';
    });
  };

  const calculateTotals = () => {
    const sessionPlayers = getSessionPlayers();
    const totalBuyIn = sessionPlayers.reduce((sum, sp) => sum + sp.buy_in, 0);
    // Include all cash-out amounts, including 0 (players who lost everything)
    const totalCashOut = sessionPlayers.reduce((sum, sp) => sum + sp.cash_out, 0);
    const netResult = totalCashOut - totalBuyIn;

    return { totalBuyIn, totalCashOut, netResult };
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error || 'Session not found'}</p>
        </div>
      </div>
    );
  }

  const sessionPlayers = getSessionPlayers();
  const { totalBuyIn } = calculateTotals();

  return (
    <div className={`container mx-auto py-4 px-4 ${isDashboardView ? 'max-w-full' : 'max-w-4xl'}`}>
      {/* Session Header */}
      {!isDashboardView && (
        <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/sessions')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Calendar className="h-6 w-6 text-primary" />
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.name || 'Poker Night'}
                </h1>
                {/* Game Type Badge */}
                <Badge
                  variant="outline"
                  className={`text-sm ${
                    session.game_type === 'tournament'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                      : 'bg-green-50 text-green-700 border-green-300'
                  }`}
                >
                  {session.game_type === 'tournament' ? '🏆 Tournament' : '💵 Cash Game'}
                </Badge>
                {isSessionActive() && (
                  <Badge className="text-xs bg-green-600 text-white animate-pulse">
                    Active Session
                  </Badge>
                )}
                {!isSessionOwner() && (
                  <Badge variant="secondary" className="text-xs">
                    Read-Only
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSessionOwner() && (
                <Button
                  onClick={toggleDashboardView}
                  variant={isDashboardView ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  {isDashboardView ? (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      Exit Dashboard
                    </>
                  ) : (
                    <>
                      <Monitor className="h-4 w-4" />
                      Dashboard View
                    </>
                  )}
                </Button>
              )}
              <UserMenu />
            </div>
          </div>

          {session.scheduledDateTime && (
            <h2 className="text-gray-600 mb-2 ml-14">
              {formatScheduledDate(session.scheduledDateTime)}
            </h2>
          )}
        </div>
      </Card>
      )}

      {/* Bomb Pot Timer Alert Overlay */}
      {bombPotAlert && (
        <div
          className="fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center z-50 animate-pulse cursor-pointer"
          onClick={acknowledgeBombPotAlert}
        >
          <div className="text-center text-white pointer-events-none">
            <div className="text-6xl font-bold mb-4">💣 BOMB POT! 💣</div>
            <div className="text-2xl">Time for a Bomb Pot!</div>
            <div className="text-lg mt-4">Click anywhere to acknowledge and restart timer</div>
          </div>
        </div>
      )}

      {/* Persistent Timer Display - Always visible when timer has been used - Only for session owners */}
      {!isDashboardView && isSessionOwner() && (bombPotRunning || bombPotTimeLeft < bombPotInterval * 60) && (
        <Card className={`mb-4 border-2 ${bombPotRunning ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50'}`}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className={`h-5 w-5 ${bombPotRunning ? 'text-orange-600' : 'text-gray-500'}`} />
                <span className={`font-medium ${bombPotRunning ? 'text-orange-800' : 'text-gray-600'}`}>
                  Bomb Pot Timer {!bombPotRunning && '(Paused)'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-bold ${bombPotRunning ? 'text-orange-600' : 'text-gray-500'}`}>
                  {formatTime(bombPotTimeLeft)}
                </div>
                {/* Timer Controls */}
                <div className="flex items-center gap-1">
                  {!bombPotRunning ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={startBombPotTimer}
                      className="h-8 w-8 p-0"
                      title="Resume Timer"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pauseBombPotTimer}
                      className="h-8 w-8 p-0"
                      title="Pause Timer"
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetBombPotTimer}
                    className="h-8 w-8 p-0"
                    title="Reset Timer to Full Interval"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelBombPotTimer}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                    title="Cancel Timer (Reset and Stop)"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard View */}
      {isDashboardView ? (
        <div className="bg-gray-900 fixed inset-0 p-3 sm:p-4 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate mr-4">
                {session.name || 'Poker Night'} - Dashboard
              </h1>
              <Button
                onClick={toggleDashboardView}
                variant="outline"
                className="bg-white text-gray-900 hover:bg-gray-100 flex-shrink-0"
                size="sm"
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Dashboard
              </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 min-h-0 overflow-hidden">
              {/* Player Buy-ins - Full Height */}
              <Card className="md:col-span-2 lg:col-span-1 flex flex-col min-h-0">
                <div className="p-2 sm:p-3 bg-green-600 text-white flex-shrink-0 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1" />
                      <div className="text-xl sm:text-2xl font-bold mb-1">
                        {formatCurrency(getTotalBuyIns())}
                      </div>
                      <div className="text-xs sm:text-sm">
                        Total Buy-ins ({sessionPlayers.length} players)
                      </div>
                    </div>
                    {isSessionOwner() && (
                      <Button
                        onClick={() => setAddPlayerModalOpen(true)}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-green-700 p-2"
                        title="Add Player"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
                  <div className="h-full overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead className="py-2 text-sm font-semibold">Player</TableHead>
                          <TableHead className="py-2 text-sm font-semibold text-right">Buy-In</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessionPlayers
                          .sort((a, b) => b.buy_in - a.buy_in) // Sort by highest buy-in first
                          .map((sessionPlayer) => {
                            const player = sessionPlayer.player;
                            const isEditing = editingFinancials?.playerId === sessionPlayer.player_id;

                            return (
                              <TableRow
                                key={sessionPlayer.player_id}
                                className={`${isSessionOwner() ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                onClick={() => isSessionOwner() && !isEditing && handleEditFinancials(sessionPlayer)}
                                data-editing-row={isEditing ? 'true' : undefined}
                              >
                                <TableCell className="py-2">
                                  <div className="text-sm font-medium text-gray-900">
                                    {player?.name || 'Unknown Player'}
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 text-right">
                                  {isEditing ? (
                                    <div className="flex justify-end">
                                      <Select
                                        value={editingFinancials.buy_in}
                                        onValueChange={(value) => {
                                          setEditingFinancials({
                                            ...editingFinancials,
                                            buy_in: value
                                          });
                                        }}
                                        onOpenChange={(open) => {
                                          if (!open) {
                                            // Auto-save when dropdown closes
                                            handleFinancialInputBlur();
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-24 h-8 text-sm text-right">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                          {getBuyInOptions().map((amount) => (
                                            <SelectItem key={amount} value={amount.toString()}>
                                              {formatCurrency(amount)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  ) : (
                                    <div className={`text-sm font-medium ${getBuyInColorClass(sessionPlayer.buy_in)}`}>
                                      {formatCurrency(sessionPlayer.buy_in)}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Bomb Pot Timer */}
              <Card className="flex flex-col min-h-0">
                <CardContent className="flex-1 flex flex-col justify-center p-2 sm:p-3 text-center">
                  <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-1" />
                  <div
                    className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 cursor-pointer hover:text-orange-700 transition-colors"
                    onClick={() => setBombPotTimerModalOpen(true)}
                    title="Click to adjust timer interval"
                  >
                    {formatTime(bombPotTimeLeft)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">
                    {bombPotRunning ? 'Next Bomb Pot' : (bombPotEverStarted ? 'Timer Paused' : 'Timer Ready')}
                  </div>
                  <div className="flex justify-center gap-1">
                    {!bombPotRunning ? (
                      <Button onClick={startBombPotTimer} size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={pauseBombPotTimer} variant="outline" size="sm">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetBombPotTimer} variant="outline" size="sm">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button onClick={cancelBombPotTimer} variant="outline" size="sm" className="text-red-600">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Seating Chart - Single Table View with Navigation */}
              <Card className="flex flex-col min-h-0">
                <div className="p-2 sm:p-3 bg-blue-600 text-white flex-shrink-0 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                      <div className="text-base sm:text-lg font-bold">Current Seating</div>
                    </div>
                    {(() => {
                      const currentChart = getCurrentSeatingChart();
                      if (currentChart && currentChart.assignments) {
                        const tables = groupAssignmentsByTable(currentChart.assignments);
                        if (tables.length > 1) {
                          return (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentTableIndex(Math.max(0, currentTableIndex - 1))}
                                disabled={currentTableIndex === 0}
                                className="text-white hover:bg-blue-700 p-1 h-8 w-8"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium min-w-[60px] text-center">
                                {currentTableIndex + 1} of {tables.length}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentTableIndex(Math.min(tables.length - 1, currentTableIndex + 1))}
                                disabled={currentTableIndex >= tables.length - 1}
                                className="text-white hover:bg-blue-700 p-1 h-8 w-8"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <CardContent className="flex-1 p-1 sm:p-2 overflow-hidden min-h-0">
                  {getCurrentSeatingChart() && getCurrentSeatingChart()!.assignments ? (
                    <div className="h-full">
                      {(() => {
                        const tables = groupAssignmentsByTable(getCurrentSeatingChart()!.assignments!);
                        if (tables.length === 0) return null;

                        // Ensure currentTableIndex is within bounds
                        const safeTableIndex = Math.min(currentTableIndex, tables.length - 1);
                        const currentTable = tables[safeTableIndex];

                        if (!currentTable) return null;

                        return (
                          <div className="h-full">
                            <PokerTable table={currentTable} variant="dashboard" />
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center text-gray-500">
                      <div>
                        <p className="mb-4">No seating chart available</p>
                        {isSessionOwner() && (
                          <Button onClick={() => setSeatingChartModalOpen(true)} size="sm">
                            Generate Seating Chart
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className={`grid w-full ${isSessionOwner() ? 'grid-cols-3' : 'grid-cols-2'} mb-6`}>
          <TabsTrigger value="winnings" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Winnings
          </TabsTrigger>
          <TabsTrigger value="seating" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Seating
          </TabsTrigger>
          {isSessionOwner() && (
            <TabsTrigger value="bombpot" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Bomb Pot
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="winnings" className="mt-0">
          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="text-center py-6">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalBuyIn)}
                </div>
                <div className="text-sm text-gray-600">
                  Total Buy-In
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center py-6">
                <User className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary">
                  {sessionPlayers.length}
                </div>
                <div className="text-sm text-gray-600">
                  Players
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Financial Details */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-primary text-primary-foreground">
              <h3 className="text-lg font-bold">
                Winnings
              </h3>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 text-sm font-semibold">
                      Player
                    </TableHead>
                    <TableHead className="py-3 text-sm font-semibold text-right">
                      Buy-In
                    </TableHead>
                    <TableHead className="py-3 text-sm font-semibold text-right">
                      Cash-Out
                    </TableHead>
                    <TableHead className="py-3 text-sm font-semibold text-right">
                      Net
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionPlayers.map((sessionPlayer) => {
                    const player = sessionPlayer.player;
                    const netResult = sessionPlayer.cash_out - sessionPlayer.buy_in;
                    const isEditing = editingFinancials?.playerId === sessionPlayer.player_id;

                    return (
                      <TableRow
                        key={sessionPlayer.player_id}
                        className={`
                          ${!editingFinancials && isSessionOwner() ? 'cursor-pointer hover:bg-gray-50' : ''}
                          ${editingFinancials?.playerId === sessionPlayer.player_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                          ${editingFinancials && editingFinancials.playerId !== sessionPlayer.player_id ? 'opacity-50' : ''}
                        `}
                        onClick={() => !editingFinancials && isSessionOwner() && handleEditFinancials(sessionPlayer)}
                        data-editing-row={editingFinancials?.playerId === sessionPlayer.player_id ? 'true' : undefined}
                      >
                        <TableCell className="py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {player?.name || 'Unknown Player'}
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={editingFinancials.buy_in.toString()}
                            onValueChange={async (value) => {
                              const updatedFinancials = {
                                ...editingFinancials,
                                buy_in: value
                              };
                              setEditingFinancials(updatedFinancials);
                              // Auto-save with the updated values immediately
                              await handleSaveFinancials(updatedFinancials);
                            }}
                          >
                            <SelectTrigger className="w-24 h-8 text-sm text-right">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                              {getBuyInOptions().map((amount) => (
                                <SelectItem
                                  key={amount}
                                  value={amount.toString()}
                                  className={getBuyInColorClass(amount)}
                                >
                                  {formatCurrency(amount)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className={`text-sm font-medium ${getBuyInColorClass(sessionPlayer.buy_in)}`}>
                          {formatCurrency(sessionPlayer.buy_in)}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end">
                          <Input
                            type="number"
                            value={editingFinancials.cash_out}
                            onChange={(e) => setEditingFinancials({
                              ...editingFinancials,
                              cash_out: e.target.value
                            })}
                            onBlur={handleFinancialInputBlur}
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            className="w-20 h-8 text-sm text-right"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <div className="text-sm font-medium">
                          {formatCurrency(sessionPlayer.cash_out)}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <Badge
                        variant={netResult === 0 ? 'outline' : 'default'}
                        className={`text-xs ${
                          netResult >= 0
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {netResult >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netResult))}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>



        {/* Add Player Button - Only for session owners */}
        {isSessionOwner() && (
          <div className="p-4 text-center border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setAddPlayerModalOpen(true)}
              disabled={getAvailablePlayersToAdd().length === 0}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        )}
      </Card>


        </TabsContent>

        <TabsContent value="seating" className="mt-0">
          <SeatingChartList
            seatingCharts={seatingCharts}
            onGenerateNew={() => setSeatingChartModalOpen(true)}
            onDelete={handleDeleteSeatingChart}
            deleting={deletingChart}
            isOwner={isSessionOwner()}
          />
        </TabsContent>

        {isSessionOwner() && (
          <TabsContent value="bombpot" className="mt-0">
            <div className="space-y-6">
              {/* Timer Display */}
              <Card className="text-center">
                <CardContent className="py-8">
                  <Timer className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                  <div className="text-6xl font-bold text-orange-600 mb-2">
                    {formatTime(bombPotTimeLeft)}
                  </div>
                  <div className="text-lg text-gray-600 mb-6">
                    {bombPotRunning ? 'Time until next Bomb Pot' : (bombPotEverStarted ? 'Timer paused' : 'Timer ready to start')}
                  </div>

                  {/* Timer Controls */}
                  <div className="flex justify-center gap-3">
                    {!bombPotRunning ? (
                      <Button onClick={startBombPotTimer} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Start Timer
                      </Button>
                    ) : (
                      <Button onClick={pauseBombPotTimer} variant="outline" className="flex items-center gap-2">
                        <Pause className="h-4 w-4" />
                        Pause Timer
                      </Button>
                    )}
                    <Button onClick={resetBombPotTimer} variant="outline" className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button onClick={cancelBombPotTimer} variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Timer Settings */}
              <Card>
                <div className="p-4 bg-primary text-primary-foreground">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Timer Settings
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bomb Pot Interval (minutes)
                      </label>
                      <Select
                        value={bombPotInterval.toString()}
                        onValueChange={(value) => updateBombPotInterval(parseInt(value))}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 minute (testing)</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">20 minutes</SelectItem>
                          <SelectItem value="25">25 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="35">35 minutes</SelectItem>
                          <SelectItem value="40">40 minutes</SelectItem>
                          <SelectItem value="45">45 minutes (default)</SelectItem>
                          <SelectItem value="50">50 minutes</SelectItem>
                          <SelectItem value="55">55 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        <strong>How it works:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Timer counts down from the selected interval (1-60 minutes)</li>
                        <li>Use 1 minute interval for testing purposes only</li>
                        <li>When it reaches zero, a full-screen alert appears</li>
                        <li>Click anywhere on the alert to acknowledge and restart timer</li>
                        <li>Timer display with controls is visible on all tabs</li>
                        <li><strong>Play/Pause:</strong> Start or stop timer</li>
                        <li><strong>Reset:</strong> Restart at full interval (keeps running/paused state)</li>
                        <li><strong>Cancel:</strong> Reset timer and stop it completely</li>
                        <li>Audio alert plays when timer completes (if supported)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

        </>
      )}

      {/* Modals - Always available regardless of dashboard mode */}
      {/* Add Player Modal - Only for session owners */}
      {isSessionOwner() && (
        <Dialog open={addPlayerModalOpen} onOpenChange={setAddPlayerModalOpen}>
          <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-base sm:text-lg">Add Player to Session</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 min-h-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Select a player to add or change their status to "In".
              </p>

              <div className="space-y-2 pr-1"> {/* Small right padding for scrollbar */}
                {getAvailablePlayersToAdd().map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0 mr-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1 sm:mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{player.name}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddPlayer(player.id)}
                      disabled={updating}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      {updating ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        'Add'
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {getAvailablePlayersToAdd().length === 0 && (
                <p className="text-xs sm:text-sm text-gray-600 text-center py-4">
                  All players are already marked as "In" for this session.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 sm:pt-4 flex-shrink-0 border-t border-gray-100 mt-3 sm:mt-4">
              <Button variant="outline" onClick={() => setAddPlayerModalOpen(false)} size="sm">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Seating Chart Modal - Only for session owners */}
      {isSessionOwner() && (
        <SeatingChartModal
          open={seatingChartModalOpen}
          onClose={() => setSeatingChartModalOpen(false)}
          sessionId={session.id}
          sessionPlayers={getSessionPlayers()}
          onGenerate={handleGenerateSeatingChart}
          generating={generatingChart}
        />
      )}

      {/* Bomb Pot Timer Settings Modal - Only for session owners */}
      {isSessionOwner() && (
        <Dialog open={bombPotTimerModalOpen} onOpenChange={setBombPotTimerModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Bomb Pot Timer Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timer Interval (minutes)
              </label>
              <Select
                value={bombPotInterval.toString()}
                onValueChange={(value) => {
                  updateBombPotInterval(parseInt(value));
                  setBombPotTimerModalOpen(false);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute (testing)</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="35">35 minutes</SelectItem>
                  <SelectItem value="40">40 minutes</SelectItem>
                  <SelectItem value="45">45 minutes (default)</SelectItem>
                  <SelectItem value="50">50 minutes</SelectItem>
                  <SelectItem value="55">55 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              <p>Click on the timer display to quickly adjust the interval. The timer will be reset to the new interval.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBombPotTimerModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}

export default SessionPage;
