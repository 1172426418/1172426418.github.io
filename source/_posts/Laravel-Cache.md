---
title: Laravel使用（Cache）
date: 2018-03-23 14:54:51
categories: PHP
tags:
	- laravel
	- cache
---
1,Cache的使用
Laravel目前支持流行的缓存后端包括Memcached和Redis等，下面说的是数据库缓存：
<!--more-->
使用database缓存驱动时，你需要设置一张表包含缓存缓存项。下面是该表的Schema声明：
```php
    Schema::create('cache', function (Blueprint $table) {
    			$table->string('key')->unique();
    			$table->text('value');
    			$table->integer('expiration');
    		});
```
首先创建表迁移：
```php
    php artisan make:migration create_cache_table
```
再将表迁移内容替换进去，就是第一段替换

执行表迁移：
```php
    PS E:\wamp\www\blog> php artisan migrate
    Migrating: 2018_03_22_160436_create_cache_table
    Migrated:  2018_03_22_160436_create_cache_table
```
那么就可以使用数据库缓存了

在需要使用的控制器里使用：
```php
    use Cache；
```
比如要将文章的详情页存入到数据库缓存，并且在没有该详情页缓存的时候添加进去：
```php
    	public function show($id) {
    		$result['result'] = Cache::remember('news_' . $id, 10060, function () use ($id) {//news_$id用于区分不同的文章详情，10060表示缓存时间，单位分，
    后面是缓存内容，使用闭包函数use连接文章id调用模型来获取数据

    			return Index::where('id', $id)->first();
    		});
    
    		$result['category_id'] = $result['result']['category_id'];
    
    		return view('home.index.show', $result);
    	}
```
Cache的remember方法第一个参数代表的是缓存的key，第二个参数代表缓存的时间，第三个参数表示的是在没有该key的情况下设置的默认值，该参数支持闭包函数。

你也可使用remember和forever方法：
```php
    $value = Cache::rememberForever('news_' . $id,function () use ($id) { return Index::where('id', $id)->first();});
```
来永久缓存数据。

扩展：比如一些导航栏是每个页面都要获取，我们也可以将其加入到缓存中：

在之前的文章里，公用的数据我们都放在app/Providers/目录下的服务提供者文件里统一加载数据。

首先在服务提供者的文件里：
```php
	public function boot() {
		//基于闭包的composer
		view()->composer('layouts.home', function ($view) {
			$config = DB::table('config')//获取网站的全局配置参数，如客服电话，公司地址等。。
				->where('id', 1)
				->first();
			$banner = DB::table('image')
				->where('is_see', 1)
				->get();
			$view->with('config', $config)->with('banner', $banner);
		});

	}
```
将站点配置$config和$banner加入到缓存中：
```php
	public function boot() {
		//基于闭包的composer
		view()->composer('layouts.home', function ($view) {
			$config = Cache::remember('config', 10060, function () {//获取key=config的数据，如果没有则使用闭包函数从数据库获取并存入缓存
				return DB::table('config')->where('id', 1)->first();
			});
			$banner = Cache::remember('banner', 10060, function () {
				return DB::table('image')->where('is_see', 1)->get();
			});
			$view->with('config', $config)->with('banner', $banner);
		});
	}
```
那么在第一次访问的时候借用laravel-debugbar调试器是这样的：

![](https://i.imgur.com/UGjLq7y.png)

当第二次访问的时候：

![](https://i.imgur.com/1nivQRB.png)

因为之前的全局数据以及文章详情都存入到了缓存中，所以没有查询数据库。

**windows下使用Redis缓存**

首先需要下载Redis服务Windows版本，因为官方不提供windows版本，所以只能再github上下载。

下载地址：[http://github.com/MSOpenTech/redis/tags](http://github.com/MSOpenTech/redis/tags)

下载时选择msi文件安装，可避免之后使用的时候要一直保持窗口打开才行。

安装过程基本上能打钩的都打上勾。

然后在计算机管理→服务与应用程序→服务  可以看到Redis服务，可直接点击启动服务或停止服务。

同时你也可以使用命令行来开启Redis服务，不过需要命令行窗口常开。

在Reids安装目录输入命令`redis-server.exe redis.windows.conf`

出现Redis服务相关信息就说明启动成功。

测试方法也可自行百度。

在Laravel5 中使用Redis缓存，首先需要在config/databasez中配置redis缓存服务（默认已经配置好了）
	'redis' => [

		'client' => 'predis',

		'default' => [
			'host' => env('REDIS_HOST', '127.0.0.1'),
			'password' => env('REDIS_PASSWORD', null),
			'port' => env('REDIS_PORT', 6379),
			'database' => 0,
		],

	],

然后在我们的config/cache.php中将驱动改为redis即可。

下载辅助工具RedisDesktopManager，能够在windows环境下更清楚的查看缓存。

例如：

		view()->composer('home/*', function ($view) {

			$carousel = Cache::remember('carousel', 10060, function () {
				return Carousel::get();
			});

			// // 分配数据
			$assign = compact('carousel');
			$view->with($assign);
		});

将数据加入到redis缓存中，同时在RedisDesktopManager工具中我们可以看到：

![](https://i.imgur.com/YsvEhKV.png)

说明已经存储到redis服务中。
