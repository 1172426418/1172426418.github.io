---
title: Laravel使用（队列）
date: 2018-05-24 15:49:01
categories: PHP
tags:
	- laravel
	- 队列
---
**首先是使用队列的原因**

例如

    请求时间比较长，影响用户体验
    
    可以通过异步来处理
    
    不确定一次执行就能成功


**使用**

首先要生成队列表并创建表迁移
```php
    php artisan queue:table
    
    php artisan migrate
```
然后创建需要操作的队列，例如发邮件：
```php
    php artisan make:job SendResetEmail
```
一下是部分代码可根据个人需求做调整：
```php
    class SendResetEmail implements ShouldQueue {
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	protected $email;//队列类的属性只会在本类中调用 所以不需要设置public属性
	protected $name;  //protected 属性即可
	/**
	 * Create a new job instance.
	 *
	 * @return void
	 */
	public function __construct($email, $name) {//用于传递控制器中的邮箱地址以及其他参数，可以为对象
		$this->email = $email;
		$this->name = $name;
	}

	/**
	 * Execute the job.
	 *
	 * @return void
	 */
	public function handle() {//获取邮箱地址以及其他参数 调用Mail类进行邮件发送
		$email = $this->email;
		$name = $this->name;
		$token = str_random(random_int(20, 30));
		$url = "http://www.test.cn/password/reset?name=$name&token=$token";
		Cache::put("user_$name", $token, 10); //将token进行缓存
		Mail::send('emails.password', ['name' => $name, 'url' => $url], function ($message) use ($email) {
			$to = $email;
			$message->to($to)->subject('找回密码');
		});
		return true;
	}

	public function failed(Exception $exception) {//队列执行失败执行的操作
		return false;
	}
    }

```
调用的时候只需要在控制层使用dispatch方法
```php
    use App\Jobs\SendResetEmail;
	...
    $result = $this->dispatch(new SendResetEmail($user->EMail, $user->ID));
```
当然，在调用前必须开启监听队列：
```php
php artisan queue:

    queue:work 默认只执行一次队列请求, 当请求执行完成后就终止；
    
    queue:listen 监听队列请求，只要运行着，就能一直接受请求，除非手动终止；
    
    queue:work --daemon同listen一样，不同的是work不需要再次加载框架，直接运行任务，一般推荐使用这个来处理队列监听。
    
    注：使用 queue:work --daemon ，当更新代码的时候，需要停止，然后重新启动，这样才能把修改的代码应用上。
```
> 那么什么时候使用 queue:listen 什么时候使用 queue:work？
> Laravel 5.3 的文档已经不写 queue:listen这个指令怎么用了，所以你可以看出来可能官方已经不怎么建议使用 queue:listen了，但是在本地调试的时候要使用 queue:listen，因为 queue:work在启动后，代码修改，queue:work不会再 Load 上下文，但是 queue:listen仍然会重新 Load 新代码。

其余情况全部使用 queue:work吧，因为效率更高。

以下为常用的Artisan命令开启队列监听：
```php
    php artisan queue:work --daemon --quiet --queue=default --delay=3 --sleep=3 --tries=3
```
--daemon
supervisor 中一般要加这个 option，可以节省 CPU 使用。

--quiet

不输出任何内容

--delay=3

一个任务失败后，延迟多长时间后再重试，单位是秒。这个值的设定我个人建议不要太短，因为一个任务失败（比如网络原因），重试时间太短可能会出现连续失败的情况。

--sleep=3

去 Redis 中拿任务的时候，发现没有任务，休息多长时间，单位是秒。这个值的设定要看你的任务是否紧急，如果是那种非常紧急的任务，不能等待太长时间。

--tries=3

定义失败任务最多重试次数。这个值的设定根据任务的重要程度来确定，一般 3 次比较适合。

一些其他心得：

在开发环境我们想测试的时候，可以把 Queue driver 设置成为 sync，这样队列就变成了同步执行，方便调试队列里面的任务。
Job 里面的 handle 方法是可以注入别的 class 的，就像在 Controller action 里面也可以注入一样。