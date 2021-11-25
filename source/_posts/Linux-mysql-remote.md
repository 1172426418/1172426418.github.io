---
title: Linux下MYSQL开启远程访问权限
date: 2018-03-23 14:31:52
categories: Mysql
tags:
	mysql
---
当在Linux服务器上搭建了LNMP环境后，在服务器端本地可以访问，但是有时候需要本地先创建数据表再上传到服务器，而Linux下Mysql默认安装完成后只有本地访问的权限，需要指定用户设置访问权限才能远程访问该数据库。

首先登陆数据库：
```php
    mysql -U root -p
```
输入数据库密码

然后运行以下sql语句：
```php
    grant all privileges on *.* to 'root'@'%' identified by 'root';
```
前面的root代表远程登陆时的用户名，后面的root代表密码，这样设置的是账号为root密码也为root的mysql用户，中间的'%'表示所有ip地址都能远程访问，如果要针对一台机器访问，将‘%’改为对应的ip地址即可访问数据库。

特别提醒不要讲账号密码设置成简单的组合，不然容易被黑。当我按照以上的操作成功远程登陆，过了几天以后。。。。
自己创建的数据库不见了，取而代之的是一个名为 “WARNING”的数据库，其中只有一张名为Readme的表，wtf？打开后是一条数据，大致内容是这样的：

    Your Data is downloaded and backed up on our secured servers. To recover your lost data: Send 0.1 BTC to our BitCoin Address and Contact us by eMail with your server IP Address and a Proof of Payment. Any eMail without your server IP Address and a Proof of Payment together will be ignored. You are welcome
翻译后是这样的：

您的数据已下载并备份在我们的安全服务器上。恢复你丢失的数据：发送0.1 BTC我们的比特币地址的服务器IP地址的电子邮件和付款证明联系我们。任何没有您的服务器IP地址和付款证明的电子邮件都将被忽略。不客气
上网查了一下原来是数据库被黑了，因为设置的账号密码太过简单，而且设置的是在所有ip上都能登陆。所以不要为了省事就不限制登陆数据库的ip地址，也不要将远程登陆的用户密码设置的过于简单。