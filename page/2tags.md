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
            {{ tag[0] }}
          {% endfor %}
        {% endcapture %}
        {% assign sortedtags = tags | split:' ' | sort %}

        <ul>
        {% for tag in sortedtags %}
          <h2 id="{{ tag }}">{{ tag }}</h2>
          {% for post in site.tags[tag] %}
            <li>
                <time>
                {{ post.date | date:"%F" }} {{ post.date | date: "%a" }}.
                </time>
                <a class="title" href="{{ post.url }}">{{ post.title }}</a>

                {% include category.html %}
                {% include tag.html %}
            </li>
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
        </div>
    </div>
</div>
<script src="{{ "/js/pageContent.js " | prepend: site.baseurl }}" charset="utf-8"></script>
