truncate table review, cart_product, order_product, orders, product, users, supplier, category restart identity cascade;

insert into category (name, img_url) values 
('electronics', 'http://img.com/elec.jpg'),
('clothing', 'http://img.com/cloth.jpg'),
('books', 'http://img.com/books.jpg');

insert into supplier (name, phone, email, logo_url) values 
('tech world', '+380991112233', 'contact@techworld.com', 'http://img.com/tech.jpg'),
('fashion hub', '+380994445566', 'sales@fashionhub.com', 'http://img.com/fashion.jpg');

insert into product (name, price, description, img_url, supplier_id, category_id) values 
('smartphone x', 12000, 'best phone', 'url1', 1, 1),
('laptop pro', 45000, 'workstation', 'url2', 1, 1),
('headphones', 3000, 'good bass', 'url3', 1, 1),
('smart watch', 5000, 'tracks health', 'url4', 1, 1),
('tablet mini', 8000, 'portable', 'url5', 1, 1),
('t-shirt white', 500, 'cotton', 'url6', 2, 2),
('jeans blue', 1500, 'denim', 'url7', 2, 2),
('sneakers', 3200, 'running', 'url8', 2, 2),
('learn sql', 800, 'programming book', 'url9', 1, 3),
('fantasy novel', 400, 'dragons inside', 'url10', 1, 3);

-- в якості пароля використовуємо захешований '0000'
insert into users (login, password, email, phone, address, role) values 
('user1', '$2b$10$2fABbgFL1OaCkMJCzDg3GuELEIBWwx4UkihulSdP23NSZ48LTdKvq', 'user1@test.com', '+380501111111', 'kiev, main st 1', 'user'),
('user2', '$2b$10$2fABbgFL1OaCkMJCzDg3GuELEIBWwx4UkihulSdP23NSZ48LTdKvq', 'user2@test.com', '+380502222222', 'lviv, market sq 2', 'user'),
('user3', '$2b$10$2fABbgFL1OaCkMJCzDg3GuELEIBWwx4UkihulSdP23NSZ48LTdKvq', 'user3@test.com', '+380503333333', 'odesa, sea st 3', 'user'),
('user4', '$2b$10$2fABbgFL1OaCkMJCzDg3GuELEIBWwx4UkihulSdP23NSZ48LTdKvq', 'user4@test.com', '+380504444444', 'dnipro, river st 4', 'user'),
('admin', '$2b$10$2fABbgFL1OaCkMJCzDg3GuELEIBWwx4UkihulSdP23NSZ48LTdKvq', 'admin1@test.com', '+380600000001', 'office hq', 'admin'),
('moderator', '$2b$10$2fABbgFL1OaCkMJCzDg3GuELEIBWwx4UkihulSdP23NSZ48LTdKvq', 'admin2@test.com', '+380600000002', 'office branch', 'admin');


insert into cart_product (user_id, product_id, amount) values 
-- user1
(1, 1, 1), (1, 2, 1), (1, 3, 2), (1, 4, 1), (1, 5, 1),
-- user2
(2, 6, 2), (2, 7, 1), (2, 8, 1), (2, 9, 1), (2, 10, 3),
-- user3
(3, 1, 1), (3, 6, 5), (3, 2, 1), (3, 7, 1), (3, 3, 1),
-- user4
(4, 10, 1), (4, 9, 1), (4, 8, 1), (4, 4, 1), (4, 5, 1);

insert into review (user_id, product_id, evaluation, comment) values 
(1, 1, 5, 'amazing phone'), (2, 1, 4, 'good but expensive'),
(3, 2, 5, 'fast laptop'),
(4, 3, 3, 'average sound'), (1, 3, 4, 'okay for price'),
(2, 4, 5, 'love it'),
(3, 5, 4, 'very handy'), (4, 5, 2, 'battery weak'),
(1, 6, 5, 'fits perfectly'),
(2, 7, 4, 'nice jeans'),
(3, 8, 5, 'very comfortable'), (4, 8, 5, 'best shoes'),
(1, 9, 5, 'very informative'),
(2, 10, 4, 'fun read');

insert into orders (user_id, status, order_address) values 
-- user1
(1, 'completed', 'kiev, main st 1'), (1, 'completed', 'kiev, main st 1'),
(1, 'waiting', 'kiev, work st 5'), (1, 'cancelled', 'kiev, main st 1'), (1, 'waiting', 'kiev, main st 1'),
-- user2
(2, 'completed', 'lviv, market sq 2'), (2, 'completed', 'lviv, market sq 2'),
(2, 'waiting', 'lviv, market sq 2'), (2, 'completed', 'lviv, market sq 2'), (2, 'waiting', 'lviv, market sq 2'),
-- user3
(3, 'cancelled', 'odesa, sea st 3'), (3, 'waiting', 'odesa, sea st 3'),
(3, 'waiting', 'odesa, sea st 3'), (3, 'completed', 'odesa, sea st 3'), (3, 'cancelled', 'odesa, sea st 3'),
-- user4
(4, 'completed', 'dnipro, river st 4'), (4, 'cancelled', 'dnipro, river st 4'),
(4, 'completed', 'dnipro, river st 4'), (4, 'waiting', 'dnipro, river st 4'), (4, 'waiting', 'dnipro, river st 4');


insert into order_product (order_id, product_id, amount, price) values 
-- order1 (user1) 
(1, 1, 1, 12000), (1, 3, 1, 3000),
-- order2 (user1)
(2, 2, 1, 45000),
-- order3 (user1) 
(3, 6, 2, 500), (3, 7, 1, 1500), (3, 8, 1, 3200),
-- order4 (user1) 
(4, 10, 1, 400),
-- order5 (user1) 
(5, 4, 1, 5000), (5, 5, 1, 8000),
-- order6 (user2)
(6, 1, 1, 12000),
-- order7 (user2)
(7, 2, 1, 45000), (7, 9, 1, 800), (7, 10, 2, 400),
-- order8 (user2) 
(8, 3, 1, 3000), (8, 4, 1, 5000),
-- order9 (user2) 
(9, 6, 3, 500),
-- order10 (user2)
(10, 8, 1, 3200),
-- order (user3)
(11, 7, 1, 1500), (11, 8, 1, 3200),
-- order12 (user3) 
(12, 1, 1, 12000),
-- order13 (user3) 
(13, 2, 1, 45000), (13, 3, 1, 3000), (13, 4, 1, 5000),
-- order (user3) 
(14, 5, 1, 8000),
-- order15 (user3)
(15, 9, 2, 800), (15, 10, 1, 400),
-- order16 (user4) 
(16, 6, 5, 500),
-- order17 (user4) 
(17, 1, 1, 12000), (17, 2, 1, 45000),
-- order18 (user4) 
(18, 3, 1, 3000), (18, 4, 1, 5000), (18, 5, 1, 8000),
-- order19 (user4) 
(19, 7, 2, 1500),
-- order20 (user4) 
(20, 8, 1, 3200), (20, 9, 1, 800);