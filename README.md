## Основні відомості
+ **Назва**: Курсова робота. Back-end застосунок онлайн-магазину
+ **Опис**: Онлайн-магазин, де користувач має можливість продивлятися різні товари, додавати їх у кошик та робити нові замовлення.
+ **Виконавець**: Сизоненко Ілля (IM-43)

## Технологічний стек
+ **Мова програмування**: Typescript 5.7.3, фреймворк Nest.js
+ **ORM-бібліотека**: TypeOrm
+ **Testing framework**: Jest, Supertest

## Інструкції з використання
1. Клонуйте репозиторій
```console
git clone https://github.com/utland/backend-store.git
```
2. Створіть .env-файл та налаштуйте наступні змінні
```code
PORT=3000

DATABASE_TYPE=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_DB=store

JWT_SECRET=secret987
JWT_EXPIRES_IN=1h

PGADMIN_EMAIL=youremail@gmail.com
PGADMIN_PASSWORD=password
```
3. Запустіть сервіси
```console
docker-compose up -d --build
```
4. Для створення тестових даних використовуйте insert-скрипт з `/docs/insert-script.sql`

## Тестування
Для запуску усіх unit-тестів:
```console 
npm run test
``` 
Для запуску усіх e2e-тестів:
```console 
npm run test:e2e
``` 

Щоб запустити конкретний тестовий файл:
```console
npm tun test -- user.service
```
```console
npm tun test:e2e -- user.e2e
```

## Міграції
Для того щоб створити нову міграцію необхідно:
```console
npm run migration:generate -- typeorm/migrations/name_of_migration
```

Після створення та налаштування міграції її необхідно запустити:
```console
npm run migration:run
```


## Огляд структури 
```
store-backend/
│
├── docs/                      # Додаткова документація
│   ├── schema.md              # Пояснення схеми бази даних
│   ├── queries.md             # Складні запити з поясненнями
│
├── src/                       # Вихідний код
│   ├── auth/               
│   │   ├── auth.service.spec.ts     # Unit-тест
│   │   └── ...
│   │
│   ├── common/              
│   │   └── ...
│   │
│   ├── config/          
│   │   └── ...
│   └── ...            
│
├── test/                     # Тестові файли
│   ├── config/               # Конфігураційні файли
│   │   └── ...     
│   └── jest.e2e-spec.ts/     # Налаштування Jest    
│   └── ...                   # E2E-тести
│
├── typeorm/               
│   ├── migrations          # Міграції бази даних
│   │   └── ...             
│   └── data-source.ts      # Налаштування міграцій
│
├── docker-compose.yml         # Конфігурація Docker
├── Dockerfile                 # Конфігурація контейнера додатку
├── README.md                  # Основна документація
└── ...
```

## Приклади API

### User (Користувачі)

`/auth/register POST` - зареєструвати нового користувача \
`/auth/login POST` - увійти в обліковий запис користувача та отримати токен \

`/user/pass PATCH` - змінити пароль \
`/user/:userId GET` - отримати публічні дані користувача \
`/user/token GET` - отримати дані користувача за токеном \
`/user GET` - отримати усіх користувачів \
`/user PATCH` - змінити налаштування користувача за токеном \
`/user/:userId DELETE` - видалити користувача \
`/user/role/:userId PATCH` - змінити права доступу користувача \

`/cart/:productId POST` - додати товар у корзину користувача \
`/cart PATCH` - змінити товар у корзині \
`/cart/:productId DELETE` - видалити товар з корзини

### Product (Товари)

`POST /product` - створити новий товар (тільки Admin) \
`GET /product` - отримати список усіх товарів \
`GET /product/byCategory` - отримати товари за категорією (через query params) \
`GET /product/:id` - отримати деталі конкретного товару \
`PATCH /product/:id` - оновити дані товару (тільки Admin) \
`DELETE /product/:id` - видалити товар (тільки Admin) 

### Order (Замовлення)

`POST /order` - створити нове замовлення \
`GET /order` - отримати історію замовлень поточного користувача \
`GET /order/all` - отримати всі замовлення у системі (Admin, Moderator) \
`GET /order/:id` - отримати деталі конкретного замовлення (Admin або власник) \
`PATCH /order/status` - змінити статус замовлення (Admin, або User для скасування) \
`PATCH /order/address` - змінити адресу доставки в замовленні \
`DELETE /order/:id` - видалити замовлення (тільки Admin) 

### Category (Категорії)

`POST /category` - створити нову категорію (тільки Admin) \
`GET /category` - отримати список усіх категорій \
`GET /category/:id` - отримати категорію за ID \
`PATCH /category/:id` - оновити категорію (тільки Admin) \
`DELETE /category/:id` - видалити категорію (тільки Admin) 

### Supplier (Постачальники)

`GET /supplier/sales` - отримати статистику продажів за місяць (тільки Admin) \
`POST /supplier` - додати нового постачальника (тільки Admin) \
`GET /supplier` - отримати список усіх постачальників \
`GET /supplier/:id` - отримати дані постачальника за ID \
`PATCH /supplier/:id` - оновити дані постачальника (тільки Admin) \
`DELETE /supplier/:id` - видалити постачальника (тільки Admin) 

### Review (Відгуки)

`POST /review` - залишити відгук про товар \
`GET /review/:id` - отримати відгук за ID \
`PATCH /review/:id` - редагувати власний відгук \
`DELETE /review/:id` - видалити відгук (Admin або автор відгуку) 