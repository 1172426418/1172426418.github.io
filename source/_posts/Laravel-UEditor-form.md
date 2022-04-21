---
title: Laravel使用（UEditor,表单验证）
date: 2018-03-23 14:54:40
categories: PHP
tags:
	- laravel
	- UEditor
	- 表单验证
---
1.富文本编辑器（UEditor）
laravel的依赖管理工具composer中可以快速的帮助我们集成ueditor到框架中，配置过程：
<!--more-->
在laravel项目根目录配置composer.json文件，在require中写入：
```php
    "stevenyangecho/laravel-u-editor": "~1.4"
```
然后在cmd模式下输入：composer update （需要将composer配置为全局变量）
```php
    PS E:\wamp\www\blog> composer update
    Loading composer repositories with package information
    Updating dependencies (including require-dev)
    Package operations: 3 installs, 31 updates, 0 removals
     - Updating symfony/polyfill-mbstring (v1.6.0 => v1.7.0): Downloading (100%)
     - Updating symfony/var-dumper (v3.3.13 => v3.4.6): Downloading (100%)
     - Updating symfony/debug (v3.3.13 => v3.4.6): Downloading (100%)
    .......//省略部分内容
    Package manifest generated successfully.
```
更新完成之后，修改laravel的配置文件（config/app.php）:

在 "providers" 这个key 最后加上 ：
```php
    Stevenyangecho\UEditor\UEditorServiceProvider::class
```
在"aliases" 这个key最后加上：
```php
    'UEditor'=>Stevenyangecho\UEditor\UEditorServiceProvider::class
```
配置完之后，命令提示符进入项目的根目录：
```php
    PS E:\wamp\www> cd blog
    PS E:\wamp\www\blog> php artisan vendor:publish
    
    
      [Symfony\Component\Debug\Exception\FatalThrowableError]
      Class 'Stevenyangecho\UEditor\UEditorServiceProvider' not found
```
提示以上的错误要确定之前的步骤是否正确：
```php
    PS E:\wamp\www\blog> php artisan vendor:publish
    
     Which provider or tag's files would you like to publish?:
      [0 ] Publish files from all providers and tags listed below
    .......
     > 0//输入0
    
    .......
    Publishing complete.
```
出现以上信息说明已经配置完成。

一串文件下载配置之后，laravel项目的public目录下会自动建立一个laravel-u-editor的文件夹。这个文件夹里包含的是编辑器本身的JS文件。同时在config文件夹下也会生成一个名为UEditorUpload.php的文件，这个是基础的配置文件。当这些文件都生成之后，说明编辑器已经在项目中集成好了，下一步就可以在视图文件中进行注入了

前端视图中整合ue编辑器：

首先引入JS等文件，因为laravel框架已经帮我们集成好了，直接在视图文件尾部加入
```php
@include('UEditor::head') 即可
```
然后加载编辑器的容器，最后实例化编辑器，这部分比较简单，直接贴代码：

 加载编辑器的容器 
```php
    <div id="detail_info">
    <script id="container" name="content" type="text/plain" style="width: 900px;position:absolute;left:300px;top:120px;">
    {!! html_entity_decode($article->content) !!} //将富文本编辑器内容转义并在页面上显示
    </script>
```
    
 实例化编辑器 
```php
    <script>
    
    var ue = UE.getEditor('container');
    ue.ready(function(){ 
    ue.execCommand('serverparam', '_token', '{{ csrf_token() }}'); //这里添加laravel安全token：便于数据提交
    });
    </script>
```
**UEditor增加视频上传**
UEditor安装好了之后并没有很好的支持插入视频，即便插入视频之后还是显示空白。

查阅了网上相关资料后，可以用一下方法实现视频上传：
修改ueditor.all.js文件（Laravel项目在public\laravel-u-editor下）

ueditor.all.js，17769行

html.push(creatInsertStr( vi.url, vi.width || 420,  vi.height || 280, id + i, null, cl, 'image'));修改为

html.push(creatInsertStr( vi.url, vi.width || 420,  vi.height || 280, id + i, null, cl, 'video'));

7343,7344,7346行，注释掉代码：

var root = UE.htmlparser(html);

me.filterInputRule(root);

html = root.toHtml();

然后清除一下缓存，刷新页面即可添加视频。

