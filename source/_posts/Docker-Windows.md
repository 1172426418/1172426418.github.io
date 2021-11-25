---
title: Docker使用（Windows系统）
date: 2018-03-23 14:46:56
categories: PHP
tags:
	Docker
---
首先从Docker官网上面下载最新版本点击前往

安装过程可能会有点长，因为需要在线下载很多文件。

安装好了之后桌面上会出现一个这样的图标：


![](https://i.imgur.com/ddozzz9.png)

双击之后出现running就ok了

然后打开命令提示符输入：
```php
    docker version

    PS C:\WINDOWS\system32> docker version
    Client:
     Version:   17.12.0-ce
     API version:   1.35
     Go version:go1.9.2
     Git commit:c97c6d6
     Built: Wed Dec 27 20:05:22 2017
     OS/Arch:   windows/amd64
    
    Server:
     Engine:
      Version:  17.12.0-ce
      API version:  1.35 (minimum version 1.12)
      Go version:   go1.9.2
      Git commit:   c97c6d6
      Built:Wed Dec 27 20:12:29 2017
      OS/Arch:  linux/amd64
      Experimental: true
```
会出现很多版本相关信息。
```php
    PS C:\WINDOWS\system32> docker images //查看当前已有镜像
    REPOSITORY  TAG IMAGE ID
    CREATED SIZE
    centos  latest  2d194b392dd1
    32 hours ago195MB
    docker4w/nsenter-dockerdlatest  cae870735e91
    4 months ago187kB
    registry.cn-hangzhou.aliyuncs.com/diligentyang/centos6.7_nginx_1.10_php5.6.29   v1.0072258802250
    14 months ago   854MB
```
关于镜像可以使用命令：

```php
    docker search centos
```
来查找与centos相关的镜像
```php
    PS C:\WINDOWS\system32> docker search centos
    NAME   DESCRIPTION STARS   OFFICIAL
       AUTOMATED
    centos The official build of CentOS.   4079[OK]
    
    ansible/centos7-ansibleAnsible on Centos7  105
···
其中越靠前是STARS越多，相当于使用的人最多，当我们选择了一个镜像后查看它的AUTOMATED就能直接拉取镜像
```php
    docker pull registry.cn-hangzhou.aliyuncs.com/diligentyang/centos6.7_nginx_1.10_php5.6.29:v1.0
```
这里使用的是一个阿里云搭建的php5.6+nginx1.10的镜像
```php
    $ docker run -p 80:80 --name ali -it 5a7e /bin/bash
```
docker run ：创建一个新的容器并运行一个命令，常用参数:
```php
- -i: 以交互模式运行容器，通常与 -t 同时使用；
- -t: 为容器重新分配一个伪输入终端，通常与 -i 同时使用
- –name=”nginx-lb”: 为容器指定一个名称；
- -P 将容器的80端口映射到主机随机端口。
- -p 80:80 将容器的80端口映射到主机的80端口
- -v 映射主机目录和容器目录
```
其中 5a7e为镜像的IMAGE ID

如果出现报错的情况：
```php
    $ docker run -p 80:80 --name ali -it 5a7e /bin/bash
    cannot enable tty mode on non tty input
```
总结出两条解决方案

1: 在命令前面加上winpty
2: 首先执行 docker-machine ssh default

不出意外的话就能直接进入到镜像了
```php
    [root@ec600fcf672e /]# ls
    bin   dev  home  lib64  lost+found  mnt   opt   root  selinux  sys  usr
    boot  etc  lib   local  media   mysql-community-release-el7-5.noarch.rpm  proc  sbin  srv  tmp  var
```
该镜像已经配置好了php环境，所以我们只需要：
```php
    [root@ec600fcf672e /]# php-fpm
    [root@ec600fcf672e /]# service nginx
```
就能启动了

在浏览器地址栏输入localhost 或者你的内网ip如果出现phpinfo的相关信息就说明启动成功。

其中网站根目录为  /var/www

如果想退出这个容器（在后台运行）需要按下ctrl+p ctrl+q （偶尔会失效。。）

如果想要切回去继续工作只需要docker attach 容器id（可以为前几位，只要和别的区分开就好）

查看所有容器：
```php
    PS C:\WINDOWS\system32> docker ps -a
    CONTAINER IDIMAGE   COMMAND CREATED STATUS   PORTS
      NAMES
    ec600fcf672e0722"/bin/bash" About an hour ago   Up About an hour 0.0.0.0:80->8
    tcp   ali
    fe985915775ecentos  "ls"6 hours ago Exited (0) 6 hours ago
```
删除不用的容器

docker rm 容器id

如果容器正在运行可以使用docker stop 容器id，关闭容器后再删除。或者直接使用docker rm -f 容器id

删除镜像

docker rmi 镜像id

那么如何将本地目录映射到容器里进行调试呢

可以在启动容器的加上一个-v参数，映射主机目录和容器目录
```php
    docker run -p 80:80 --name test -v /e/wamp/www:/var/www -it ec60 /bin/bash
```
由于我们之前已经配置并启动了镜像，那么我们可以将本地的项目拷贝到容器里：
```php
    $ docker cp /e/wamp/www/test ec60:/var/www
```
注意项目的路径写法。

