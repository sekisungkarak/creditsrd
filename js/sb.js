/* ----------------------- */
/* STREAMER.BOT CONNECTION */
/* ----------------------- */

const streamerBotStatus = {};
const streamerBotServerAddress      = getURLParam("streamerBotServerAddress", "127.0.0.1");
const streamerBotServerPort         = getURLParam("streamerBotServerPort", "8080");
const streamerBotWSS                = getURLParam("streamerBotWSS", false);

const streamerInfo = {};

let streamerBotClientActive = null;

function streamerBotConnect() {

    const streamerBotSchema = streamerBotWSS ? 'wss' : 'ws';
    
    if (streamerBotClientActive) {
        try {
            console.debug("[CreditsRD][Settings] Closing previous Streamer.bot connection...");
            streamerBotClientActive.disconnect?.();
            streamerBotClientActive = null;
            streamerBotStatus.connected = false;
        } catch (err) {
            console.error("[CreditsRD][Settings] Error closing previous client:", err);
        }
    }

    streamerBotClientActive = new StreamerbotClient({
        host: streamerBotServerAddress,
        port: streamerBotServerPort,
        scheme: streamerBotSchema,
        onConnect: () => {
            streamerBotStatus.connected = true;
            streamerBotStatus.disconnected = false;
            streamerBotStatus.error = false;
            
            (async () => {
                console.debug("[CreditsRD][Settings] Getting streamer info from Streamer.bot...");
                streamerInfo.get = await getStreamerInfo();
                console.debug("[CreditsRD][Settings] Streamer info saved.", streamerInfo.get);
            })();

            notifySuccess({
                title: 'CreditsRD 🤝 Streamer.bot',
                text: ``
            });
            
        },
        onDisconnect: () => {
            console.debug("[CreditsRD][Settings] Streamer.bot disconnected.");

            if (streamerBotStatus.disconnected === true) return;
            notifyError({
                title: 'CreditsRD ❌ Streamer.bot',
                text: ``
            });

            streamerBotStatus.connected = false;
            streamerBotStatus.disconnected = true;
            streamerBotStatus.error = true;
        },
        onError: (err) => {
            
            if (streamerBotStatus.error === true) return;

            console.debug("[CreditsRD][Settings] Streamer.bot connection error.");

            notifyError({
                title: 'CreditsRD ⚠️ Streamer.bot',
                text: `Error connecting to Streamer.bot.`
            });
            
            streamerBotStatus.connected = false;
            streamerBotStatus.disconnected = true;
            streamerBotStatus.error = true;
        }
    });

    return streamerBotClientActive;
}

const streamerBotClient = streamerBotConnect();


async function getStreamerInfo() {
    const requestForStreamer = await streamerBotClient.getBroadcaster();
    return requestForStreamer;
}

function getURLParam(param, defaultValue) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(param);
    
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === null) return defaultValue;

    return value;
}


function getURLParamLegacy(param, newParam) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(param);
    
    if (value === null) {
        return newParam();
    }
    else {
        return value;
    }
}



function registerPlatformHandlersToStreamerBot(handlers, logPrefix = '') {
    for (const [event, handler] of Object.entries(handlers)) {
        streamerBotClient.on(event, (...args) => {
            if (logPrefix) {
                if (event != 'General.Custom') {
                    console.debug(`${logPrefix} ${event}`, args[0]);
                }
            }
            handler(...args);
        });
    }
}


async function waitForStreamerBot(platformName = '') {
    const checkInterval = 1000;

    return new Promise((resolve) => {
        (function check() {
            if (streamerBotStatus && streamerBotStatus.connected === true) {
                console.debug(`[CreditsRD][StreamerBot] Connected. Releasing "${platformName}".`);
                resolve();
                return;
            }
            console.debug(`[CreditsRD][StreamerBot] Waiting for connection to release "${platformName}"...`);
            setTimeout(check, checkInterval);
        })();
    });
}


const pushNotify = (data) => {

    if (!document.body.classList.contains('preview')) return;

    const SimpleNotify = {
        effect: 'fade',
        speed: 500,
        customClass: 'toasty',
        customIcon: '',
        showIcon: true,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 3000,
        notificationsGap: null,
        notificationsPadding: null,
        type: 'outline',
        position: 'x-center bottom',
        customWrapper: '',
    };
    const mergedData = {
        ...SimpleNotify,
        ...data
    }
    new Notify (mergedData);
    
}

const notifyError = (err) => {
    err.status = 'error';
    pushNotify(err);
}

const notifyInfo = (info) => {
    info.status = 'info';
    pushNotify(info);
}

const notifyWarning = (warn) => {
    warn.status = 'warning';
    pushNotify(warn);
}

const notifySuccess = (success) => {
    success.status = 'success';
    pushNotify(success);
}