---
layout: portfolio-page
permalink: /projects/maya-python-qt-tools/
priority: 12
filters:

title: Maya Python QT Tools
tagline: Various Projects
description: 
thumbnail: rig_transplant.png
tags: Maya
role: Python and Maya
year: 2023
---

# Maya Python QT Tools

[Image of Maya Rig side-by-side with Unreal Import]
To allow animators I worked with to export their Maya animations with custom rigs directly into Unreal Engine, I designed a tool to 

[Image of Stacker Tool]
With python and Qt, I built a simple interface to select objects and stack them on each other based on their bounding box sizes.

{% highlight python %}
def run():
    rigCreator = RigTransplant()
    rigCreator.init_gui()


class RigTransplant:
    def __init__(self):
        self.windowName = 'unrealRigCreator'
        self.sourceJointsField = None
        self.sourceJoints = None
        self.destinationJointsField = None
        self.destinationJoints = None

    def init_gui(self):
        # Delete Existing Window if it Exists
        if cmds.window(self.windowName, exists=True):
            cmds.deleteUI(self.windowName)

        # Create Window
        cmds.window(self.windowName, title='Rig Transplant', widthHeight=(250, 300))

        # Content
        cmds.columnLayout(adjustableColumn=True, rowSpacing=5)
        cmds.separator(height=1)
        cmds.text(l='Source Joints')
        self.sourceJointsField = cmds.textField()
        cmds.button(l='Select Joints', command=self.select_source_joints)
        cmds.separator(height=10)
        cmds.text(l='Destination Joints')
        self.destinationJointsField = cmds.textField()
        cmds.button(l='Select Joints', command=self.select_destination_joints)
        cmds.separator(height=10)
        cmds.button(l='Bind Joints (Parent)', command=self.set_parent_constraints)
        cmds.button(l='Bind Joints (Scale)', command=self.set_scale_constraints)
        cmds.separator(height=10)
        cmds.button(label='Close',
                    command=('cmds.deleteUI(\"' + self.windowName + '\", window=True)'))

        # Display Window
        cmds.showWindow(self.windowName)

    def select_source_joints(self, *args):
        selected = cmds.ls(selection=True)
        self.sourceJoints = cmds.listRelatives(selected, ad=True, type='joint')
        cmds.textField(self.sourceJointsField, edit=True,
                       tx=str(self.sourceJoints))

    def select_destination_joints(self, *args):
        selected = cmds.ls(selection=True)
        self.destinationJoints = cmds.listRelatives(selected, ad=True, type='joint')
        cmds.textField(self.destinationJointsField, edit=True,
                       tx=str(self.destinationJoints))

    def set_parent_constraints(self, *args):
        sj = self.sourceJoints
        dj = self.destinationJoints
        for x in range(0, len(sj)):
            if not cmds.objExists(sj[x]):
                continue
            if cmds.objectType(sj[x], isType='joint') == 1:
                cmds.select(d=True)
                cmds.parentConstraint(sj[x], dj[x])

    def set_scale_constraints(self, *args):
        sj = self.sourceJoints
        dj = self.destinationJoints
        for x in range(0, len(sj)):
            if not cmds.objExists(sj[x]):
                continue
            if cmds.objectType(sj[x], isType='joint') == 1:
                cmds.select(d=True)
                cmds.scaleConstraint(sj[x], dj[x])
{% endhighlight %}

![](rig_transplant.png){: class="full" }
