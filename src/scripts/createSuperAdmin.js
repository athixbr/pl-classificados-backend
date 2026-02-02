import dotenv from 'dotenv';
import { sequelize, testConnection } from '../config/database.js';
import { User, Plan } from '../models/index.js';

// Carregar variáveis de ambiente
dotenv.config();

const createSuperAdmin = async () => {
  try {
    console.log('🔄 Iniciando criação do Super Admin...\n');

    // Testar conexão
    await testConnection();

    // Sincronizar modelos
    await sequelize.sync();

    // Verificar se já existe
    const existingAdmin = await User.findOne({
      where: { email: 'superadmin@plclassificados.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Super Admin já existe!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nome:', existingAdmin.name);
      console.log('🔑 Tipo:', existingAdmin.type);
      console.log('\n✅ Use este email e senha para fazer login.');
      process.exit(0);
    }

    // Criar Super Admin
    const superAdmin = await User.create({
      name: 'Super Administrador',
      email: 'superadmin@plclassificados.com',
      password: 'Admin@2026',
      type: 'admin',
      is_active: true,
      email_verified: true
    });

    console.log('✅ Super Admin criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 CREDENCIAIS DO SUPER ADMIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    superadmin@plclassificados.com');
    console.log('🔒 Senha:    Admin@2026');
    console.log('👤 Nome:     Super Administrador');
    console.log('🔑 Tipo:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar Super Admin:', error);
    process.exit(1);
  }
};

// Criar alguns usuários de teste também
const createTestUsers = async () => {
  try {
    console.log('🔄 Criando usuários de teste...\n');

    // Testar conexão
    await testConnection();
    await sequelize.sync();

    // Buscar plano gratuito
    const freePlan = await Plan.findOne({ where: { slug: 'free' } });

    // Usuário comum
    const userExists = await User.findOne({ where: { email: 'usuario@teste.com' } });
    if (!userExists) {
      await User.create({
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        password: 'Teste@2026',
        type: 'user',
        plan_id: freePlan?.id,
        is_active: true,
        email_verified: true
      });
      console.log('✅ Usuário comum criado');
      console.log('   📧 Email: usuario@teste.com');
      console.log('   🔒 Senha: Teste@2026\n');
    }

    // Imobiliária
    const agencyExists = await User.findOne({ where: { email: 'imobiliaria@teste.com' } });
    if (!agencyExists) {
      await User.create({
        name: 'Imobiliária Premium',
        email: 'imobiliaria@teste.com',
        password: 'Imob@2026',
        type: 'agency',
        phone: '11999999999',
        plan_id: freePlan?.id,
        is_active: true,
        email_verified: true
      });
      console.log('✅ Imobiliária criada');
      console.log('   📧 Email: imobiliaria@teste.com');
      console.log('   🔒 Senha: Imob@2026\n');
    }

    console.log('✅ Todos os usuários de teste foram criados!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
    process.exit(1);
  }
};

// Verificar argumentos
const args = process.argv.slice(2);
if (args.includes('--with-test-users')) {
  createTestUsers();
} else {
  createSuperAdmin();
}
