# tbhints

tbhints is a Thunderbird extension that allows opening links within messages from the keyboard similarly to browser extensions like Pentadactyl, Vimperator, VimFX, Tridactyl, Vimium, LinkHints, etc.

## Installation

tbhints can be installed by zipping the contents of the `src/` directory into a file (or running `make tbhints` to produce a xpi file in the `build/` directory) and installing it via the Thunderbird addons manager.
It can also be installed temporarily from the `Tools->Developer Tools->Debug Addons` page by selecting the `manifest.json` file in the `src/` directory.

## Usage

From the main folder tab (with the message preview pane not hidden) or a message tab, press `ctrl+shift+E` to activate link hinting.
If the message contains links, boxes with one or two letters should appear over the links and a text box should be focused at the bottom of the message.
Enter one of the strings of letters to open the link with the default web browser.
Hitting Escape with the input box focused or entering an invalid hint string in the input box will hide the hints and the input box.

### More flexible binding

The MailExtensions API limits command bindings to modifier plus key.
To trigger hints from a single key (or a different combination of keys), the [tbkeys or tbkeys-lite](https://github.com/wshanks/tbkeys) extensions (version 2.2 or newer) may be used.
To do so, the command should be `"memsg:tbhints@addons.thunderbird.net:show-hints"`.

## Experiments usage

`tbhints` uses an [Experiment](https://developer.thunderbird.net/add-ons/mailextensions/experiments) to focus the hint selection input box on the folder tab.
Experiments require full access to Thunderbird and present a warning about this at extension installation time.
It would be great to find a convenient way to capture hint input without needing an Experiment.

## External control

Hints can be triggered from another MailExtension by using `browser.runtime.sendMessage()` to send a message with content `"show-hints"` to `tbhints`.
