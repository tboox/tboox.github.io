---
layout: default.cn
---

<div class="page clearfix" index>
    <div class="left">
        <h1>{{site.title-cn}}</h1>
        <small>{{ site.description-cn }}</small>
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
                    {% include category.cn.html %}
                    </div>

                    <div class="label-card">
                    {% include tag.cn.html %}
                    </div>
                </div>
                <div class="excerpt">
                    {{post.excerpt}}
                </div>
                <div class="read-all">

                    {% assign hasEnglish = '' %}
                    {% for post2 in site.posts %}
                        {% unless post2.url contains '/cn/' %}
                        {% assign postHasEnglish = false %}
                            {% if postHasEnglish == false and hasEnglish.size < 6 and post2 != post and post.url contains post2.url %}
                                {% if hasEnglish.size == 0 %}
                                <a href="{{ post2.url | prepend: site.baseurl }}"><i class="fa fa-language"></i>Read English</a>
                                {% endif %}
                                {% capture hasEnglish %}{{ hasEnglish }}*{% endcapture %}
                                {% assign postHasEnglish = true %}
                            {% endif %}
                        {% endunless %}
                    {% endfor %}

                    <a href="{{ post.url | prepend: site.baseurl }}"><i class="fa fa-newspaper-o"></i>阅读全文</a>
                </div>
                <hr>
              </li>
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

        <!-- Pagination links -->
        <div class="pagination">
          {% if paginator.previous_page %}
            <a href="/cn/index.html" class="previous"><i class="fa fa-angle-double-left"></i></a>
            <a href="{{ paginator.previous_page_path }}" class="previous"><i class="fa fa-angle-left"></i></a>
          {% else %}
            <span class="previous disable"><i class="fa fa-angle-double-left"></i></span>
            <span class="previous disable"><i class="fa fa-angle-left"></i></span>
          {% endif %}
          <span class="page_number ">{{ paginator.page }}/{{ paginator.total_pages }}</span>
          {% if paginator.next_page %}
            <a href="{{ paginator.next_page_path }}" class="next"><i class="fa fa-angle-right"></i></a>
            <a href="/cn/page{{ paginator.total_pages }}" class="next"><i class="fa fa-angle-double-right"></i></a>
          {% else %}
            <span class="next disable"><i class="fa fa-angle-right"></i></span>
            <span class="next disable"><i class="fa fa-angle-double-right"></i></span>
          {% endif %}
        </div>
    </div>
    <!-- <button class="anchor"><i class="fa fa-anchor"></i></button> -->
    <div class="right">
        <div class="wrap">

            <!-- wwads -->
            {% if site.wwads_id %}
            <div class="side">
            <div class="wwads-cn wwads-vertical" data-id="{{site.wwads_id}}" style="max-width:200px"></div>
            <script type="text/javascript" charset="UTF-8" src="https://cdn.wwads.cn/js/makemoney.js" async></script>
            </div>
            {% endif %}

            <div class="side">
                <div>
                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                    最近文章
                </div>
                <ul class="content-ul" recent>
                    {% assign count = 0 %}
                    {% for post in site.posts offset: 0 %}
                    {% if count < 8 %}
                        {% if post.url contains '/cn/' %}
                            <li><a href="{{ post.url }}">{{ post.title }}</a></li>
                            {% assign count = count | plus: 1 %}
                        {% endif %}
                    {% endif %}
                    {% endfor %}
                </ul>
            </div>

            <!-- baidu ads -->
            {% if site.baiduads_id4 %}
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

            <!-- xmake courses -->
            <br>
            <div class="side">
                <div>
                    <i class="fa fa-external-link"></i>
                    xmake 入门课程
                </div>
                <a href="https://xmake.io/#/zh-cn/about/course" target="_blank">
                <img src="/static/img/xmake-course.png" alt="course" width="256" height="193">
                </a>
            </div>

            <!-- wechat public -->
            <br>
            <div class="side">
                <div>
                    <i class="fa fa-external-link"></i>
                    微信公众号
                </div>
                <img src="/static/img/weixin_public.jpg" alt="wechat" width="256" height="284">
            </div>

            <!-- 其他div框放到这里 -->
            <br>
            <div class="side">
                <div>
                    <i class="fa fa-tags"></i>
                    标记
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
                     {% if tag[1].size > 1 %}
                     {% assign post_first = tag[1][0] %}
                     {% if post_first.url contains '/cn/' %}
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
                      <a href="{{ root_url }}/cn/{{ site.tag_dir }}#{{ tag[0] }}" style="font-size: {{ size }}pt; color: #{{ color }}{{ color }}{{ color }};">{{ tag[0] }}</a>
                    {% endif %}
                    {% endif %}
                    {% endfor %}
                </div>
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

            <!-- baidu ads -->
            {% if site.baiduads_id0 %}
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

