import { User, Plan, Listing } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

// @desc    Listar todos os usuários
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (type) {
      where.type = type;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [{ model: Plan, as: 'plan' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const safeUsers = users.map(user => user.toSafeObject());

    res.json({
      success: true,
      data: safeUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Plan, as: 'plan' },
        { model: Listing, as: 'listings', limit: 5 }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar usuário (Admin)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, type, plan_id } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      type,
      plan_id
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const { name, email, phone, type, plan_id, is_active } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone !== undefined ? phone : user.phone,
      type: type || user.type,
      plan_id: plan_id || user.plan_id,
      is_active: is_active !== undefined ? is_active : user.is_active
    });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar usuário
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Estatísticas de usuários
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const usersByType = await User.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        byType: usersByType
      }
    });
  } catch (error) {
    next(error);
  }
};
