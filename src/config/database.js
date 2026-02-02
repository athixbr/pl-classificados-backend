import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000, // Aumentado para 60s
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 60000, // 60 segundos
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : undefined
  },
  timezone: '-03:00',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    freezeTableName: true
  }
};

let sequelize;

try {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    dbConfig
  );
} catch (error) {
  console.error('❌ Erro ao criar instância do Sequelize:', error.message);
  process.exit(1);
}

// Teste de conexão com retry
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Tentando conectar ao banco... (tentativa ${i + 1}/${retries})`);
      console.log(`📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`📂 Database: ${process.env.DB_NAME}`);
      console.log(`👤 User: ${process.env.DB_USER}`);
      
      await sequelize.authenticate();
      console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
      return true;
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1} falhou:`, error.message);
      
      if (error.message.includes('ETIMEDOUT')) {
        console.error(`
⚠️  ERRO DE TIMEOUT - Possíveis causas:
  1. Firewall bloqueando a conexão
  2. IP não autorizado no Digital Ocean
  3. Servidor de banco de dados inativo
  4. Problemas de rede/internet
  
💡 Soluções:
  - Verifique se seu IP está autorizado no firewall do Digital Ocean
  - Teste a conexão: ping ${process.env.DB_HOST}
  - Use banco de dados local (veja .env.example)
  - Verifique credenciais no painel do Digital Ocean
        `);
      } else if (error.message.includes('Access denied')) {
        console.error(`
⚠️  ERRO DE AUTENTICAÇÃO
  - Usuário ou senha incorretos
  - Verifique DB_USER e DB_PASSWORD no arquivo .env
        `);
      }
      
      if (i === retries - 1) {
        console.error('\n❌ Não foi possível conectar ao banco após todas as tentativas.');
        console.error('🔧 Configure um banco local ou verifique suas credenciais.\n');
        process.exit(1);
      }
      
      // Aguardar 2 segundos antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export { sequelize, testConnection };
