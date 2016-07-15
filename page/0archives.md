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
