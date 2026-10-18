const testModeAutoStart     = getURLParam("testMode", false);
const testModeMinInterval   = parseInt(getURLParam("testModeMinInterval", 1500), 10);
const testModeMaxInterval   = parseInt(getURLParam("testModeMaxInterval", 1500), 10);

const TestMode = (() => {
    let running = false;
    let timeoutId = null;

    const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomId   = () => (typeof createRandomString === 'function')
        ? createRandomString(24)
        : Math.random().toString(36).slice(2);

    const fakeNames = [
        'Nutty', 'CouRageJD', 'VortisRD', 'Gaules', 'MrHappy1227', 'TimTheTatman', 'tawmae', 'TheBurntPeanut',
        'Shroud', 'summit1g', 'fireb0rn', 'SypherPK', 'rexbordz', 'Bushy', 'Silvarian', 'CohhCarnage',
        'JesseCox', 'Snaux12', 'Mr_Sharkey_', 'Cloakzy', 'Flashforce', 'wudijo'
    ];

    const fakeUsers = fakeNames.map((name, i) => ({
        id: String(100000 + i),
        name,
        login: name.toLowerCase()
    }));

    const randomUser = (exclude) => {
        let user;
        do { user = randomFrom(fakeUsers); } while (exclude && user.id === exclude.id && fakeUsers.length > 1);
        return user;
    };

    const TWITCH_DEFAULT_AVATAR  = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-300x300.png';
    const YOUTUBE_DEFAULT_AVATAR = 'images/youtube-default-user-pfp.jpg';

    const kickDefaultAvatars = [
        'https://kick.com/img/default-profile-pictures/default-avatar-1.webp',
        'https://kick.com/img/default-profile-pictures/default-avatar-2.webp',
        'https://kick.com/img/default-profile-pictures/default-avatar-3.webp',
        'https://kick.com/img/default-profile-pictures/default-avatar-4.webp',
        'https://kick.com/img/default-profile-pictures/default-avatar-5.webp',
        'https://kick.com/img/default-profile-pictures/default-avatar-6.webp'
    ];

    function seedTwitchAvatar(login) {
    }

    const generators = {};

    generators['twitch:follow'] = () => {
        if (typeof twitchFollowMessage !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.login);
        twitchFollowMessage({
            targetUser: { id: u.id, name: u.name, login: u.login }
        });
    };

    generators['twitch:sub'] = () => {
        if (typeof twitchSubMessage !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.login);
        const isPrime = Math.random() < 0.2;
        twitchSubMessage({
            user: { id: u.id, name: u.name, login: u.login },
            durationMonths: randomFrom([1, 1, 1, 3, 6, 12]),
            isPrime,
            subTier: isPrime ? 1000 : randomFrom([1000, 1000, 2000, 3000])
        });
    };

    generators['twitch:resub'] = () => {
        if (typeof twitchReSubMessage !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.login);
        const isPrime = Math.random() < 0.15;
        twitchReSubMessage({
            user: { id: u.id, name: u.name, login: u.login },
            cumulativeMonths: randomFrom([2, 4, 7, 12, 18, 24, 36, 48]),
            isPrime,
            subTier: isPrime ? 1000 : randomFrom([1000, 1000, 2000, 3000])
        });
    };

    generators['twitch:giftsub'] = () => {
        if (typeof twitchGiftMessage !== 'function') return;
        const u = randomUser();
        const r = randomUser(u);
        seedTwitchAvatar(u.login);
        twitchGiftMessage({
            user: { id: u.id, name: u.name, login: u.login },
            recipient: { id: r.id, name: r.name, login: r.login },
            durationMonths: randomFrom([1, 1, 1, 3, 6]),
            subTier: randomFrom([1000, 1000, 2000, 3000]),
            fromCommunitySubGift: false
        });
    };

    generators['twitch:giftbomb'] = () => {
        if (typeof twitchGiftBombMessage !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.login);
        twitchGiftBombMessage({
            user: { id: u.id, name: u.name, login: u.login },
            total: randomFrom([5, 10, 20, 50, 100]),
            subTier: randomFrom([1000, 1000, 2000, 3000])
        });
    };

    generators['twitch:cheer'] = () => {
        if (typeof twitchBitsMessage !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.login);
        twitchBitsMessage({
            user: { id: u.id, name: u.name, login: u.login },
            bits: randomFrom([50, 100, 250, 500, 1000, 5000])
        });
    };

    generators['twitch:powerup'] = () => {
        if (typeof twitchPowerUpRedemption !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.login);
        twitchPowerUpRedemption({
            type: randomFrom(['message_effect', 'celebration', 'gigantify_an_emote']),
            user: { id: u.id, name: u.name, login: u.login },
            bits: randomFrom([100, 250, 500, 1000, 5000])
        });
    };

    generators['twitch:custompowerup'] = () => {
        if (typeof twitchCustomPowerUpRedemption !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.login);
        const powerUp = randomFrom([
            { title: 'Confetti Bomb', backgroundColor: '#e14dff', bits: 100 },
            { title: 'Air Horn',      backgroundColor: '#ffd24d', bits: 250 },
            { title: 'Screen Shake',  backgroundColor: '#ff4d4d', bits: 500 },
            { title: 'Rain Emotes',   backgroundColor: '#4dc3ff', bits: 1000 }
        ]);
        twitchCustomPowerUpRedemption({
            user: { id: u.id, name: u.name, login: u.login },
            customPowerUp: powerUp
        });
    };

    generators['twitch:raid'] = () => {
        if (typeof twitchRaidMessage !== 'function') return;
        const u = randomUser();
        seedTwitchAvatar(u.name);
        twitchRaidMessage({
            from_broadcaster_user_id: u.id,
            from_broadcaster_user_name: u.name,
            viewers: randomInt(2, 500)
        });
    };

    const youtubeUser = () => {
        const u = randomUser();
        return {
            id: `UC${u.id}`,
            name: u.name,
            url: `https://youtube.com/@${u.login}`,
            profileImageUrl: YOUTUBE_DEFAULT_AVATAR,
            isOwner: false,
            isModerator: false,
            isSponsor: Math.random() < 0.2,
            isVerified: false
        };
    };

    const youtubeMoney = () => {
        const { amount, currencyCode } = randomFrom([
            { amount: 5,  currencyCode: 'BRL' },
            { amount: 10, currencyCode: 'BRL' },
            { amount: 25, currencyCode: 'BRL' },
            { amount: 50, currencyCode: 'BRL' },
            { amount: 5,  currencyCode: 'USD' },
            { amount: 20, currencyCode: 'USD' },
            { amount: 10, currencyCode: 'EUR' }
        ]);
        return { microAmount: amount * 1_000_000, currencyCode };
    };

    generators['youtube:superchat'] = () => {
        if (typeof youTubeSuperChatMessage !== 'function') return;
        youTubeSuperChatMessage({
            eventId: randomId(),
            ...youtubeMoney(),
            user: youtubeUser()
        });
    };

    generators['youtube:supersticker'] = () => {
        if (typeof youTubeSuperStickerMessage !== 'function') return;
        youTubeSuperStickerMessage({
            eventId: randomId(),
            ...youtubeMoney(),
            user: youtubeUser()
        });
    };

    generators['youtube:sponsor'] = () => {
        if (typeof youTubeNewSponsorMessage !== 'function') return;
        youTubeNewSponsorMessage({
            eventId: randomId(),
            months: randomFrom([1, 1, 1, 2, 6, 12]),
            user: youtubeUser()
        });
    };

    generators['youtube:giftmembership'] = () => {
        if (typeof youTubeGiftBombMessage !== 'function') return;
        youTubeGiftBombMessage({
            eventId: randomId(),
            count: randomFrom([1, 5, 10, 20, 50]),
            user: youtubeUser()
        });
    };

    generators['youtube:jewels'] = () => {
        if (typeof youTubeJewels !== 'function') return;
        const jewel = randomFrom([
            { name: 'Tamo junto', jewelsAmount: 10 },
            { name: 'Oi!',        jewelsAmount: 2 },
            { name: 'Ha-i',       jewelsAmount: 50 }
        ]);
        youTubeJewels({
            eventId: randomId(),
            name: jewel.name,
            jewelsAmount: jewel.jewelsAmount,
            comboCount: randomInt(1, 5),
            duration: { seconds: 3, nanos: 0 },
            user: youtubeUser()
        });
    };

    const kickUser = (u) => ({
        id: u.id,
        name: u.name,
        login: u.login,
        profilePicture: randomFrom(kickDefaultAvatars)
    });

    generators['kick:follow'] = () => {
        if (typeof kickFollowMessage !== 'function') return;
        kickFollowMessage({ user: kickUser(randomUser()) });
    };

    generators['kick:sub'] = () => {
        if (typeof kickSubMessageFromStreamerBot !== 'function') return;
        kickSubMessageFromStreamerBot({
            user: kickUser(randomUser()),
            duration: randomFrom([1, 1, 1, 3, 6, 12])
        });
    };

    generators['kick:giftsub'] = () => {
        if (typeof kickGiftMessageFromStreamerBot !== 'function') return;
        const u = randomUser();
        const r = randomUser(u);
        kickGiftMessageFromStreamerBot({
            user: kickUser(u),
            recipient: { id: r.id, name: r.name }
        });
    };

    generators['kick:giftbomb'] = () => {
        if (typeof kickMassGiftMessageFromStreamerBot !== 'function') return;
        const total = randomFrom([5, 10, 20, 50]);
        kickMassGiftMessageFromStreamerBot({
            user: kickUser(randomUser()),
            recipients: Array.from({ length: total }, () => {
                const r = randomUser();
                return { id: r.id, name: r.name };
            })
        });
    };

    generators['kick:kicksgifted'] = () => {
        if (typeof kickKicksGiftedMessageFromStreamerBot !== 'function') return;
        const u = randomUser();
        kickKicksGiftedMessageFromStreamerBot({
            sender: { id: u.id, name: u.name, profilePicture: randomFrom(kickDefaultAvatars) },
            gift: {
                amount: randomFrom([1, 10, 50, 100, 500, 10000, 50000]),
                message: ''
            }
        });
    };

    const tiktokBase = () => {
        const u = randomUser();
        return {
            msgId: randomId(),
            userId: u.id,
            uniqueId: u.login,
            nickname: u.name
        };
    };

    generators['tiktok:follow'] = () => {
        if (typeof tiktokFollowMessage !== 'function') return;
        tiktokFollowMessage({ ...tiktokBase() });
    };

    generators['tiktok:share'] = () => {
        if (typeof tiktokShareMessage !== 'function') return;
        tiktokShareMessage({ ...tiktokBase() });
    };

    generators['tiktok:like'] = () => {
        if (typeof tiktokLikesMessage !== 'function') return;
        tiktokLikesMessage({
            ...tiktokBase(),
            likeCount: randomInt(1, 50)
        });
    };

    generators['tiktok:superfan'] = () => {
        if (typeof tiktokSubMessage !== 'function') return;
        tiktokSubMessage({
            ...tiktokBase(),
            user: {}
        });
    };

    generators['tiktok:gift'] = () => {
        if (typeof tiktokGiftMessage !== 'function') return;
        const gift = randomFrom([
            { name: 'Rose',    coins: 1,     giftPictureUrl: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba3a9bb85c33e017f3648eaf88d7189~tplv-obj.webp' },
            { name: 'Super GG', coins: 100,   giftPictureUrl: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/cbd7588c53ec3df1af0ed6d041566362.png~tplv-obj.webp' },
            { name: 'Galaxy',  coins: 1000,   giftPictureUrl: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/79a02148079526539f7599150da9fd28.png~tplv-obj.webp' },
            { name: 'Phoenix', coins: 25999,  giftPictureUrl: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/2c5980ea26241ebeeab76de701d47968.png~tplv-obj.webp' }
        ]);
        tiktokGiftMessage({
            ...tiktokBase(),
            giftType: randomFrom([0, 1]),
            repeatEnd: true,
            repeatCount: randomInt(1, 5),
            diamondCount: gift.coins,
            giftName: gift.name,
            giftPictureUrl: gift.giftPictureUrl
        });
    };

    const isOn = (fn) => {
        try { return Boolean(fn()); } catch { return false; }
    };

    const platformFlags = {
        twitch:  () => showTwitch,
        youtube: () => showYoutube,
        kick:    () => showKick,
        tiktok:  () => showTiktok
    };

    const eventFlags = {
        'twitch:follow':          () => showTwitchFollows,
        'twitch:sub':             () => showTwitchSubs,
        'twitch:resub':           () => showTwitchSubs,
        'twitch:giftsub':         () => showTwitchSubs && showTwitchGiftedSubs,
        'twitch:giftbomb':        () => showTwitchSubs && showTwitchMassGiftedSubs,
        'twitch:cheer':           () => showTwitchBits,
        'twitch:powerup':         () => showTwitchPowerUpRedemption,
        'twitch:custompowerup':   () => showTwitchPowerUpRedemption,
        'twitch:raid':            () => showTwitchRaids,

        'youtube:superchat':      () => showYouTubeSuperChats,
        'youtube:supersticker':   () => showYouTubeSuperStickers,
        'youtube:sponsor':        () => showYouTubeMemberships,
        'youtube:giftmembership': () => showYouTubeMemberships && showYouTubeGiftMemberships,
        'youtube:jewels':         () => showYouTubeJewels,

        'kick:follow':            () => showKickFollows,
        'kick:sub':               () => showKickSubs,
        'kick:giftsub':           () => showKickGiftedSubs,
        'kick:giftbomb':          () => showKickGiftedSubs && showKickMassGiftedSubs,
        'kick:kicksgifted':       () => showKickKicks,

        'tiktok:follow':          () => showTikTokFollows,
        'tiktok:share':           () => showTikTokShares,
        'tiktok:like':            () => showTikTokLikes,
        'tiktok:superfan':        () => showTikTokSubs,
        'tiktok:gift':            () => showTikTokGifts
    };

    const weights = {
        'twitch:follow': 3,
        'twitch:cheer': 2,
        'kick:follow': 3,
        'tiktok:follow': 3,
        'tiktok:like': 2,
        'tiktok:gift': 2,
        'twitch:giftbomb': 0.5,
        'kick:giftbomb': 0.5
    };

    function getPlatformFlags() {
        return Object.fromEntries(
            Object.entries(platformFlags).map(([platform, fn]) => [platform, isOn(fn)])
        );
    }

    function activeGeneratorKeys() {
        return Object.keys(generators).filter((key) => {
            const platform = key.split(':')[0];
            if (!isOn(platformFlags[platform] ?? (() => false))) return false;
            return key in eventFlags ? isOn(eventFlags[key]) : true;
        });
    }

    function usableGeneratorKeys() {
        return activeGeneratorKeys().flatMap((key) => {
            const weight = weights[key] ?? 1;
            if (weight < 1) return Math.random() < weight ? [key] : [];
            return Array(Math.round(weight)).fill(key);
        });
    }

    function fire(key) {
        const generator = generators[key];
        if (!generator) {
            console.warn(`[CreditsRD][TestMode] Event "${key}" doesn't exist.`);
            return;
        }
        try {
            generator();
            console.debug(`[CreditsRD][TestMode] Event fired: ${key}`);
        } catch (err) {
            console.error(`[CreditsRD][TestMode] Error when generating event "${key}":`, err);
        }
    }

    function fireRandom() {
        const keys = usableGeneratorKeys();
        if (keys.length === 0) return;
        fire(randomFrom(keys));
    }

    function populate(count = 30) {
        for (let i = 0; i < count; i++) fireRandom();
        console.info(`[CreditsRD][TestMode] ${count} events fired.`);
    }

    function scheduleNext() {
        const delay = randomInt(
            Math.min(testModeMinInterval, testModeMaxInterval),
            Math.max(testModeMinInterval, testModeMaxInterval)
        );
        timeoutId = setTimeout(() => {
            fireRandom();
            if (running) scheduleNext();
        }, delay);
    }

    function start() {
        if (running) return;
        running = true;
        fireRandom();
        scheduleNext();
        document.dispatchEvent(new CustomEvent('creditsrd:testmode:start'));
        console.info('[CreditsRD][TestMode] Demo mode started.');
        console.debug('[CreditsRD][TestMode] Platform flags:', getPlatformFlags());
        console.debug('[CreditsRD][TestMode] Active events:', activeGeneratorKeys());
    }

    function stop() {
        running = false;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
        document.dispatchEvent(new CustomEvent('creditsrd:testmode:stop'));
        console.info('[CreditsRD][TestMode] Demo mode stopped.');
    }

    function toggle() {
        running ? stop() : start();
    }

    async function clear() {
        if (typeof clearSession === 'function') await clearSession();
    }

    return {
        start,
        stop,
        toggle,
        fire,
        fireRandom,
        populate,
        clear,
        isRunning: () => running,
        listEvents: () => Object.keys(generators),
        listActiveEvents: () => activeGeneratorKeys()
    };

})();

window.TestMode = TestMode;
window.startTestMode = TestMode.start;
window.stopTestMode = TestMode.stop;
window.fireTestEvent = TestMode.fire;
window.fireRandomTestEvent = TestMode.fireRandom;
window.populateTestMode = TestMode.populate;

if (testModeAutoStart) {
    document.addEventListener('DOMContentLoaded', () => {
        const waitForConnection = setInterval(() => {
            if (typeof streamerBotStatus !== 'undefined' && streamerBotStatus.connected === true) {
                clearInterval(waitForConnection);
                TestMode.start();
            }
        }, 1000);
    });
}