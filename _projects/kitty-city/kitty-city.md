---
layout: portfolio-page
permalink: /projects/kitty-city/
priority: 2
filters:
- featured
- gallery
- vastlab

title: Kitty City
tagline: Augmented Reality Cats
description: A Portfolio Piece
thumbnail: kitty-city-icon-16-9.png
tags: Unity Meta Maya
year: 2023
---

<iframe class="full aspect16-9" src="https://www.youtube.com/embed/nRpLaVBkLVs?autoplay=1&mute=1&loop=1&list=PLRNKKzTiLuHQl-WUGmUibhqL_UkyWO1yo" allowfullscreen></iframe>

Kitty City is an Augmented Reality Project hosted by the [New Mexico Museum of Art - Vladem Contemporary](https://www.nmartmuseum.org/vladem-contemporary/){: target="_blank"} that is based on [Judy Chicago's Kitty City](https://judychicago.com/gallery/kitty-city/kc-artwork-2/). I was the lead developer on the project at the [VAST Lab]({{site.url}}/vast-lab/){: target="_blank"}, and worked on bringing the virtual cat models and animations into Unity for augmented reality on the Meta Quest Pro.

<br>

The project was awarded a
[silver medal in the Davey Awards](https://daveyawards.com/winners-area/gallery/list/?search=relevantvr&event=1066&award=2){: target="_blank"}
in the Emerging Tech category for virtual and immersive experiences in augmented reality.

<br> 

Additionally, it has been mentioned in the following:
- [The New York Times](https://www.nytimes.com/2023/10/19/arts/design/santa-fe-museum-vladem.html?unlocked_article_code=HjHbO4vTy72VSdmlsK3wxISNixs8BZ9m7BL7utkNj-qrZg09UjhRVDoeopTix5X5JkEz2x_I1JGSEzimfOv64v-c88xQYki8FbzvwO_QoyG9cEzyw1m9jhZMqDmQmu5xNQ7cXbhxJCWnsQNfAIzSs1aSaH8zUYCgF6clqVOqoNSxu25pNvgFWsoYEhzI3b0ZUOQnTwVGg2wLQvy27nJYSMuIpzEPVy9hAQdxWmFfSsmsXdmrlMGJMNnOjCnORBZARjYxMMUT0Fu9NhdarRizpZwdFtrSjiOt0QJOoQhkesB_jHcGplnSbwlgalsIEqawsmQIT8MhrYqJdgAnNPeqMNVIu4w&smid=url-share){: target="_blank"}
- [The Art Newspaper](https://www.theartnewspaper.com/2023/08/28/new-mexico-museum-expansion-vladem-contemporary){: target="_blank"}
- [Yahoo Travel and Leisure](https://www.yahoo.com/lifestyle/one-santa-fes-most-exciting-163726145.html?guccounter=1){: target="_blank"}

<br>

Once the cats were modeled, rigged, and animated, the setup process in Unity required a custom solution for handling how the rig was exported from Maya, [mentioned in this posting]({{site.url}}/projects/maya-python-qt-tools/){: target="_blank"}.

![](kitty-city-cats.png){: style="width:56.2%"}
![](kitty-city-rigs.png){: style="width:43.3%"}

<br>

To make the cats able to walk around the room in augmented reality, a floor plan of the gallery had to be constructed and match to the real world. Spatial anchors were used to store the location of the gallery for the experience.

![](gallery-mapping.png)

<!--
Video of setting up the gallery to match the real world? And of the cats in high quality?

<i>The Academic Paper for Kitty City will be posted here once it has been accepted into a Journal</i>

<p style="text-align: center"><a href="{{page.url}}/KittyCityPaper.pdf" target="_blank">View or Download Resume PDF</a>.</p>

<object class="pdf-embed-short" data="{{page.url}}/KittyCityPaper.pdf" type="application/pdf">
    <a href="{{page.url}}/KittyCityPaper.pdf" target="_blank">
        <img style="width: 100%; max-width: 800px;" src="{{page.url}}/KittyCityPaper.png" alt="Resume PDF" />
    </a>
</object>
-->