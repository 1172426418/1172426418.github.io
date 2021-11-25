---
title: PHP无极分类递归方法实现
date: 2018-03-23 14:36:44
categories: PHP
tags:
	- 递归
	- php
---
在做权限相关模块的功能，我们需要给不同的用户指定不同功能权限。

首先我们需要一张分类的表格。类似于这样：

![](https://i.imgur.com/Ix6npqC.png)

其中category_id表示的是分类id，category_name表示的是分类名，pid代表的就是父级分类id，我们可以将顶级的pid设置为0，以递归算法实现父级以下包涵所有子级：
```php
    /**
     * 无极分类递归 选择权限
    *   @param   int $assortPid   要查询分类的父级id
    *   @param   mixed   $tag 上下级分类之间的分隔符
    *   @param   array   $list包涵权限的数组
    *   @return  string  $tree返回的分类树型结构结果 
    *
    */
    function recursiveAssort($assortPid, $tag = '',$list)
    {   
    
    $assort = M('category')->where("pid = $assortPid")->field('category_id, category_name')->order("category_id asc")->select();
    foreach ($assort as $value) {
      if(in_array($value['category_id'], $list)){
    $tree .= '<li>'.$tag.'<input type="checkbox" checked="checked" name="permission[]" value="' . $value['category_id'] . '">' ."<label for='role_2'>".$value['category_name']."</label></li>";
    $tree .= recursiveAssort($value['category_id'], $tag.'├ ',$list);
      }else{
    $tree .= '<li>'.$tag.'<input type="checkbox" name="permission[]" value="' . $value['category_id'] . '">' ."<label for='role_2'>".$value['category_name']."</label></li>";
    $tree .= recursiveAssort($value['category_id'], $tag.'├ ',$list);
      }
    }
    return $tree;
    }
```
比如
```php
$list=[1,3,4];
```
那么分类id为1,3,4的分类将会自动添加钩中的样式。

相当于先遍历出pid=0的所有顶级菜单，然后再次调用自身查询当前顶级菜单下的子级菜单，以此类推，直到查询结束。同时以字符串拼接的方式存放在$tree里。

以下为工作中改良后的版本，实现的效果如下：

![](https://i.imgur.com/UAcpdqu.png)


源代码：
```php
    <li class="level0">
    <a href="">
    <i class="icon-cogs"></i>
    <span class="title">基础设置</span>
    <span class="arrow"></span>
    </a>
    <ul class="sub-menu">
    <li class="level1">
    <a href="">
    <i class="icon-home"></i>
    <span class="title">管理中心</span>
    </a>
    </li>
    <li class="level1">
    <a href="">
    <i class="icon-globe"></i>
    <span class="title">站点配置</span>
    </a>
    </li>
    <li class="level1">
    <a href="">
    <i class="icon-user"></i>
    <span class="title">管理员</span>
    </a>
    </li>
    </ul>
     </li>
```
改版后的递归方法：
```php
    /**
     * 无极分类递归 菜单加载
    *   @param   int $assortPid   要查询分类的父级id
    *   @param   mixed   $tag 上下级分类之间的分隔符
    *   @param   array   $list包涵权限的数组
    *   @return  string  $tree返回的分类树型结构结果 
    *
    */
    function recursiveAssort_menu($assortPid,$list,$tag = '<li class="level0">',$tag2='<ul class="sub-menu">',$tag3='<span class="arrow"></span>',$tag4='</ul></li>')
    {   
    $assort = M('category')->where("pid = $assortPid")->field('category_id, category_name,url,icon')->order("category_id asc")->select();
    
    foreach ($assort as $value) {
      
      if(in_array($value['category_id'], $list)){
    $tree.=$tag;
    $tree.= '<a href="'.$value['url'].'"> <i class="'.$value['icon'].'"></i><span class="title">'.$value['category_name'].'</span>'.$tag3.'</a>'.$tag2;
    $tree.= recursiveAssort_menu($value['category_id'],$list,'<li class="level1">','','','</li>');
    $tree.=$tag4;
      
     
      }
      
    }
    return $tree;
    }
```