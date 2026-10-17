/* ---------------------- */
/* KICK MODULE VARIABLES */
/* ---------------------- */

const showKick                      = getURLParam("showKick", false);

const showKickFollows               = getURLParam("showKickFollows", true);
const showKickKicks                 = getURLParam("showKickKicks", true);
const showKickSubs                  = getURLParam("showKickSubs", true);
const showKickGiftedSubs            = getURLParam("showKickGiftedSubs", true);
const showKickMassGiftedSubs        = getURLParam("showKickMassGiftedSubs", true);


// KICK EVENTS HANDLERS

const kickMessageHandlers = {
    'Kick.Follow': (response) => {
        kickFollowMessage(response.data);
    },
    'Kick.Subscription': (response) => {
        kickSubMessageFromStreamerBot(response.data);
    },
    'Kick.Resubscription': (response) => {
        kickSubMessageFromStreamerBot(response.data);
    },
    'Kick.GiftSubscription': (response) => {
        kickGiftMessageFromStreamerBot(response.data);
    },
    'Kick.MassGiftSubscription': (response) => {
        kickMassGiftMessageFromStreamerBot(response.data);
    },
    'Kick.KicksGifted': (response) => {
        kickKicksGiftedMessageFromStreamerBot(response.data);
    },
    'Kick.StreamOnline': (response) => {
        creditsRdReset('kick');
    }

};



document.addEventListener('DOMContentLoaded', async () => {
    if (showKick) {
        waitForStreamerBot('Kick').then(() => {
            registerPlatformHandlersToStreamerBot(kickMessageHandlers, '[CreditsRD][Streamer.bot][Kick]');
        });
    }
});



// ---------------------------
// KICK UTILITY FUNCTIONS

async function kickFollowMessage(data) {
	if (showKickFollows == false) return;

	const { id, name, login } = data.user;
    const avatar = data.user.profilePicture;

	addEvent({
		id: `kick-follow-${id}`,
		platform: "kick",
		type: "follow",
		ts: Date.now(),
		user: { id, name, avatar }
	});
}

async function kickKicksGiftedMessageFromStreamerBot(data) {

    if (showKickKicks == false) return;

    const { id, name } = data.sender;
    const avatar = data.sender.profilePicture;

	addEvent({
		id: `kick-kicks-${id}-${Date.now()}`,
		platform: "kick",
		type: "kicks",
		ts: Date.now(),
		user: { id, name, avatar },
        data: { amount: data.gift.amount }
	});

}

async function kickSubMessageFromStreamerBot(data) {

    if (showKickSubs == false) return;

    const { id, name, login } = data.user;
    const avatar = data.user.profilePicture;

	addEvent({
		id: `kick-subs-${id}-${Date.now()}`,
		platform: "kick",
		type: "sub",
		ts: Date.now(),
		user: { id, name, avatar },
        data: { months: data.duration }
	});
}

async function kickGiftMessageFromStreamerBot(data) {

    if (showKickGiftedSubs == false) return;

    const { id, name, login } = data.user;
    const avatar = data.user.profilePicture;
    const recipient = data.recipient?.name;

    if (!recipient) return; // sem destinatário não é presente direto

    addEvent({
        id: `kick-giftSub-${id}-${data.recipient?.id ?? recipient}-${Date.now()}`,
        platform: "kick",
        type: "giftSub",
        ts: Date.now(),
        user: { id, name, avatar },
        data: { amount: 1, months: 1, recipient: recipient }
    });

}

async function kickMassGiftMessageFromStreamerBot(data) {

    if (showKickGiftedSubs == false || showKickMassGiftedSubs == false) return;

    const { id, name, login } = data.user;
    const avatar = data.user.profilePicture;
    const total = data.recipients.length;

    addEvent({
        id: `kick-giftSub-${id}-${Date.now()}`,
        platform: "kick",
        type: "giftSub",
        ts: Date.now(),
        user: { id, name, avatar },
        data: { amount: total }
    });
}