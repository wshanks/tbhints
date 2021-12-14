/*

   Copyright 2021 Will Shanks

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */

/* global browser */
let contentScript = { js: [{ file: "content.js" }] };
browser.messageDisplayScripts.register(contentScript);

// Listen for message from content script -- it will be an url to open
async function linkListener(message) {
  await browser.windows.openDefaultBrowser(message.url);
}
browser.runtime.onMessage.addListener(linkListener);

browser.runtime.onMessageExternal.addListener(
  // eslint-disable-next-line no-unused-vars
  (message, sender, sendResponse) => {
    switch (message) {
      case "show-hints":
        triggerHints();
        break;
      default:
    }
  }
);

async function triggerHints() {
  // Get current tab
  let tabs = await browser.tabs.query({ active: true, currentWindow: true });
  let tab = tabs[0];

  // If current tab is folder tab, try to focus message pane, so that input box
  // can get focus and capture hint selection
  let messagePaneFocused = false;
  if (tab.mailTab) {
    messagePaneFocused = await browser.tbhints.FocusMessagePane();
  }

  // If tab has a message displayed, hint the message
  if (tab.type == "messageDisplay" || (tab.mailTab && messagePaneFocused)) {
    browser.tabs.sendMessage(tab.id, "show-hints");
  }
}

// eslint-disable-next-line no-unused-vars
browser.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "show-hints":
      await triggerHints();
      break;
    default:
  }
});
