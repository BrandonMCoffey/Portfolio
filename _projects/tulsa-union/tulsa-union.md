---
layout: portfolio-page
permalink: /projects/tulsa-union/
priority: 4
filters:
- gallery
- vastlab

title: Tulsa Union
tagline: Metaverse Football Stadium
description: A Portfolio Piece
thumbnail: tulsa-union-icon.png
tags: Unity Spatial
role: Programmer
year: 2023
---

<iframe class="full aspect16-9" src="https://www.youtube.com/embed/sDWqWFVe_N8?autoplay=1&mute=1&loop=1&list=PLRNKKzTiLuHR3Q5TOn7e0LvNBLOGiivCd" allowfullscreen></iframe>

Tulsa Union's Tuttle Stadium is a Metaverse space created by the [VAST Lab]({{site.url}}/vast-lab/){: target="_blank"} and hosted on [Spatial.io](https://www.spatial.io/){: target="_blank"}. I was the lead developer for the project and implemented the majority of the minigames and other functionality. 

<br>

[Click here to view the Metaverse space for Tulsa Union](https://www.spatial.io/s/Tulsa-Unions-Tuttle-Stadium-64bac1f432b4ffa68becfcc9?share=6279006230809640245){: target="_blank"}.

<br>

The project was featured by Fox News, [click here to view the posting](https://www.fox23.com/news/union-hs-partners-with-university-of-texas-combines-football-and-the-metaverse/article_439dec42-4dd5-11ee-bcc3-236144879db4.html){: target="_blank"}, and was awarded a silver medal at the [Davey Awards](https://daveyawards.com/winners-area/gallery/list/?search=relevantvr&event=1066&award=2){: target="_blank"}.

<br>
<hr>
<br>

The stadium was modeled by [Chris Gauthier](https://www.artstation.com/chrisgauthier), and I assisted in the process of optimizing and lighting the environment for the web-based platform. The lighting is a mixed setup that involves baked lighting, faked volumetrics using cones, and real time lights for the day-night switches that respond to what time of day it is at the actual location.

![](stadium-environment.png)

<br>

Because the site was hosted with Spatial.io, all game logic was coded using Unity's visual scripting. Below is the sode can toss minigame at the center of the stadium, which features automatic game starting and completing, a scrolling led high score board, and networked events for scoring points.

![](game-manager-script.png)
