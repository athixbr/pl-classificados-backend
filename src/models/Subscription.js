import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
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
  plan_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'plans',
      key: 'id'
    }
  },
  mp_subscription_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID da assinatura no Mercado Pago'
  },
  mp_preapproval_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID do preapproval no Mercado Pago'
  },
  status: {
    type: DataTypes.ENUM('pending', 'authorized', 'paused', 'cancelled', 'expired'),
    defaultValue: 'pending',
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Valor da assinatura'
  },
  frequency: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Frequência de cobrança (1 = mensal)'
  },
  frequency_type: {
    type: DataTypes.ENUM('days', 'months'),
    defaultValue: 'months',
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de início da assinatura'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de término da assinatura'
  },
  next_payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data do próximo pagamento'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Método de pagamento (credit_card, pix, etc)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dados adicionais da assinatura'
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
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['mp_subscription_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default Subscription;