![](https://i.imgur.com/yhHVRiN.png)

视频无法预览，但是仍可改变布局和大小。

看到有些博客写将whitList修改为whiteList，好像并没有什么效果。。

**Ueditor图片上传**

在laravel中使用ueditor上传图片依旧会出现上传错误的提示，按F12可以看到：

![](https://i.imgur.com/AREcTBq.png)

说明是一个图片上传的请求地址，原因可能出在上传的图片的保存路径。打开Ueditor扩展包的配置文件`config/UEditorUpload.php`：

    /* 上传图片配置项 */
    'upload' => [
        "imageActionName" => "uploadimage", /* 执行上传图片的action名称 */
        "imageFieldName" => "upfile", /* 提交的图片表单名称 */
        "imageMaxSize" => 2048000, /* 上传大小限制，单位B */
        "imageAllowFiles" => [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 上传图片格式显示 */
        "imageCompressEnable" => true, /* 是否压缩图片,默认是true */
        "imageCompressBorder" => 1600, /* 图片压缩最长边限制 */
        "imageInsertAlign" => "none", /* 插入的图片浮动方式 */
        "imageUrlPrefix" => "", /* 图片访问路径前缀 */
        "imagePathFormat" => "/uploads/ueditor/image/{yyyy}{mm}{dd}/{time}{rand:6}", /* 上传保存路径,可以自定义保存路径和文件名格式 */

将imagePathFormat改为图片保存的目录。Linux系统需要注意权限问题。修改之后重新选择图片本地上传，还是会出现以下问题：

![](https://i.imgur.com/hhv7yHL.jpg)

在这个Upload.php中rand 第二个参数太长导致的，然后找到这个文件，路径：`vendor\stevenyangecho\laravel-u-editor\src\Uploader`下面。然后找到131行，发现：
`$randNum = rand(1, 10000000000) . rand(1, 10000000000);`  更改成
    $randNum = rand(1, 1000000) . rand(1, 1000000);
修改之后上传的问题解决了。Linux系统下还是需要注意文件的路径问题以及权限问题。

**Ueditor图片左右浮动**


```php
    ,xssFilterRules: true
    //input xss过滤
    ,inputXssFilter: true
    //output xss过滤
    ,outputXssFilter: true
```
然后设置元素的白名单过滤：
```php
    ,whitList: {
    ...
    img: [..., 'style'],
    ...
    }
```
使img的style属性忽略。

2.表单验证
直接上代码：
```php
	public function store(Request $request) {
		$data = $request->except('_token');//获取除token外的所有表单数据
		$this->validate($request, [//验证表单值
			'title' => 'requred',//设置title为必填
			'content' => 'integer',//设置content整数

		], [
			'required' => ':attribute 为必填项',//自定义提示文字，默认为英文
			'min' => ':attribute 长度不符合要求',
			'integer' => ':attribute 必须为整数',
		], [
			'title' => '标题',//设置表单字段表示的含义
			'content' => '内容',
		]);//当验证未通过则自动返回表单页面，不会执行以下内容
		$result = DB::table('news')
			->insert($data);//数据插入
		if ($result) {
			return redirect()->back()->with('msg', '操作成功');//插入成功，返回添加页
		} else {
			return redirect()->back()->with('msg', '操作失败')->withInput();//插入失败，返回添加页并提示错误，将原表单数据返回
		}
	}
```
在页面上显示提示：
```php
                                    @if (count($errors) > 0)//$errors 变量在每次请求的所有视图中都可以被使用，你可以很方便的假设 $errors 变量已被定义且进行安全地使用。
                                      <div class="alert alert-danger">//验证未通过则返回错误信息
                                        <ul>
                                          @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                          @endforeach
                                        </ul>
                                      </div>
                                    @endif

                                    <fieldset>
                                        <div class="form-group">
                                            <label class="col-sm-2 control-label">资讯标题</label>
                                          {{session('success')}}//此处返回表单验证通过后闪存中session的信息
                                            <div class="col-sm-6">
                                                <input value="{{old('title')}}" class="form-control" id="title" type="text" name="title"  style="width:40%;"/>
                                            </div>
                                        </div>
```
3.数据筛选和分页
```php
    	public function index(Request $request) {
    		if ($request->input('category_id')) {//判断是否带有分类id
    			$category_id = $request->input('category_id');//获取分类id
    			if ($category_id == 'all') {//判断是否是所有分类
    				$news = DB::table('news')
    					->select('id', 'title', 'category_id', 'addtime')
    					->orderBy("id", "desc")
    					->paginate(10);
    			} else {//否则执行where查询单个分类
    				$news = DB::table('news')
    					->select('id', 'title', 'category_id', 'addtime')
    					->where('category_id', $category_id)
    					->orderBy("id", "desc")
    					->paginate(10);
    			}
    		} else {//不带分类id则默认加上，方便在分页里调用
    			$news = DB::table('news')
    				->select('id', 'title', 'category_id', 'addtime')
    				->orderBy("id", "desc")
    				->paginate(10);
    			$category_id = 'all';
    		}
    
    		$category = DB::table('category')
    			->get();
    		$assign = array(
    			'news' => $news,
    			'category' => $category,
    			'category_id' => $category_id,//用于记住分类id
    		);
    		return view('admin.news.index', $assign);
    	}
```
重点在于：

默认的分页展示写法是这样的：
```php
      {!! $news->links() !!}
```
那么当分页筛选成功后，点击下一页则无法按照条件筛选，因为category_id没有存入到分页的url。我们需要将分类id加入到分页url中才能记住用户选择的分类id：
```php
      {!! $news->appends(array('category_id'=>$category_id))->links() !!}
```
那么生成的分页url是这样的：
```php
    http://www.blog.com/admin/news/index?category_id=1&page=2
```
就能记住用户选择的分类id进行where条件筛选。

