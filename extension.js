let internals = {};

internals.extensionId = 'roam-scrollbars';

// dev mode can activated by using the special key/value 'dev=true' in the query string;
// example: https://roamresearch.com?dev=true/#/app/<GRAPH_NAME>

internals.isDev = String(new URLSearchParams(window.location.search).get('dev')).includes('true');
internals.extensionAPI = null;

internals.settingsCached = {
	mainViewScrollbarWidth: null,
	searchResultsScrollbarWidth: null,
	starredPagesScrollbarWidth: null,

	codeBlockScrollbarWidth: null,
	codeBlockMaxHeight: null,

	blockEmbedScrollbarWidth: null,
	blockEmbedMaxHeight: null,
	blockEmbedScrollOnChildren: null,
};

internals.settingsDefault = {
	mainViewScrollbarWidth: '8px',
	searchResultsScrollbarWidth: '6px',
	starredPagesScrollbarWidth: '6px',

	codeBlockScrollbarWidth: '6px',
	codeBlockMaxHeight: '50vh',

	blockEmbedScrollbarWidth: '6px',
	blockEmbedMaxHeight: '50vh',
	blockEmbedScrollOnChildren: false,
};

internals.installedExtensions = {
	roamStudio: false,  // https://github.com/rcvd/RoamStudio
}

function onload({ extensionAPI }) {

	log('ONLOAD (start)');

	internals.extensionAPI = extensionAPI;

	initializeSettings();
	resetStyle();

	log('ONLOAD (end)');
}

function onunload() {

	log('ONUNLOAD (start)');

	removeStyle();

	log('ONUNLOAD (end)');
}

function log() {
	
	let isProd = !internals.isDev;

	if (isProd) { return }

	console.log(`${internals.extensionId} ${Date.now()}]`, ...arguments);
}

