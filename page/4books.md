---
layout: book
title: Books
permalink: /book/
icon: book
---



<div class="grid">
</div>

<script src="{{ " /js/masonry.pkgd.min.js " | prepend: site.baseurl }}" charset="utf-8"></script>
<script src="{{ " /js/books.js " | prepend: site.baseurl }}" charset="utf-8"></script>

{% if site.amazon_ads_en %}

#### I want to see <a target="_blank" href="https://www.amazon.com/b?_encoding=UTF8&tag={{site.amazon_ads_en}}&linkCode=ur2&linkId=2cca8cae968e2a6f434c7e7053f07802&camp=1789&creative=9325&node=5">more books</a><img src="//ir-na.amazon-adsystem.com/e/ir?t={{site.amazon_ads_en}}&l=ur2&o=1" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" />

{% endif %}


{% include comments.html %}
