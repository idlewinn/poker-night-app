import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Users, Link as LinkIcon } from 'lucide-react';

function TestPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<'invite' | 'reminder'>('invite');

  // Mock data for email preview
  const mockSession = {
    name: "Friday Night Poker",
    scheduledDateTime: "2026-02-07T19:00:00.000Z",
    players: [
      { name: "Edwin", status: "In" },
      { name: "Michelle", status: "In" },
      { name: "John", status: "Invited" },
      { name: "Sarah", status: "Maybe" }
    ]
  };

  const mockPlayer = {
    name: "John Doe",
    email: "john@example.com"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Email invite template
  const renderInviteEmail = () => (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f5f6f8', padding: '20px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#4a7c59', padding: '30px', textAlign: 'center', borderRadius: '8px 8px 0 0' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>♠ ♣</div>
        <h1 style={{ color: '#ffffff', margin: '0', fontSize: '28px' }}>Poker Night Invitation</h1>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '0 0 8px 8px' }}>
        <p style={{ fontSize: '16px', color: '#1a2332', marginBottom: '20px' }}>
          Hi {mockPlayer.name},
        </p>

        <p style={{ fontSize: '16px', color: '#1a2332', marginBottom: '20px' }}>
          You're invited to join us for <strong>{mockSession.name}</strong>!
        </p>

        {/* Event Details Card */}
        <div style={{ backgroundColor: '#f0f5f2', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: '4px solid #4a7c59' }}>
          <p style={{ margin: '0 0 10px 0', color: '#1a2332' }}>
            <strong>📅 When:</strong> {formatDate(mockSession.scheduledDateTime)}
          </p>
          <p style={{ margin: '0', color: '#1a2332' }}>
            <strong>👥 Players:</strong> {mockSession.players.length} invited
          </p>
        </div>

        {/* RSVP Buttons */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', color: '#1a2332', marginBottom: '15px' }}>
            Will you be joining us?
          </p>
          <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
            <tr>
              <td style={{ padding: '0 5px' }}>
                <a href="#" style={{ 
                  backgroundColor: '#4a7c59', 
                  color: '#ffffff', 
                  padding: '12px 24px', 
                  textDecoration: 'none', 
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  ✓ I'm In
                </a>
              </td>
              <td style={{ padding: '0 5px' }}>
                <a href="#" style={{ 
                  backgroundColor: '#e0e0e0', 
                  color: '#1a2332', 
                  padding: '12px 24px', 
                  textDecoration: 'none', 
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  ? Maybe
                </a>
              </td>
              <td style={{ padding: '0 5px' }}>
                <a href="#" style={{ 
                  backgroundColor: '#e63946', 
                  color: '#ffffff', 
                  padding: '12px 24px', 
                  textDecoration: 'none', 
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  ✗ Can't Make It
                </a>
              </td>
            </tr>
          </table>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginTop: '20px' }}>
          Looking forward to seeing you at the table! 🎲
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: '#6b7280' }}>
        <p style={{ margin: '0' }}>Poker Night Tracker</p>
        <p style={{ margin: '5px 0 0 0' }}>
          <a href="#" style={{ color: '#4a7c59', textDecoration: 'none' }}>View Session Details</a>
        </p>
      </div>
    </div>
  );

  // Reminder email template
  const renderReminderEmail = () => (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f5f6f8', padding: '20px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#d4a017', padding: '30px', textAlign: 'center', borderRadius: '8px 8px 0 0' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏰ 🎰</div>
        <h1 style={{ color: '#1a2332', margin: '0', fontSize: '28px' }}>Poker Night Reminder</h1>
      </div>

      {/* Content */}
      <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '0 0 8px 8px' }}>
        <p style={{ fontSize: '16px', color: '#1a2332', marginBottom: '20px' }}>
          Hi {mockPlayer.name},
        </p>

        <p style={{ fontSize: '16px', color: '#1a2332', marginBottom: '20px' }}>
          Just a friendly reminder about <strong>{mockSession.name}</strong> coming up soon!
        </p>

        {/* Event Details Card */}
        <div style={{ backgroundColor: '#fff9e6', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: '4px solid #d4a017' }}>
          <p style={{ margin: '0 0 10px 0', color: '#1a2332' }}>
            <strong>📅 When:</strong> {formatDate(mockSession.scheduledDateTime)}
          </p>
          <p style={{ margin: '0 0 10px 0', color: '#1a2332' }}>
            <strong>⏰ That's in 2 days!</strong>
          </p>
        </div>

        {/* Current Status */}
        <div style={{ backgroundColor: '#f0f5f2', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#1a2332', fontWeight: 'bold' }}>
            Current RSVPs:
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#1a2332' }}>
            <li>✓ 2 confirmed</li>
            <li>? 1 maybe</li>
            <li>⏳ 1 pending (you!)</li>
          </ul>
        </div>

        {/* Action */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', color: '#1a2332', marginBottom: '15px' }}>
            Haven't responded yet? Let us know!
          </p>
          <a href="#" style={{ 
            backgroundColor: '#4a7c59', 
            color: '#ffffff', 
            padding: '14px 28px', 
            textDecoration: 'none', 
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block',
            fontSize: '16px'
          }}>
            Update RSVP
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: '#6b7280' }}>
        <p style={{ margin: '0' }}>Poker Night Tracker</p>
      </div>
    </div>
  );

  // Invite response page (what the user sees when they click the link)
  const renderInviteResponsePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl poker-card shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-primary to-poker-felt-light text-white text-center pb-8">
          <div className="text-5xl mb-4">♠ ♣ ♥ ♦</div>
          <CardTitle className="text-3xl font-bold mb-2">{mockSession.name}</CardTitle>
          <p className="text-white/90 text-lg">{formatDate(mockSession.scheduledDateTime)}</p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Hi {mockPlayer.name}! 👋
            </h2>
            <p className="text-muted-foreground">
              Will you be joining us for poker night?
            </p>
          </div>

          {/* RSVP Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button 
              size="lg" 
              className="h-20 bg-success hover:bg-success/90 text-white text-lg font-bold"
            >
              <span className="text-2xl mr-2">✓</span>
              I'm In!
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-20 border-2 text-lg font-bold"
            >
              <span className="text-2xl mr-2">?</span>
              Maybe
            </Button>
            <Button 
              size="lg" 
              variant="destructive"
              className="h-20 text-lg font-bold"
            >
              <span className="text-2xl mr-2">✗</span>
              Can't Make It
            </Button>
          </div>

          {/* Current Players */}
          <div className="bg-accent/30 rounded-lg p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Who's Playing ({mockSession.players.filter(p => p.status === 'In').length} confirmed)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {mockSession.players.map((player, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-lg">
                    {player.status === 'In' ? '✓' : player.status === 'Maybe' ? '?' : '⏳'}
                  </span>
                  <span className="text-foreground">{player.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>You can change your response anytime by clicking the link in your email.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-poker-navy dark:text-foreground">
                Email Preview & Test Page
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Preview email templates and invite response page
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="invite-email" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="invite-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invite Email
            </TabsTrigger>
            <TabsTrigger value="reminder-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Reminder Email
            </TabsTrigger>
            <TabsTrigger value="response-page" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Response Page
            </TabsTrigger>
          </TabsList>

          {/* Invite Email Preview */}
          <TabsContent value="invite-email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Invitation Email Template
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  This is what players receive when invited to a poker session
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg overflow-auto">
                  {renderInviteEmail()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminder Email Preview */}
          <TabsContent value="reminder-email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-warning" />
                  Reminder Email Template
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sent to players who haven't responded yet
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg overflow-auto">
                  {renderReminderEmail()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Response Page Preview */}
          <TabsContent value="response-page">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-info" />
                  Invite Response Page
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  What players see when they click the invite link
                </p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-border rounded-lg overflow-hidden">
                  {renderInviteResponsePage()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Helper Info */}
        <Card className="mt-6 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-2">💡 Testing Notes</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Email templates use inline styles for email client compatibility</li>
              <li>Response page uses your app's theme and components</li>
              <li>All links in these previews are non-functional (#)</li>
              <li>Actual emails will have working RSVP links with unique tokens</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TestPage;
