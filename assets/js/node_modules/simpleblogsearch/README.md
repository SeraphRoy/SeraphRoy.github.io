# SimpleBlogSearch

A small library that does searching in your static blog contents. In theory should
work with any blog generator like Jekyll and Hexo as long as it generates
data for all of your blog posts.

This is motivated by [hexo-theme-freemind](https://github.com/wzpan/hexo-theme-freemind/blob/master/source/js/search.js),
and [Simple-Jekyll-Search](https://github.com/christian-fei/Simple-Jekyll-Search).
The hexo one is just too buggy and lacks features I want, so I end up rewriting it
to fit my needs. The codes currently are very simple and don't support as many features
as Simple-Jekyll-Search, so I think the best thing to do is to have
Simple-Jekyll-Search integrate the functionalities that are useful.

## Features

- Custom data processing function to make it work with any static blog generator
- Search in post contents and title
- Highlight matched contents
- Regex support
- Skip math sections

## Installation

  `npm install simpleblogsearch`

## Demo

See [my own blog](https://www.gaeblogx.com).

## Usage

Add the following script to your html file (change parameters accordingly):

```
<script>
SimpleBlogSearch({
   searchDataPath: '{{ site.baseurl }}/assets/search_data.json',
   dataType: 'json',
   processDataFunc: function(data){ return data },
   searchInputID: 'search_box',
   resultsDivID: 'search_results',
   resultULClass: 'content-ul search-ul content-side',
   highlightKeywordClass: 'search_keyword',
   limit: 4,

});
</script>
```

See [my own theme](https://github.com/SeraphRoy/GaeBlogx) as an example.
