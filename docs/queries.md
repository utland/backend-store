### Запит 1: Щомісячний звіт про постачальників

Бізнес-питання: 
Щомісячний звіт про продажі постачальників?

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

Приклад виводу:
| company_name | month | soldProducts | average_price |
|----------|-------|-------------|---------------|
| tech world | 2025-12 | 12 | 12963.64 |
| fashion hub | 2025-12 | 8 | 2000 |