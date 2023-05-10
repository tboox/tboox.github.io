---
layout: default.cn
title: 标记
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
           {% if post_first.url contains '/cn/' %}
            {{ tag[0] }}
           {% endif %}
           {% endif %}
          {% endfor %}
        {% endcapture %}
        {% assign sortedtags = tags | split:' ' | sort %}

        <ul>
        {% for tag in sortedtags %}
          <h2 id="{{ tag }}">{{ tag }}</h2>
          {% for post in site.tags[tag] %}
            {% if post.url contains '/cn/' %}
            <li>
                <time>
                {{ post.date | date:"%F" }} {{ post.date | date: "%a" }}.
                </time>
                <a class="title" href="{{ post.url }}">{{ post.title }}</a>

                {% include category.cn.html %}
                {% include tag.cn.html %}
            </li>
          {% endif %}
          {% endfor %}
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
                    内容
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

            <!-- wwads -->
            {% if site.wwads_id %}
            <div class="side">
            <div class="wwads-cn wwads-vertical" data-id="{{site.wwads_id}}" style="max-width:200px"></div>
            <script type="text/javascript" charset="UTF-8" src="https://cdn.wwads.cn/js/makemoney.js" async></script>
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


            <!-- qqgroup -->
            <br>
            <div class="side">
                <div>
                    <i class="fa fa-external-link"></i>
                    技术交流群（QQ）
                </div>
                <img src="/static/img/qqgroup.png" alt="qqgroup" width="256" height="284">
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

