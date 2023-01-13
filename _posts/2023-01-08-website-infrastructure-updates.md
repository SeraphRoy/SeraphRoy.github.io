---
title: Website Infrastructure Updates
date: 2023-01-08T14:28:56.639-08:00
categories:
 - Jekyll
tags:
  - Blog
  - Jekyll
  - CMS
  - Netlify
mathjax: false
---
There were some major updates to the infrastructure of this website so just to note them down before I forget.

# Theme

I switched from my own theme [https://github.com/SeraphRoy/GaeBlogx](https://github.com/SeraphRoy/GaeBlogx) to something more well-known https://mmistakes.github.io/minimal-mistakes/. I was never an expert on frontend stuffs, not even right now. My original theme was a fork of [https://github.com/Gaohaoyang/gaohaoyang.github.io](https://github.com/Gaohaoyang/gaohaoyang.github.io) and added a few additional features I wanted. It was one of the best themes at that time about 5 years ago and with the additional features I added it did capture pretty much all the requirements I needed. Now that it's been almost 5 years since then, other Jekyll theme are becoming more and more mature. It doesn't really make sense for me to maintain my theme given that other better themes are actively maintained. Instead of adding yet another feature I needed on top of mine, I chose to adapt a more well-known theme.





# CMS

CMS (content management service) is something that I have been wanting since the beginning. To my supprise finding a good one for Jekyll is extremely difficult. I've surveyed and tried multiple solutions on the market and currently I end up using [https://github.com/StaticJsCMS/static-cms](https://github.com/StaticJsCMS/static-cms) . It isn't perfect but at least it's better than most solutions available. Here are the ones I tried

## [Jekyll-Admin](https://github.com/jekyll/jekyll-admin)

This is a jekyll plugin which intends to only work with `jekyll serve` locally. I mean with nowadays all these great markdown editors why would I need such plugin locally? :)





## [Tina.io](https://tina.io/)

A cloud CMS solution that can work with github pages. Sounds perfect isn't it? Well it was mainly designed for [NextJs](https://nextjs.org) and the support for Jekyll and [Liquid](https://jekyllrb.com/docs/liquid/) is pretty poor. There are special syntax in Liquid that tina.io isn't able to parse and understand. The worst part is, if it fails to parse a specific string, the entire markdown preview isn't gonna funciton. It does support adding your own specific logics of parsing, but still this is very annoying.





Another issue I have is with accessing my static assets with editting online (not in local mode). For some reason, the same asset configuration that works locally doesn't work after I deploy it. Doesn't really worth the effort of me filing a bug and waiting for a solution or fix, and instead I go look for other solutions.





## [NetlifyCMS](https://www.netlifycms.org/)

The CMS solution that comes with Netlify app. All other stuffs work great except for one thing: non-English characters editting. It's a bit difficult to describe the issue in words but here is the github issue [https://github.com/netlify/netlify-cms/issues/5306](https://github.com/netlify/netlify-cms/issues/5306). The issue is mainly due to a legacy dependency. Given that this issue exists for years and there's no sign of fixing it, plus there are 750+ open issues with 200+ open bugs on github, I am just not confident that this project is well-maintained and thus again have to find something else.





## [Static-CMS](https://github.com/StaticJsCMS/static-cms)

This is the one that I am currently using to write this post. This is a fork of NetlifyCMS with additional updates and features that the author wants. It is still very new and there are still some minor glitches, but at least the **BASIC** functionality is working, unlike the other ones. I am sticking with it for now and will continue to observe the future updates.





# Hosting

I migrated the hosting solution from Github pages to Netlify. Originally it was mainly to use their CMS solution like I mentioned above, but now I am moving away from it. Besides CMS there are a few other solutions of Netlify and good integration plugins with other useful tools that I don't have to configure and install manually on github. I am not relying on it too much but it's been a ok experience so far.
