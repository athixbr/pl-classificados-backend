import { User, Listing, Plan } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

// @desc    Get dashboard overview report
// @route   GET /api/reports/overview
// @access  Private/Admin
export const getOverviewReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Estatísticas gerais
    const totalUsers = await User.count();
    const totalListings = await Listing.count();
    const activeListings = await Listing.count({ where: { status: 'active' } });

    // Crescimento de usuários (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Usuários por tipo
    const usersByType = await User.count({
      group: ['type'],
      attributes: ['type']
    });

    // Anúncios por categoria
    const listingsByCategory = await Listing.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category_id']
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        activeListings,
        newUsersLast30Days,
        usersByType,
        listingsByCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users report
// @route   GET /api/reports/users
// @access  Private/Admin
export const getUsersReport = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['name', 'price']
        }
      ],
      attributes: ['id', 'name', 'email', 'type', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: users.map(u => u.toSafeObject())
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get listings report
// @route   GET /api/reports/listings
// @access  Private/Admin
export const getListingsReport = async (req, res, next) => {
  try {
    const listings = await Listing.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'type']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial report
// @route   GET /api/reports/financial
// @access  Private/Admin
export const getFinancialReport = async (req, res, next) => {
  try {
    // Aqui você pode implementar lógica de pagamentos quando tiver a tabela de payments
    const paidUsers = await User.count({
      include: [{
        model: Plan,
        as: 'plan',
        where: {
          price: { [Op.gt]: 0 }
        }
      }]
    });

    res.json({
      success: true,
      data: {
        paidUsers,
        totalRevenue: 0, // Implementar quando tiver tabela de payments
        monthlyRevenue: 0
      }
    });
  } catch (error) {
    next(error);
  }
};
