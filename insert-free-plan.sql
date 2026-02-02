-- Inserir plano gratuito padrão (se não existir)
INSERT INTO plans (id, name, slug, price, period, features, ads_limit, highlighted, featured, type, is_active, created_at, updated_at)
SELECT 
  UUID() as id,
  'Plano Gratuito' as name,
  'free' as slug,
  0.00 as price,
  'monthly' as period,
  JSON_ARRAY('Publicar anúncios básicos', 'Fotos ilimitadas', 'Suporte por email') as features,
  5 as ads_limit,
  0 as highlighted,
  0 as featured,
  'user' as type,
  1 as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM plans WHERE slug = 'free'
);
