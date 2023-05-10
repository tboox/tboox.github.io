---
layout: default.cn
title: 分类
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
                    内容
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

