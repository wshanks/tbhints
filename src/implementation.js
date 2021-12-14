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
        // FocusMessagePane: focus the message pane of the folder tab if the
        // folder tab is currently active in the most recent window. Return
        // true if the message pane was successfully focused.
        //
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
