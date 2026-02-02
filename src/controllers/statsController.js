import { User, Listing, Plan } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get admin statistics
// @route   GET /api/stats/admin
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    // Total de usuários
    const totalUsers = await User.count();

    // Total de usuários por tipo
    const usersByType = await User.count({
      group: ['type'],
      attributes: ['type']
    });

    // Total de anúncios
    const totalListings = await Listing.count();

    // Total de anúncios ativos
    const activeListings = await Listing.count({
      where: { status: 'active' }
    });

    // Usuários recentes (últimos 10)
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'email', 'type', 'created_at', 'is_active']
    });

    // Anúncios recentes (últimos 10)
    const recentListings = await Listing.findAll({
      order: [['created_at', 'DESC']],
      limit: 10,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    // Total de agências
    const totalAgencies = await User.count({
      where: { type: 'agency' }
    });

    // Receita total (simulada por enquanto)
    const totalRevenue = 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        activeListings,
        totalAgencies,
        totalRevenue,
        recentUsers: recentUsers.map(u => u.toSafeObject()),
        recentListings,
        usersByType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/stats/user
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total de anúncios do usuário
    const totalListings = await Listing.count({
      where: { user_id: userId }
    });

    // Anúncios ativos
    const activeListings = await Listing.count({
      where: {
        user_id: userId,
        status: 'active'
      }
    });

    // Total de visualizações
    const listings = await Listing.findAll({
      where: { user_id: userId },
      attributes: ['views']
    });

    const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);

    // Anúncios recentes do usuário
    const recentListings = await Listing.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        totalListings,
        activeListings,
        totalViews,
        recentListings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get agency statistics
// @route   GET /api/stats/agency
// @access  Private/Agency
export const getAgencyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total de anúncios da agência
    const totalListings = await Listing.count({
      where: { user_id: userId }
    });

    // Anúncios ativos
    const activeListings = await Listing.count({
      where: {
        user_id: userId,
        status: 'active'
      }
    });

    // Total de visualizações
    const listings = await Listing.findAll({
      where: { user_id: userId },
      attributes: ['views']
    });

    const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);

    // Anúncios destacados
    const featuredListings = await Listing.count({
      where: {
        user_id: userId,
        featured: true
      }
    });

    // Anúncios recentes
    const recentListings = await Listing.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        totalListings,
        activeListings,
        featuredListings,
        totalViews,
        recentListings
      }
    });
  } catch (error) {
    next(error);
  }
};
