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
            <iframe src="//rcm-na.amazon-adsystem.com/e/cm?o=1&p=12&l=ur1&category=books&banner=01MEDV80D9378NXA6202&f=ifr&linkID=ef80848a534a13814aca2786129afa65&t=tboox-20&tracking_id=tboox-20" width="265" height="243" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0"></iframe>
            </div>
        </div>
    </div>
</div>
<script src="{{ "/js/pageContent.js " | prepend: site.baseurl }}" charset="utf-8"></script>
