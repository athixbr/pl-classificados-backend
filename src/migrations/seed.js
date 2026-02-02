import { sequelize } from '../config/database.js';
import { User, Plan, Category, City } from '../models/index.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar planos
    console.log('📋 Criando planos...');
    const plans = await Plan.bulkCreate([
      {
        name: 'Gratuito',
        slug: 'free',
        price: 0,
        period: 'monthly',
        features: JSON.stringify([
          '1 anúncio ativo',
          'Duração de 30 dias',
          'Fotos básicas (até 3)',
          'Suporte por email'
        ]),
        ads_limit: 1,
        highlighted: 0,
        featured: false,
        type: 'user'
      },
      {
        name: 'Básico',
        slug: 'basic',
        price: 29.90,
        period: 'monthly',
        features: JSON.stringify([
          '5 anúncios ativos',
          'Duração de 60 dias',
          'Fotos ilimitadas',
          '1 anúncio destacado/mês',
          'Estatísticas básicas',
          'Suporte prioritário'
        ]),
        ads_limit: 5,
        highlighted: 1,
        featured: false,
        type: 'user'
      },
      {
        name: 'Profissional',
        slug: 'pro',
        price: 59.90,
        period: 'monthly',
        features: JSON.stringify([
          '20 anúncios ativos',
          'Duração de 90 dias',
          'Fotos ilimitadas',
          '5 anúncios destacados/mês',
          'Estatísticas avançadas',
          'Selo de vendedor verificado',
          'Suporte 24/7'
        ]),
        ads_limit: 20,
        highlighted: 5,
        featured: true,
        type: 'user'
      },
      {
        name: 'Imobiliária Básico',
        slug: 'agency-basic',
        price: 199.90,
        period: 'monthly',
        features: JSON.stringify([
          '50 anúncios ativos',
          'Duração de 90 dias',
          'Fotos e vídeos ilimitados',
          '10 anúncios destacados/mês',
          'Página da imobiliária',
          'Logo nos anúncios',
          'Estatísticas completas'
        ]),
        ads_limit: 50,
        highlighted: 10,
        featured: false,
        type: 'agency'
      },
      {
        name: 'Imobiliária Premium',
        slug: 'agency-pro',
        price: 399.90,
        period: 'monthly',
        features: JSON.stringify([
          'Anúncios ilimitados',
          'Duração ilimitada',
          'Fotos e vídeos ilimitados',
          '30 anúncios destacados/mês',
          'Página personalizada',
          'Logo e banner nos anúncios',
          'API de integração',
          'Gerente de conta dedicado'
        ]),
        ads_limit: -1,
        highlighted: 30,
        featured: true,
        type: 'agency'
      }
    ]);
    console.log(`✅ ${plans.length} planos criados`);

    // Criar categorias
    console.log('📂 Criando categorias...');
    const categories = await Category.bulkCreate([
      { name: 'Imóveis', slug: 'imoveis', icon: 'Home', order: 1 },
      { name: 'Veículos', slug: 'veiculos', icon: 'Car', order: 2 },
      { name: 'Eletrônicos', slug: 'eletronicos', icon: 'Smartphone', order: 3 },
      { name: 'Móveis', slug: 'moveis', icon: 'Sofa', order: 4 },
      { name: 'Empregos', slug: 'empregos', icon: 'Briefcase', order: 5 },
      { name: 'Serviços', slug: 'servicos', icon: 'Wrench', order: 6 },
      { name: 'Moda', slug: 'moda', icon: 'Shirt', order: 7 },
      { name: 'Esportes', slug: 'esportes', icon: 'Dumbbell', order: 8 }
    ]);
    console.log(`✅ ${categories.length} categorias criadas`);

    // Criar cidades
    console.log('🏙️ Criando cidades...');
    const cities = await City.bulkCreate([
      { name: 'São Paulo', slug: 'sao-paulo', state: 'SP' },
      { name: 'Rio de Janeiro', slug: 'rio-de-janeiro', state: 'RJ' },
      { name: 'Belo Horizonte', slug: 'belo-horizonte', state: 'MG' },
      { name: 'Curitiba', slug: 'curitiba', state: 'PR' },
      { name: 'Porto Alegre', slug: 'porto-alegre', state: 'RS' },
      { name: 'Salvador', slug: 'salvador', state: 'BA' },
      { name: 'Brasília', slug: 'brasilia', state: 'DF' },
      { name: 'Fortaleza', slug: 'fortaleza', state: 'CE' },
      { name: 'Recife', slug: 'recife', state: 'PE' },
      { name: 'Manaus', slug: 'manaus', state: 'AM' }
    ]);
    console.log(`✅ ${cities.length} cidades criadas`);

    // Criar usuário admin
    console.log('👤 Criando usuário admin...');
    const adminPlan = plans.find(p => p.slug === 'pro');
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@plclassificados.com.br',
      password: 'admin123',
      type: 'admin',
      plan_id: adminPlan.id,
      is_active: true,
      email_verified: true
    });
    console.log(`✅ Admin criado - Email: ${admin.email} | Senha: admin123`);

    // Criar usuário teste
    console.log('👤 Criando usuário teste...');
    const freePlan = plans.find(p => p.slug === 'free');
    const testUser = await User.create({
      name: 'João Silva',
      email: 'joao@teste.com',
      password: '123456',
      phone: '11999999999',
      type: 'user',
      plan_id: freePlan.id,
      is_active: true
    });
    console.log(`✅ Usuário teste criado - Email: ${testUser.email} | Senha: 123456`);

    console.log('🎉 Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
};

seedDatabase();
