import { Category, Listing } from '../models/index.js';
import { sequelize } from '../config/database.js';

// @desc    Listar categorias
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const { includeCount } = req.query;

    const categories = await Category.findAll({
      where: { 
        is_active: true,
        parent_id: null // Apenas categorias principais
      },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { is_active: true },
          required: false
        }
      ],
      order: [
        ['order', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Adicionar contagem de anúncios se solicitado
    if (includeCount === 'true') {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const count = await Listing.count({
            where: {
              category_id: category.id,
              status: 'active'
            }
          });
          return {
            ...category.toJSON(),
            count
          };
        })
      );
      
      return res.json({
        success: true,
        data: categoriesWithCount
      });
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter categoria por ID ou slug
// @route   GET /api/categories/:identifier
// @access  Public
export const getCategoryById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    const category = await Category.findOne({
      where: {
        [sequelize.Op.or]: [
          { id: identifier },
          { slug: identifier }
        ]
      },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { is_active: true },
          required: false
        },
        {
          model: Category,
          as: 'parent'
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Contar anúncios
    const count = await Listing.count({
      where: {
        category_id: category.id,
        status: 'active'
      }
    });

    res.json({
      success: true,
      data: {
        ...category.toJSON(),
        count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar categoria
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, icon, parent_id, order } = req.body;

    const category = await Category.create({
      name,
      slug,
      icon,
      parent_id,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar categoria
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    const { name, slug, icon, parent_id, is_active, order } = req.body;

    await category.update({
      name: name || category.name,
      slug: slug || category.slug,
      icon: icon || category.icon,
      parent_id: parent_id !== undefined ? parent_id : category.parent_id,
      is_active: is_active !== undefined ? is_active : category.is_active,
      order: order !== undefined ? order : category.order
    });

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar categoria
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se há anúncios nesta categoria
    const listingsCount = await Listing.count({
      where: { category_id: category.id }
    });

    if (listingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível deletar. Existem ${listingsCount} anúncios nesta categoria.`
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
