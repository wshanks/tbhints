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
  let win = await browser.windows.create({
    type: "normal",
    titlePreface: "tbhints test",
    width: 200,
    height: 20,
    url: browser.runtime.getURL("") + "input.html"
  });
  tabs = await browser.tabs.query({
    windowId: win.id,
    active: true,
  });
  await browser.tabs.executeScript(
    tabs[0].id,
    {code: 'document.querySelector("#inputbox")[0].focus();'}
  );
})