function initializeSettings() {

	log('initializeSettings');

	let panelConfig = {
		tabTitle: `Scrollbars${internals.isDev ? ' (dev)' : ''}`,
		settings: []
	};

	// options for main view and sidebar

	panelConfig.settings.push({
		id: 'mainViewScrollbarWidth',
		name: 'Main view and sidebar: scrollbar width',
		description: `
			Values between 8 and 12 should be good for most people. 
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px'],
			onChange: value => { updateSettingsCached({ key: 'mainViewScrollbarWidth', value }) },
		},
	});

	// options for search results list

	panelConfig.settings.push({
		id: 'searchResultsScrollbarWidth',
		name: 'Search results: scrollbar width',
		description: `
			Width of scrollbar in the search results dropdown. 
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px'],
			onChange: value => { updateSettingsCached({ key: 'searchResultsScrollbarWidth', value }) },
		},
	});

	// options for starred pages list

	panelConfig.settings.push({
		id: 'starredPagesScrollbarWidth',
		name: 'Starred pages: scrollbar width',
		description: `
			Width of scrollbar in the starred pages list. 
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px'],
			onChange: value => { updateSettingsCached({ key: 'starredPagesScrollbarWidth', value }) },
		},
	});

	// options for code blocks

	panelConfig.settings.push({
		id: 'codeBlockScrollbarWidth',
		name: 'Code blocks: scrollbar width',
		description: `
			By default Roam will not show any scrollbars in code blocks (even for long code blocks, where the default maximum height of 1000px is reached). 
			Use this setting if you prefer to actually have a scrollbar in code blocks (visible only when the max-height is reached). Use the next setting to customize the respective max-height.
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
			TIP: having this width smaller than the width of the main view is a good choice.
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px'],
			onChange: value => { updateSettingsCached({ key: 'codeBlockScrollbarWidth', value }) },
		},
	});

	panelConfig.settings.push({
		id: 'codeBlockMaxHeight',
		name: 'Code blocks: maximum height',
		description: `
			Roam has a default maximum height of 1000px for code blocks (that's around 48 lines of code). However, it might be convenient to change the unit of that max-height from pixels (absolute unit) to a percentage of the viewport height (relative unit). This is useful to quickly see the beginning/end of the code block in relation to the surrounding blocks, regardless of the sizes of the code block and screen. A subtle border is also added to the code block container.
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '20vh', '30vh', '40vh', '50vh', '60vh', '70vh', '80vh', '90vh', '100vh'],
			onChange: value => { updateSettingsCached({ key: 'codeBlockMaxHeight', value }) },
		},
	});

	// options for block embeds

	panelConfig.settings.push({
		id: 'blockEmbedScrollbarWidth',
		name: 'Block embeds: scrollbar width',
		description: `
			By default Roam will expand the container of a block embed as much as necessary. However when using embeds of "long" blocks (with many children), it might be convenient to have a maximum height for the embed (in which case a scrollbar is necessary). 
			This setting is used to define the width of scrollbars in embeds. The next setting is used to define the respective maximum height. 
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used). 
			TIP: having this width smaller than the width of the main view is a good choice.
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px'],
			onChange: value => { updateSettingsCached({ key: 'blockEmbedScrollbarWidth', value }) },
		},
	});

	panelConfig.settings.push({
		id: 'blockEmbedMaxHeight',
		name: 'Block embeds: maximum height',
		description: `
			This setting defines a maximum height for block embeds. This is useful to quickly see the beginning/end of the embed in relation to the surrounding blocks. 
			The numeric values are a percentage of the viewport height. A subtle border is also added to the block embed container.
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '10vh', '20vh', '30vh', '40vh', '50vh', '60vh', '70vh', '80vh', '90vh', '100vh'],
			onChange: value => { updateSettingsCached({ key: 'blockEmbedMaxHeight', value }) },
		},
	});

	panelConfig.settings.push({
		id: 'blockEmbedScrollOnChildren',
		name: 'Block embeds: scroll only on children',
		description: `
			If this setting is activated, the scroll happens only on the children of the block being embeded. That is, the root block (the one associated to the block reference) will always be visible. The scroll starts only on the children.
			NOTE: for page embededs, this is the only way to have a scroll. 
		`,
		action: {
			type: 'switch',
			onChange: ev => { updateSettingsCached({ key: 'blockEmbedScrollOnChildren', value: ev.target.checked }) },
		},
	});

	let { extensionAPI } = internals;

	extensionAPI.settings.panel.create(panelConfig);

	let settingsKeys = panelConfig.settings.map(o => o.id);

	// cache the panel settings internally for best performance;
	// if necessary, initialize the panel settings with our default values;

	settingsKeys.forEach(key => {

		let value = extensionAPI.settings.get(key);

		if (value == null) {
			value = internals.settingsDefault[key];
			extensionAPI.settings.set(key, value);
		}
		
		updateSettingsCached({ key, value, resetStyle: false });
	});

	// detect if other extensions are loaded; if so we might need to make a few tweaks;

	internals.installedExtensions.roamStudio = (document.querySelectorAll('style[id^="roamstudio"]').length > 0);
}

function updateSettingsCached({ key, value, resetStyle: _resetStyle }) {

	internals.settingsCached[key] = value;

	// styles are reseted here, unless we explicitly turn it off

	if (_resetStyle !== false) {
		resetStyle();
	}

	log('updateSettingsCached', { key, value, 'internals.settingsCached': internals.settingsCached });
}

function resetStyle() {

	// we have to resort to dynamic stylesheets (instead of using extension.css directly) to be able
	// to support the 'disabled' option in our settings (when 'disabled' is selected, we don't add  
	// any css at all relative to that setting/feature); this is the simplest way to avoid having 
	// css rules that might conflict with other extensions/themes;

	removeStyle();

	// use setTimeout to make sure our css styles are loaded after styles from other extensions

	setTimeout(addStyle, internals.isDev ? 200 : 100);
}

function removeStyle() {

	log('removeStyle');

	// we assume no one else has added a <style data-id="roam-scrollbars-28373625"> before, which seems
	// to be a strong hypothesis

	let extensionStyles = Array.from(document.head.querySelectorAll(`style[data-id^="${internals.extensionId}"]`));
	extensionStyles.forEach(el => { el.remove() });
}

function addStyle() {

	log('addStyle');

	let textContent = '';
	let { 
		mainViewScrollbarWidth,
		searchResultsScrollbarWidth,
		starredPagesScrollbarWidth,

		blockEmbedScrollbarWidth,
		blockEmbedMaxHeight,
		blockEmbedScrollOnChildren,

		codeBlockScrollbarWidth,
		codeBlockMaxHeight
	} = internals.settingsCached;

	const mainViewSelector = 'div.rm-article-wrapper';
	const sidebarSelector = 'div#roam-right-sidebar-content';
	
	// using rgba(0,0,0,.25) for the scrollbar color, which was taken from the default theme:
	// see https://roamresearch.com/assets/css/re-com/re-com.min.css
	
	// for starred pages re-use the color from .rm-settings; see issue #1 for more details;

	if (mainViewScrollbarWidth !== 'disabled') {
		const cssForMainView = `

			/* SETTING: "Main view and sidebar: scrollbar width" */

			${mainViewSelector}::-webkit-scrollbar {
				width: ${mainViewScrollbarWidth};
			}

			${mainViewSelector} {
				scrollbar-width: ${getCssValue('scrollbar-width', { width: mainViewScrollbarWidth })};
				scrollbar-color: ${getCssValue('scrollbar-color')};
			}

		`;

		textContent += cssForMainView;
		textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);

		// this setting will also affect the graph list

		let graphListSelector = 'div.rm-graphs__search + div.scroll';
		textContent += replaceAll(cssForMainView, mainViewSelector, graphListSelector);
	}


	if (searchResultsScrollbarWidth !== 'disabled') {
		const searchListSelector = 'div.rm-find-or-create-wrapper ul.rm-find-or-create__menu';

		textContent += `

			/* SETTING: "Search results: scrollbar width" */

			${searchListSelector}::-webkit-scrollbar {
				width: ${searchResultsScrollbarWidth};
			}

			${searchListSelector} {
				scrollbar-width: ${getCssValue('scrollbar-width', { width: searchResultsScrollbarWidth })};
				scrollbar-color: ${getCssValue('scrollbar-color')};
			}

			/* in small viewports the height of the search results needs to be constrained */

			${searchListSelector} {
				max-height: min(calc(80vh - 10px), 400px);
			}

			/* give a little space between the input and the results list */

			div.rm-find-or-create-wrapper div.bp3-transition-container {
				top: 6px !important;
			}

		`;
	}


	if (starredPagesScrollbarWidth !== 'disabled') {
		const starredPagesListSelector = 'div.starred-pages';
		const hoverColor = 'rgba(0,0,0,.2)';
		const trackColor = internals.installedExtensions.roamStudio ? 'rgba(0,0,0,.05)' : '#293742';
		const thumbColor = internals.installedExtensions.roamStudio ? 'rgba(0,0,0,.25)' : '#8A9BA8';

		textContent += `

			/* SETTING: "Starred pages: scrollbar width" */

			${starredPagesListSelector}::-webkit-scrollbar {
				width: ${starredPagesScrollbarWidth};
				background-color: ${trackColor};
			}

			${starredPagesListSelector}::-webkit-scrollbar-thumb {
				background-color: ${thumbColor};
			}

			${starredPagesListSelector} {
				scrollbar-width: ${getCssValue('scrollbar-width', { width: starredPagesScrollbarWidth })};
				scrollbar-color: ${trackColor} ${thumbColor};
			}

		`;

		// add hover color only for roam studio; in the default theme mimic the scrollbar in the settings modal
		// (which doesn't have hover)

		if (internals.installedExtensions.roamStudio) {
			textContent += `

				${starredPagesListSelector}::-webkit-scrollbar:hover {
					background-color: ${hoverColor};
				}

			`;
		}

	}


	if (blockEmbedScrollbarWidth !== 'disabled') {
		if (blockEmbedScrollOnChildren) {
			const cssForMainView = `

				/* SETTING: "Block embeds: scrollbar width" + "Block embeds: scroll only on children" */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container > div.rm-level-1::-webkit-scrollbar {
					width: ${blockEmbedScrollbarWidth};
				}

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container > div.rm-level-1 {
					scrollbar-width: ${getCssValue('scrollbar-width', { width: blockEmbedScrollbarWidth })};
					scrollbar-color: ${getCssValue('scrollbar-color')};
				}

			`;

			textContent += cssForMainView;
			textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
		}
		else {
			const cssForMainView = `

				/* SETTING: "Block embeds: scrollbar width" */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container::-webkit-scrollbar {
					width: ${blockEmbedScrollbarWidth};
				}

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container {
					scrollbar-width: ${getCssValue('scrollbar-width', { width: blockEmbedScrollbarWidth })};
					scrollbar-color: ${getCssValue('scrollbar-color')};
				}

			`;

			textContent += cssForMainView;
			textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
		}

		// for page embeds the only selector that seems to work is the one below; the "scroll on children" option is not available in this case;

		const applyToPageEmbeds = true;

		if (applyToPageEmbeds) {
			const cssForMainView = `

				/* SETTING: "Block embeds: scrollbar width" (for page embeds) */

				${mainViewSelector} div.rm-embed__content::-webkit-scrollbar {
					width: ${blockEmbedScrollbarWidth};
				}

				${mainViewSelector} div.rm-embed__content {
					scrollbar-width: ${getCssValue('scrollbar-width', { width: blockEmbedScrollbarWidth })};
					scrollbar-color: ${getCssValue('scrollbar-color')};
				}

			`;

			textContent += cssForMainView;
			textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
		}
	}


	if (blockEmbedMaxHeight !== 'disabled') {

		// background colors: #EBF1F5 (default), #fcfcfc (roam studio light), #?????? (roam studio dark)

		let borderColor = internals.installedExtensions.roamStudio ? '#efefef' : '#dfe5e9';

		if (blockEmbedScrollOnChildren) {
			const cssForMainView = `
			
				/* SETTING: "Block embeds: maximum height" + "Block embeds: scroll only on children" */
				/* padding-bottom is a css hack to avoid showing the scrollbar when the embed height is < embed max height */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container > div.rm-level-1 {
					max-height: ${blockEmbedMaxHeight};
					overflow-y: auto;
					padding-bottom: 14px;
					display: block;
				}

				/* add a subtle border color to the container (5% shade relative to the default background color, #EBF1F5);
				generated with this tool: https://noeldelgado.github.io/shadowlord */

				${mainViewSelector} div.rm-embed-container {
					border: 1px solid ${borderColor};
				}

			`;

			textContent += cssForMainView;
			textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
		}
		else {
			const cssForMainView = `

				/* SETTING: "Block embeds: maximum height" */
				/* padding-bottom is a css hack to avoid showing the scrollbar when the embed height is < embed max height */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container {
					max-height: ${blockEmbedMaxHeight};
					overflow-y: auto;
					padding-bottom: 14px;
				}

				/* add a subtle border color to the container (5% shade relative to the default background color, #EBF1F5);
				generated with this tool: https://noeldelgado.github.io/shadowlord */

				${mainViewSelector} div.rm-embed-container {
					border: 1px solid ${borderColor};
				}

			`;

			textContent += cssForMainView;
			textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
		}

		// for page embeds the only selector that seems to work is the one below; no need to use the padding-bottom hack in this case;

		const applyToPageEmbeds = true;

		if (applyToPageEmbeds) {
			// background colors: #EBF1F5 (default), #ececec (roam studio light), #?????? (roam studio dark)

			let borderColor = internals.installedExtensions.roamStudio ? '#e0e0e0' : '#dfe5e9';

			const cssForMainView = `

				/* SETTING: "Block embeds: maximum height" (for page embeds) */

				${mainViewSelector} div.rm-embed__content {
					max-height: ${blockEmbedMaxHeight};
					overflow-y: auto;
					padding-left: 6px;
				}

				/* add a subtle border color to the container (5% shade relative to the default background color, #EBF1F5);
				generated with this tool: https://noeldelgado.github.io/shadowlord */

				${mainViewSelector} div.rm-embed-container {
					border: 1px solid ${borderColor};
				}

			`;

			textContent += cssForMainView;
			textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
		}
	}


	if (codeBlockScrollbarWidth !== 'disabled') {
		const cssForMainView = `

			/* SETTING: "Code blocks: scrollbar width" */

			${mainViewSelector} div.cm-scroller::-webkit-scrollbar {
				width: ${codeBlockScrollbarWidth};

			}

			${mainViewSelector} div.cm-scroller {
				scrollbar-width: ${getCssValue('scrollbar-width', { width: codeBlockScrollbarWidth })};
				scrollbar-color: ${getCssValue('scrollbar-color')};
			}

		`;

		textContent += cssForMainView;
		textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
	}

	if (codeBlockMaxHeight !== 'disabled') {
		// background colors: #f5f5f5 (default), #ececec (roam studio light), #?????? (roam studio dark)

		let borderColor = internals.installedExtensions.roamStudio ? '#e0e0e0' : '#e9e9e9';
		let cssForMainView = `

			/* SETTING: "Code blocks: maximum height" */

			${mainViewSelector} div.cm-editor {
				max-height: ${codeBlockMaxHeight};
				overflow-y: auto;
			}

			/* add a subtle border color to the container (5% shade relative to the background color);
				generated with this tool: https://noeldelgado.github.io/shadowlord */
			
			${mainViewSelector} div.rm-code-block {
				border: 1px solid ${borderColor};
			}

			${mainViewSelector} div.rm-code-block__settings-bar {
				border-top: 1px solid ${borderColor};
			}

			${mainViewSelector} div.cm-gutters {
				border-right: 1px solid ${borderColor} !important;
			}

		`;

		textContent += cssForMainView;
		textContent += replaceAll(cssForMainView, mainViewSelector, sidebarSelector);
	}

	let extensionStyle = document.createElement('style');
	
	extensionStyle.textContent = textContent;
	extensionStyle.dataset.id = `${internals.extensionId}-${Date.now()}`;
	extensionStyle.dataset.title = `dynamic styles added by the ${internals.extensionId} extension`;
	extensionStyle.dataset.isDev = String(internals.isDev);

	document.head.appendChild(extensionStyle);
}

function replaceAll (inputStr, searchStr, replacementStr) {

	// is String.prototype.replaceAll() safe to use by now? 
	let out = inputStr.split(searchStr).join(replacementStr);

	let idx = out.indexOf('*/');

	if (idx !== -1) {
		out = out.slice(0, idx) + ` (replace "${searchStr}" with "${replacementStr}") ` + out.slice(idx);
	}

	return out;
}

function getCssValue (cssProperty , { width } = {}) {

	let value = '';

	if (cssProperty === 'scrollbar-color') {
		value = `rgba(0,0,0,.25) transparent`;
	}

	if (cssProperty === 'scrollbar-width') {
		value = parseInt(width, 10) <= 8 ? 'thin' : 'auto';
	}

	return value;
}

export default {
	onload,
	onunload
};
