import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, testConnection } from './config/database.js';
import { configureMercadoPago } from './config/mercadopago.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente da raiz do projeto
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Inicializar app
const app = express();

// Middlewares
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    'http://localhost:8081',
    'http://localhost:8080',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api', routes);

// Middlewares de erro
app.use(notFound);
app.use(errorHandler);

// Porta
const PORT = process.env.PORT || 3003;

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    await testConnection();

    // Configurar Mercado Pago
    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      configureMercadoPago();
    } else {
      console.log('⚠️ MERCADOPAGO_ACCESS_TOKEN não configurado');
    }

    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Modelos sincronizados com o banco de dados');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
