---
layout: default
---

<div class="page clearfix" index>
    <div class="left">
        <h1>{{site.title}}</h1>
        <small>{{site.description}}</small>
        <hr>
        <ul>
            {% for post in paginator.posts %}
              <li>
                <h2>
                  <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
                </h2>
                <div class="label">
                    <div class="label-card">
                        <i class="fa fa-calendar"></i>{{ post.date | date: "%F" }}
                    </div>
                    <div class="label-card">
                        {% if post.author %}<i class="fa fa-user"></i>{{ post.author }}
                        {% endif %}
                    </div>
                    <div class="label-card">
                        {% if page.meta %}<i class="fa fa-key"></i>{{ page.meta }}  {% endif %}
                    </div>

                    <div class="label-card">
                    {% include category.html %}
                    </div>

                    <div class="label-card">
                    {% include tag.html %}
                    </div>
                </div>
                <div class="excerpt">
                    {{post.excerpt}}
                </div>
                <div class="read-all">
                    
                    {% assign hasChinese = '' %}
                    {% for post2 in site.posts %}
                        {% if post2.url contains '/cn/' %}
                        {% assign postHasChinese = false %}
                            {% if postHasChinese == false and hasChinese.size < 6 and post2 != post and post2.url contains post.url %}
                                {% if hasChinese.size == 0 %}
                                <a href="{{ post2.url | prepend: site.baseurl }}"><i class="fa fa-language"></i>阅读中文</a>
                                {% endif %}
                                {% capture hasChinese %}{{ hasChinese }}*{% endcapture %}
                                {% assign postHasChinese = true %}
                            {% endif %}
                        {% endif %}
                    {% endfor %}

                    <a href="{{ post.url | prepend: site.baseurl }}"><i class="fa fa-newspaper-o"></i>Read All</a>
                </div>
                <hr>
              </li>
            {% endfor %}
        </ul>

        <!-- Pagination links -->
        <div class="pagination">
          {% if paginator.previous_page %}
            <a href="/index.html" class="previous"><i class="fa fa-angle-double-left"></i></a>
            <a href="{{ paginator.previous_page_path }}" class="previous"><i class="fa fa-angle-left"></i></a>
          {% else %}
            <span class="previous disable"><i class="fa fa-angle-double-left"></i></span>
            <span class="previous disable"><i class="fa fa-angle-left"></i></span>
          {% endif %}
          <span class="page_number ">{{ paginator.page }}/{{ paginator.total_pages }}</span>
          {% if paginator.next_page %}
            <a href="{{ paginator.next_page_path }}" class="next"><i class="fa fa-angle-right"></i></a>
            <a href="/page{{ paginator.total_pages }}" class="next"><i class="fa fa-angle-double-right"></i></a>
          {% else %}
            <span class="next disable"><i class="fa fa-angle-right"></i></span>
            <span class="next disable"><i class="fa fa-angle-double-right"></i></span>
          {% endif %}
        </div>

    </div>
    <!-- <button class="anchor"><i class="fa fa-anchor"></i></button> -->
    <div class="right">
        <div class="wrap">
            <div class="side">
                <div>
                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                    Recent Posts
                </div>
                <ul class="content-ul" recent>
                    {% for post in site.posts offset: 0 limit: 10  %}
                    {% unless post.url contains '/cn/' %}
                        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
                    {% endunless %}
                    {% endfor %}
                </ul>
            </div>

            <!-- Content -->
            <div class="side ">
                <div>
                    <i class="fa fa-th-list"></i>
                    Categories
                </div>
                <ul class="content-ul" cate>
                    {% for category in site.categories order:ascending %}
                    <li>
                        <a href="{{ root_url }}/{{ site.category_dir }}#{{ category | first }}" class="categories-list-item" cate="{{ category | first }}">
                            <span class="name">
                                {{ category | first }}
                            </span>
                            <span class="badge">{{ category | last | size }}</span>
                        </a>
                    </li>
                    {% endfor %}
                </ul>
            </div>
            <!-- 其他div框放到这里 -->
            <div class="side">
                <div>
                    <i class="fa fa-tags"></i>
                    Tags
                </div>
                <div class="tags-cloud">
                    {% assign first = site.tags.first %}
                    {% assign max = first[1].size %}
                    {% assign min = max %}
                    {% for tag in site.tags offset:1 %}
                      {% if tag[1].size > max %}
                        {% assign max = tag[1].size %}
                      {% elsif tag[1].size < min %}
                        {% assign min = tag[1].size %}
                      {% endif %}
                    {% endfor %}

                    {% if max == min %}
                        {% assign diff = 1 %}
                    {% else %}    
                        {% assign diff = max | minus: min %}
                    {% endif %}

                    {% for tag in site.tags %}
                     {% if tag[1].size > 0 %}
                     {% assign post_first = tag[1][0] %}
                     {% unless post_first.url contains '/cn/' %}
                      {% assign temp = tag[1].size | minus: min | times: 36 | divided_by: diff %}
                      {% assign base = temp | divided_by: 4 %}
                      {% assign remain = temp | modulo: 4 %}
                      {% if remain == 0 %}
                        {% assign size = base | plus: 9 %}
                      {% elsif remain == 1 or remain == 2 %}
                        {% assign size = base | plus: 9 | append: '.5' %}
                      {% else %}
                        {% assign size = base | plus: 10 %}
                      {% endif %}
                      {% if remain == 0 or remain == 1 %}
                        {% assign color = 9 | minus: base %}
                      {% else %}
                        {% assign color = 8 | minus: base %}
                      {% endif %}
                      <a href="{{ root_url }}/{{ site.tag_dir }}#{{ tag[0] }}" style="font-size: {{ size }}pt; color: #{{ color }}{{ color }}{{ color }};">{{ tag[0] }}</a>
                    {% endunless %}
                    {% endif %}
                    {% endfor %}
                </div>
            </div>

            <div class="side">
                <div>
                    <i class="fa fa-external-link"></i>
                    Links
                </div>
                <ul class="content-ul" links>
                  <li><a href="http://github.com/waruqi/tbox">tbox</a></li>
                  <li><a href="http://www.xmake.io">xmake</a></li>
                  <li><a href="https://github.com/waruqi">github</a></li>
                </ul>
            </div> 

            {% if site.adsbygoogle_client %}
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
            {% if site.amazon_ads_en %}
            <div class="side" ads>
            <iframe src="//rcm-na.amazon-adsystem.com/e/cm?o=1&p=12&l=ur1&category=books&banner=0Y6NKQA0Z279VVYY1382&f=ifr&linkID=e872b59911f21bc2cb49f64e7db3fa73&t={{site.amazon_ads_en}}&tracking_id={{site.amazon_ads_en}}" width="265" height="243" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0"></iframe>
            </div>
            {% endif %}

</div>
<!-- <script src="{{ "/js/scroll.min.js " | prepend: site.baseurl }}" charset="utf-8"></script> -->
<!-- <script src="{{ "/js/pageContent.js " | prepend: site.baseurl }}" charset="utf-8"></script> -->
