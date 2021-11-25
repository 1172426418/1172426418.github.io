---
title: Laravel使用（七牛云存储图片）
date: 2018-05-26 17:06:19
categories: PHP
tags:
	- laravel
	- 图片云存储
---
**laravel5结合七牛云存储图片**

首先去官网注册账号以及完成实名认证[https://www.qiniu.com/](https://www.qiniu.com/)

1.新建对象存储

![](https://i.imgur.com/KIE1F52.png)

2.查询我们所需要的数据

![](https://i.imgur.com/KN0egkT.png)

3.借助第三方集成扩展处理上传

![](https://i.imgur.com/F4Mj0VA.png)

4.然后就是修改普通的上传代码

存储图片：
```php
    Storage::disk('qiniu')->put($newFileName, File::get($request->file('file')->path()));
```
获取图片地址：
```php
    'path' => Storage::disk('qiniu')->getDriver()->downloadUrl($newFileName)
```
当然，也可以先把图片保存在本地再上传：
```php
		if ($request->hasFile('image')) {
			$file = $data['image'];
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

				$Images = substr($realPath, 0, -4) . '.' . $ext; //设置裁剪图片保存的名称

				$filename = uniqid() . '.' . $ext;

				Image::make($realPath)->resize(1920, 260)->save($Images); //图片裁剪

				$bool = Storage::disk('public')->put($filename, file_get_contents($Images));
   				Storage::disk('qiniu')->put($filename, $realPath);
				//判断是否上传成功
				if ($bool) {
					$data['image'] = Storage::disk('public')->url($filename);

				}
			}
		}
```
