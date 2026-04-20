-- Initialize the first super-admin account.
-- Usage: replace EMAIL_ICI with your actual email, then run against the database.
-- psql $DATABASE_URL -f scripts/init-super-admin.sql

UPDATE utilisateur
SET is_super_admin = true, updated_at = now()
WHERE email = 'EMAIL_ICI';

SELECT id, email, nom, prenom, is_super_admin
FROM utilisateur
WHERE email = 'EMAIL_ICI';
