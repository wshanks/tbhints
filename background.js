/* global browser */
let contentScript = {js: [{file: "scripts/content.js"}]};
browser.messageDisplayScripts.register(contentScript);

async function linkListener(message) {
  await browser.windows.openDefaultBrowser(message.url);
}

browser.runtime.onMessage.addListener(linkListener)

browser.commands.onCommand.addListener(async (command) => { // eslint-disable-line no-unused-vars
  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  console.log(tabs[0]);
  browser.tabs.sendMessage(tabs[0].id, "show-hints");
})
