---
layout: default
---

<script>
<!--
function getqval(qvar) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == qvar){return pair[1];}
    }
    return(false);
}
if (getqval("lang") !== "0") {
    var lang = navigator.language || navigator.userLanguage || navigator.browserLanguage;
    if (lang && lang.substr(0, 2) == "zh") document.location.href = '/cn?lang=0';
    else document.location.href = '/?lang=0';
}
//-->
</script>

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
                    {% assign count = 0 %}
                    {% for post in site.posts offset: 0 %}
                    {% if count < 5 %}
                        {% unless post.url contains '/cn/' %}
                            <li><a href="{{ post.url }}">{{ post.title }}</a></li>
                            {% assign count = count | plus: 1 %}
                        {% endunless %}
                    {% endif %}
                    {% endfor %}
                </ul>
            </div>

            <!-- wwads -->
            {% if site.wwads_id %}
            <div class="side">
            <div class="wwads-cn wwads-vertical" data-id="{{site.wwads_id}}" style="max-width:255px"></div>
            <script type="text/javascript" charset="UTF-8" src="https://cdn.wwads.cn/js/makemoney.js" async></script>
            </div>
            {% endif %}

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

            <!-- 其他div框放到这里 -->
            <br>
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
                     {% if tag[1].size > 1 %}
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
                  <li><a href="http://github.com/tboox/tbox">tbox</a></li>
                  <li><a href="http://xmake.io">xmake</a></li>
                  <li><a href="https://github.com/tboox">github</a></li>
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

            <!-- chitika ads -->
            {% if site.chitika_ads_en %}
            <script type="text/javascript">
              ( function() {
                if (window.CHITIKA === undefined) { window.CHITIKA = { 'units' : [] }; };
                var unit = {"calltype":"async[2]","publisher":"{{site.chitika_ads_en}}","width":265,"height":250,"sid":"Chitika Default","color_button":"{{site.chitika_ads_color_button}}","color_button_text":"473047"};
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

