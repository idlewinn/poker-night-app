import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Users, Trash2, Calendar } from 'lucide-react';
import { SeatingChart } from '../types/index';
import { groupAssignmentsByTable } from '../utils/seatingChart';
import PokerTable from './PokerTable';

interface SeatingChartDisplayProps {
  seatingChart: SeatingChart;
  onDelete?: (chartId: number) => Promise<void>;
  deleting?: boolean;
}

function SeatingChartDisplay({
  seatingChart,
  onDelete,
  deleting = false
}: SeatingChartDisplayProps): React.JSX.Element {
  // Group assignments by table for display
  const tables = seatingChart.assignments ? groupAssignmentsByTable(seatingChart.assignments) : [];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTotalPlayers = (): number => {
    return seatingChart.assignments?.length || 0;
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(seatingChart.id);
    } catch (error) {
      console.error('Failed to delete seating chart:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {seatingChart.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(seatingChart.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {getTotalPlayers()} players
              </div>
              <Badge variant="outline">
                {seatingChart.number_of_tables} table{seatingChart.number_of_tables > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Only show delete button if onDelete is provided (user is owner) */}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Seating Chart</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{seatingChart.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {tables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No seating assignments found</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {tables.map((table) => (
              <PokerTable key={table.tableNumber} table={table} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SeatingChartDisplay;
