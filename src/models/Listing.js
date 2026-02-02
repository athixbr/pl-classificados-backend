import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  city_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cities',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  neighborhood: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  type: {
    type: DataTypes.ENUM('sale', 'rent'),
    defaultValue: 'sale',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'sold', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Campos específicos por categoria (quartos, km, etc)'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'listings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['city_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['featured']
    }
  ]
});

export default Listing;
