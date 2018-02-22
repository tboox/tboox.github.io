---
layout: default
title: Categories
permalink: /category/
icon: th-list
---


<div class="page clearfix">
    <div class="left">
        <h1>{{page.title}}</h1>
        <hr>
        <ul>
            {% for category in site.categories %}
            <h2 id="{{category | first}}">{{category | first}}</h2>
                {% for posts in category  %}
                    {% for post in posts %}
                        {% if post.url %}
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
                        {% endif %}
                    {% endfor %}
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
                    {% for category in site.categories%}
                        <li>
                            <a class="scroll" href="#{{ category | first }}">
                                {{ category | first }} ({{ category | last | size }})
                            </a>
                        </li>
                    {% endfor %}
                </ul>
            </div>
            
            <!-- google ads -->
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
                var cpro_id = isPC()? "{{site.baiduads_slide_id0}}" : "";
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

    <!-- baidu ads -->
    {% if site.baiduads_slide_id3 %}
    <script type="text/javascript">
        var cpro_id = isPC()? "" : "{{site.baiduads_slide_id3}}";
    </script>
    <script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/cm.js"></script>
    {% endif %}
</div>
<script src="{{ "/js/pageContent.js " | prepend: site.baseurl }}" charset="utf-8"></script>

