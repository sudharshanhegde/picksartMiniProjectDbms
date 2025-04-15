create database sales;
use sales;
drop database sales;
create table salesman(
 salesman_id int primary key,
 name varchar(20),
 city varchar(20),
 commision varchar(20)
 );
 create table customer(
  customer_id int primary key,
  customer_name varchar(20),
  city varchar(20),
  grade int,
  salesman_id int,
  foreign key(salesman_id) references salesman(salesman_id) on delete set null
  );
  create table orders(
   ord_no int primary key,
   purchase_amount decimal(10,2),
   ord_date date,
   customer_id int,
   salesman_id int,
   foreign key (customer_id) references customer(customer_id) on delete cascade,
   foreign key (salesman_id) references salesman(salesman_id) on delete cascade);
   
   
  INSERT INTO salesman VALUES (101, 'Alice', 'New York', '0.15');
INSERT INTO salesman VALUES (102, 'Bob', 'Los Angeles', '0.12');
INSERT INTO salesman VALUES (103, 'Charlie', 'Chicago', '0.10');
INSERT INTO salesman VALUES (104, 'Diana', 'Houston', '0.14');
INSERT INTO salesman VALUES (105, 'Evan', 'Phoenix', '0.13');
INSERT INTO salesman VALUES (106, 'Fiona', 'Philadelphia', '0.11');
INSERT INTO salesman VALUES (107, 'George', 'San Antonio', '0.09');
INSERT INTO salesman VALUES (108, 'Hannah', 'San Diego', '0.12');
INSERT INTO salesman VALUES (109, 'Ian', 'Dallas', '0.10');
INSERT INTO salesman VALUES (110, 'Jane', 'San Jose', '0.15');

INSERT INTO customer VALUES (201, 'Acme Corp', 'New York', 200, 101);
INSERT INTO customer VALUES (202, 'Beta Inc', 'Chicago', 300, 103);
INSERT INTO customer VALUES (203, 'Delta LLC', 'Houston', 250, 104);
INSERT INTO customer VALUES (204, 'Omega Ltd', 'Phoenix', 150, 105);
INSERT INTO customer VALUES (205, 'Sigma Co', 'Philadelphia', 100, 106);
INSERT INTO customer VALUES (206, 'Gamma Traders', 'San Antonio', 200, 107);
INSERT INTO customer VALUES (207, 'Zeta Group', 'San Diego', 300, 108);
INSERT INTO customer VALUES (208, 'Theta Services', 'Dallas', 275, 109);
INSERT INTO customer VALUES (209, 'Lambda Systems', 'San Jose', 180, 110);
INSERT INTO customer VALUES (210, 'Alpha Goods', 'Los Angeles', 220, 102);

INSERT INTO orders VALUES (301, 2500.00, '2023-01-10', 201, 101);
INSERT INTO orders VALUES (302, 1800.50, '2023-01-15', 202, 103);
INSERT INTO orders VALUES (303, 2200.75, '2023-02-05', 203, 104);
INSERT INTO orders VALUES (304, 1700.25, '2023-02-12', 204, 105);
INSERT INTO orders VALUES (305, 3000.00, '2023-03-01', 205, 106);
INSERT INTO orders VALUES (306, 2600.40, '2023-03-10', 206, 107);
INSERT INTO orders VALUES (307, 3100.60, '2023-03-15', 207, 108);
INSERT INTO orders VALUES (308, 2750.00, '2023-04-01', 208, 109);
INSERT INTO orders VALUES (309, 2400.90, '2023-04-05', 209, 110);
INSERT INTO orders VALUES (310, 2950.00, '2023-04-10', 210, 102);

select count(*) as num_customers
from customer
where grade > (select avg(grade) from customer where city = 'New York');

select s.salesman_id,s.name 
from salesman s 
where salesman_id in(select c.salesman_id from customer c group by c.salesman_id having count(*) > 1);

select s.salesman_id,s.name,c.customer_name,s.commision from salesman s,customer c where s.city = c.city  union select s.salesman_id,s.name,'no match',s.commision from salesman s where s.city not in(select city from customer) order by name desc;


create view top_salesman as 
select o.ord_date,s.salesman_id,s.name
from salesman s,orders o
where s.salesman_id = o.salesman_id and o.purchase_amount = (select max(purchase_amount) from orders where ord_date = o.ord_date);
select * from top_salesman;
delete from salesman where salesman_id = 101;
select * from salesman;