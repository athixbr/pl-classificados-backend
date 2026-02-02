-- Migration: Adicionar campos de assinatura Mercado Pago
-- Execute este SQL no seu banco de dados MySQL

-- 1. Adicionar campos no User
ALTER TABLE users
ADD COLUMN subscription_id VARCHAR(100) NULL COMMENT 'ID da assinatura no Mercado Pago' AFTER plan_id,
ADD COLUMN subscription_status ENUM('pending', 'authorized', 'paused', 'cancelled') NULL COMMENT 'Status da assinatura no Mercado Pago' AFTER subscription_id,
ADD COLUMN subscription_expires_at DATETIME NULL COMMENT 'Data de expiração da assinatura atual' AFTER subscription_status;

-- 2. Criar tabela Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  plan_id CHAR(36) NOT NULL,
  mp_subscription_id VARCHAR(100) NULL COMMENT 'ID da assinatura no Mercado Pago',
  mp_preapproval_id VARCHAR(100) NULL COMMENT 'ID do preapproval no Mercado Pago',
  status ENUM('pending', 'authorized', 'paused', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Valor da assinatura',
  frequency INT DEFAULT 1 COMMENT 'Frequência de cobrança (1 = mensal)',
  frequency_type ENUM('days', 'months') NOT NULL DEFAULT 'months',
  start_date DATETIME NULL COMMENT 'Data de início da assinatura',
  end_date DATETIME NULL COMMENT 'Data de término da assinatura',
  next_payment_date DATETIME NULL COMMENT 'Data do próximo pagamento',
  payment_method VARCHAR(50) NULL COMMENT 'Método de pagamento (credit_card, pix, etc)',
  metadata JSON NULL COMMENT 'Dados adicionais da assinatura',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_mp_subscription_id (mp_subscription_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Criar tabela Payments
CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  subscription_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  mp_payment_id VARCHAR(100) NULL COMMENT 'ID do pagamento no Mercado Pago',
  status ENUM('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back') NOT NULL DEFAULT 'pending',
  status_detail VARCHAR(100) NULL COMMENT 'Detalhes do status do pagamento',
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NULL,
  payment_type VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  payer_email VARCHAR(100) NULL,
  paid_at DATETIME NULL,
  metadata JSON NULL COMMENT 'Dados completos do webhook do Mercado Pago',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_user_id (user_id),
  INDEX idx_mp_payment_id (mp_payment_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar se as tabelas foram criadas
SHOW TABLES LIKE '%subscription%';
SHOW TABLES LIKE '%payment%';

-- Verificar estrutura
DESCRIBE users;
DESCRIBE subscriptions;
DESCRIBE payments;
