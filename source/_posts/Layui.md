---
title: Layui相关技巧
date: 2021-12-30 21:59:41
categories: 前端
tags:
	- Layui
---
1.添加半遮罩请求中状态弹出层

```javascript
load = layer.load(1,{shade:[0.5,'#000']});
```

2.刷新弹出层父级页面

```javascript
parent.location.reload();
```

3.渲染的按钮无法绑定事件时使用此方法

```javascript
$(document).on('click',"#export",function(){}}
```

4.单页显示表格所有数据

```javascript
table.render({
    elem: '#test0'
    ,limit: Number.MAX_VALUE // 数据表格默认全部显示
    ,cols: [[
        {field:'nodeSort',width: 180, title: '节点顺序'}
        ,{field:'nodeName',width: 180, title: '节点名称'}
        ,{field:'userName',width: 687, title: '用户名称'}
    ]]
    ,id: 'testReload0'
    ,data:{}

});
```



5.区间金额验证 

```javascript
if(moneyVerify('gteMoney','lteMoney') === false){
                    return false
                }
```

```javascript
    function moneyVerify(starts,ends,msg=''){
        var start = $('#'+starts);
        var end = $('#'+ends);

        var pattern = new RegExp(/^\d+$/);
        if (start.val() || end.val())
        {
            if (start.val() && end.val())
            {
                if (pattern.exec(start.val()) == null )
                {
                    var layer4 = layer.open({
                        type: 1
                        , title: '提示' //防止重复弹出
                        , content: '<div style="padding: 20px 100px;">' + '仅支持输入0及以上的正整数' + '</div>'
                        , btn: ['确定']
                        , btnAlign: 'c' //按钮居中
                        , shade: 0 //不显示遮罩
                        , yes: function () {
                            layer.close(layer4);
                        }
                    });
                    return false
                }
                if (pattern.exec(end.val()) == null )
                {
                    var layer4 = layer.open({
                        type: 1
                        , title: '提示' //防止重复弹出
                        , content: '<div style="padding: 20px 100px;">' + '仅支持输入0及以上的正整数' + '</div>'
                        , btn: ['确定']
                        , btnAlign: 'c' //按钮居中
                        , shade: 0 //不显示遮罩
                        , yes: function () {
                            layer.close(layer4);
                        }
                    });
                    return false
                }

                if (eval(start.val()) > eval(end.val()))
                {
                    var layer6 = layer.open({
                        type: 1
                        , title: '提示' //防止重复弹出
                        , content: '<div style="padding: 20px 100px;">' + msg+'开始金额不能大于结束金额' + '</div>'
                        , btn: ['确定']
                        , btnAlign: 'c' //按钮居中
                        , shade: 0 //不显示遮罩
                        , yes: function () {
                            layer.close(layer6);
                        }
                    });
                    return false
                }

            } else if(start.val())
            {
                if (pattern.exec(start.val()) == null )
                {
                    var layer4 = layer.open({
                        type: 1
                        , title: '提示' //防止重复弹出
                        , content: '<div style="padding: 20px 100px;">' + '仅支持输入0及以上的正整数' + '</div>'
                        , btn: ['确定']
                        , btnAlign: 'c' //按钮居中
                        , shade: 0 //不显示遮罩
                        , yes: function () {
                            layer.close(layer4);
                        }
                    });
                    return false
                }

            } else if (end.val())
            {
                if (pattern.exec(end.val()) == null)
                {
                    var layer4 = layer.open({
                        type: 1
                        , title: '提示' //防止重复弹出
                        , content: '<div style="padding: 20px 100px;">' + '仅支持输入0及以上的正整数' + '</div>'
                        , btn: ['确定']
                        , btnAlign: 'c' //按钮居中
                        , shade: 0 //不显示遮罩
                        , yes: function () {
                            layer.close(layer4);
                        }
                    });
                    return false
                }
            }
        }
}
```

