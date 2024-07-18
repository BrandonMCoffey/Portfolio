---
layout: portfolio-page
permalink: /projects/death-bloom/
priority: 3
filters:
- featured
- gallery
- gamelab

title: Death Bloom
tagline: First Person Horror Puzzle Game
description: A First Person Horror Puzzle Game made in Unreal Engine with a team of 40+ students at UTD.
thumbnail: level-02.jpg
tags: Unreal
year: 2023
bordercolor: 505059
---

<iframe class="full aspect16-9" src="https://www.youtube.com/embed/2myu7wgIIP8?autoplay=1&mute=1&loop=1&list=PLRNKKzTiLuHTvUxQyooEYBcjeP0ZtC-N6" allowfullscreen></iframe>

Death Bloom is a first person horror puzzler made by a team of 40+ students at the University of Texas at Dallas within the [Game Lab]({{site.url}}/game-lab/) program over the course of three months. For the game, I worked as a Programmer on various level mechanics and the core player animation blueprint.

![](level-02.jpg){: class="full gap01" }

<br>

<!-- ADD PHOTO OF HANDS WITH BUCKET OR SOMETHING -->

Late into development, the art team decided to add hands to the protagonist, and I was assigned to implement the animations and all that came with it. I setup a state machine to handle every type of animation and event dispatchers to trigger the animations. Most systems and mechanics were already established at this point, so I dove deep into other people’s blueprints and implemented event calls to trigger the animations. Then, to hook up the original animations, I realized I needed a solution to handle a lot of the same animation, but holding different items.

![](hands-state-machine.jpg){: class="full gap01" }
![](hands-enum-blend.jpg){: class="full gap01" }

There were 85 individual animations in the game, most of which consisted of repeated equip, idle, and interact animations for each holdable object. Taking this on as my task, I wanted a way to build a state machine in a smart way, where I didn’t need an insane amount of states. At first I looked into arrays or different ways to select animations based on a value, but nothing came up. Later, I realized there existed an enum blend animation node, which allowed me to set up an enum for each item, and then select the animation based on which item the player was holding in the form of an enum. This allowed for a very controlled state machine that isn’t too complex.

![](level-03.jpg){: class="full gap03" }

The third and final level of the game was the main level that I worked on. I talked with the level designer, artists, and animators on the level consistently, working to bring the level to life. My focus was on the moondial in the center, the vine doors blocking the player's passage, and the monster's art and effect on the world.

<!-- ADD PHOTO OF BLUEPRINT FOR MOONDIAL -->

![](moondial.jpg){: class="full gap03" }

The Moondial is the main mechanic of level 3 which I designed alongside the level designer. Essentially, the player can pick up coins that represent the different phases of the moon and can place them on the dial. Then, when the dial is rotated towards a new moon, the ‘light’ from the moon is siphoned into the lantern, making the lantern brighter and the moon darker. This opens up new passages both by lighting them up and making vines move out of the way (Vines avoid light in the game).

{% comment %}
![](arveado.jpg){: class="full gap03" }
Although I did not design the AI of the monster, I implemented other functionality and set up the art and VFX of the monster.
{% endcomment %} 