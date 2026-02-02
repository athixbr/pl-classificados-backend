import { City, Listing } from '../models/index.js';
import { sequelize } from '../config/database.js';

// @desc    Listar cidades
// @route   GET /api/cities
// @access  Public
export const getCities = async (req, res, next) => {
  try {
    const { state, includeCount } = req.query;
    const where = { is_active: true };

    if (state) {
      where.state = state;
    }

    const cities = await City.findAll({
      where,
      order: [['name', 'ASC']]
    });

    // Adicionar contagem de anúncios se solicitado
    if (includeCount === 'true') {
      const citiesWithCount = await Promise.all(
        cities.map(async (city) => {
          const count = await Listing.count({
            where: {
              city_id: city.id,
              status: 'active'
            }
          });
          return {
            ...city.toJSON(),
            count
          };
        })
      );
      
      return res.json({
        success: true,
        data: citiesWithCount
      });
    }

    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter cidade por ID ou slug
// @route   GET /api/cities/:identifier
// @access  Public
export const getCityById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    const city = await City.findOne({
      where: {
        [sequelize.Op.or]: [
          { id: identifier },
          { slug: identifier }
        ]
      }
    });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Cidade não encontrada'
      });
    }

    // Contar anúncios
    const count = await Listing.count({
      where: {
        city_id: city.id,
        status: 'active'
      }
    });

    res.json({
      success: true,
      data: {
        ...city.toJSON(),
        count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar cidade
// @route   POST /api/cities
// @access  Private/Admin
export const createCity = async (req, res, next) => {
  try {
    const { name, slug, state } = req.body;

    const city = await City.create({
      name,
      slug,
      state
    });

    res.status(201).json({
      success: true,
      message: 'Cidade criada com sucesso',
      data: city
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar cidade
// @route   PUT /api/cities/:id
// @access  Private/Admin
export const updateCity = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Cidade não encontrada'
      });
    }

    const { name, slug, state, is_active } = req.body;

    await city.update({
      name: name || city.name,
      slug: slug || city.slug,
      state: state || city.state,
      is_active: is_active !== undefined ? is_active : city.is_active
    });

    res.json({
      success: true,
      message: 'Cidade atualizada com sucesso',
      data: city
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar cidade
// @route   DELETE /api/cities/:id
// @access  Private/Admin
export const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByPk(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Cidade não encontrada'
      });
    }

    // Verificar se há anúncios nesta cidade
    const listingsCount = await Listing.count({
      where: { city_id: city.id }
    });

    if (listingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível deletar. Existem ${listingsCount} anúncios nesta cidade.`
      });
    }

    await city.destroy();

    res.json({
      success: true,
      message: 'Cidade deletada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Listar estados
// @route   GET /api/cities/states/list
// @access  Public
export const getStates = async (req, res, next) => {
  try {
    const states = await City.findAll({
      attributes: [
        'state',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cities_count']
      ],
      where: { is_active: true },
      group: ['state'],
      order: [['state', 'ASC']]
    });

    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    next(error);
  }
};
