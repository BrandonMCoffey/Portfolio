---
layout: portfolio-page
permalink: /projects/coffey-utils/
priority: 6
filters:

title: Coffey Utils
tagline: Unity Package for Custom Attributes and Inspector Tools
description: A digital adaptation of the board game, Terraforming Mars.
thumbnail: sound-system.png
tags: Unity
role: Solo Project
year: 2021
---

# Coffey Utils

<br>

### Attributes

![](attributes-demo.png)

{% highlight csharp %}
[Header("Read Only")]
[SerializeField] private float _regularValue;
[SerializeField, ReadOnly] private float _readOnlyValue;

[Header("Highlights")]
[SerializeField, Highlight(0.1f, 1f, 0.1f, HighlightMode.Text)] private bool _greenFieldText;
[SerializeField, Highlight(ColorField.Blue)] private int _blueField;
[SerializeField, Highlight(250, 200, 15)] private float _yellowField;
[SerializeField, Highlight(System.Drawing.KnownColor.Red)] private GameObject _redField;

[Header("Highlight If")]
[SerializeField] private bool _test;
[SerializeField, HighlightIf("_test")] private float _hightlightIfAboveIsTrue;

[Header("Highlight If Null")]
[SerializeField, HighlightIfNull] private GameObject _highlightIfNull;
[SerializeField, HighlightIfNull(ColorField.Green)] private GameObject _highlightIfNull2;

[Header("Optional")]
[SerializeField] private Optional<float> _optionalValue;
[SerializeField] private Optional<Vector3> _optionalValue2;

[Header("Show If")]
[SerializeField] private bool _show;
[SerializeField, ShowIf("_show")] private float _value;

[SerializeField, ShowIf("_show")] private bool _secondardShow;
[SerializeField, ShowIf("_show", "_secondardShow")] private float _secondaryValue;

// Ranged Floats have the following properties: MinValue, MaxValue, GetRandomInRange
// Set a custom valid range using the MinMaxRange attribute
[Header("Ranged Floats")]
[SerializeField, MinMaxRange(-1, 2)] private RangedFloat _customRangedFloat = new RangedFloat(0.5f);
[SerializeField] private RangedFloat _rangedFloat = new RangedFloat(0.5f, 1f);

[Button(Spacing = 20)]
private void NormalButton()
{
    Debug.Log("Runs some code when a button in the inspector is clicked");
}

[Button(Mode = RuntimeMode.OnlyPlaying)]
private void PlayModeOnlyButton() { }

[Button(Mode = RuntimeMode.OnlyEditor)]
private void NotInPlayModeButton() { }

[Button(Spacing = 10, Color = ColorField.Green)]
private void GreenButton() { }

[Button(Color = ColorField.Red)]
private void RedButton() { }
{% endhighlight %}

<br>

### Sound System

![](sound-system.png){: class="full"}
