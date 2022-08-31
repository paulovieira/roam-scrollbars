# roam-scrollbars: a Roam Research extension to show and customize scrollbars

## Introduction

The default Roam theme [doesn't show scrollbars](https://github.com/paulovieira/roam-scrollbars/issues/1) in some important places. This extension solves that issue by adding a little bit of minimal css to show the scrollbars again. It also allows you to configure some aspects related to scrollbars, namely:

- set the scrollbar width in the main view and sidebar
- set the scrollbar width and maximum height of code blocks
- set the scrollbar width and maximum height of block embeds and page embeds
	- for block embeds, you can optionally make the scroll start only in the children (of the block being embeded)

The following screenshots gives a before/after overview. In the right image notice the scrollbars in the main view and sidebar, and the height of the block embed and code block. In this case the settings "maximum height" were configured with "30%" (a percentage of the screen height). However you also can disable this feature.

<p align="center">
	<img 
		alt="Default Roam theme without the scrollbars plugin" 
		title="Default Roam theme without the scrollbars plugin" 
		src="https://user-images.githubusercontent.com/2184309/187561666-418598c2-adf3-4e92-a90b-a61ebb1944e8.jpg" 
		width="47%"
	>
	&nbsp; &nbsp; 
	<img 
		alt="Default Roam theme with the scrollbars plugin" 
		title="Default Roam theme with the scrollbars plugin" 
		src="https://user-images.githubusercontent.com/2184309/187560809-ee9fb2a7-1363-4aa7-86c9-97b3ab16bf40.jpg" 
		width="47%"
	>
</p>


## Using with custom themes

While this extension is meant to be used with the default Roam theme, you can use it safely with any custom theme. But check if the scrollbars / max-height issues have already been addressed in the custom theme. If so this extension is probably not useful (nevertheless you can still use it to control some aspects of the scrollbars).


## Using the "disabled" option

All settings/features in this extension can be disabled. When the "disabled" option is used, the css relative to that setting is simply not added to Roam. If you notice some inconsistency with other extension or theme loaded in your graph, try to disable the setting in question. In the extreme case where all settings are disabled this extension does nothing!


## Future improvements

- the controls in the settings panel look ugly because of the long descriptions; can we have more control there? how are other extesions doing this?
- detect if the plugin is being loaded in the mobile app in android, and if necessary, don't add the stylesheet (?)
- check if the other types of embeds can also benefit from max-height + scrollbar: PDF embed, Website embed, etc
- what else can be improved? feedback is welcome!
