import { Listing, User, Category, City } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Listar anúncios
// @route   GET /api/listings
// @access  Public
export const getListings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      city,
      state,
      type,
      featured,
      urgent,
      minPrice,
      maxPrice,
      search,
      userId,
      status = 'active'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.category_id = cat.id;
    }

    if (city) {
      const cityObj = await City.findOne({ where: { slug: city } });
      if (cityObj) where.city_id = cityObj.id;
    }

    if (state) {
      where.state = state;
    }

    if (type) {
      where.type = type;
    }

    if (featured) {
      where.featured = featured === 'true';
    }

    if (urgent) {
      where.urgent = urgent === 'true';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (userId) {
      where.user_id = userId;
    }

    const { count, rows: listings } = await Listing.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'type'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: City, as: 'city', attributes: ['id', 'name', 'state'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['featured', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: listings,
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

// @desc    Obter anúncio por ID
// @route   GET /api/listings/:id
// @access  Public
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'type', 'phone', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: City, as: 'city', attributes: ['id', 'name', 'state'] }
      ]
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Anúncio não encontrado'
      });
    }

    // Incrementar visualizações
    await listing.increment('views');

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar anúncio
// @route   POST /api/listings
// @access  Private
export const createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category_id,
      city_id,
      state,
      neighborhood,
      type,
      whatsapp,
      phone,
      email,
      details
    } = req.body;

    // Processar imagens do upload
    const images = req.files ? req.files.map(file => file.location) : [];

    const listing = await Listing.create({
      user_id: req.user.id,
      title,
      description,
      price,
      category_id,
      city_id,
      state,
      neighborhood,
      type,
      whatsapp,
      phone,
      email,
      details: details ? JSON.parse(details) : null,
      images,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    });

    const newListing = await Listing.findByPk(listing.id, {
      include: [
        { model: Category, as: 'category' },
        { model: City, as: 'city' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Anúncio criado com sucesso',
      data: newListing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar anúncio
// @route   PUT /api/listings/:id
// @access  Private
export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Anúncio não encontrado'
      });
    }

    // Verificar se o usuário é dono do anúncio ou admin
    if (listing.user_id !== req.user.id && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este anúncio'
      });
    }

    const {
      title,
      description,
      price,
      category_id,
      city_id,
      state,
      neighborhood,
      type,
      whatsapp,
      phone,
      email,
      details,
      status
    } = req.body;

    let images = listing.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.location);
      images = [...images, ...newImages];
    }

    await listing.update({
      title: title || listing.title,
      description: description || listing.description,
      price: price !== undefined ? price : listing.price,
      category_id: category_id || listing.category_id,
      city_id: city_id || listing.city_id,
      state: state || listing.state,
      neighborhood,
      type: type || listing.type,
      whatsapp,
      phone,
      email,
      details: details ? JSON.parse(details) : listing.details,
      images,
      status: status || listing.status
    });

    const updatedListing = await Listing.findByPk(listing.id, {
      include: [
        { model: Category, as: 'category' },
        { model: City, as: 'city' }
      ]
    });

    res.json({
      success: true,
      message: 'Anúncio atualizado com sucesso',
      data: updatedListing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar anúncio
// @route   DELETE /api/listings/:id
// @access  Private
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Anúncio não encontrado'
      });
    }

    // Verificar se o usuário é dono do anúncio ou admin
    if (listing.user_id !== req.user.id && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este anúncio'
      });
    }

    await listing.destroy();

    res.json({
      success: true,
      message: 'Anúncio deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Meus anúncios
// @route   GET /api/listings/my/ads
// @access  Private
export const getMyListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = { user_id: req.user.id };

    if (status) {
      where.status = status;
    }

    const { count, rows: listings } = await Listing.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: City, as: 'city' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: listings,
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

// @desc    Destacar anúncio
// @route   PUT /api/listings/:id/feature
// @access  Private
export const featureListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Anúncio não encontrado'
      });
    }

    if (listing.user_id !== req.user.id && req.user.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão'
      });
    }

    await listing.update({ featured: !listing.featured });

    res.json({
      success: true,
      message: listing.featured ? 'Anúncio destacado' : 'Destaque removido',
      data: listing
    });
  } catch (error) {
    next(error);
  }
};
