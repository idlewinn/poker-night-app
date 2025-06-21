import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Users } from 'lucide-react';

interface SessionPageParams extends Record<string, string | undefined> {
  sessionId: string;
}

function SessionPageTest(): React.JSX.Element {
  const { sessionId } = useParams<SessionPageParams>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/sessions')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                <CardTitle>Session {sessionId}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a test session page for the shadcn/ui migration.
              Session ID: {sessionId}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Player management functionality will be migrated here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SessionPageTest;
