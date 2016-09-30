---
layout: project.cn
title: 项目
tags: tbox,xmake,gbox,ios trace,数字识别,开源项目,工程,图形渲染,opengl
permalink: /project/
icon: bookmark
---



<div class="grid">
</div>

<script src="{{ " /js/masonry.pkgd.min.js " | prepend: site.baseurl }}" charset="utf-8"></script>
<script src="{{ " /js/projects.cn.js " | prepend: site.baseurl }}" charset="utf-8"></script>


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
