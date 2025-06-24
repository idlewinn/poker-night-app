import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeatingTable } from '../types/index';

interface PokerTableProps {
  table: SeatingTable;
  maxSeats?: number;
  variant?: 'default' | 'dashboard';
}

function PokerTable({ table, variant = 'default' }: PokerTableProps): React.JSX.Element {
  const players = table.players;
  
  // Calculate positions around the oval table
  const getPlayerPosition = (seatIndex: number, totalSeats: number) => {
    // Distribute players around an oval/ellipse
    // Use smaller radius to prevent clipping at edges
    const angle = (seatIndex / totalSeats) * 2 * Math.PI - Math.PI / 2; // Start from top

    // Smaller base radius to keep cards within bounds
    let radiusX = 38; // Reduced from 45 to prevent horizontal clipping
    let radiusY = 28; // Reduced from 35 to prevent vertical clipping

    if (totalSeats > 8) {
      // More conservative expansion for crowded tables
      radiusX = Math.min(42, 38 + (totalSeats - 8) * 0.5); // Smaller increments
      radiusY = Math.min(32, 28 + (totalSeats - 8) * 0.8); // Smaller increments
    }

    const x = 50 + radiusX * Math.cos(angle); // Center at 50%
    const y = 50 + radiusY * Math.sin(angle); // Center at 50%

    return { x, y, angle };
  };



  // Dynamic sizing based on variant
  const sizeClasses = variant === 'dashboard'
    ? "relative w-full h-full bg-gradient-to-br from-green-800 to-green-900 border-2 sm:border-4 border-amber-600 shadow-2xl overflow-hidden"
    : "relative w-full aspect-[4/3] min-h-[350px] md:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px] bg-gradient-to-br from-green-800 to-green-900 border-4 border-amber-600 shadow-2xl overflow-hidden";

  return (
    <Card className={sizeClasses}>
      {/* Table Surface - Add more padding to prevent card clipping */}
      <div className="absolute inset-6 sm:inset-8 bg-gradient-to-br from-green-600 to-green-700 rounded-full border-4 border-green-800 shadow-inner">
        {/* Table Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/20 select-none">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">TABLE {table.tableNumber}</div>
            <div className="text-sm md:text-base lg:text-lg">{players.length} PLAYERS</div>
          </div>
        </div>
        
        {/* Player Positions */}
        {players.map((assignment, index) => {
          const position = getPlayerPosition(index, Math.max(players.length, 6));
          // Position badge on top-left for players on the right side to prevent clipping
          const isRightSide = position.x > 50;
          const badgePosition = isRightSide ? "-top-1 -left-1" : "-top-1 -right-1";

          // Scale down player cards for crowded tables
          const isCrowded = players.length > 8;
          const cardSizeClasses = isCrowded
            ? "bg-white/95 backdrop-blur-sm border-2 border-gray-300 shadow-lg min-w-[60px] md:min-w-[70px] lg:min-w-[80px] max-w-[80px] md:max-w-[90px] lg:max-w-[100px]"
            : "bg-white/95 backdrop-blur-sm border-2 border-gray-300 shadow-lg min-w-[80px] md:min-w-[100px] lg:min-w-[120px] xl:min-w-[140px] max-w-[140px] md:max-w-[160px] lg:max-w-[180px]";

          const textSizeClasses = isCrowded
            ? "text-xs md:text-sm font-semibold text-gray-900 truncate"
            : "text-sm md:text-base lg:text-lg font-semibold text-gray-900 truncate";

          const paddingClasses = isCrowded ? "p-1 md:p-2" : "p-2 md:p-3";

          return (
            <div
              key={assignment.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              {/* Player Card */}
              <div className="relative">
                {/* Seat Position Badge */}
                <Badge
                  variant="secondary"
                  className={`absolute ${badgePosition} z-10 bg-amber-500 text-amber-900 text-xs font-bold min-w-[18px] md:min-w-[20px] h-4 md:h-5 flex items-center justify-center`}
                >
                  {assignment.seat_position}
                </Badge>

                {/* Player Info Card */}
                <Card className={cardSizeClasses}>
                  <div className={`${paddingClasses} text-center`}>
                    <div className={textSizeClasses}>
                      {assignment.player?.name || 'Unknown'}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
        
        {/* Dealer Button (always at position 1) */}
        {players.length > 0 && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${getPlayerPosition(0, Math.max(players.length, 6)).x}%`,
              top: `${getPlayerPosition(0, Math.max(players.length, 6)).y - 8}%`,
            }}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xs md:text-sm lg:text-base font-bold text-gray-800">D</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Table Info */}
      <div className="absolute bottom-2 md:bottom-3 left-2 right-2">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 md:px-4 py-1 md:py-2 text-center">
          <div className="text-white text-sm md:text-base lg:text-lg font-semibold">
            Table {table.tableNumber} • {players.length} Player{players.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default PokerTable;
