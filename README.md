# roam-scrollbars: a Roam Research extension to show and customize scrollbars

## Introduction

The default Roam theme [doesn't show scrollbars](https://github.com/paulovieira/roam-scrollbars/issues/1) in some important places. This extension solves that issue by adding a little bit of minimal css to show the scrollbars again. It also allows you to configure some aspects related to scrollbars, namely:

- set the scrollbar width in the main view and sidebar
- set the scrollbar width and maximum height of code blocks
- set the scrollbar width and maximum height of block embeds and page embeds
	- for block embeds, you can optionally make the scroll start only in the children (of the block being embeded)


## Before/after screenshots

Click the images below to see an overview of the changes produced by this extension. Some observations about the "after" image:

- the main view and sidebar now have scrollbars;
- the small block embeds and code blocks have not changed (no need for a scrollbar there);
- the big block embeds and code blocks now have a maximum height (that is, if their contents is big enough, the height is limited and a scrollbar for them is shown);

In this case the "maximum height" settings were configured with "30vh" (a percentage of the viewport height). However you can disable this feature.

<p align="center">
	<img 
		alt="Default Roam theme without the scrollbars extension" 
		title="Default Roam theme without the scrollbars extension" 
		src="https://user-images.githubusercontent.com/2184309/187561666-418598c2-adf3-4e92-a90b-a61ebb1944e8.jpg" 
		width="46%"
		data-comment="46% width and 2 nbsp seems to be the best for 2 side-by-side images"
	>
	&nbsp;&nbsp;
	<img 
		alt="Default Roam theme with the scrollbars extension" 
		title="Default Roam theme with the scrollbars extension" 
		src="https://user-images.githubusercontent.com/2184309/187560809-ee9fb2a7-1363-4aa7-86c9-97b3ab16bf40.jpg" 
		width="46%"
		data-comment="46% width and 2 nbsp seems to be the best for 2 side-by-side images"
	>
</p>

<br>
<br>

Another example:

<p align="center">
	<img 
		alt="Default Roam theme without the scrollbars extension" 
		title="Default Roam theme without the scrollbars extension" 
		src="https://user-images.githubusercontent.com/2184309/188215238-29d1ab2e-a3bd-4f0e-814b-0779c6d374f4.jpg" 
		width="46%"
		data-comment="46% width and 2 nbsp seems to be the best for 2 side-by-side images"
	>
	&nbsp;&nbsp;
	<img 
		alt="Default Roam theme with the scrollbars extension" 
		title="Default Roam theme with the scrollbars extension" 
		src="https://user-images.githubusercontent.com/2184309/188215271-df506a7f-a156-4394-916f-bf42b5d27d02.jpg" 
		width="46%"
		data-comment="46% width and 2 nbsp seems to be the best for 2 side-by-side images"
	>
</p>

Here we have the browser window resized to take half of the screen height. After the extension is loaded we can see some changes in the Shortcuts / Starred pages list and in the search results. Having a scrollbar in the search results is useful to give a hint that there are more results than what is shown. Once again, this features can be disabled.

## Using with custom themes

While this extension is meant to be used with the default Roam theme, you can use it safely with any custom theme. But check if the scrollbars / max-height issues have already been addressed in the custom theme. If so this extension is probably not useful (nevertheless you can still use it to control some aspects of the scrollbars).


## Using the "disabled" option

All settings/features in this extension can be disabled. When the "disabled" option is used, the css relative to that setting is simply not added to Roam. If you notice some inconsistency with other extension or theme loaded in your graph, try to disable the setting in question. In the extreme case where all settings are disabled this extension does nothing!


## Future improvements

- the controls in the settings panel look ugly because of the long descriptions; can we have more control there? how are other extesions doing this?
- [DONE] detect if the extension is being loaded in the mobile app in android, and if necessary, don't add the stylesheet (?)
	- conclusion: in the mobile app, the extension also needs to be loaded; native scrollbars don't work there...
- check if the other types of embeds can also benefit from max-height + scrollbar: PDF embed, Website embed, etc
- what else can be improved? feedback is welcome!
