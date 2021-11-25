---
title: Thinkphp+jquery实现多图异步上传
date: 2018-03-23 14:43:35
categories: PHP
tags:
	tp
---
网上查找了很多方法，有的多图上传是通过html添加多个input框type=file，然后在后台遍历循环$_FILES实现一张张上传图片。还有一种就是通过jq将图片转码成base64来将图片存储成字符串的形式，然后后台将获取到的字符串通过解码成图片文件保存，这里要说的就是这种方法。

html页面主要部分如下：
```php
            <div class="weui-cells weui-cells_form" id="uploader">
                <div class="weui-cell">
                    <div class="weui-cell__bd">
                        <div class="weui-uploader">
                            <input name="goods_id" value="{$goods_id}" type="hidden">
                            <div class="weui-uploader__bd">
                                <ul class="weui-uploader__files" id="uploaderFiles"></ul>
                                <div class="weui-uploader__input-box">
                                    <div class="file-img">
                                        <i></i>
                                        <p>添加图片</p>
                                    </div>

                                    <input id="uploaderInput" class="weui-uploader__input" name="img" type="file" accept="image/*" capture="camera" multiple="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
```
jq部分：
```php
    /* 图片手动上传 */
    var uploadCustomFileList = [];
    var uploadCount = 0;
    
    weui.uploader('#uploader', {
    // url: 'http://localhost:8002/upload',
    auto: false,
    type:'base64',
    onQueued: function onQueued() {
    uploadCustomFileList.push(this);
      
    //console.log(this.url.match(/url\((.*?)\)/)[1].replace(/"/g, ''));
    },
    onBeforeQueued: function (files) {
    // `this` 是轮询到的文件, `files` 是所有文件
    
    if (["image/jpg", "image/jpeg", "image/png", "image/gif"].indexOf(this.type) < 0) {
    weui.alert('请上传图片');
    return false; // 阻止文件添加
    }
    if (this.size > 2 * 1024 * 1024) {
    weui.alert('请上传不超过2M的图片');
    return false;
    }
    if (files.length > 3) { // 防止一下子选择过多文件
    weui.alert('最多只能上传3张图片，请重新选择');
    return false;
    }
    if (uploadCount + 1 > 3) {
    weui.alert('最多只能上传3张图片');
    return false;
    }
    
    ++uploadCount;
    
    //return true; // 阻止默认行为，不插入预览图的框架
    },
    });
```
将上传的图片转码成base64
```php
    // 缩略图预览
    document.querySelector('#uploaderFiles').addEventListener('click', function (e) {
    var target = e.target;
    // var _that = this.children.length;
    // console.log(_that);
    
    while (!target.classList.contains('weui-uploader__file') && target) {
    target = target.parentNode;
    
    }
    if (!target) return;
    
    var url = target.getAttribute('style') || '';
    var id = target.getAttribute('data-id');
    
    if (url) {
    url = url.match(/url\((.*?)\)/)[1].replace(/"/g, '');
    }
    var gallery = weui.gallery(url, {
    onDelete: function onDelete() {
    weui.confirm('确定删除该图片？', function () {
    var index;
    for (var i = 0, len = uploadCustomFileList.length; i < len; ++i) {
    var file = uploadCustomFileList[i];
    if (file.id == id) {
    index = i;
    break;
    }
    }
    if (index !== undefined) uploadCustomFileList.splice(index, 1);
    
     uploadCount --;
    
    target.remove();
    gallery.hide();
    
    });
    }
    });
    });
```
这是生成缩略图预览
```php
    $(function () {
    
    $("form").submit(function(){
    
    var arr=[];
    var urls=$("[name=upload_url]").val();
      $("#uploaderFiles").find("li").each(function(index,item){
    var data_id = $(item).data("id");
       var img_url = $(item)[0].style.backgroundImage.split("\"")[1];
    
    //.split("\"")[1]
    arr[index]=img_url;
    //console.log(data_id);
    //console.log(img_url);
      })
    
      $.ajax({
    type:'post',
    url:urls,
    async:false,
    data:{result:arr},
    success:function(msg){
    console.log(msg);
    }
      })
      console.log(arr);
    return  false;
    });
    })
```
以上是将转码成base64的图片存到一个二维数组里面，方便后台遍历存储。

jquery传递的数据大致如下：

![](https://i.imgur.com/tQSb2iq.png)

这是传递两个图片的例子，当只有一个图片的时候二维数组的长度（length）即为1。

后台接收处理图片：
```php
    	/**
    	 * 异步上传图片
    	 */
    	public function upload_img() {
    		if (IS_AJAX) {
    			$data = I("result");
    			foreach ($data as $key => $value) {
    
    				list($type, $datas) = explode(',', $value);//获取图片类型，以及转码后的图片
    				if (strstr($type, 'image/jpeg') !== '') {//判断图片类型
    					$ext = '.jpg';
    				} elseif (strstr($type, 'image/gif') !== '') {
    					$ext = '.gif';
    				} elseif (strstr($type, 'image/png') !== '') {
    					$ext = '.png';
    				}
    
    				$photo = __ROOT__ . "/uploads/Goods/" . date("Y-m-d", time()) . '/' . time() . $key . $ext;//生成图片地址和文件并加上图片后缀
    
    				// 生成文件
    				file_put_contents($photo, base64_decode($datas), true);//解码图片进行保存
    			}
    			$this->ajaxReturn("ok");
    		}
    	}
```
接收到的数据就是一个二维数组，内容类似：
```php
    ["data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABgk..",data:image\/jpeg;base64,\/9j\HBwYIChAKCgk.."]
```
大概就是二维数组中的每个数组都是一个很长的字符串，其中base64后面就是经转码后的图片。我们要做的就是将图片还原然后保存。

