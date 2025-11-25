-- Обновляем пароль тестового администратора (admin123)
-- SHA-256 хеш для пароля "admin123"
UPDATE users 
SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
WHERE email = 'admin@dentkazan.ru';

-- Обновляем пароли тестовых пользователей (password: test123)
UPDATE users 
SET password_hash = 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae'
WHERE email IN ('anna@example.com', 'dmitry@example.com', 'elena@example.com');