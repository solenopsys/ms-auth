# ms-auth
SSO - Single Sign On for Solenopsys ecosystem
 


buildah bud -t ms-auth -f Dockerfile

 

podman run -d \
  -p 3005:3000 \
  -v ./sso:/db:Z \
   ms-auth:latest 


podman run -d   -p 3005:3000   -v ./sso:/db:Z --env-file .env   ms-auth:latest    


podman run -d \
  -p 3005:3000 \
  -v /var/home/core/sso:/db:Z \
  -e ROOT_SECRET=blalba \
  -e JWT_SECRET=your-jwt-secret
  --name ms-auth 
  --network my-network
  localhost/ms-auth



# API Документация

## Аутентификация


### Создание refresh токена 
```http
POST /auth/token/refresh
Content-Type: application/json

{
    "client_id": "string",
    "client_secret": "string"
}
```
**Ответ:**
```json
{
    "access_token": "string",
    "token_type": "Refresh",
    "expires_in": 2592000 // 30 дней
}
```

### Создание JWT токена 
```http
POST /auth/token/bearer
Content-Type: application/json

{
    "refresh_token": "string", 
}
```
**Ответ:**
```json
{
    "refresh_token": "string",
    "token_type": "Bearer",
    "expires_in": 60*60 // 1 час
}
```

## Управление доступом

### Проверка токена
```http
GET /auth/verify
Authorization:  <token>
```
**Ответ:**
```json
{
    "valid": true
}
```

### Получение разрешений
```http
GET /auth/permission
Authorization:  <token>
```
**Ответ:**
```json
{
    "permissions": ["resource:action", ...]
}
```

### Регистрация root-пользователя
```http
POST /auth/register/root
Content-Type: application/json

{
    "client_id": "string",
    "client_secret": "string",
    "root_secret": "string",
    "permissions": ["resource:action", ...]
}
```
**Ответ:**
```json
{
    "id": "string"
}
```

### Google OAuth
```http
POST /auth/google
Content-Type: application/json

{
    "id_token": "string" // Google ID токен
}
```
**Ответ:**
```json
{
    "access_token": "string",
    "token_type": "Bearer",
    "expires_in": 604800 // 7 дней
}
```

### Apple OAuth
```http
POST /auth/apple
Content-Type: application/json

{
    "id_token": "string" // Apple ID токен
}
```
**Ответ:** *Аналогичен Google OAuth*


## Примечания
- Все эндпоинты возвращают ошибку 400/401/403 при неверных данных
- Токены Bearer используются для всех авторизованных запросов
- Разрешения форматируются как `resource:action` (например, "npm:publish")
