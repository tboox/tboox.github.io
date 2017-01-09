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
            <div class="side">
                <div>
                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                    最近文章
                </div>
                <ul class="content-ul" recent>
                    {% assign count = 0 %}
                    {% for post in site.posts offset: 0 %}
                    {% if count < 10 %}
                        {% if post.url contains '/cn/' %}
                            <li><a href="{{ post.url }}">{{ post.title }}</a></li>
                            {% assign count = count | plus: 1 %}
                        {% endif %}
                    {% endif %}
                    {% endfor %}
                </ul>
            </div>

            <!-- Content -->
            <div class="side ">
                <div>
                    <i class="fa fa-th-list"></i>
                    分类
                </div>
                <ul class="content-ul" cate>
                    {% for category in site.categories order:ascending %}
                    <li>
                        <a href="{{ root_url }}/cn/{{ site.category_dir }}#{{ category | first }}" class="categories-list-item" cate="{{ category | first }}">
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

            <div class="side">
                <div>
                    <i class="fa fa-external-link"></i>
                    链接
                </div>
                <ul class="content-ul" links>
                  <li><a href="http://github.com/waruqi/tbox">tbox</a></li>
                  <li><a href="http://www.xmake.io">xmake</a></li>
                  <li><a href="https://github.com/waruqi">github</a></li>
                  <li><a href="http://suppore.cn">懒人的小窝</a></li>
                  <li><a href="http://crackerme.github.io/">愛尚丨輕博客</a></li>
                  <li><a href="https://blog.6ag.cn">六阿哥博客</a></li>
                  <li><a href="http://www.acgxt.com">七空幻音</a></li>
                  <li><a href="http://blog.a0z.me">Ghosty Core</a></li>
                  <li><a href="http://www.0xsky.com">xSky实验室</a></li>
                </ul>
            </div> 

            <!-- weixin -->
            <div class="side">
                <div>
                    <i class="fa fa-external-link"></i>
                    微信公众号
                </div>
                <img src="/static/img/weixin_public.jpg" alt="weixin" width="256" height="256">
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
            {% if site.baiduads_slide_id0 %}
            <script type="text/javascript">
                var cpro_id = "{{site.baiduads_slide_id0}}";
            </script>
            <script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/c.js"></script>
            {% endif %}

        </div>
    </div>
</div>

<!-- baidu ads -->
{% if site.baiduads_slide_id1 %}
<script type="text/javascript">
    var cpro_id = "{{site.baiduads_slide_id1}}";
</script>
<script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/c.js"></script>
{% endif %}

{% if site.baiduads_slide_id2 %}
<script type="text/javascript">
    function isPC(){    
        var userAgentInfo = navigator.userAgent;  
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");    
        var flag = true;    
        for (var v = 0; v < Agents.length; v++) {    
            if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }    
        }    
        return flag;    
    }  
    var cpro_id = !isPC()? "{{site.baiduads_slide_id2}}" : "";
</script>
<script type="text/javascript" src="http://cpro.baidustatic.com/cpro/ui/cm.js"></script>
{% endif %}
