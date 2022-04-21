---
title: Laravel使用（关联数据预加载）
categories: PHP
tags:
	- laravel
	- 预加载
---
**1.预加载**
应用场景：在一个商品表里面的商品分类字段category_id,要在商品分类列表里面直接获取到分类的名字，那么必须要从商品分类表product_category里通过category_id来获取category_name。
<!--more-->
首先获取商品表数据：
```php
    	public function index() {
    		$product = Product::with('category')->paginate(15);
    		$assign = compact('product');
    		return view('admin.product.index', $assign);
    	}
```
其中with里面就是预加载的分类表，在这之前需要在商品的模型中添加对应的关系：
```php
	/**
	 * 关联分类  Models/Product.php
	 */
	public function category() {
		return $this->hasOne(Product_category::class, 'category_id', 'category_id')->withDefault(function ($category) {
			$category->category_name = '未分类';
		});
	}
```
其中hasOne表示一对一，即一个商品对应一个分类，通过分类id在父级中找到对应的分类名。
相关的还有一对多（hasMany），多对多（belongsToMany）等。
hasOne第一个参数表示相关联的模型，第二个参数默认通过检查关系方法(category)的名称并使用 _id 作为后缀名来确定默认外键名称的，即`category_id`。第三个参数是父级模型没有使用 id 作为主键，或者是希望用不同的字段来连接子级模型，则可以通过给 hasOne 方法传递第三个参数的形式指定父级数据表的自定义键。因为我在分类表指定的是category_id作为主键，所以需要配置第三个参数。

添加withDefault方法是当在父级没有找到查询到结果返回空的模型。使用闭包函数来定义一个未查询到的分类名称。

关于模型关联的一些其他操作，可参考[https://www.kancloud.cn/iwzh/laravel_doc_zh-5-5/400324#querying-relationship-absence](https://www.kancloud.cn/iwzh/laravel_doc_zh-5-5/400324#querying-relationship-absence)

**2.增加表单请求次数限制**

比如一个用户一天只能登陆10次

可以使用访问频率限制的中间件来实现，该中间件已经内置到了框架中：
```php
    Route::post('update', 'UserController@update')->middleware('throttle:1,1440');;
```
以上路由表示用户请求更新数据为1440分钟只能更新1次，即一天更新一次，否则将在浏览器显示429的错误码，即访问次数频繁。同时可以自定义错误页面来修改默认的错误提示信息。

**3.错误页面获取缓存数据**

因为错误页面没有经过数据渲染，所以在App/Providers里服务提供者分配的通用缓存数据无法通过变量获取，但仍然可以通过视图层使用Cache门面来获取缓存数据：
```php
    @foreach(Cache::get('carousel') as $key=>$value)

    <li data-target="#carousel" @if($key==0)class="active"@endif data-slide-to="{{$key}}"></li>
    @endforeach
```
