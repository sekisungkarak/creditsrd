import {
    allDefined,
    registerIconLibrary
} from 'https://ka-f.webawesome.com/webawesome@3.10.0/webawesome.loader.js';


const streamerBot = {};


/* CreditsRD Functions */
async function loadCreditsRDSettings() {
    const saved = localStorage.getItem("CreditsRDWidgetSettings");
    const settings = saved ? JSON.parse(saved) : {};

    document.querySelectorAll('[data-setting]:not([data-ignore])').forEach((el) => {
        const key = el.dataset.setting;
        const hasSavedValue = Object.prototype.hasOwnProperty.call(settings, key);

        let value;

        if (hasSavedValue) {
            value = settings[key];
        }
        
        else {
            const defaultValue = el.dataset.default;

            if (defaultValue === undefined) {
                value = undefined;
            }
            else if (el.tagName === 'WA-SWITCH' || (el.tagName === 'INPUT' && el.type === 'checkbox')) {
                value = defaultValue === 'true'; // converte string pra boolean
            }
            else if (el.tagName === 'WA-SLIDER' || el.tagName === 'WA-NUMBER-INPUT') {
                value = Number( defaultValue ); // converte string pra number
            }
            else {
                value = defaultValue;
            }
        }

        switch (el.tagName) {
            case 'WA-SLIDER' :
                el.value = value ?? '';
                break;
            case 'WA-SWITCH' :
                el.checked = value;
                break;
            case 'INPUT' :
                if (el.type === 'checkbox') {
                    el.checked = value;
                }
                break;

            case 'WA-SELECT' :
                el.value = el.multiple
                    ? (Array.isArray(value) ? value : String(value ?? '').split(',').map(v => v.trim()).filter(Boolean))
                    : (value ?? '');
                break;

            case 'WA-INPUT' :
                el.value = value ?? '';
                break;

            case 'WA-NUMBER-INPUT' : 
                el.value = value ?? '';
                break;
                
            case 'WA-COLOR-PICKER' : 
                el.value = value ?? '';
                break;

            default:
                console.warn(`Tipo não tratado para "${key}":`, el.tagName);
        }
    });

    console.debug('[CreditsRD][Settings] Widget Settings Loaded on Local Storage onto the Settings.', settings);
    
    const url = await getCreditsRDUrl({ preview: true });
    document.querySelector('#CreditsRDPreview').src = url;
    
}


async function collectCreditsRDSettings() {
	const settings = {};

	document.querySelectorAll('[data-setting]:not([data-ignore])').forEach((el) => {
		const key = el.dataset.setting;
		const defaultValue = el.dataset.default;

		let value;

		switch (el.tagName) {
			case 'WA-SWITCH':
				value = el.checked;
				break;

			case 'WA-SELECT':
				value = el.multiple
					? (Array.isArray(el.value) ? el.value.join(',') : [])
					: el.value;
				break;

			case 'INPUT':
				value = (el.type === 'checkbox') ? el.checked : el.value;
				break;

			case 'WA-SLIDER':
            case 'WA-NUMBER-INPUT':
                value = Number( el.value );
                break;

            case 'WA-INPUT':
            case 'WA-COLOR-PICKER':
                value = el.value;
                break;

			default:
				console.warn(`Tipo não tratado para "${key}":`, el.tagName);
				value = undefined;
		}

		// só pula se houver default declarado E o valor (normalizado pra string) for igual a ele
		if (defaultValue !== undefined && String(value) === String(defaultValue)) {
			return;
		}

		settings[key] = value;

	});

	return settings;
}

async function bindCreditsRDSettings() {

    document.querySelectorAll('[data-setting]:not([data-ignore])').forEach((el) => {
		if (el.dataset.bound) return;
		el.dataset.bound = 'true';
		el.addEventListener('input', async () => {
            const settings = await collectCreditsRDSettings();
            const url = await getCreditsRDUrl({ preview: true });

            localStorage.setItem('CreditsRDWidgetSettings', JSON.stringify(settings));
            console.debug('[CreditsRD][Settings] Widget Settings Saved on Local Storage.', settings);
            
            document.querySelector('#CreditsRDPreview').src = url;

            streamerBotConnect();
        });
	});

    document.querySelector('#CreditsRDSelectSystemFont').addEventListener('change', (event) => {
        const input = document.querySelector(`[data-setting="font"]`);
        input.value = event.target.value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });


    const loadSystemFontsButton = document.querySelector('#CreditsRDLoadFontsFromSystem');

    loadSystemFontsButton.addEventListener('click', (event) => {
        event.preventDefault();
        populateFontSelect();
    });

    if ('queryLocalFonts' in window) {
       loadSystemFontsButton.parentNode.style.display = '';
    }

}



