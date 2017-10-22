---
layout: post
title: "Remote Shell Session Setup: iTerm2+tmux+mosh"
date: 2017-10-09 15:45
categories: ['Random']
tags: Mosh iTerm tmux
author: Yanxi Chen
mathjax: true
---

* content
{:toc}

## Requirements and Comments

Inspired by [My Remote Shell Session Setup](https://blog.filippo.io/my-remote-shell-session-setup/)

My work requires connecting to _a few_ different hosts via ssh. Similar to [My Remote Shell Session Setup](https://blog.filippo.io/my-remote-shell-session-setup/) while still a little different, my personal requirements are as follows:

1. I want one tab of the terminal I'm using to be connected to one remote host
2. I want the shell to survive unaffected with no context loss the following events
    - connection failure
    - route change (like, toggling the VPN or changing Wi-fi)
    - laptop sleep (like, me closing the lid)
    - local terminal restart or laptop reboot
3. I want to be able to copy-paste
4. I want colors
5. I want to launch it with a single command

Some requirements are just copy pasted. Specifically for requirement #1，I used to manage various tabs by using screen/tmux alone. The problem with that approach is when you want to switch to next tab/session, you have to press the escape key (usually ctrl-b or something else) plus another key, which is 3 keys in total. 3 keys are too many for me; I want 2 keys only, so using the tab of the terminal itself might be a good idea. Also, because I need to get access to different hosts, I actually need multiple tmux windows, which is quite inconvenient.

<!--more-->

## My Solution

Similar to [My Remote Shell Session Setup](https://blog.filippo.io/my-remote-shell-session-setup/), I also use iterm2+mosh+tmux, with some different settings. I use Mac and `brew`, but similar commands should be available for linux as well. If you are using Windows, the best solution is to buy a Mac.

### Mosh

`brew install mosh` and replace your usual `ssh` command with `mosh` and it would just works.

### tmux

`brew install tmux`. The main reason why I need tmux is that mosh doesn't quite support scrollback well. In [My Remote Shell Session Setup](https://blog.filippo.io/my-remote-shell-session-setup/), the author suggests one solution but scrolling is way less fluid than native, and most importantly, it requires building mosh from source on the server side and you need `sudo apt-get` to do that. Usually we don't have root access to the server, so I give up the scrollback feature. If you have root access, that's great and follow his steps to get scrollback working. If not, use tmux/screen for scrollback.

### iTerm2

Go to `Preference->Profiles` and click the plus sign at the bottom to create a new profile. I create one profile per remote host I want to connect to. You can specify a name for your profile, and a shortcut key for opening that profile. Then type the mosh command you use to connect to the server in the "Send text at start" field. Here is my example:

![]({{site.url}}/assets/Remote-Shell-Session-Setup-1.png)

where `sshcvp` is the alias of `mosh --ssh='ssh -p 10140' r123s19 -- sh -c "tmux ls | grep -vq attached && tmux a || tmux new"`. Why the heck is that so long? Becasue `"tmux ls | grep -vq attached && tmux a || tmux new"` is just the tmux way of saying `screen -R`, which attaches to an unattached session if one exists or creates a new session if all sessions are attached or there is no session at all. I don't like screen becasue it is not aesthetically appealing so I choose tmux. Why use `sh -c` but not directly run the following command? Because `mosh` doesn't like `grep` and we can't run `grep` directly. Adding `sh -c` is the workaround. [Issue with mosh when running with grep](https://github.com/mobile-shell/mosh/issues/931).

Then you can just open a bunch of different profiles, each per tab, which are connected to different hosts. You can open more tabs than you usually need, just to be safe. Then click `Window->Save Window Arrangement`, which will save your arrangement for all of your tabs, and can be restored easily. To test that, press Cmd-q to close iTerm2. Then open iTerm2 again, go to `Window->Restore Window Arrangement` and select your saved arrangement and resotre it. You can see that all your tabs including your connections to those various hosts come back.
