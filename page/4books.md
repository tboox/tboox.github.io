---
layout: book
title: Books
tags: book,programing,software,development,reverse engineering
permalink: /book/
icon: book
---



<div class="grid">
</div>

{% if site.amazon_ads_en %}

<script src="{{ " /js/masonry.pkgd.min.js " | prepend: site.baseurl }}" charset="utf-8"></script>
<script src="{{ " /js/books.js " | prepend: site.baseurl }}" charset="utf-8"></script>

#### I want to see <a target="_blank" href="https://www.amazon.com/b?_encoding=UTF8&tag={{site.amazon_ads_en}}&linkCode=ur2&linkId=2cca8cae968e2a6f434c7e7053f07802&camp=1789&creative=9325&node=5">more books</a><img src="//ir-na.amazon-adsystem.com/e/ir?t={{site.amazon_ads_en}}&l=ur2&o=1" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />

{% endif %}


{% include comments.html %}


<!-- baidu ads -->
{% if site.baiduads_slide_id1 %}
<script type="text/javascript">
    var cpro_id = "{{site.baiduads_slide_id1}}";
</script>
<script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/c.js"></script>
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
