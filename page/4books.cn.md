---
layout: book.cn
title: 书柜
tags: 图书,计算机,编程,开发,软件开发,逆向工程
permalink: /book/
icon: book
---

推荐一些个人觉得还不错的图书，有兴趣的同学可以看看。。

<div class="grid">
</div>

{% if site.amazon_ads_cn %}

<script src="{{ " /js/masonry.pkgd.min.js " | prepend: site.baseurl }}" charset="utf-8"></script>
<script src="{{ " /js/books.cn.js " | prepend: site.baseurl }}" charset="utf-8"></script>

#### 更多图书：<a target="_blank"  href="http://www.amazon.cn/b?_encoding=UTF8&camp=536&creative=3200&linkCode=ur2&node=658414051&tag={{site.amazon_ads_cn}}">去逛逛</a><img src="http://ir-cn.amazon-adsystem.com/e/ir?t={{site.amazon_ads_cn}}&l=ur2&o=28" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />

{% endif %}


{% include comments.html %}


<!-- baidu ads -->
{% if site.baiduads_slide_id1 %}
<script type="text/javascript">
    var cpro_id = "{{site.baiduads_slide_id1}}";
</script>
<script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/f.js"></script>
{% endif %}

{% if site.baiduads_slide_id2 %}
<script type="text/javascript">
    function isPC(){    
        var userAgentInfo = navigator.userAgent;  
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");    
        var flag = true;    
        for (var v = 0; v < Agents.length; v++) {    
            if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }    
        }    
        return flag;    
    }  
    var cpro_id = !isPC()? "{{site.baiduads_slide_id2}}" : "";
</script>
<script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/cm.js"></script>
{% endif %}
