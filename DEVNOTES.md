# Background

Here are some notes on what was found while writing this extension:

`tbhints` began as an experiment to see if it were possible to support a link hinting feature in Thunderbird using a MailExtension.
Assuming the experiment was successful, a next step could be to figure out how port an existing link hinting WebExtension like to LinkHints or Tridactyl to Thunderbird.

# Findings

1. Initially, I tried to set up a key event listener to capture hint selection.
However, this approach was problematic because Thunderbird has many built in single key shortcuts and those would also fire even if the MailExtension used `stopPropagation()` and `preventDefault()`.
I could not find a way to suppress these events from a MailExtension (the tbkeys extension can suppress them via an Experiment).
For This reason, an input field was used to capture hint selection.

2. Content scripts can be injected into message documents (the html document for a single email) (as well for compose windows).
When a message is opened in its own tab, this behaves similarly to a web browser like Firefox where a content script can control most of the interaction with the user.
However, when a message is viewed in the preview pane of the main folder view of Thunderbird, there are a lot of UI elements (like the folder and message lists) which the content script has no control over.
In particular, if the message preview pane does not have focus, a content script can not give it focus.
This deficiency makes for a bad user experience when trying to hint a message from the folder view.
One needs to tab over many times to get to the hint selection input box.
Currently, tbhints works around this by using an experiment to force the focus to the message preview pane.

These two findings make it difficult to see how a WebExtension could be ported to a MailExtension without a lot of shimming.
Also, it should be noted that the API for injecting content scripts into the message documents is different from the one WebExtensions use to inject into page documents, so that would need shimming as well.
For something like Tridactyl, the lack of many WebExtension API's it likely uses for features other than hinting would also be problematic.
