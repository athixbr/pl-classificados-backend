import { testConnection } from './config/database.js';

console.log('🔍 Testando conexão com o banco de dados...\n');

testConnection().then(() => {
  console.log('\n✅ Teste concluído com sucesso!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Falha no teste:', error.message);
  process.exit(1);
});