async function populateFontSelect() {
    const select = document.querySelector('#CreditsRDSelectSystemFont');
    const currentFontInput = document.querySelector('[data-setting="font"]');
    const currentFont = currentFontInput.value;

    select.parentNode.style.display = '';
    currentFontInput.parentNode.style.display = 'none';

    select.innerHTML = '';

    if (currentFont) {
        const currentOption = document.createElement('wa-option');
        currentOption.value = currentFont;
        currentOption.textContent = currentFont;
        currentOption.style.fontFamily = currentFont;
        currentOption.style.fontSize = '20px';
        currentOption.selected = true;
        select.appendChild(currentOption);
    }

    try {
        const fonts = await window.queryLocalFonts();
        const uniqueNames = [...new Set(fonts.map(f => f.family))].sort();

        uniqueNames.forEach(name => {
            if (name === currentFont) return;

            const option = document.createElement('wa-option');
            option.value = name;
            option.textContent = name;
            option.style.fontFamily = name;
            option.style.fontSize = '20px';
            select.appendChild(option);
        });
    }
    catch (err) {
        console.error('[CreditsRD][Settings] Permission denied or API unavailable:', err);
    }
}





async function importCreditsRDSettings(url) {

    console.debug('[CreditsRD][Settings] Importing Settings...');

    const base = new URL(url);
    base.hash = "";

    const settings = Object.fromEntries( base.searchParams.entries() );
    const validated = {};

    document.querySelectorAll('[data-setting]:not([data-ignore])').forEach((el) => {
        const key = el.dataset.setting;

        if ( !Object.prototype.hasOwnProperty.call( settings, key ) ) {
            return;
        }

        const rawValue = settings[ key ];
        const defaultValue = el.dataset.default;

        let value;

        switch (el.tagName) {
            case 'WA-SWITCH':
                value = rawValue === 'true';
                break;

            case 'WA-SELECT':
                value = el.multiple
                    ? rawValue.split(',').map(v => v.trim()).filter(Boolean)
                    : rawValue;
                break;

            case 'INPUT':
                value = (el.type === 'checkbox') ? (rawValue === 'true') : rawValue;
                break;

            case 'WA-SLIDER':
            case 'WA-NUMBER-INPUT':
                value = Number( rawValue );
                break;

            case 'WA-INPUT':
            case 'WA-COLOR-PICKER':
                value = rawValue;
                break;

            default:
                console.warn(`Tipo não tratado para "${key}":`, el.tagName);
                value = undefined;
        }

        if ( value === undefined ) {
            return;
        }

        if ( defaultValue !== undefined && String(value) === String(defaultValue) ) {
            return;
        }

        validated[ key ] = value;
    });

    localStorage.setItem( "CreditsRDWidgetSettings", JSON.stringify( validated ) );

    console.debug('[CreditsRD][Settings] Settings Imported Successfully!', validated);
    console.debug('[CreditsRD][Settings] Reloading...');

    var loadingScreen = document.getElementById('loading');
    
    loadingScreen.style.display = '';
    loadingScreen.classList.remove('hidden');
    document.body.style.overflowY = 'hidden';

    setTimeout(() => {
        location.reload();
    }, 1500)

}

async function getCreditsRDUrl({ preview = false } = {}) {

	const base = new URL(window.location.href);

	base.hash = "";

	const targetFile = preview ? "preview.html" : "widget.html";

	if (!base.pathname.endsWith("widget.html") && !base.pathname.endsWith("preview.html")) {
		if (base.pathname.endsWith("/") || base.pathname === "") {
			base.pathname += targetFile;
		}
		else if (base.pathname.endsWith("index.html")) {
			base.pathname = base.pathname.replace(/index\.html$/, targetFile);
		}
		else {
			base.pathname += "/" + targetFile;
		}
	}
	else {
		base.pathname = base.pathname.replace(/(widget|preview)\.html$/, targetFile);
	}

	const settings = await collectCreditsRDSettings();

	Object.entries(settings).forEach(([key, value]) => {
		base.searchParams.set(key, value);
	});

	return base.toString();
}











/* Streamer.bot & Speaker.bot Functions */

async function streamerBotDisconnectExisting(closeCode = 1000, timeout = 1000) {
    if (!streamerBot.client) {
        console.warn(`[CreditsRD][Settings] No Streamer.bot client detected.`);
        return false;
    }

    try {
        await streamerBot.client.disconnect(closeCode, timeout);
        console.debug(`[CreditsRD][Settings] Streamer.bot disconnected successfully.`);
        return true;
    }
    catch (err) {
        console.error(`[CreditsRD][Settings] Error while trying to disconnect from Streamer.bot:`, err);
        return false;
    }
}

async function streamerBotConnect() {

    await streamerBotDisconnectExisting();

    const status = document.querySelector('#streamerbot .status');
    const streamerBotIp = document.querySelector(`[data-setting=streamerBotServerAddress]`).value;
    const streamerBotPort = document.querySelector(`[data-setting=streamerBotServerPort]`).value;
    const streamerBotWSS = document.querySelector(`[data-setting=streamerBotWSS]`).checked;

    const streamerBotSchema = streamerBotWSS ? 'wss' : 'ws';

    streamerBot.client = new StreamerbotClient({
        host: streamerBotIp,
        port: streamerBotPort,
        scheme: streamerBotSchema,
        autoReconnect: true,
        onConnect: () => {
            streamerBot.connected = true;
            console.debug(`[CreditsRD][Settings] Connected to Streamer.bot successfully!`);
            status.classList.add('connected');
        },
        onDisconnect: () => {
            streamerBot.connected = false;
            status.classList.remove('connected');
            console.debug(`[CreditsRD][Settings] Streamer.bot Disconnected!`);
        }
    });

}











