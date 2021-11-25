---
title: Mysql相关小技巧总结在这里
date: 2018-11-24 14:42:47
categories: Mysql
tags:
	mysql
---
1.Mysql触发器

适用案例，删除订单同时删除订单详情：
```php
    CREATE TRIGGER del_orderdetails AFTER DELETE ON ms_order FOR EACH ROW
    BEGIN
    DELETE FROM ms_order_details WHERE user_id=old.id;
    END
```
del_orderdetails：触发器的名称 AFTER：触发时机，为BEFORE或者AFTER DELETE：触发事件，为INSERT、DELETE或者UPDATE ms_order：表示建立触发器的表明，就是在哪张表上建立触发器


2.不同库之间的表关联查询
```php
    select * from db1.table1 left join db2.table2 on db1.table1.id = db2.table2.id
```
只需要在表前面带上库的名称加上然后在后面加上 ‘.’ 表名


3.查询指定表是否存在
```php
    SELECT count(0) FROM information_schema.TABLES WHERE table_schema='gzjs' and table_name='user';
```
需要注意的是一定要带上table_schema来判断是哪个库，不然将会在所有的数据库来检索目标数据表


4.查找id为奇数（偶数）的行
```php
    select * from table where id&1 ;//奇数
    
    select * from table where id=(id>>1)<<1 ;//偶数
```