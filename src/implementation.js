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

"use strict";
/* global ChromeUtils */

var { ExtensionCommon } = ChromeUtils.import(
  "resource://gre/modules/ExtensionCommon.jsm"
);
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

// eslint-disable-next-line no-unused-vars
var tbhints = class extends ExtensionCommon.ExtensionAPI {
  onShutdown(isAppShutdown) {
    if (isAppShutdown) return;

    // Thunderbird might still cache some of your JavaScript files and even
    // if JSMs have been unloaded, the last used version could be reused on
    // next load, ignoring any changes. Get around this issue by
    // invalidating the caches (this is identical to restarting TB with the
    // -purgecaches parameter):
    Services.obs.notifyObservers(null, "startupcache-invalidate", null);
  }

  // eslint-disable-next-line no-unused-vars
  getAPI(context) {
    return {
      tbhints: {
        /**
         * Focuses the message pane of the folder tab if the folder tab is
         * currently active in the most recent window.
         * @return {Boolean} true if the message pane was successfully focused.
         */
        // eslint-disable-next-line require-await
        FocusMessagePane: async function () {
          let win = Services.wm.getMostRecentWindow("mail:3pane");
          let tabmail = win.document.getElementById("tabmail");
          let folderTabActive =
            tabmail.selectedTab.tabNode.mode.type == "folder";

          if (folderTabActive && !win.IsMessagePaneCollapsed()) {
            win.SetFocusMessagePane();
            return true;
          }

          return false;
        },
      },
    };
  }
};
