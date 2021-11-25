---
title: Centos下LNMP环境搭建
date: 2018-03-23 14:24:56
categories: Linux
tags:
	- mysql
	- nginx
	- php
---
1,.安装Nginx

添加CentOS 7 Nginx yum资源库
```php
rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
```
安装：
```php
yum -y install nginx
```
启动：
```php
systemctl start nginx.service
```
设置开机启动：
```php
systemctl enable nginx.service
```
nginx配置：

默认配置文件在 /etc/nginx/conf.d/default.conf

我们只需要复制一份配置文件来实现根据域名来访问不同的目录
```php
cp default.conf beeasy.conf
```
然后beeasy.conf的配置如下：
![](https://i.imgur.com/Bbs4OzM.png)


server_name 即配置的访问域名

root 后面即为访问该域名的根目录

该配置解决了在WordPress框架下修改固定链接后除首页其他页面404的问题。

重启nginx：
```php
systemctl restart nginx.service
```
2.安装php7.0

添加CentOS 7 php7 yum资源库
```php
rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm
```
安装：
```php
yum install php70w php70w-opcache
yum install php70w-fpm php70w-opcache
yum install php70w-mysql
```
你也可以安装一些其他扩展：
```php
yum install yum-plugin-replace
yum replace php-common --replace-with=php70w-common
```
还包涵一些其他的扩展包，可以根据需求安装：
```php
php70w-dba，php70w-devel，php70w-embedded，php70w-enchant，php70w-gd，php70w-pdo等。。
```
可参考https://webtatic.com/packages/php70/

3.安装mysql
```php
yum -y install mysql
```
安装mysql-server
```php
yum -y install mysql-server
```
虽然可能会报错，但是不要慌
```php
wget http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm

rpm -ivh mysql-community-release-el7-5.noarch.rpm

yum install mysql-community-server
```
然后需要确定几次，都按y回车即可

安装mysql扩展包：
```php
yum -y install mysql-connector-odbc mysql-devel libdbi-dbd-mysql
```
重启对应服务：
```php
service mysqld restart

service php-fpm start

service nginx restart
```
初次安装mysql是没有密码的,我们要设置密码，mysql的默认账户为root

设置 MySQL 数据 root 账户的密码：

命令：
```php
mysql_secure_installation
```
当出现如下提示时候直接按回车：
```php
Enter current password for root
```
出现如下再次回车：
```php
Set root password? [Y/n]
```
出现如下提示输入你需要设置的密码，这里输入了root,输入密码是不显示的，回车后再输入一次确认：
```php
Remove anonymous users? [Y/n]
Disallow root login remotely? [Y/n]
Remove test database and access to it? [Y/n]
Reload privilege tables now? [Y/n]
```
以上的教程都是搭建完成以后写的，如果存在问题，还请指出。