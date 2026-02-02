import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  period: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    defaultValue: 'monthly',
    allowNull: false
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  ads_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '-1 para ilimitado'
  },
  highlighted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de anúncios destacados permitidos por mês'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  type: {
    type: DataTypes.ENUM('user', 'agency'),
    defaultValue: 'user',
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Plan;
