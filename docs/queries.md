### Запит 1: Щомісячний звіт про постачальників

Бізнес-питання: 
Які компанії за поточний місяць виявилися найуспішнішими?

SQL-запит:
```sql
select 
s.name as company_name,
to_char(date_trunc('month', o.created_at), 'YYYY-MM') as month,
sum(op.amount)::integer as sold_products,
round(avg(op.amount * op.price), 2)::float as average_price
from supplier s
left join product p on s.supplier_id = p.supplier_id
left join order_product op on op.product_id = p.product_id
left join orders o on o.order_id = op.order_id
where o.status = 'completed'
group by s.name, date_trunc('month', o.created_at)
order by sold_products desc
```

Пояснення:
- JOIN таблиць product, order_product, orders
- Фільтрація лише завершених замовлень
- Групування за назвою постачальника та місяцем замовлення
- Обчислення суми загальної кількості товарів за місяць та середню ціну товарів
- Сортування результатів за кількістю проданих товарів
- Переведення у ::integer та ::float для більше коректної серіалізації даних у JSON

Приклад виводу:
| company_name | month | soldProducts | average_price |
|----------|-------|-------------|---------------|
| tech world | 2025-12 | 12 | 12963.64 |
| fashion hub | 2025-12 | 8 | 2000 |

### Запит 2: Аналіз ТОП-покупців магазину

Бізнес-питання: 
Які найпопулярніші категорії у ТОП-покупців за весь час?

SQL-запит:
```sql
with category_stat as (
    select
	u.login as username,
	c.name as category,
	sum(sum(op.amount)) over (partition by u.login)::integer as total_products,
	row_number() over (partition by u.login order by sum(op.amount) desc)as rank_category
	from users u
	left join orders o using(user_id)
	left join order_product op on op.order_id = o.order_id
	left join product p on p.product_id = op.product_id
	left join category c on c.category_id = p.category_id
	where o.status = 'completed'
	group by u.login, u.role, c.category_id, c.name
	having role = 'user'
)

select 
username, 
total_products, 
category as favorite_category
from category_stat
where rank_category = 1
order by total_products desc
limit 3 offset 0
```

Пояснення:
- Створення CTE category_stat
- JOIN таблиць orders, order_product, product, category
- Фільтрація лише завершених замовлень
- Групування за логіном/ролью користувача та категорією
- Фільтрація через "having" лише звичайних користувачів
- Спочатку сумування кількості продуктів, які попередньо згруповані за category_id, а потім, через віконну функцію, сумування цих значень за user.login
- Переведення у ::integer для більше коректної серіалізації даних у JSON
- Визначення Через віконну функцію поточний rank для user по кількості товарів в кожній категорії
- Відсортування CTE тільки з найпопулярнішою категорією
- Сортування за загальною кількістю придбаних товарів
- Вивести тільки перших 3-ьох користувачів

Приклад виводу:
| username | total_products | favorite_category |
|----------|--------------|---------------|
| user2 | 8 | clothing |
| user4 | 8 | clothing |
| user1 | 3 | electronics |