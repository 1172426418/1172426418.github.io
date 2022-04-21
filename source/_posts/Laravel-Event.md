---
title: Laravel使用（事件监听）
date: 2018-05-12 11:46:26
categories: PHP
tags:
	- laravel
	- 事件监听
---
---
**1.事件监听**

有时候我们需要在执行完一步操作后自动执行下一步事件，比如在用户购买商品后增加到购买记录的同时将商品增加到订单表中。
<!--more-->
首先需要注册事件/监听器，在`\app\Providers\EventServiceProvider.php`文件中
```php
	protected $listen = [
		'SocialiteProviders\Manager\SocialiteWasCalled' => [
			'SocialiteProviders\Weibo\WeiboExtendSocialite@handle',
			'SocialiteProviders\QQ\QqExtendSocialite@handle',
		],
		'Illuminate\Auth\Events\Login' => [
			'App\Listeners\LoginStoreSession',
		],
	//增加一个订单触发的事件
		'App\Event\Order' => [
		//这里是事件监听，可以是多个，即一个事件可以对应多个监听器
			'App\Listeners\CreateOrder',
		],
	];
```
之后执行`php artisan event:generate` 会分别自动在` app/Events`和`app/Listensers`目录下生成 Order.php和CreateOrder.php文件。
Order.php文件中是定义变量与监听器进行变量传递的过程，其中变量可以是表单数据，也可以是自带的数据参数，我们这里自定义一个$data数组用于将数据写入写入订单
```php
    class Order {
    	use Dispatchable, InteractsWithSockets, SerializesModels;
    
    	public function __construct($data) {
    		$this->data = $data;
    	}
    
    	/**
    	 * Get the channels the event should broadcast on.
    	 *
    	 * @return \Illuminate\Broadcasting\Channel|array
    	 */
    	public function broadcastOn() {
    		return new PrivateChannel('channel-name');
    	}
    }
```
然后去`app\Listeners`目录CreateOrder.php文件中创建各种要做的事件监听类。
```php
	/**
	 * Create the event listener.
	 *
	 * @return void
	 */
	public function __construct() {
		//
	}

	/**
	 * Handle the event.
	 *
	 * @param  Order  $event
	 * @return void
	 */
	public function handle(Order $event) {
		$data = $event->data;
		DB::table('orders')->insert($data);
	}
```
监听器在handle方法中接收事件的实例，你可以获取到Order实例中的所有属性以及使用。我们这里是直接将$data数据直接从实例Order中拿到并使用。

那么事件与监听器都设置好了，接下来就是如何触发事件即监听：
```php
    use App\Event\Order;//使用到的事件
    
    DB::table('purchase_records')->insert($data);//这是将数据加入购买记录
	Event::fire(new Order($data));//增加成功后触发事件Order同时带上数据$data

```
当然，你也可以使用助手函数来增加触发事件：
```php
    event(new Order($data));

```