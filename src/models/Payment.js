import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  subscription_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'subscriptions',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  mp_payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID do pagamento no Mercado Pago'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back'),
    defaultValue: 'pending',
    allowNull: false
  },
  status_detail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Detalhes do status do pagamento'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  payer_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados completos do webhook do Mercado Pago'
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
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['subscription_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['mp_payment_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default Payment;
