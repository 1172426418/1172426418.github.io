---
title: Laravel使用（共享数据,debugbar）
date: 2018-03-23 14:54:47
categories: PHP
tags:
	- laravel
	- debugbar
---
1.多视图共享数据
如题，如果我们有一些固定的网站内容，如联系方式，客服扣扣等，需要放在公用视图模板的头部或底部，如这样：
<!--more-->
在home.blade.php中
```php
            <p>手机：{{$config->linktel}} 丨 邮箱：{{$config->linkemail}} 丨 地址：{{$config->linkadress}}</p>
```
怎样在每个视图中都加载这些内容呢。

1.直接使用View::share()方法来在每个视图层加载固定内容

首先使用Artisan创建服务提供者
```php
    php artisan make:provider ComposerServiceProvider
```
然后在config/app.php里注册提供者。在providers里加入：
```php
	'providers' => [

		/*
			         * Laravel Framework Service Providers...
		*/
		Illuminate\Auth\AuthServiceProvider::class,
		Illuminate\Broadcasting\BroadcastServiceProvider::class,
		........
		App\Providers\RouteServiceProvider::class,
		App\Providers\ComposerServiceProvider::class,//加入刚刚创建的提供者
		Stevenyangecho\UEditor\UEditorServiceProvider::class,
	],
```
然后在注册的提供者里面加入：
```php
    public function boot()
    {
    View::share('abc','beeasy');
    }
```
这是使用外观模式，也可以直接使用view()方法，
```php
    view()->share('abc', 'beeasy');
```
这样在视图层里面就能直接使用
```php
    {{$abc}}
```
2.使用Composer单独对某个视图闭包来完成
```php
	public function boot() {
		//基于闭包的composer
		view()->composer('layouts.home', function ($view) {//绑定公用视图的前端页面
			$config = DB::table('config')
				->where('id', 1)
				->first();
			$view->with('config', $config);//将数据载入到视图
		});
	}
```
这样就能在layouts/home.blade.php视图下直接使用config变量了

当然你也可以这样写：
```php
	public function boot() {
		//基于闭包的composer
		view()->composer(*, function ($view) {//绑定公用视图的前端页面
			$config = DB::table('config')
				->where('id', 1)
				->first();
			$view->with('config', $config);//将数据传递到视图
		});
	}
```
这样就能达到第一种方法的效果



两种方法的区别：第一种方法是在每个视图层都传递数据，而第二种是针对某个视图层来传递数据，具体的选择方法还是要根据具体情况来定。

2.安装laravel-debugbar来提高开发效率
1). 使用 Composer 安装该扩展包：
```php
    composer require barryvdh/laravel-debugbar
```
2). 安装完成后，修改 config/app.php 在 providers 数组内追加 Debugbar 的 Provider
```php
    'providers' => [
    ...
    Barryvdh\Debugbar\ServiceProvider::class,
    ],
```
同时在 aliases 数组内追加如下内容
```php
    'aliases' => [
    ...
    'Debugbar' => Barryvdh\Debugbar\Facade::class,
    ]
```
3). 接下来运行以下命令生成此扩展包的配置文件 config/debugbar.php：
```php
    php artisan vendor:publish --provider="Barryvdh\Debugbar\ServiceProvider"
```
打开 config/debugbar.php，将 enabled 的值设置为：
```php
    'enabled' => env('DEBUGBAR_ENABLED', true),
```
修改完以后, Debugbar 分析器的启动状态将由 .env文件中 DEBUGBAR_ENABLED 值决定。

页面刷新后, 看到下图即表示运行成功。

![](https://i.imgur.com/1ImUL0w.png)

原文地址：https://laravel-china.org/topics/2531

关闭功能只需要在debugbar.php文件中，将
```php
    'enabled' => env('DEBUGBAR_ENABLED', true),
```
改为
```php
    'enabled' => env('DEBUGBAR_ENABLED', false),
```

或者将根目录下.ENV文件：
```php
    DEBUGBAR_ENABLED=true
```
改为
```php
    DEBUGBAR_ENABLED=false
```
