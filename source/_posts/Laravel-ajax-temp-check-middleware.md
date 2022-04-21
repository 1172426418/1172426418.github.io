---
title: Laravel使用（ajax,模板继承,登陆验证,中间件）
date: 2018-03-23 14:54:18
categories: PHP
tags:
	- laravel
	- ajax
	- 模板继承
	- 登陆验证
	- 中间件
---
1.ajax
使用ajax传递数据必须带上_token字段:
<!--more-->
```php
    $.ajax({
    type:'post',
    url:"{{ url('admin/login/login')}} ",
    data:{username:username,password:password,_token:'<?php echo csrf_token() ?>'},
    success:function(data){
    if(data=='no'){
    $('#success').text('用户名或密码错误').css('color','red');
    }else{
    window.location.href="{{ url('admin/login/login')}}";
    }
    }
    })
```
后台返回ajax数据：
```php
	public function login(Request $request) {
		$data = $request->all();
		return response()->json('no'); //ajax返回数据
	}
```
2.保存未提交成功的数据
```php
	/**
	 * 用户登录验证
	 */

	public function login(Request $request) {
		$data = $request->only('name', 'password');
		if (Auth::attempt($data)) {
			return 'ok';
		}
		return redirect('admin/login/index')->withInput($request->except('password'))->with('msg', '用户名或密码错误');
    //返回登陆页并返回除密码外的所有表单数据，添加一次性session错误提示
    	}

```
在视图页用old获取之前的数据
 ```php   
    <input type="text" name="username" value="{{ old('username') }}">
    
     {{ session('msg') }} //视图层获取错误信息
```
3.模板继承
比头尾分离更加人性化

制定头尾模板home.blade.php放入resouces/views/layouts/目录下：
```php
    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport"
      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>@yield('title') - BeEasy博客</title>
    </head>
    <body>
    
    @yield('content')
    
    </body>
    </html>
```
其中变量用@yield()替代

视图层模板继承：
```php
    @extends('layouts.home')
    
    @section('title', $title);
    
    @section('content')
    <form action="{{ url('view/store') }}" method="post">
    {{ csrf_field() }}
    <input type="text" name="title" value=""> <br>
    <input type="text" name="content" value=""> <br>
    <button type="submit">提交</button>
    </form>
    @endsection
```
其中块级元素必须有闭合标签

4.中间件
比如后台管理员登陆后登陆超时将返回登陆
```php
    php artisan make:middleware AdminMiddleware
```
使用Artisan命令快速创建中间件

这个命令会在 app/Http/Middleware 目录下创建一个新的中间件类 Admin来检测用户是否登录
```php
    namespace App\Http\Middleware;
    
    use Closure;
    use Illuminate\Support\Facades\Auth;
    
    class AdminMiddleware {
    	/**
    	 * Handle an incoming request.
    	 *
    	 * @param  \Illuminate\Http\Request  $request
    	 * @param  \Closure  $next
    	 * @return mixed
    	 */
    	public function handle($request, Closure $next) {
    		if (Auth::guard('admin')->check()) {//检测用户是否登录
    			return $next($request);//执行登陆后的操作。可自行定制
    		} else {
    			return redirect('admin/login/index');//未登录则返回登陆页
    		}
    	}
    }
```
中间件创建成功后我们需要注册中间件，不然使用起来会特别不方便：

在 app/Http/Kernel.php 文件中
```php
    	protected $routeMiddleware = [
    		'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
    		'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    		'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
    		'can' => \Illuminate\Auth\Middleware\Authorize::class,
    		'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    		'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    		'logincheck' => \App\Http\Middleware\logincheckMiddleware::class,
    		'admincheck' => \App\Http\Middleware\AdminMiddleware::class,//给中间件设置别名，方面调用
    	];
```
如果你想要中间件在每一个 HTTP 请求期间被执行，只需要将相应的中间件类设置到 app/Http/Kernel.php 的数组属性 $middleware 中即可。

有时候你可能想要通过指定一个键名的方式将相关中间件分到同一个组里面，从而更方便将其分配到路由中，这可以通过使用 HTTP Kernel 的 $middlewareGroups 属性实现。

那么当你将后台登陆页面和登陆成功首页写好后，如何只在登陆成功页加入中间件检测登陆，而不在登陆页加上中间件？

打开全局路由文件 routes/web.php
```php
    //admin模块
    Route::prefix('admin')->namespace('admin')->group(function () {
    	Route::prefix('login')->group(function () {
    		Route::get('index', 'LoginController@index');
    		Route::post('login', 'LoginController@login');
    	});
    	Route::group(['middleware' => ['admincheck']], function () {
    //路由中间件，检测用户是否登录
    		Route::prefix('index')->group(function () {
    			Route::get('index', 'IndexController@index');
    			Route::post('loginout', 'IndexController@loginout');
    		});
    	});
    
    });
```
那么其他需要登陆的页面方法，将路由规则写在注释下面就可以了。

5.登陆账号密码验证
虽然laravel给我们提供了一套简单的用户注册登录流程，但是并不能完全满足我们的需求，比如我们管理员是在admin表，验证的是username和password。

首先需要在 /config/auth.php文件中添加：
```php
    	'guards' => [
    		'web' => [
    			'driver' => 'session',
    			'provider' => 'users',
    		],
    
    		'api' => [
    			'driver' => 'token',
    			'provider' => 'users',
    		],
    		'admin' => [//定义后台的驱动和提供
    			'driver' => 'session',
    			'provider' => 'admin',
    
    		],
    	],
```
添加配置
```php
    	'providers' => [
    		'users' => [
    			'driver' => 'eloquent',
    			'model' => App\User::class,
    		],
    
    		'admin' => [ //后台驱动以及模型 database驱动对应的是table表单
    			'driver' => 'eloquent',
    			'model' => App\Models\AdminUser::class,
    		],
    		// 'users' => [
    		// 'driver' => 'database',
    		// 'table' => 'users',
    		// ],
    	],
```
然后我们可以通过复制App目录下User.php
```php
    <?php
    
    namespace App\Models;
    
    use Illuminate\Foundation\Auth\User as Authenticatable;
    use Illuminate\Notifications\Notifiable;
    
    class AdminUser extends Authenticatable {
    	use Notifiable;
    	/**
    	 * 关联到模型的数据库
    	 */
    	protected $table = 'admin';
    	/**
    	 * The attributes that are mass assignable.
    	 *
    	 * @var array
    	 */
    	protected $fillable = [//验证的字段
    		'username', 'password',
    	];
    
    	/**
    	 * The attributes that should be hidden for arrays.
    	 *
    	 * @var array
    	 */
    	protected $hidden = [
    		'password', 'remember_token',
    	];
    }
```
然后在控制器里调用：
```php
    	public function login(Request $request) {
    		$data = $request->only('username', 'password');
    		if (Auth::guard('admin')->attempt($data, $remember)) {
    			return redirect('admin/index/index');
    		}
    		return redirect('admin/login/index')->withInput($request->except('password'))->with('msg', '用户名或密码错误');
    	}
```
当然，如果你的网站只有后台管理员不涉及到前台用户，那么在auth.php里可修改默认配置：
```php
	'defaults' => [
		'guard' => 'admin',//将默认改为admin
		'passwords' => 'users',
	],
```
这样在调用的时候不用指定guard：
```php
    Auth::attempt($data, $remember)
```

