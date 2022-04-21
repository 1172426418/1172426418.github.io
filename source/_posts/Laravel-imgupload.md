---
title: Laravel使用（图片上传,裁剪）
date: 2018-03-23 14:54:43
categories: PHP
tags:
	- laravel
	- 上传
---
1.图片上传
<!--more-->
直接上代码：
```php
    use DB;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Storage;//使用到的类
    ...
    public function update(Request $request, $id) {//
    		$data = $request->except('_token');//获取表单中除token外的所有数值
    
    		if (!$request->hasFile('image')) {//判断是否有图片上传
    			DB::table('image')
    				->where('id', $id)
    				->update($data);
    			return redirect('admin/carousel/index');
    		} else {
    			$file = $data['image'];//获取图片信息
    			$this->validate($request, [//图片验证
    				'logo_img' => 'image|between:0,5242880',//是否为图片类型，以及大小在0~5M之间
    
    			], [
    				'image' => ':attribute 必须为图片',
    				'size' => ':attribute 文件大小必须小于5M',
    			], [
    				'image' => '图片',
    			]);
    			//判断文件是否上传成功
    			if ($file->isValid()) {
    				//原文件名
    				$originalName = $file->getClientOriginalName();
    				//扩展名
    				$ext = $file->getClientOriginalExtension();
    				//MimeType
    				$type = $file->getClientMimeType();
    				//临时绝对路径
    				$realPath = $file->getRealPath();
    				$filename = uniqid() . '.' . $ext;
    				$bool = Storage::disk('public')->put($filename, file_get_contents($realPath));//这里使用的是基于PHP的flysystem强大的文件系统抽象
    				//判断是否上传成功
    				if ($bool) {
    					$data['image'] = Storage::disk('public')->url($filename);//获取软连接地址
    					DB::table('image')
    						->where('id', $id)
    						->update($data);
    					return redirect('admin/carousel/index');//存储到数据库
    				} else {
    					return redirect()->back()->with('msg', '请稍后再试');
    				}
    			}
    		}
    
    	}
```
我们上传文件的地址其实是在 config/filesystems.php配置文件中的disk数组下public中的root地址
```php
	'disks' => [

		'local' => [
			'driver' => 'local',
			'root' => storage_path('app'),
		],

		'public' => [
			'driver' => 'local',
			'root' => storage_path('app/public'),
			'url' => env('APP_URL') . '/storage',
			'visibility' => 'public',
		],

		's3' => [
			'driver' => 's3',
			'key' => env('AWS_ACCESS_KEY_ID'),
			'secret' => env('AWS_SECRET_ACCESS_KEY'),
			'region' => env('AWS_DEFAULT_REGION'),
			'bucket' => env('AWS_BUCKET'),
		],

	],
```
因为我们指定的disks是public，所以上传的文件将存储在/storage/app/public目录下。

当以上操作成功将文件上传，我们使用Storage::disk('public')->url($filename)  获取到的结果是这样的：
```php
    /storage/5aaa3fe021b6f.png
```
虽然路径看起来一目了然，但是直接拿到页面上去用并不能获取到图片。

那么我们需要创建一个软连接来将上面的链接指向到storage_path('app/public')

即  /storage/app/public目录下

要创建这个软链接，直接使用Artisan命令：
```php
    php artisan storage:link
```
文件被存储并且软链已经被创建的情况下，就可以使用辅助函数 asset 创建一个指向该文件的URL：
```php
    <img  src="{{ asset(‘/storage/5aaa3fe021b6f.png’) }}">
```
这种方式可以将公开访问的文件保存在一个可以很容易被不同部署环境共享的目录，在使用零停机时间部署系统如Envoyer的时候尤其方便。

关于flysystem其他的一些文件操作，可参考[http://laravelacademy.org/post/6071.html](http://laravelacademy.org/post/6071.html "这里")


**附加：图片裁剪**
使用图片裁剪可以用强大的Intervention Image扩展，需要确保PHP版本>=5.4并且安装了Fileinfo扩展，以及GD库（>=2.0）或者Imagick扩展（>=6.5.7）。

使用Composer命令安装最新版本的Intervention Image
```php
    composer require intervention/image
```
安装完毕之后注册服务提供者，在config/app.php文件，$providers数组下加入：
```php
    Intervention\Image\ImageServiceProvider::class
```
然后添加如下门面到$aliaes数组：
```php
	'Image' => Intervention\Image\Facades\Image::class
```
配置方面，默认情况下，Intervention Image使用PHP的GD库扩展处理所有图片，如果你想要切换到Imagick，你可以将配置文件拉到应用中：
```php
    php artisan vendor:publish --provider="Intervention\Image\ImageServiceProviderLaravel5"
```
这样对应的配置文件会被拷贝到 config/image.php ，这样你可以在该配置文件中修改图片处理驱动配置。

在控制器中使用图片裁剪

首先需要在控制器：
```php
    use Image；
```
然后将带上文件路径的图片进行操作：
```php
			if ($file->isValid()) {
				//原文件名
				$originalName = $file->getClientOriginalName();
				//扩展名
				$ext = $file->getClientOriginalExtension();
				//MimeType
				$type = $file->getClientMimeType();
				//临时绝对路径
				$realPath = $file->getRealPath();

				$Images = substr($realPath, 0, -4) . '.' . $ext; //设置裁剪图片保存的名称

				$filename = uniqid() . '.' . $ext;

				Image::make($realPath)->resize(1920, 530)->save($Images); //图片裁剪

				$bool = Storage::disk('public')->put($filename, file_get_contents($Images));
				
	}
```
以上代码只是在文件上传功能中添加了一小部分，其中添加变量$Images用来保存裁剪后的图片名称，因为临时的绝对路径中图片的后缀是.tmp，在调用Image类的时候save方法保存的文件后缀不能用图片类型以外的后缀，故只能自行添加。resize方法用于重新设定图片大小，连接save方法将裁剪的图片进行保存。

更多使用方法请参考 Intervention Image 官方文档：http://image.intervention.io/

