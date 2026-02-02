import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('user', 'admin', 'agency'),
    defaultValue: 'user',
    allowNull: false
  },
  plan_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  subscription_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID da assinatura no Mercado Pago'
  },
  subscription_status: {
    type: DataTypes.ENUM('pending', 'authorized', 'paused', 'cancelled'),
    allowNull: true,
    comment: 'Status da assinatura no Mercado Pago'
  },
  subscription_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração da assinatura atual'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método para comparar senha
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para retornar dados seguros (sem senha)
User.prototype.toSafeObject = function() {
  const { password, ...safeUser } = this.get();
  return safeUser;
};

export default User;
