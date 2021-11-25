---
title: php-队列和栈
date: 2018-08-23 20:02:29
categories: PHP
tags:
	- 队列
	- 栈
---
PHP里面没有栈和队列，但是可以通过数组来模拟，主要用到以下几个函数：
```php
    array_push   数组末尾增加一个元素 
    
    array_pop　　数组末尾删除一个元素 
    
    array_shift　数组头部删除一个元素
```
先看栈：
```php
    <?php
    
     class Stack{
     public static $dataInfo =  array();
     public static $theMax= 10;
     public static $length=0;
    // public static $stackInfo;

     public function addData($data){
         if(self::$length >= self::$theMax){
             return false;
         }else{
           array_push(self::$dataInfo,$data);
           self::$length ++; 
         }
         
     }
     public function outData(){
         if(self::$length<=0 ){
             
             return false;
         }else{
            $data = array_pop(self::$dataInfo);
            self::$length --;
             return $data;
         }
         
         
     }
     
     public function getAll(){
         foreach (self::$dataInfo as $value) {
             // code..
             print_r($value);
        }
    }
     
     }
    $a = new Stack();
    $a->addData(1);
    $a->addData(3);
    $a->addData(5);
    $a->getAll();
    print_r($a->outData());


    ?>
```
同理，队列也是一样的 只不过可以把array_pop()换成array_shift()。
栈和队列的区别在于前者是先入后出，像在杯子里放东西一样，先放进去的最后才能拿出来。队列就像排队吃饭一样，先进先出。