---
title: Linux服务器搭建vsftp
date: 2018-03-23 12:03:16
categories: Linux
tags:
description: #你對本頁的描述 可以省略
---
之前一直用的是windows下的FlashFXP，现在用的Linux服务器（Centos 7.1），为了方便上传项目，安装vsftpd。
<!--more-->
1.安装vsftpd
```php
    yum -y install vsftpd
```
安装完毕后可以通过启动来测试是否安装完成
```php
    systemctl start vsftpd.service
```
2.创建宿主用户及分配权限

安装完默认情况下是开启匿名登录的，对应的是 /var/ftp 目录，这时只要服务启动了，就可以直接连上FTP了。而这并不是我们想要的效果，一般都是按照需求来分配用户访问不同的目录。

新建一个ftp的宿主用户(即存在Linux系统的用户，不是虚拟用户)
```php
    groupadd ftpuser #创建用户组
    useradd -g root -M -d /var/www -s /sbin/nologin ftpuser
    #创建系统用户分配权限，只用于ftp，所以禁止登陆系统
    passwd ftpuser #设置账户密码，这个不是很重要
    #此处的ftpuser就是你的账户名
    
    chown -R ftpuser.root /var/www
    #把 /var/www 的所有权给ftpuser.root
    #这里的 /var/www 就是ftp的根目录，没有的话自行创建，也可以换成其他目录
```
这样就可以通过ftpuser用户连接FTP了。至于虚拟用户需要做的步骤就比较多了。首先虚拟用户的用户认证是通过pam方式去认证的，pam文件里面指定了认证的db文件，db文件又是通过明文用户名和密码文件生成而来，在 /etc/vsftpd/vsftpd.conf 配置文件是通过 pam_service_name=vsftpd 配置指定的，其位置是 /etc/pam.d/vsftpd，编辑该文件，把文件内容全部注释掉，加上以下两行：

64位系统：
```php
    auth required /lib64/security/pam_userdb.so db=/etc/vsftpd/vuser_passwd
    account required /lib64/security/pam_userdb.so db=/etc/vsftpd/vuser_passwd
```
32位系统：
```php
    auth sufficient /lib/security/pam_userdb.so db=/etc/vsftpd/vuser_passwd
    account sufficient /lib/security/pam_userdb.so db=/etc/vsftpd/vuser_passwd
```
db=/etc/vsftpd/vuser_passwd 指定了db文件的位置，接下来就是生成db文件，由于db文件是通过明文用户名和密码文件生成而来，所以先创建一个保存明文用户名和密码的文件     vuser_passwd.txt
```php
    vi /etc/vsftpd/vuser_passwd.txt
```
这个文件的奇数行位账号，偶数行为密码：
```php
    beeasy
    beeasy1234
```
保存之后通过以下命令生成db文件：
```php
    cd /etc/vsftpd
    db_load -T -t hash -f vuser_passwd.txt vuser_passwd.db
```
如果 db_load 命令无法使用，那就需要安装db4 包
```php
    yum -y install db4
```
如果要添加新的用户的话，在 vuser_passwd.txt 文件里面继续添加用户密码，但是要再次生成一下db文件。然后现在每个用户的具体配置是通过一个用户对应一个配置文件来实现的，且这个文件必须用FTP用户名去做文件名，建一个目录专门存放这些文件：

在vsftpd目录下
```php
    mkdir vuser_conf
```
并且新建文件
```php
    vi vuser_conf/beeasy
```
大致内容如下：

![](https://i.imgur.com/mzvPvJe.png)


local_root 是指当前虚拟用户的访问目录

write_enable 设置用户是否可以写入

anon_upload_enable 设置虚拟用户的上传功能

anon_mkdir_write_enable 设置虚拟用户创建文件夹的功能

anon_other_write_enable 设置虚拟用户是否可以执行其他的写入操作，覆盖，删除，重命名等。

max_per_ip 最多允许同一账户在多少个不同的ip登陆

3.根据以上的信息来修改vsftpd的配置文件
```php
    anonymous_enable=NO # 禁用匿名登录
    ascii_upload_enable=YES
    ascii_download_enable=YES
    chroot_local_user=YES # 启用限定用户在其主目录下
```
以下配置为自己添加：
![](https://i.imgur.com/3lWKWbB.png)


然后重启vsftpd：
```php
    systemctl restart vsftpd.service
```
若是连接超时，请确认防火墙是否开放vsftpd服务的端口，建议开放20至22号端口以及主动模式PASV下的6000至7000端口。或者在服务器上的安全组里添加入方向的端口。

以及SElinux是否关闭。