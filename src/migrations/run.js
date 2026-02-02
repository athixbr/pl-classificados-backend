import { sequelize } from '../config/database.js';
import '../models/index.js';

const runMigrations = async () => {
  try {
    console.log('🔄 Iniciando criação das tabelas...');
    
    // Força a criação das tabelas (CUIDADO: deleta dados existentes)
    // Use { force: false } ou { alter: true } em produção
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Tabelas criadas/atualizadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    process.exit(1);
  }
};

runMigrations();
