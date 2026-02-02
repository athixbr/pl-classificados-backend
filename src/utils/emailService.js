import nodemailer from 'nodemailer';

// Configurar transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Enviar email de boas-vindas
export const sendWelcomeEmail = async (user, password) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Bem-vindo ao PL Classificados!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao PL Classificados!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${user.name}</strong>,</p>
            
            <p>Sua conta foi criada com sucesso! Agora você pode publicar anúncios e conectar-se com milhares de pessoas.</p>
            
            <div class="credentials">
              <h3>📋 Seus dados de acesso:</h3>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Senha:</strong> ${password || '(senha escolhida por você)'}</p>
              <p><strong>Tipo de conta:</strong> ${user.type === 'user' ? 'Usuário' : user.type === 'agency' ? 'Imobiliária' : 'Administrador'}</p>
            </div>
            
            <p>Para começar, faça login e explore todas as funcionalidades:</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Acessar Minha Conta</a>
            </div>
            
            <p><strong>💡 Próximos passos:</strong></p>
            <ul>
              <li>Complete seu perfil</li>
              <li>Escolha um plano (se ainda não escolheu)</li>
              <li>Publique seu primeiro anúncio</li>
            </ul>
            
            <p>Se você não criou esta conta, por favor ignore este email ou entre em contato conosco.</p>
            
            <div class="footer">
              <p>© 2026 PL Classificados - Todos os direitos reservados</p>
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de boas-vindas enviado para ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

// Enviar email de confirmação de plano
export const sendPlanConfirmationEmail = async (user, plan) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: `Plano ${plan.name} ativado com sucesso!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .plan-details { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
          .feature { padding: 8px 0; border-bottom: 1px solid #eee; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Plano Ativado!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${user.name}</strong>,</p>
            
            <p>Seu plano <strong>${plan.name}</strong> foi ativado com sucesso!</p>
            
            <div class="plan-details">
              <h3>📦 Detalhes do seu plano:</h3>
              <div class="feature"><strong>Plano:</strong> ${plan.name}</div>
              <div class="feature"><strong>Valor:</strong> ${plan.price > 0 ? `R$ ${plan.price.toFixed(2)}/${plan.period === 'monthly' ? 'mês' : 'ano'}` : 'Gratuito'}</div>
              <div class="feature"><strong>Anúncios permitidos:</strong> ${plan.ads_limit === -1 ? 'Ilimitado' : plan.ads_limit}</div>
              <div class="feature"><strong>Anúncios em destaque:</strong> ${plan.highlighted || 0} por mês</div>
            </div>
            
            ${plan.features && plan.features.length > 0 ? `
            <p><strong>✨ Recursos inclusos:</strong></p>
            <ul>
              ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Acessar Painel</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmação de plano enviado para ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendWelcomeEmail,
  sendPlanConfirmationEmail
};
