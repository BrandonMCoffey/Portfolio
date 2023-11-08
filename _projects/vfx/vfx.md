---
layout: portfolio-page
permalink: /projects/vfx/
priority: 11
filters:
- gallery

title: Visual FX
tagline: Various Projects
description: Various VFX Projects done in Houdini, and Nuke
thumbnail: no-way-home-vfx.jpg
bordercolor: 595551
tags: Houdini Nuke Maya 
role: Nuke and Houdini
year: 2023
---

<br>

### Spiderman: No Way Home VFX Recreation
#### Houdini VFX and Nuke Comp
<iframe class="full aspect16-9" src="https://www.youtube.com/embed/I4qBPPt2_6M?autoplay=1&mute=1&loop=1&list=PLRNKKzTiLuHTs8TA5Axug4cdoWctY6-OQ" allowfullscreen></iframe>

For a Visual FX project I re-created a shot from Spider-Man: No Way Home, attempting to replicate the VFX and lighting of the shot in Houdini. I started with the lightning and created a similar flow of lightning and then set up a shot using free models online. After some work I got the lighting and composition to look close, so I spent the rest of the time on the VFX and comped it together in Nuke, using cryptomattes and specular AOVs to increase the reflections and make the render look closer to the original shot.

<br>

### Prestige Shot Recreation
#### Houdini VFX and Nuke Comp
![](nuke-prestige-comp.jpg){: class="full" }

On an earlier VFX project, I replicated a shot from the movie Prestige, setting up a basic scene and the lightning. In the Houdini render, there were very little to no reflections on the ground, so in Nuke I added a custom pass of reflections by adding the lighting in multiple times, transforming it, and blurring it slightly to give the look of lightning reflecting off of the floor.