/* Web Asweome Visual Styling */


async function registerRemixIcons() {
    registerIconLibrary('remixicon', {
        resolver: name => {
            const match = name.match(/^(.*?)\/(.*?)?$/);
            match[1] = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            return `https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/${match[1]}/${match[2]}.svg`;
        },
        mutator: svg => svg.setAttribute('fill', 'currentColor'),
    });
}

async function setUpDetails() {

	// Percentage Sliders
	const percentageSliders = document.querySelectorAll('.slider_percent');
	const percentageFormatter = new Intl.NumberFormat('en-US', { style: 'percent' });

	customElements.whenDefined('wa-slider').then(() => {
		percentageSliders.forEach((slider) => {
			slider.valueFormatter = value => percentageFormatter.format(value);
		});
	});

    
    
    // Setting up Buttons
    const copyButton = document.getElementById("copyUrlButton");
    copyButton.addEventListener("click", async () => {

        const defaultText = copyButton.textContent;
        const url = await getCreditsRDUrl();
        
        navigator.clipboard.writeText(url).then(() => {
            copyButton.textContent = '👍';
            copyButton.style.backgroundColor = "#00dd63";

            console.debug("[CreditsRD][Settings] CreditsRD's URL copied successfully!");

            setTimeout(() => {
                copyButton.textContent = defaultText;
                copyButton.removeAttribute('style');
            }, 3000);
        })
        .catch(err => {
            console.error("[CreditsRD][Settings] Failed to copy CreditsRD's URL: ", err);
        });
    });
    

    const importUrlButton = document.getElementById("openImportModal");
    importUrlButton.addEventListener("click", async () => {
        const dialog = document.querySelector('#modalUrlImport');
        dialog.open = true;
    });

    



    // Setting up Modals
    document.querySelectorAll('.modal').forEach(modal => {
        
        modal.querySelector('.cancel')?.addEventListener('click', () => {
            modal.open = false;
        });


        modal.querySelector('#importUrlConfirm')?.addEventListener('click', async () => {
            const url = modal.querySelector('#importUrl');
            await importCreditsRDSettings(url.value.trim());
            modal.open = false;
        });



        modal.querySelector('#reloadStreamerBotActions')?.addEventListener('click', async () => {
            location.reload();
        });


    });

}








async function hideLoadingScreen() {
	var loadingScreen = document.getElementById('loading');
	if (!loadingScreen) {
		return;
	}

	loadingScreen.addEventListener('transitionend', function onTransitionEnd() {
		loadingScreen.style.display = 'none';
        document.body.style.overflowY = 'unset';
		loadingScreen.removeEventListener('transitionend', onTransitionEnd);
	});

	loadingScreen.classList.add('hidden');
}

async function isChannelLive(username) {
    const response = await fetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"
        },
        body: JSON.stringify({
            query: `
                query($login: String!) {
                    user(login: $login) {
                        stream {
                            id
                            type
                        }
                    }
                }
            `,
            variables: { login: username }
        })
    });

    const data = await response.json();
    return data.data.user?.stream !== null;
}


let isVortisLive;

async function checkIfVortisIsLiveBecauseIWantMoreFollowersLMAO() {
    const isLive = await isChannelLive("vortisrd");

    if ( isLive ) {
        if (isVortisLive == true) return;
        document.querySelector('footer .links').style.display = 'none';
        document.querySelector('footer .live').style.display = '';
        isVortisLive = true;
    }
    else {
        if (isVortisLive == false) return;
        document.querySelector('footer .links').style.display = '';
        document.querySelector('footer .live').style.display = 'none';
        isVortisLive = false;
    }
}



async function loadWithProgress(onProgress) {
    const tags = new Set(
      [...document.querySelectorAll('*')]
        .map(el => el.tagName.toLowerCase())
        .filter(tag => tag.startsWith('wa-'))
    );

    const total = tags.size;
    let loaded = 0;

    await Promise.all(
        [...tags].map(async (tag) => {
            await customElements.whenDefined(tag);
            loaded++;
            onProgress(Math.round((loaded / total) * 100));
        })
    );
}

await loadWithProgress(async (pct) => {

    document.querySelector('#loadingPercentage span').textContent = `${pct}%`;

    if (pct == 100) {
        registerRemixIcons();
        await loadCreditsRDSettings();
        await bindCreditsRDSettings();

        await hideLoadingScreen(); 
        document.querySelector('#loadingPercentage span').textContent = ``;
        
        await setUpDetails();
        await streamerBotConnect();
        await checkIfVortisIsLiveBecauseIWantMoreFollowersLMAO();
        setInterval(async () => {
            await checkIfVortisIsLiveBecauseIWantMoreFollowersLMAO();
        }, 30000);
    }
});