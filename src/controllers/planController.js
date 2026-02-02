import { Plan, User } from '../models/index.js';
import { sequelize } from '../config/database.js';

// Função helper para criar slug
const createSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};

// @desc    Listar planos
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req, res, next) => {
  try {
    const { type, include_inactive } = req.query;
    const where = {};

    // Se não for para incluir inativos, filtrar apenas ativos
    // include_inactive vem como string "true" ou "false" da query string
    if (include_inactive !== 'true') {
      where.is_active = true;
    }

    if (type) {
      where.type = type;
    }

    const plans = await Plan.findAll({
      where,
      order: [['price', 'ASC']]
    });

    // Mapear para o formato esperado pelo frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      price: parseFloat(plan.price),
      duration_days: plan.period === 'yearly' ? 365 : 30,
      max_listings: plan.ads_limit,
      max_photos: 10, // Valor padrão
      highlight_days: plan.highlighted,
      features: typeof plan.features === 'string' ? plan.features : JSON.stringify(plan.features),
      is_active: plan.is_active,
      created_at: plan.created_at,
      updated_at: plan.updated_at
    }));

    res.json({
      success: true,
      data: formattedPlans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter plano por ID ou slug
// @route   GET /api/plans/:identifier
// @access  Public
export const getPlanById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    const plan = await Plan.findOne({
      where: {
        [sequelize.Op.or]: [
          { id: identifier },
          { slug: identifier }
        ]
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar plano
// @route   POST /api/plans
// @access  Private/Admin
export const createPlan = async (req, res, next) => {
  try {
    const {
      name,
      price,
      duration_days,
      max_listings,
      max_photos,
      highlight_days,
      features,
      is_active
    } = req.body;

    // Gerar slug automaticamente a partir do nome
    let slug = createSlug(name);
    
    // Verificar se o slug já existe e adicionar número se necessário
    let existingPlan = await Plan.findOne({ where: { slug } });
    let counter = 1;
    while (existingPlan) {
      slug = `${createSlug(name)}-${counter}`;
      existingPlan = await Plan.findOne({ where: { slug } });
      counter++;
    }

    // Mapear campos do frontend para o modelo do banco
    const plan = await Plan.create({
      name,
      slug,
      price,
      period: duration_days >= 365 ? 'yearly' : 'monthly',
      features: typeof features === 'string' ? JSON.parse(features) : features,
      ads_limit: max_listings || 1,
      highlighted: highlight_days || 0,
      featured: false,
      type: 'user',
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      message: 'Plano criado com sucesso',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar plano
// @route   PUT /api/plans/:id
// @access  Private/Admin
export const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    const {
      name,
      price,
      duration_days,
      max_listings,
      max_photos,
      highlight_days,
      features,
      is_active
    } = req.body;

    // Se o nome mudou, gerar novo slug
    let slug = plan.slug;
    if (name && name !== plan.name) {
      slug = createSlug(name);
      
      // Verificar se o slug já existe
      let existingPlan = await Plan.findOne({ where: { slug } });
      let counter = 1;
      while (existingPlan && existingPlan.id !== plan.id) {
        slug = `${createSlug(name)}-${counter}`;
        existingPlan = await Plan.findOne({ where: { slug } });
        counter++;
      }
    }

    await plan.update({
      name: name || plan.name,
      slug: slug,
      price: price !== undefined ? price : plan.price,
      period: duration_days >= 365 ? 'yearly' : 'monthly',
      features: features ? (typeof features === 'string' ? JSON.parse(features) : features) : plan.features,
      ads_limit: max_listings !== undefined ? max_listings : plan.ads_limit,
      highlighted: highlight_days !== undefined ? highlight_days : plan.highlighted,
      is_active: is_active !== undefined ? is_active : plan.is_active
    });

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar plano
// @route   DELETE /api/plans/:id
// @access  Private/Admin
export const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    // Verificar se há usuários com este plano
    const usersCount = await User.count({
      where: { plan_id: plan.id }
    });

    if (usersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível deletar. Existem ${usersCount} usuários com este plano.`
      });
    }

    await plan.destroy();

    res.json({
      success: true,
      message: 'Plano deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
