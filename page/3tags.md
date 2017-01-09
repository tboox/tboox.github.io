---
layout: default
title: Tags
permalink: /tag/
icon: tags
---

<div class="page clearfix">
    <div class="left">
        <h1>{{page.title}}</h1>
        <hr>
        {% capture tags %}
          {% for tag in site.tags %}
           {% if tag[1].size > 0 %}
           {% assign post_first = tag[1][0] %}
           {% unless post_first.url contains '/cn/' %}
            {{ tag[0] }}
           {% endunless %}
           {% endif %}
          {% endfor %}
        {% endcapture %}
        {% assign sortedtags = tags | split:' ' | sort %}

        <ul>
        {% for tag in sortedtags %}
          <h2 id="{{ tag }}">{{ tag }}</h2>
          {% for post in site.tags[tag] %}
           {% unless post.url contains '/cn/' %}
            <li>
                <time>
                {{ post.date | date:"%F" }} {{ post.date | date: "%a" }}.
                </time>
                <a class="title" href="{{ post.url }}">{{ post.title }}</a>

                {% include category.html %}
                {% include tag.html %}
            </li>
           {% endunless %}
          {% endfor %}
        {% endfor %}
        </ul>

    </div>
    <button class="anchor"><i class="fa fa-anchor"></i></button>
    <div class="right">
        <div class="wrap">

            <!-- Content -->
            <div class="side content">
                <div>
                    Content
                </div>
                <ul id="content-side" class="content-ul">
                    {% for tag in sortedtags %}
                    <li>
                        <a class="scroll" href="#{{ tag }}">
                            {{ tag }} ({{ site.tags[tag].size }})
                        </a>
                    </li>
                    {% endfor %}

                </ul>
            </div>
            
            <!-- 其他div框放到这里 -->
            {% if site.adsbygoogle_client %}
            <br>
            <div class="side">
                <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
                <ins class="adsbygoogle"
                     style="display:inline-block;width:336px;height:280px"
                     data-ad-client="{{ adsbygoogle_client }}"
                     data-ad-slot="{{ adsbygoogle_slot }}"></ins>
                <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div> 
            {% endif %}

            <!-- baidu ads -->
            {% if site.baiduads_slide_id0 %}
            <br>
            <script type="text/javascript">
                var cpro_id = "{{site.baiduads_slide_id0}}";
            </script>
            <script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/c.js"></script>
            {% endif %}

            <!-- chitika ads -->
            {% if site.chitika_ads_en %}
            <br>
            <script type="text/javascript">
              ( function() {
                if (window.CHITIKA === undefined) { window.CHITIKA = { 'units' : [] }; };
                var unit = {"calltype":"async[2]","publisher":"{{site.chitika_ads_en}}","width":265,"height":250,"sid":"Chitika Default","color_button":"{{site.chitika_ads_color_button}}","color_button_text":"{{site.chitika_ads_color_button_text}}"};
                var placement_id = window.CHITIKA.units.length;
                window.CHITIKA.units.push(unit);
                document.write('<div id="chitikaAdBlock-' + placement_id + '" class="chitika-ads"></div>');
            }());
            </script>
            <script type="text/javascript" src="//cdn.chitika.net/getads.js" async></script>
            {% endif %}
        </div>
    </div>
</div>
<script src="{{ "/js/pageContent.js " | prepend: site.baseurl }}" charset="utf-8"></script>

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
