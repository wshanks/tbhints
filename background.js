/* global browser */
let contentScript = {js: [{file: "content.js"}]};
browser.messageDisplayScripts.register(contentScript);

// Listen for message from content script -- it will be an url to open
async function linkListener(message) {
  await browser.windows.openDefaultBrowser(message.url);
}
browser.runtime.onMessage.addListener(linkListener)

// eslint-disable-next-line no-unused-vars
browser.commands.onCommand.addListener(async (command) => {
  // Get current tab
  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  let tab = tabs[0];

  // If current tab is folder tab, try to focus message pane, so that input box
  // can get focus and capture hint selection
  let messagePaneFocused = false;
  if (tab.mailTab) {
    messagePaneFocused = await browser.tbhints.FocusMessagePane();
  }

  // If tab has a message displayed, hint the message
  if (tab.type == "messageDisplay" || tab.mailTab && messagePaneFocused) {
    browser.tabs.sendMessage(tab.id, "show-hints");
  }
})
