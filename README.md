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
APP_PORT=3000

DATABASE_TYPE=postgres
DATABASE_HOST=main-db
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_PORT=5432
DATABASE_DB=store
DATABASE_SYNC=1

DATABASE_TEST_HOST=test-db
DATABASE_TEST_DB=test

JWT_SECRET=secret
JWT_EXPIRES_IN=1h

PGADMIN_EMAIL=youremail0@gmail.com
PGADMIN_PASSWORD=password
```
3. Запустіть сервіси
```console
docker-compose up -d --build
```
4. Для створення тестових даних використовуйте insert-скрипт з `/docs/insert-script.sql`

## Тестування
Для виконання наступних команд необхідно увійти в shell нашого додатка: 
```console
docker-compose exec app sh
```
---
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
`Для коректного використання міграцій необхідно поміняти змінну в .env-файлі на DATABASE_SYNC=0` 

Для того щоб створити нову міграцію:
```console
npm run migration:generate -- typeorm/migrations/name_of_migration
```

Щоб застосувати міграцію до БД:
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

`POST /auth/register` - зареєструвати нового користувача \
`POST /auth/login` - увійти в обліковий запис користувача та отримати токен \

`PATCH /user/pass` - змінити пароль \
`GET /user/:id` - отримати публічні дані користувача \
`GET /user/token` - отримати дані користувача за токеном \
`GET /user` - отримати усіх користувачів \
`PATCH /user` - змінити налаштування користувача за токеном \
`DELETE /user/:id` - видалити користувача \
`PATCH /user/role/:id` - змінити права доступу користувача \

`POST /cart/:productId` - додати товар у корзину користувача \
`PATCH /cart` - змінити товар у корзині \
`DELETE /cart/:productId` - видалити товар з корзини

### Product (Товари)

`POST /product` - створити новий товар (тільки Admin) \
`GET /product` - отримати список усіх товарів \
`GET /product/byCategory/?orderBy=name&categoryId=1&isInStock=true` - отримати товари за категорією (через query params) \
`GET /product/:id` - отримати деталі конкретного товару \
`PATCH /product/:id` - оновити дані товару \
`DELETE /product/:id` - видалити товар

### Order (Замовлення)

`POST /order` - створити нове замовлення \
`GET /order` - отримати історію замовлень поточного користувача \
`GET /order/all` - отримати всі замовлення у системі \
`GET /order/:id` - отримати деталі конкретного замовлення \
`PATCH /order/status` - змінити статус замовлення \
`PATCH /order/address` - змінити адресу доставки в замовленні \
`DELETE /order/:id` - видалити замовленн

### Category (Категорії)

`POST /category` - створити нову категорію \
`GET /category` - отримати список усіх категорій \
`GET /category/:id` - отримати категорію за ID \
`PATCH /category/:id` - оновити категорію \
`DELETE /category/:id` - видалити категорію 

### Supplier (Постачальники)

`GET /supplier/sales` - отримати статистику продажів за місяць \
`POST /supplier` - додати нового постачальника \
`GET /supplier` - отримати список усіх постачальників \
`GET /supplier/:id` - отримати дані постачальника за ID \
`PATCH /supplier/:id` - оновити дані постачальника \
`DELETE /supplier/:id` - видалити постачальника 

### Review (Відгуки)

`POST /review` - залишити відгук про товар \
`GET /review/:id` - отримати відгук за ID \
`PATCH /review/:id` - редагувати власний відгук \
`DELETE /review/:id` - видалити відгук