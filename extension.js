let internals = {};

internals.extensionId = 'roam-scrollbars';

// dev mode can activated by using the special key/value 'dev=true' in the query string;
// example: https://roamresearch.com?dev=true/#/app/<GRAPH_NAME>

internals.isDev = String(new URLSearchParams(window.location.search).get('dev')).includes('true');
internals.isProd = !internals.isDev;
internals.extensionAPI = null;
internals.unloadHandlers = [];

internals.settingsCached = {
	mainViewScrollbarWidth: null,

	blockEmbedScrollbarWidth: null,
	blockEmbedMaxHeight: null,
	blockEmbedScrollOnChildren: null,

	codeBlockScrollbarWidth: null,
	codeBlockMaxHeight: null,
};

internals.settingsDefault = {
	mainViewScrollbarWidth: '8px',

	blockEmbedScrollbarWidth: '6px',
	blockEmbedMaxHeight: '50%',
	blockEmbedScrollOnChildren: true,

	codeBlockScrollbarWidth: '6px',
	codeBlockMaxHeight: '50%',
};

function onload({ extensionAPI }) {

	log('ONLOAD (start)');

	internals.extensionAPI = extensionAPI;
	initializeSettings();

	let unloadHandler = () => { 

		log('unloadHandler');
		removeStyle();
	};

	internals.unloadHandlers.push(unloadHandler);

	// we have to resort to dynamic stylesheets (instead of using extension.css directly) to be able to support 
	// the 'disabled' option in our settings (when 'disabled' is selected, we don't add any css at all relative 
	// to that setting/feature); this is the simplest way to avoid having css rules that might conflict with 
	// other extensions/themes;
	
	resetStyle();

	log('ONLOAD (end)');
}

function onunload() {

	log('ONUNLOAD (start)');

	internals.unloadHandlers.forEach(unloadHandler => { unloadHandler() })

	log('ONUNLOAD (end)');
}

function log() {
	
	if (internals.isProd) { return }

	console.log(`${internals.extensionId} ${Date.now()}]`, ...arguments);
}

