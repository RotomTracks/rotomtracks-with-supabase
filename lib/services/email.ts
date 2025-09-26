import { createClient } from '@/lib/supabase/server';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface RegistrationEmailData {
  to: string;
  participantName: string;
  tournamentName: string;
  tournamentDate: string;
  tournamentLocation: string;
  registrationStatus: 'registered' | 'waitlist';
  participantId: string;
}

export class EmailService {
  private static instance: EmailService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send a registration confirmation email
   */
  async sendRegistrationConfirmation(data: RegistrationEmailData): Promise<boolean> {
    try {
      const { to, subject, html, text } = this.generateRegistrationEmail(data);
      return await this.sendEmail({ to, subject, html, text });
    } catch (error) {
      console.error('Error sending registration confirmation email:', error);
      return false;
    }
  }

  /**
   * Generate registration confirmation email content
   */
  private generateRegistrationEmail(data: RegistrationEmailData): EmailData {
    const { participantName, tournamentName, tournamentDate, tournamentLocation, registrationStatus } = data;
    
    const statusText = registrationStatus === 'registered' 
      ? 'confirmada' 
      : 'añadido a la lista de espera';
    
    const statusColor = registrationStatus === 'registered' 
      ? '#10B981' 
      : '#F59E0B';

    const subject = `Confirmación de registro - ${tournamentName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-badge { 
            display: inline-block; 
            padding: 8px 16px; 
            border-radius: 20px; 
            color: white; 
            font-weight: bold;
            background-color: ${statusColor};
          }
          .tournament-info { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #3B82F6;
          }
          .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 RotomTracks</h1>
            <p>Confirmación de Registro de Torneo</p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${participantName}!</h2>
            
            <p>Tu registro para el torneo ha sido <span class="status-badge">${statusText}</span>.</p>
            
            <div class="tournament-info">
              <h3>📋 Detalles del Torneo</h3>
              <p><strong>Nombre:</strong> ${tournamentName}</p>
              <p><strong>Fecha:</strong> ${tournamentDate}</p>
              <p><strong>Ubicación:</strong> ${tournamentLocation}</p>
              <p><strong>Estado:</strong> ${registrationStatus === 'registered' ? 'Registrado' : 'Lista de espera'}</p>
            </div>
            
            ${registrationStatus === 'waitlist' ? `
              <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                <p><strong>📝 Lista de Espera</strong></p>
                <p>El torneo está completo, pero has sido añadido a la lista de espera. Te notificaremos si se libera una plaza.</p>
              </div>
            ` : `
              <div style="background: #D1FAE5; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
                <p><strong>✅ Registro Confirmado</strong></p>
                <p>Tu plaza en el torneo está confirmada. ¡Nos vemos en el torneo!</p>
              </div>
            `}
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            
            <p>¡Que tengas suerte en el torneo!</p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático de RotomTracks. Por favor, no respondas a este mensaje.</p>
            <p>© 2024 RotomTracks. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Confirmación de Registro - ${tournamentName}
      
      Hola ${participantName},
      
      Tu registro para el torneo ha sido ${statusText}.
      
      Detalles del Torneo:
      - Nombre: ${tournamentName}
      - Fecha: ${tournamentDate}
      - Ubicación: ${tournamentLocation}
      - Estado: ${registrationStatus === 'registered' ? 'Registrado' : 'Lista de espera'}
      
      ${registrationStatus === 'waitlist' 
        ? 'El torneo está completo, pero has sido añadido a la lista de espera. Te notificaremos si se libera una plaza.'
        : 'Tu plaza en el torneo está confirmada. ¡Nos vemos en el torneo!'
      }
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      ¡Que tengas suerte en el torneo!
      
      --
      RotomTracks
      © 2024 RotomTracks. Todos los derechos reservados.
    `;

    return {
      to: data.to, // Use the email address from data.to
      subject,
      html,
      text
    };
  }

  /**
   * Send email using MailerSend via Supabase function
   */
  private async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Use MailerSend function in Supabase
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      
      const { data, error } = await supabase.rpc('send_email_mailersend', {
        message: {
          sender: 'no-reply@rotomtracks.es',
          recipient: emailData.to,
          subject: emailData.subject,
          text_body: emailData.text || '',
          html_body: emailData.html || ''
        }
      });

      if (error) {
        console.error('Error sending email via MailerSend:', error);
        return false;
      }

      // Check if the response indicates success (202 = accepted)
      const response = typeof data === 'string' ? parseInt(data) : data;
      const isSuccess = response === 202 || (typeof response === 'object' && response?.status === 202);
      
      if (isSuccess) {
        console.log('Email sent successfully via MailerSend:', {
          to: emailData.to,
          subject: emailData.subject,
          messageId: typeof response === 'object' ? response?.content : 'unknown'
        });
        return true;
      } else {
        console.error('MailerSend returned non-success status:', response);
        return false;
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send a simple notification email
   */
  async sendNotification(to: string, subject: string, message: string): Promise<boolean> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>${subject}</h2>
            <p>${message}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
              © 2024 RotomTracks. Todos los derechos reservados.
            </p>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail({ to, subject, html, text: message });
    } catch (error) {
      console.error('Error sending notification email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
