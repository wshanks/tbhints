# tbhints

tbhints is a Thunderbird extension that allows opening links within messages from the keyboard similarly to browser extensions like Pentadactyl, Vimperator, VimFX, Tridactyl, Vimium, LinkHints, etc.

## Installation

tbhints can be installed by zipping the contents of the `src/` directory into a file and installing it via the Thunderbird addons manager.
It can also be installed temporarily from the `Tools->Developer Tools->Debug Addons` page by selecting the `manifest.json` file in the `src/` directory.

## Usage

From the main folder tab (with the message preview pane not hidden) or a message tab, press `ctrl+shift+E` to activate link hinting.
If the message contains links, boxes with one or two letters should appear over the links and a text box should be focused at the bottom of the message.
Enter one of the strings of letters to open the link with the default web browser.
Hitting Escape with the input box focused or entering an invalid hint string in the input box will hide the hints and the input box.

## Experiments usage

`tbhints` uses an Experiment to focus the hint selection input box on the folder tab.
Experiments require full access to Thunderbird.
It would be great to find a convenient way to capture hint input without needing an Experiment.
