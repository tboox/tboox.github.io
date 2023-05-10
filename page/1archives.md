---
layout: default
title: Archives
permalink: /archive/
icon: archive
---

<!-- <h1>Archive of posts with {{ page.type }} '{{ page.title }}'</h1> -->


<div class="page clearfix">
    <div class="left">
        <h1>{{page.title}}</h1>
        <hr>
        <ul>
          {% for post in site.posts %}
            {% unless post.url contains '/cn/' %}

            {% unless post.next %}
              <h2 id="y{{ post.date | date: '%Y' }}">{{ post.date | date: '%Y' }}</h2>
            {% else %}
              {% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
              {% capture nyear %}{{ post.next.date | date: '%Y' }}{% endcapture %}
              {% if year != nyear %}
                <h2 id="y{{ post.date | date: '%Y' }}">{{ post.date | date: '%Y' }}</h2>
              {% endif %}
            {% endunless %}

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
        </ul>


        <!-- baidu ads -->
        {% if site.baiduads_id1 %}
        <script type="text/javascript">
            if (isPC()) {
                (function() {
                    var s = "_" + Math.random().toString(36).slice(2);
                    document.write('<div style="" id="' + s + '"></div>');
                    (window.slotbydup = window.slotbydup || []).push({
                        id: "{{site.baiduads_id1}}",
                        container:  s
                    });
                })();
            }
        </script>
        {% endif %}

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
                    {% assign counter = 0 %}
                        {% for post in site.posts %}
                          {% assign thisyear = post.date | date: "%Y" %}
                          {% assign prevyear = post.previous.date | date: "%Y" %}
                          {% assign counter = counter | plus: 1 %}
                          {% if thisyear != prevyear %}
                            <li><a class="scroll" href="#y{{ post.date | date: '%Y' }}">{{ thisyear }} ({{ counter }})</a></li>
                            {% assign counter = 0 %}
                          {% endif %}
                        {% endfor %}
                </ul>
            </div>

            <!-- wwads -->
            {% if site.wwads_id %}
            <div class="side">
            <div class="wwads-cn wwads-vertical" data-id="{{site.wwads_id}}" style="max-width:255px;height:250px"></div>
            </div>
            {% endif %}

            <!-- baidu ads -->
            {% if site.baiduads_id4 %}
            <br>
            <script type="text/javascript">
                if (isPC()) {
                    (function() {
                        var s = "_" + Math.random().toString(36).slice(2);
                        document.write('<div style="" id="' + s + '"></div>');
                        (window.slotbydup = window.slotbydup || []).push({
                            id: "{{site.baiduads_id4}}",
                            container:  s
                        });
                    })();
                }
            </script>
            {% endif %}


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
            {% if site.baiduads_id0 %}
            <br>
            <script type="text/javascript">
                if (isPC()) {
                    (function() {
                        var s = "_" + Math.random().toString(36).slice(2);
                        document.write('<div style="" id="' + s + '"></div>');
                        (window.slotbydup = window.slotbydup || []).push({
                            id: "{{site.baiduads_id0}}",
                            container:  s
                        });
                    })();
                }
            </script>
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
    {% if site.baiduads_id3 %}
    <script type="text/javascript">
        if (!isPC()) {
            (function() {
                var s = "_" + Math.random().toString(36).slice(2);
                document.write('<div style="" id="' + s + '"></div>');
                (window.slotbydup = window.slotbydup || []).push({
                    id: "{{site.baiduads_id3}}",
                    container:  s
                });
            })();
        }
    </script>
    {% endif %}
</div>
<script src="{{ "/js/pageContent.js " | prepend: site.baseurl }}" charset="utf-8"></script>

