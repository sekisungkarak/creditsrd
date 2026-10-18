# ![CreditsRD](https://i.imgur.com/9UJUxeU.png)

A Multistream End Credits Overlay. Supports **Twitch**, **YouTube**, **TikTok** and **Kick**.

![CreditsRD Config UI](https://i.imgur.com/lByJMQC.jpeg)

## 🛠️ Setting it up
First, download **[Streamer.bot](https://streamer.bot/)** for **Twitch**, **YouTube** and **Kick** support and the **[TikFinity Desktop App](https://app.tikfinity.com/)** for TikTok (partial) support. Make sure your **Twitch**, **YouTube** and **Kick** accounts are connected on **Streamer.bot**. Also have **TikFinity Desktop App** installed and your account on **TikTok** setup. 

If you have both of these ready, follow these steps:

1. On **Streamer.bot**, go to **Server/Clients → WebSocket Server** and make sure it is running.
2. Open the [Settings Page](https://vortisrd.github.io/creditsrd) in your browser.
3. Choose your desired options.
4. **Don't forget select a platform to tie CreditsRD to.** It will detect when a stream on that platform starts then it will clean the credits database to start collecting newer events.
5. Select how many events you will want to show per category. If goes beyond that, it will show "and X more...".
6. Click **"Copy URL"**.
7. Add the copied URL as a Browser Source in OBS.

---

## ❓ Frequently Asked Questions

**- TikTok events are not working anymore, what should I do?**
R: Make sure your TikFinity is connected to your account and you are live.

**- Kick events are not working or are taking too much time to show, what should I do?**
R: Kick's API is notoriously slow on their peak usage. It's been reported on [Streamer.bot](https://discord.streamer.bot/) Discord (check the #html-css-js section) that sometimes it could take up to 60 seconds for the responses to be relayed. I hope in the future they throw more money into their servers.

**- Can you add other streaming/payment platforms?**
R: CreditsRD uses Streamer.Bot to 95% of all platform iterations. *TikFinity* is perfectly integrated via WebSockets. So if the platform has any integration with Streamer.bot or has a decent WebSocket API (not WebHooks), feel free to suggest it. Other than that, there are no plans to add more platforms.

**- Can I customize it?**
R: If you mean visual styles, you can add your own using the *Custom CSS* field in OBS's Browser Source Properties Window. You can use your browser Dev Tools to inspect the elements you want to change. **I won't provide support if you're planning to customize codes that could break CreditsRD**.

**- I forked/downloaded CreditsRD to change it to my liking, both on CSS and Javascript. Can you provide support in this situation?**
R: I assume you know what you're doing if you forked/downloaded CreditsRD to customize it. That being said, **no, I won't.**.

---

## ✨ Credits

Made with ❤️ by **VortisRD**  

🔗 [GitHub](https://github.com/vortisrd) • [Twitch](https://twitch.tv/vortisrd) • [YouTube](https://youtube.com/@vortisrd) • [Kick](https://kick.com/vortisrd) • [TikTok](https://tiktok.com/@vortisrd) • [Twitter / X](https://twitter.com/vortisrd)