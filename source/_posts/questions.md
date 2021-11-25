---
title: 一些小问题将全部总结在这里
date: 2018-03-23 14:41:06
categories: PHP
tags:
	- php
	- git
	- qrcode
---
**1.使用TP3.2.3将项目部署到线上出现Undefined class constant 'MYSQL_ATTR_INIT_COMMAND'的情况**

是因为php没有开启Mysqlnd扩展，php5以上版本已经在使用mysqlnd驱动而非mysql，至于mysqlnd可自行百度了解。且在php7则正式移除了mysql扩展。

在使用phpinfo()打印php信息的时候并没有显示mysqlnd扩展
```php
    yum install php70w-mysqlnd
    systemctl restart php-fpm
```
网上搜了很久，也折腾了很久，最后发现直接安装mysqlnd扩展，并重启php，再次打印phpinfo()将出现以下内容：

![](https://i.imgur.com/KopF8jI.png)


证明已经成功开启mysqlnd扩展，解决了之前出现的问题。

**2.FQ**

常用的有Lantern（蓝灯），还有火狐浏览器的一个好用的插件Hoxx VPN Proxy

**3.关于wamp集成环境安装**

当出现httpd.exe停止运行，一般根据提示是缺少msvcr110.dll文件，在百度上面下载即可。

但是，划重点：

当我一切vs版本库安装完之后，wamp集成环境也安装完成之后，出现了php-win停止运行。于是网上搜索了各种教程，装补丁，重装了n多次wamp还是没用。最后还好根据网友的文章尝试重新下载
msvcr110.dll的版本，因为我是64位系统，所以必须要安装64位系统的msvcr110.dll,其他相关的组件也必须是64位，如msvcp120.dll，装完之后问题解决。

**4.关于云服务器项目外网访问**

1. 确保云服务器上的安全组开启了80端口访问，即入站规则
2. 确保云服务上的防火墙未阻止外网访问
3. 当访问服务器ip地址超时，一般是访问的权限问题，当出现403错误，说明服务器是通的，问题出在wamp或其他集成环境的配置上

**5.关于git的一些使用问题**
```php
    git pull origin master --allow-unrelated-histories 用于无法pull本地数据
    
    git config --global user.name "imcsi"  设置用户名和邮箱，不可与已存在账户重复
    git config --global user.email "imcsi@qq.com"  
    ssh-keygen -t rsa -C "imcsi@qq.com"  连续三次回车设置的密码即为空，并且创建了key
```
最后得到了两个文件：id_rsa和id_rsa.pub  将id_rsa里的key放在github或者码云的公钥里即可

基本拉取更新提交步骤
init + remote add origin git地址 + pull origin master --allow-unrelated-histories + wq+ add + commit +push -u origin master

**6.关于Laravel项目部署线上的问题**
当出现public目录为空白时：
```php
    chmod -R 777 storage
    chmod -R 777 vendor
    chmod -R 777 bootstrap/cache 均为最高权限
```
当开启debug后，出现
```php
    RuntimeException No application encryption key has been specified
```
需要在config/app.php中配置
```php
    'key' => 'base64:4Q7FFSyR4YjEnA6bcEpOmeAYnUo*******',
```
为具体的值，因为一般的虚拟主机无法直接读取根目录.env中的配置，所以导致无法获取到key才提示的错误。
```php
    php artisan config:cache 为生成配置项的缓存，一般用于线上配置，本地因为修改比较频繁，所以一般不会使用
    
    php artisan config:clear 清除生成配置项的缓存
```
**7.将Laravel项目部署到虚拟主机根目录**

首先需要在跟目录创建.htaccess文件，内容如下：
```php
    RewriteEngine on
    # 把 www.test.com 改为你要绑定的域名.
    RewriteCond %{HTTP_HOST} ^(www.)?www.test.com$
    # 把 public改为要绑定的目录.
    RewriteCond %{REQUEST_URI} !^/public/
    # 不要改以下两行.
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    # 把 public改为要绑定的目录.
    RewriteRule ^(.*)$ /public/$1
    # 把 www.test.com 改为你要绑定的域名
    # 把 public 改为要绑定的目录.
    # public/ 后面是首页文件index.php, index.html……
    RewriteCond %{HTTP_HOST} ^(www.)?www.test.com$
    RewriteRule ^(/)?$ public/ [L]
```
**补充**
由于在windows系统下对图片上传的地址创建了软连接，但是上传到linux系统的云虚拟主机和windows系统下使用的软连接不一样，所以在windows系统下创建的软连接（即快捷方式）无法生效。所以所有的图片资源都无法访问。

在网上也没有找到确切的解决方法，最终还是使用.htaccess文件来重写url。
由于`/storage/*.jpg`图片路径实际指向的是 `/storage/app/public/*.jpg` 。所以我们可以将图片软连接的地址重写到实际的文件路径地址：
```php
    RewriteRule ^(.*)/storage/(.*)$ /storage/app/public/$2 [L] 
```
这样写就是匹配url地址storage目录下的文件指向实际的文件路径达到访问图片资源的目的。

Laravel项目部署到云虚拟主机上的坑比较多，由于云虚拟主机仅能够上传项目文件，所以最好还是使用云服务器来搭建Laravel项目。

**8.Laravel5微信扫码支付**

Laravel5中关于支付方面，我们可以使用前人已经造好的轮子，如yansongda的微信及支付宝集成的支付扩展包，可参考[http://laravelacademy.org/post/7804.html](http://laravelacademy.org/post/7804.html "http://laravelacademy.org/post/7804.html")

在使用的过程中我们可以简单获取到微信生成的二维码以及其他的返回参数
```php
			$order = [
				'out_trade_no' => time() . rand(1000, 9999),
				'body' => '实例订单',
				'total_fee' => '1',
			];
			$result = Pay::wechat()->scan($order);
```
但是得到的二维码地址类似于`weixin://wxpay/bizpayurl?pr=jFEHom4`，所以我们需要使用到Laravel中的另一个扩展。Simple Qrcode，是 Bacon/BaconQrCode 针对 Laravel 框架的封装版本，用于在 Laravel 中为生成二维码提供接口。可参考[http://laravelacademy.org/post/2605.html](http://laravelacademy.org/post/2605.html "http://laravelacademy.org/post/2605.html")

然而，生成的二维码是svg格式，并且嵌套了很多页面元素，使用起来很不方面。Laravel学院中有说明将svg转存为图片
```php
     QrCode::format('png')->generate('Hello,LaravelAcademy!',public_path('qrcodes/qrcode.png'));
 ```
此种方法是要将图片先保存，但是作为扫码支付，如果每次生成二维码都要先保存二维码再显示会很浪费空间，即便之后能定时删除过期的二维码也会比较麻烦。  之后在Simple Qrcode 官方网站找到了可以直接将生成的图片显示而不需要保存：
```php
    <img src="data:image/png;base64, {!! base64_encode(QrCode::format('png')->size(100)->generate('Make me into an QrCode!')) !!} ">
```
直接使用 base64_encode 来将二进制数据直接显示成二维码图片，免去了保存图片的步骤。

**9.Apache使用mod_expires模块缓存页面，加快访问速度**

 mod_expires可以有效减少网页资源文件的重复请求，让重复的用户对指定的页面请求结果都CACHE在本地，不需要向服务器发出请求。
在使用之前,首先要确认一下”mod_expires”模组是否有启用.如果是自己安装Apache来搭建网站环境,我们可以透过编辑Apache的”httpd.conf”设定来开启mod_expires模块.

打开http.conf搜索mod_expires,你可能会找到这么一行:
```php
    #LoadModule expires_module modules/mod_expires.so
```
去掉前面的#号，在最下面加上：
```php
    <IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault A0
    # 1 年
    <FilesMatch “\.(flv|ico|pdf|avi|mov|ppt|doc|mp3|wmv|wav)$”>
    ExpiresDefault A9030400
    </FilesMatch>
    # 1 星期
    <FilesMatch “\.(jpg|jpeg|png|gif|swf)$”>
    ExpiresDefault A604800
    </FilesMatch>
    # 3 小时
    <FilesMatch “\.(txt|xml|js|css)$”>
    ExpiresDefault A10800″
    </FilesMatch>
    </IfModule>
```
同时确定在wamp安装目录`E:\wamp\bin\apache\apache2.4.23\modules` 下有mod_expires.so 这个模块文件。重启WAMP即可达到客户端缓存文件的目的。如果是虚拟主机，也可在根目录下设置.htaccess下加上以上内容。
Apache中php的配置文件并不是`E:\wamp\bin\php\php7.0.10`目录下的php.ini文件，而是phpForApache.ini文件。
