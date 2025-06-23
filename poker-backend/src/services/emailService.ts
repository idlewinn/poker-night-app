import nodemailer from 'nodemailer';
import { Session, Player } from '../types/index';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SessionInviteEmailData {
  session: Session;
  player: Player;
  inviteUrl: string;
  hostName: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      // Check if email configuration is available
      const emailHost = process.env.EMAIL_HOST;
      const emailPort = process.env.EMAIL_PORT;
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailHost || !emailPort || !emailUser || !emailPass) {
        console.log('Email configuration not found. Email functionality will be disabled.');
        return;
      }

      const config: EmailConfig = {
        host: emailHost,
        port: parseInt(emailPort),
        secure: parseInt(emailPort) === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      };

      this.transporter = nodemailer.createTransport(config);
      this.isConfigured = true;

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  public async sendSessionInviteEmail(data: SessionInviteEmailData): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('Email service not configured. Skipping email send.');
      return false;
    }

    if (!data.player.email) {
      console.log(`Player ${data.player.name} has no email address. Skipping email send.`);
      return false;
    }

    try {
      const emailHtml = this.generateSessionInviteHtml(data);
      const emailText = this.generateSessionInviteText(data);

      const mailOptions = {
        from: `"Poker Night" <${process.env.EMAIL_USER}>`,
        to: data.player.email,
        subject: `🃏 You're invited to ${data.session.name || 'Poker Night'}!`,
        text: emailText,
        html: emailHtml,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Session invite email sent to ${data.player.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`Failed to send session invite email to ${data.player.email}:`, error);
      return false;
    }
  }

  public async sendBulkSessionInvites(
    session: Session,
    players: Player[],
    hostName: string,
    baseUrl: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const player of players) {
      if (!player.email) {
        console.log(`Player ${player.name} has no email address. Skipping.`);
        failed++;
        continue;
      }

      // Generate invite URL with base64 encoded email
      const encodedEmail = Buffer.from(player.email).toString('base64');
      const inviteUrl = `${baseUrl}/invite/${session.id}/${encodedEmail}`;

      const emailData: SessionInviteEmailData = {
        session,
        player,
        inviteUrl,
        hostName,
      };

      const success = await this.sendSessionInviteEmail(emailData);
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Add a small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }

  private generateSessionInviteHtml(data: SessionInviteEmailData): string {
    const { session, player, inviteUrl, hostName } = data;
    
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Poker Night Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .cta-button:hover { background: #5a6fd8; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .emoji { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><span class="emoji">🃏</span> Poker Night Invitation</h1>
          <p>You're invited to join the action!</p>
        </div>
        
        <div class="content">
          <p>Hi ${player.name},</p>
          
          <p>${hostName} has invited you to a poker session!</p>
          
          <div class="session-details">
            <h3><span class="emoji">🎮</span> ${session.name || 'Poker Night'}</h3>
            ${session.scheduled_datetime ? `
              <p><strong><span class="emoji">📅</span> When:</strong> ${formatDate(session.scheduled_datetime)}</p>
            ` : ''}
            <p><strong><span class="emoji">${session.game_type === 'tournament' ? '🏆' : '💵'}</span> Game Type:</strong> ${session.game_type === 'tournament' ? 'Tournament' : 'Cash Game'}</p>
            <p><strong><span class="emoji">👤</span> Host:</strong> ${hostName}</p>
          </div>
          
          <p>Please let us know if you can make it by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${inviteUrl}" class="cta-button">
              <span class="emoji">✅</span> Respond to Invitation
            </a>
          </div>
          
          <p>You can update your status anytime using the link above. We're looking forward to seeing you at the table!</p>
          
          <p>Best regards,<br>
          The Poker Night Team</p>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${hostName} through Poker Night.<br>
          If you have any questions, please contact the host directly.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateSessionInviteText(data: SessionInviteEmailData): string {
    const { session, player, inviteUrl, hostName } = data;
    
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return `
🃏 POKER NIGHT INVITATION

Hi ${player.name},

${hostName} has invited you to a poker session!

SESSION DETAILS:
🎮 Session: ${session.name || 'Poker Night'}
${session.scheduled_datetime ? `📅 When: ${formatDate(session.scheduled_datetime)}` : ''}
${session.game_type === 'tournament' ? '🏆' : '💵'} Game Type: ${session.game_type === 'tournament' ? 'Tournament' : 'Cash Game'}
👤 Host: ${hostName}

Please respond to this invitation by visiting:
${inviteUrl}

You can update your status anytime using the link above. We're looking forward to seeing you at the table!

Best regards,
The Poker Night Team

---
This invitation was sent by ${hostName} through Poker Night.
If you have any questions, please contact the host directly.
    `.trim();
  }

  public isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