function initializeSettings() {

	log('initializeSettings');

	let panelConfig = {
		tabTitle: 'Scrollbars',
		settings: []
	};

	// options for main view and sidebar

	panelConfig.settings.push({
		id: 'mainViewScrollbarWidth',
		name: 'Main view and sidebar: scrollbar width (px)',
		description: `
			Values between 8 and 12 should be good for most people. 
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px', '18px', '20px'],
			onChange: value => { updateSettingsCached({ key: 'mainViewScrollbarWidth', value }); resetStyle(); },
		},
	});

	// options for block embeds

	panelConfig.settings.push({
		id: 'blockEmbedScrollbarWidth',
		name: 'Block/page embeds: scrollbar width',
		description: `
			By default Roam will expand the container of a block/page embed as much as necessary. However when using embeds of "long" blocks/pages (with many children), it might be convenient to have a maximum height for the embed (in which case a scrollbar is necessary). 
			This setting is used to define the width of scrollbars in embeds. The next setting is used to define the respective maximum height. 
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used). 
			TIP: having this width smaller than the width of the main view is a good choice.
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px', '18px', '20px'],
			onChange: value => { updateSettingsCached({ key: 'blockEmbedScrollbarWidth', value }); resetStyle(); },
		},
	});

	panelConfig.settings.push({
		id: 'blockEmbedMaxHeight',
		name: 'Block/page embeds: maximum height',
		description: `
			This setting defines a maximum height for block/page embeds. This is useful to quickly see the beginning/end of the embed in relation to the surrounding blocks. 
			The numeric values are a percentage of the viewport height. 
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
			onChange: value => { updateSettingsCached({ key: 'blockEmbedMaxHeight', value }); resetStyle(); },
		},
	});

	panelConfig.settings.push({
		id: 'blockEmbedScrollOnChildren',
		name: 'Block/page embeds: scroll only on children',
		description: `
			If this setting is activated, the scroll happens only on the children of the block/page being embeded. That is, the root block (the one associated to the block reference) will always be visible. The scroll starts only on the children.
			NOTE: for page embededs, this is the only way to have a scroll. 
		`,
		action: {
			type: 'switch',
			onChange: ev => { updateSettingsCached({ key: 'blockEmbedScrollOnChildren', value: ev.target.checked }); resetStyle(); },
		},
	});

	// options for code blocks

	panelConfig.settings.push({
		id: 'codeBlockScrollbarWidth',
		name: 'Code blocks: scrollbar width',
		description: `
			By default Roam will not show any scrollbars in code blocks (even for long code blocks, where the maximum height of 1000px is reached). 
			Use this setting if you prefer to actually have a scrollbar in code blocks (visible only when the maximum height is reached). Use the next setting to customize the respective maximum height.
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
			TIP: having this width smaller than the width of the main view is a good choice.
		`,
		action: {
			type: 'select',
			items: ['disabled', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '12px', '14px', '16px', '18px', '20px'],
			onChange: value => { updateSettingsCached({ key: 'codeBlockScrollbarWidth', value }); resetStyle(); },
		},
	});

	panelConfig.settings.push({
		id: 'codeBlockMaxHeight',
		name: 'Code blocks: maximum height',
		description: `
			By default Roam has a maximum height of 1000px for code blocks (that's around 48 lines of code). However, it might be convenient to change the unit of that maximum height from pixels (absolute) to a percentage of the viewport height (relative). This is useful to quickly see the beginning/end of the code block in relation to the surrounding blocks, regardless of the size of the code block and the size the of screen being used.
			Set to "disabled" to refrain from adding any css related to this feature (the css from the current theme will then be used).
		`,
		action: {
			type: 'select',
			items: ['disabled', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
			onChange: value => { updateSettingsCached({ key: 'codeBlockMaxHeight', value }); resetStyle(); },
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
		
		updateSettingsCached({ key, value });
	});
}

function updateSettingsCached({ key, value }) {

	// clean the units from the numeric value

	if (typeof value === 'string' && (value.endsWith('px') || value.endsWith('%'))) { 
		value = parseInt(value) 
	}

	internals.settingsCached[key] = value;

	log('updateSettingsCached', { key, value, 'internals.settingsCached': internals.settingsCached });
}

function resetStyle() {

	// setTimeout is used to improve the chances of our css styles being loaded after styles from other extensions

	removeStyle();
	setTimeout(addStyle, 100);  
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
	let { mainViewScrollbarWidth } = internals.settingsCached;
	let { blockEmbedScrollbarWidth, blockEmbedMaxHeight, blockEmbedScrollOnChildren } = internals.settingsCached;
	let { codeBlockScrollbarWidth, codeBlockMaxHeight } = internals.settingsCached;

	const mainViewSelector = 'div.rm-article-wrapper';
	const sidebarSelector = 'div#roam-right-sidebar-content';

	if (mainViewScrollbarWidth !== 'disabled') {
		textContent += `

			/* setting: mainViewScrollbarWidth */

			${mainViewSelector}::-webkit-scrollbar {
				width: ${mainViewScrollbarWidth}px;
			}

			${sidebarSelector}::-webkit-scrollbar {
				width: ${mainViewScrollbarWidth}px;
			}

			/* firefox only; reference: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scrollbars */
			/* color taken from the default theme - see https://roamresearch.com/assets/css/re-com/re-com.min.css */

			${mainViewSelector} {
				scrollbar-width: ${Number(mainViewScrollbarWidth) <= 6 ? 'thin' : 'auto' };
				scrollbar-color: rgba(0,0,0,.25) transparent;
			}

			${sidebarSelector} {
				scrollbar-width: ${Number(mainViewScrollbarWidth) <= 6 ? 'thin' : 'auto' };
				scrollbar-color: rgba(0,0,0,.25) transparent;
			}
		`;
	}

	if (blockEmbedScrollbarWidth !== 'disabled') {
		if (blockEmbedScrollOnChildren) {
			textContent += `

				/* setting: blockEmbedScrollbarWidth + blockEmbedScrollOnChildren */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container > div.rm-level-1::-webkit-scrollbar {
					width: ${blockEmbedScrollbarWidth}px;
				}

				${sidebarSelector} div.rm-embed-inner-block-hide > div.roam-block-container > div.rm-level-1::-webkit-scrollbar {
					width: ${blockEmbedScrollbarWidth}px;
				}
			`;
		}
		else {
			textContent += `

				/* setting: blockEmbedScrollbarWidth */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container::-webkit-scrollbar {
					width: ${blockEmbedScrollbarWidth}px;
				}

				${sidebarSelector} div.rm-embed-inner-block-hide > div.roam-block-container::-webkit-scrollbar {
					width: ${blockEmbedScrollbarWidth}px;
				}
			`;
		}

		// for page embeds the only place that seems to work is here

		textContent += `

			${mainViewSelector} div.rm-embed__content::-webkit-scrollbar {
				width: ${blockEmbedScrollbarWidth}px;
			}

			${sidebarSelector} div.rm-embed__content::-webkit-scrollbar {
				width: ${blockEmbedScrollbarWidth}px;
			}
		`;
	}

	if (blockEmbedMaxHeight !== 'disabled') {
		if (blockEmbedScrollOnChildren) {
			textContent += `

				/* setting: blockEmbedMaxHeight + blockEmbedScrollOnChildren */
				/* padding-bottom is a css hack to avoid showing the scrollbar when the embed height is < embed max height */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container > div.rm-level-1 {
					max-height: ${blockEmbedMaxHeight}vh;
					overflow-y: auto;
					padding-bottom: 14px;
					display: block;
				}
				
				${sidebarSelector} div.rm-embed-inner-block-hide > div.roam-block-container > div.rm-level-1 {
					max-height: ${blockEmbedMaxHeight}vh;
					overflow-y: auto;
					padding-bottom: 14px;
					display: block;
				}
			`;
		}
		else {
			textContent += `

				/* setting: blockEmbedMaxHeight */
				/* padding-bottom is a css hack to avoid showing the scrollbar when the embed height is < embed max height */

				${mainViewSelector} div.rm-embed-inner-block-hide > div.roam-block-container {
					max-height: ${blockEmbedMaxHeight}vh;
					overflow-y: auto;
					padding-bottom: 14px;
				}

				${sidebarSelector} div.rm-embed-inner-block-hide > div.roam-block-container {
					max-height: ${blockEmbedMaxHeight}vh;
					overflow-y: auto;
					padding-bottom: 14px;
				}
			`;
		}

		// for page embeds the only place that seems to work is here; no need to use the padding-bottom hack here;

		textContent += `

			${mainViewSelector} div.rm-embed__content {
				max-height: ${blockEmbedMaxHeight}vh;
				overflow-y: auto;
				padding-left: 6px;
			}

			${sidebarSelector} div.rm-embed__content {
				max-height: ${blockEmbedMaxHeight}vh;
				overflow-y: auto;
				padding-left: 6px;
			}
		`
	}

	if (codeBlockScrollbarWidth !== 'disabled') {
		textContent += `

			/* setting: codeBlockScrollbarWidth */

			${mainViewSelector} div.cm-scroller::-webkit-scrollbar {
				width: ${codeBlockScrollbarWidth}px;
			}

			${sidebarSelector} div.cm-scroller::-webkit-scrollbar {
				width: ${codeBlockScrollbarWidth}px;
			}
		`;
	}

	if (codeBlockMaxHeight !== 'disabled') {
		textContent += `

			/* setting: codeBlockMaxHeight */

			${mainViewSelector} div.cm-editor {
				max-height: ${codeBlockMaxHeight}vh;
				overflow-y: auto;
			}

			${sidebarSelector} div.cm-editor {
				max-height: ${codeBlockMaxHeight}vh;
				overflow-y: auto;
			}
		`;
	}

	let extensionStyle = document.createElement('style');
	
	extensionStyle.textContent = textContent;
	extensionStyle.dataset.id = `${internals.extensionId}-${Date.now()}`;
	extensionStyle.dataset.title = `dynamic styles added by the ${internals.extensionId} extension`;

	document.head.appendChild(extensionStyle);
}

export default {
	onload,
	onunload
};
