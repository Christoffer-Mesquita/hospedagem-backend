const nodemailer = require('nodemailer');
const ApiError = require('../utils/ApiError');

class EmailService {
  static transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // false para porta 587, true para 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true,
    tls: {
      rejectUnauthorized: true
    }
  });

  static async sendPasswordReset(email, token) {
    console.log('Iniciando envio de email...');
    console.log('Configurações do Gmail:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Redefinição de Senha - Sistema de Hospedagem',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Helvetica', Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
              color: #374151;
            }
            .button {
              display: inline-block;
              background: #4f46e5;
              color: white;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
              transition: background 0.3s ease;
            }
            .button:hover {
              background: #4338ca;
            }
            .footer {
              background: #f3f4f6;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #fbbf24;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Redefinição de Senha</h1>
            </div>
            <div class="content">
              <h2>Olá!</h2>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
              <p>Para continuar com o processo de redefinição, clique no botão abaixo:</p>
              
              <a href="${resetLink}" class="button">Redefinir Minha Senha</a>
              
              <div class="warning">
                <strong>Importante:</strong>
                <p>Este link é válido por apenas 1 hora e pode ser usado apenas uma vez.</p>
                <p>Se você não solicitou esta redefinição, ignore este email.</p>
              </div>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>&copy; ${new Date().getFullYear()} Sistema de Hospedagem. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      console.log('Tentando enviar email...');
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', info);
      return info;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      console.error('Detalhes do erro:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack
      });
      throw new ApiError(500, `Erro ao enviar email: ${error.message}`);
    }
  }
}

module.exports = EmailService; 