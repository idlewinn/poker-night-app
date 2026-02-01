import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle, Plus } from 'lucide-react';
import { SeatingChart } from '../types/index';
import SeatingChartDisplay from './SeatingChartDisplay';

interface SeatingChartListProps {
  seatingCharts: SeatingChart[];
  onGenerateNew: () => void;
  onDelete: (chartId: number) => Promise<void>;
  loading?: boolean;
  deleting?: boolean;
  isOwner?: boolean;
}

function SeatingChartList({
  seatingCharts,
  onGenerateNew,
  onDelete,
  loading = false,
  deleting = false,
  isOwner = false
}: SeatingChartListProps): React.JSX.Element {
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (seatingCharts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shuffle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Seating Charts</h3>
          <p className="text-gray-600 mb-6">
            {isOwner
              ? "Generate seating arrangements for your poker tables to organize players efficiently."
              : "No seating charts have been created for this session yet."
            }
          </p>
          {isOwner && (
            <Button onClick={onGenerateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Generate Seating Chart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Seating Charts ({seatingCharts.length})
          </h3>
          <p className="text-sm text-gray-600">
            Manage seating arrangements for this session
          </p>
        </div>
        {isOwner && (
          <Button onClick={onGenerateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate New Chart
          </Button>
        )}
      </div>

      {/* Seating Charts List */}
      <div className="space-y-4">
        {seatingCharts.map((chart) => (
          <SeatingChartDisplay
            key={chart.id}
            seatingChart={chart}
            {...(isOwner && onDelete ? { onDelete: onDelete } : {})}
            deleting={deleting}
          />
        ))}
      </div>
    </div>
  );
}

export default SeatingChartList;
