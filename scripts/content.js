/* globals browser */
const hintLetters = "fjdkslgha";

function labelAnchors() {
  let links = document.getElementsByTagName('a');
  if (links.length == 0) {
    return {}
  }

  let labels = [];
  let numLabels = links.length < hintLetters.length ** 2 ? links.length : hintLetters.length ** 2;
  if (links.length <= hintLetters.length) {
    labels = Array.from(Array(numLabels), (_, i) => hintLetters[i]);
  } else {
    labels = Array.from(
      Array(numLabels),
      (_, i) => hintLetters[Math.floor(i / hintLetters.length)] + hintLetters[i % hintLetters.length]
    )
  }

  let labeledAnchors = {}
  for (let idx=0; idx < labels.length; idx++) {
    labeledAnchors[labels[idx]] = links[idx];
  }

  return labeledAnchors
}

function hintDOM(labeledAnchors) {
  let hintHolder = document.createElement("div");
  for (let label in labeledAnchors) {
    let span = makeHint(label, labeledAnchors[label]);
    hintHolder.appendChild(span);
  }
  document.documentElement.appendChild(hintHolder);

  return hintHolder
}

function makeHint(label, anchor) {
  let pad = 4;
  let flag = document.createElement("span");
  flag.textContent = label;
  flag.className = "tbhintsHint";

  const clientRects = anchor.getClientRects()
  let rect = clientRects[0];
  for (const recti of clientRects) {
      if (recti.bottom > 0 && recti.right > 0) {
          rect = recti
          break
      }
  }

  const top = rect.top > 0 ? rect.top : pad;
  const left = rect.left > 0 ? rect.left : pad;
  let x = window.scrollX + left;
  let y = window.scrollY + top;
  console.log(`${x}, ${y}`)

  flag.style.cssText = `
  left: ${x}px !important;
  top: ${y}px !important;
  background-color: yellow !important;
  color: black !important;
  border-color: white !important;
  border-width: 2px !important;
  padding: 2pt !important;
  position: absolute !important;
  z-index: 1 !important;
  text-align: center !important;
  `
  flag.style.display = "none";
  console.log(anchor.textContent);

  return flag
}

class HintingStatus {
  constructor() {
    // Keys that have been pressed in hint mode
    this.keys = "";
    // All hinted elments in the document
    this.hints = labelAnchors();
    if (Object.keys(this.hints).length > 0) {
      this.hintLength = Object.keys(this.hints)[0].length;
    } else {
      this.hintLength = 0;
    }
    // div holding all hint DOM elements
    this.hintHolder = hintDOM(this.hints);
    // holder for key listener
    this._listener = null;
    this.input = null;
  }

  handleKey(event) {
    console.log(`tbhints: handle ${event.key}`)
    if (event.key.length != 1) {
      if (["Control", "Alt", "Shift", "Meta"].includes(event.key)) {
        // Ignore modifier key presses
        return
      } else {
        // Reset for other special keys like Escape
        this.reset();
      }
    }

    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
      this.reset();
      return
    }

    if (hintLetters.indexOf(event.key) == -1) {
      this.reset();
      return
    }
    
    this.keys = this.keys + event.key;
    if (this.keys.length < this.hintLength) {
      event.stopImmmediatePropagation();
      event.preventDefault();
      return
    }

    if (this.keys in this.hints) {
      browser.runtime.sendMessage({"url": this.hints[this.keys].href});
      this.reset();
      event.stopImmmediatePropagation();
      event.preventDefault();
    }
  }

  activate() {
    console.log("tbhints activated");
    if (Object.keys(this.hints).legnth == 0) {
      return
    }

    this.reset();
    this._listener = this.handleKey.bind(this);
    // document.addEventListener('keydown', this._listener);
    // Hack: is there a better way to make sure the key listener can see key events?
    // document.documentElement.focus()
    //
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.style.cssText = `
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    border-color: white !important;
    padding: 2pt !important;
    position: fixed !important;
    z-index: 2 !important;
    `
    this.hintHolder.appendChild(this.input);
    this.input.focus();
    this.input.addEventListener('keydown', this._listener);

    for (let hint of this.hintHolder.children) {
      hint.style.display = "";
    }
  }

  reset() {
    console.log("start tbhints reset")
    this.keys = "";
    // document.removeEventListener("keydown", this._listener);
    if (this.input !== null) {
      this.input.removeEventListener("keydown", this._listener);
    }
    for (let hint of this.hintHolder.children) {
      console.log(hint.style)
      hint.style.display = "none";
    }
    console.log("end tbhints reset")
  }
}

const status = new HintingStatus();

browser.runtime.onMessage.addListener(
  (_message, _sender, _sendMessage) => { // eslint-disable-line no-unused-vars
    status.activate();
  }
)
