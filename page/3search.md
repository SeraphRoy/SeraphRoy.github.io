---
layout: default
title: Search
permalink: /search/
icon: search
type: page
---
<div class="page clearfix" index>
   <div class="left">
      <img src="/assets/search-by-algolia.svg" style="height:2em;">
      <div id="search-searchbar">
      </div>
      <hr>

      <div id="search-hits"> </div>
      {% include algolia.html %}
   </div>
    <div class="right">
        <div class="wrap">

            <div class="side">
                {% include sidebar-search.html %}
            </div>

            <div class="side">
                <div>
                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                    Recent Posts
                </div>
                <ul class="content-ul" recent>
                    {% for post in site.posts offset: 0 limit: 10  %}
                        <li><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
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
                    {% for category in site.categories %}
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
                    {% endfor %}
                </div>
            </div>

            <!-- <div class="side">
                <div>
                    <i class="fa fa-external-link"></i>
                    Links
                </div>
                <ul  class="content-ul">

                </ul>
            </div> -->
        </div>
    </div>
</div>
