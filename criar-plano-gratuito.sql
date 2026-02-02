-- Script para verificar e criar plano gratuito
-- Execute este comando no MySQL Workbench ou qualquer cliente MySQL

-- Verificar se já existe
SELECT * FROM plans WHERE slug = 'free';

-- Se não existir, execute este INSERT:
INSERT INTO plans (
  id, 
  name, 
  slug, 
  price, 
  period, 
  features, 
  ads_limit, 
  highlighted, 
  featured, 
  type, 
  is_active, 
  created_at, 
  updated_at
)
VALUES (
  UUID(),
  'Plano Gratuito',
  'free',
  0.00,
  'monthly',
  '["Publicar até 5 anúncios", "Fotos ilimitadas", "Suporte por email", "Válido por 30 dias"]',
  5,
  0,
  0,
  'user',
  1,
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT * FROM plans WHERE slug = 'free';
