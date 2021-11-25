---
title: Centos7 配置https协议
date: 2018-03-23 14:20:03
categories: Linux
tags:
	https
---
本文用的是Let's Encrypt数字证书认证机构免费提供的ssl证书。letsencrypt基于ACME协议自助颁发证书的过程由letsencrypt提供一个工具完成，工具名称现在叫做：certbot，在linux下certbot工具安装后也就是certbot命令。

1,.安装certbot用于生成证书
```php
    ##安装epel-release扩展包
    yum install epel-release
    ##更新yum缓存
    yum makecache
    ##直接yum安装certbot
    yum install certbot
```
2.使用certbot申请Let's Encrypt免费的ssl证书

配置Let's Encrypt有两种模式，standalone和webroot。至于两种模式的区别可自行百度一下。我们这里使用的是webroot模式。
```php
    ##--webroot指定你的网站的根目录
    certbot certonly --webroot -w /var/www/blog -d blog.ibeeasy.cn
```
对于nginx而言web根目录下的隐藏目录默认情况下是不允许访问的，所以nginx情况下再执行非standalone模式申请ssl证书之前，需要将nginx网站根目录下的.well-known隐藏目录设置成允许访问。

申请过程中可能会需要输入邮箱接受通知，还有一个同意协议的选项，选y。

不出意外的话，证书文件会在以下的位置：
```php
    /etc/letsencrypt/live/你的域名/
```
3.配置nginx

以前我们使用的是80（http）端口，而https协议是443端口，所以我们要将80端口转发到443端口，在你当前网站的配置文件里修改配置如下：
```php
    server{
    listen 80;
    server_name blog.ibeeasy.cn;
    rewrite ^(.*) https://$server_name$1 permanent; 
    }


    server {
    listen 443 ssl http2;
    server_name  blog.ibeeasy.cn;
       #告诉浏览器当前页面禁止被frame
    add_header X-Frame-Options DENY;
    #告诉浏览器不要猜测mime类型
    add_header X-Content-Type-Options nosniff;
    #证书路径
    ssl_certificate /etc/letsencrypt/live/blog.ibeeasy.cn/fullchain.pem;
    #私钥路径
    ssl_certificate_key /etc/letsencrypt/live/blog.ibeeasy.cn/privkey.pem;
    #安全链接可选的加密协议
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    #可选的加密算法,顺序很重要,越靠前的优先级越高.
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-RC4-SHA:!ECDHE-RSA-RC4-SHA:ECDH-ECDSA-RC4-SHA:ECDH-RSA-RC4-SHA:ECDHE-RSA-AES256-SHA:HIGH:!RC4-SHA:!aNULL:!eNULL:!LOW:!3DES:!MD5:!EXP:!CBC:!EDH:!kEDH:!PSK:!SRP:!kECDH;
    #在 SSLv3 或 TLSv1 握手过程一般使用客户端的首选算法,如果启用下面的配置,则会使用服务器端的首选算法.
    ssl_prefer_server_ciphers on;
    #储存SSL会话的缓存类型和大小
    ssl_session_cache shared:SSL:10m;
    #缓存有效期
    ssl_session_timeout 60m;
       #其他配置照原先的不变，这里就不列出来了
    }
```
配置完成后重启Nginx或重新加载配置：
```php
    #或重启nginx
    systemctl restart nginx
    #重新加载配置
    systemctl reload nginx
```
至此，https协议就部署完成了，如果还是无法访问，请确定443端口是否开启，或者是否添加安全组443端口的入方向。

4.添加脚本执行证书更新

因为ssl证书的有效期是90天，所以我们要设置一个定时任务来自动更新证书，证书更新的命令如下：
```php
    ./letsencrypt-auto renew
```
如果要指定更新某个域名的证书, 则要使用 certonly 参数,：
```php
    ./letsencrypt-auto certonly --webroot --renew-by-default --email admin@ibeeasy.cn -w /var/www/blog -d blog.ibeeasy.cn -d a.ibeeasy.cn
```
当然，官方也提供了 cron 运行脚本的方式可以实现定时续期，脚本如下：
```php
    #!/bin/sh
    #停止 nginx 服务,使用 --standalone 独立服务器验证需要停止当前 web server.
    systemctl stop nginx
    if ! /path/to/letsencrypt-auto renew -nvv --standalone > /var/log/letsencrypt/renew.log 2>&1 ; then
    echo Automated renewal failed:
    cat /var/log/letsencrypt/renew.log
    exit 1
    fi
    #启动 nginx
    systemctl start nginx
```
将以上脚本保存为 letsencrypt-renew.sh

添加可执行权限：
```php
    chmod +x letsencrypt-renew.sh
```
编辑 crontab 配置文件或执行` crontab -e` 添加 cron 任务：
```php
    nano /etc/crontab
```
我这里设置为每月1号0点执行此脚本.
```php
    #分 时 日 月 星期 执行用户 执行命令
     0 0 1 *  *   root/脚本目录/letsencrypt-renew.sh
```
加入后Ctrl+X保存退出即可。