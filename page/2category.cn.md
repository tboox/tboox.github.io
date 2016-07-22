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


            <!-- amazon ads -->
            <br>
            <div class="side" ads>
            <iframe src="http://rcm-cn.amazon-adsystem.com/e/cm?t=tboox-23&o=28&p=12&l=ur1&category=books&banner=13KHSWM8QK53P2BAMKG2&f=ifr" width="265" height="243" scrolling="no" border="0" marginwidth="0" style="border:none;max-width:800px;max-height:600px;" frameborder="0"></iframe>
            </div>
        </div>
    </div>
</div>
<script src="{{ "/js/pageContent.js " | prepend: site.baseurl }}" charset="utf-8"></script>