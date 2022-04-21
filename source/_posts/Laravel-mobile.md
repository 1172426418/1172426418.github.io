---
title: Laravel使用（检测移动端并加载视图）
date: 2018-06-13 14:25:18
categories: PHP
tags:
	- laravel
	- views
---
**1.有的网站无法用响应式来完成移动端的浏览效果，就要写一套移动端的代码来代替原有视图模板**
首先需要添加支持设备识别的Laravel扩展，这里以Jenssegers为例：
<!--more-->
添加扩展：
```php
    composer require jenssegers/agent
```
方案一：直接通过修改配置文件中的`config/views.php`文件，达到修改view函数的默认视图路径。
```php
    <?php
    
    use Jenssegers\Agent\Agent as Agent;
    $Agent = new Agent();
    // 判断是否是移动端
    if ($Agent->isMobile()) {
    // 是移动端则指向mobile目录
    $viewPath = 'mobile';
    } else {
    // 否则指向默认目录
    $viewPath = 'views';
    }
    
    return array(
    'paths' => array($viewPath),
```
同时在resources目录下新建mobile文件夹并保持与views文件夹下相同目录结构。

这样做的好处就是无须修改控制层任何代码，所有在PC端的数据都能完整的应用到移动端，操作便捷。但是如果说移动端渲染的数据与PC端不一致，则可能需要在控制层进行逻辑调整。

方案二：注册一个服务提供者用于判断是否是移动端，然后在模板中判断是否为移动端来显示不同的样式

创建用于判断是否是移动端的服务提供者：
```php
    php artisan make:provider AgentServiceProvider
```
在`config/app.php`中注册服务
```php
    'providers' => [
    App\Providers\AgentServiceProvider::class,
    ...
```
在`app/Providers/AgentServiceProvider.php`中
```php
    <?php
    
    namespace App\Providers;
    
    use View;
    use Jenssegers\Agent\Agent;
    use Illuminate\Support\ServiceProvider;
    
    class AgentServiceProvider extends ServiceProvider
    {
    public function boot()
    {
    $agent = new Agent();//Agent对象用于判断移动设备
    
    View::share('agent', $agent);//用于在所有视图层通过对象判断设备
    }
    
    public function register()
    {
    //
    }
    }
```
然后在视图层可直接调用对象的方法来判断设备：
```php
    @if ($agent->isMobile())
    
    显示移动设备的内容
    
    @endif
```
这种方案的好处就是可以将移动端模板与PC端都放在一个模板里面，避免重写第二套模板，同时可以根据需求来判断哪些页面需要判断移动端哪些不需要，灵活性比较强。

方案三：在控制器return视图的时候调用扩展判断设备来显示不同的模板。
```php
    use View;
    use Jenssegers\Agent\Agent;
    ...
    public function index() {
    $agent = new Agent();
     return View::make( ($agent->isMobile() ? 'mobile' : 'desktop') . '.your-view-name' );
	}
```
那么视图层结构应该是这个样子：
```php
    ├── views
    |   ├── mobile
    |   |   ├── main.blade.php
    |   └── desktop
    |   ├── main.blade.php
```