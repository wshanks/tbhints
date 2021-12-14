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

/* globals browser */
// Characters used to build hint labels
const hintLetters = "fjdkslgha";

/**
 * Assigns a hint string to each anchor in the current document.
 * Assigns at most the first `hintLetters` squared anchors.
 * @return {!Object<string, HTMLElement>} Mapping of hint strings to anchor DOM
 *     elements
 */
function labelAnchors() {
  let links = document.getElementsByTagName("a");
  if (links.length == 0) {
    return {};
  }

  let labels = [];
  if (links.length <= hintLetters.length) {
    // Single letter hints
    labels = Array.from(Array(links.length), (_, i) => hintLetters[i]);
  } else {
    // Two letter hints
    let numLabels = Math.min(links.length, hintLetters.length ** 2);
    labels = Array.from(Array(numLabels), (_, i) => {
      [
        hintLetters[Math.floor(i / hintLetters.length)],
        hintLetters[i % hintLetters.length],
      ].join("");
    });
  }

  let labeledAnchors = {};
  for (let idx = 0; idx < labels.length; idx++) {
    labeledAnchors[labels[idx]] = links[idx];
  }

  return labeledAnchors;
}

/**
 * Draws hint label spans over each link in the document.
 * @param {!Object<string, HTMLElement>} labeledAnchors Mapping of hint strings
 *     to anchor DOM elements
 * @return {HTMLElement} A new div element containing all all hint spans as
 *     children.
 */
function hintDOM(labeledAnchors) {
  let hintHolder = document.createElement("div");
  for (let label in labeledAnchors) {
    let span = makeHint(label, labeledAnchors[label]);
    hintHolder.appendChild(span);
  }
  document.documentElement.appendChild(hintHolder);

  return hintHolder;
}

/**
 * Create a span HTMLElement to hint an anchor node
 * @param {string} label String label to show as the hint text
 * @param {HTMLElement} anchor HMTLElement for the anchor tag to be hinted
 */
function makeHint(label, anchor) {
  let pad = 4;
  let flag = document.createElement("span");
  flag.textContent = label;
  flag.className = "tbhintsHint";

  const clientRects = anchor.getClientRects();
  let rect = clientRects[0];
  for (const recti of clientRects) {
    if (recti.bottom > 0 && recti.right > 0) {
      rect = recti;
      break;
    }
  }

  const top = rect.top > 0 ? rect.top : pad;
  const left = rect.left > 0 ? rect.left : pad;
  let x = window.scrollX + left;
  let y = window.scrollY + top;

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
  `;
  flag.style.display = "none";

  return flag;
}

/** A class to hold the hinting state of the document.
 *
 * On first call to `activate()` labels strings and span DOM elements are
 * generated for all anchors in the message. This class is intended to be used
 * as a singleton so that its `reset()` method can clean up and hide hints when
 * they are not needed.
 */
class HintingStatus {
  constructor() {
    // Setting these properties is delayed until the first call to activate()
    // All hinted elments in the document
    this.hints = null;
    // div holding all hint DOM elements
    this.hintHolder = null;
  }

  /** Handles changes to text in the hint selection input
   * @param {Event} event
   */
  handleInput(event) {
    let current = event.target.value;

    // All hints have the same length, so check the length of first one
    let hintLength = Object.keys(this.hints)[0].length;
    if (current.length < hintLength) {
      return;
    }

    if (current in this.hints) {
      let url = this.hints[current].href;
      browser.runtime.sendMessage({ url: url });
    }
    // Reset even if not a match if enough characters entered
    this.reset();
  }

  /** Handles escape key in hint selection input
   * @param {Event} event
   */
  handleEscape(event) {
    if (event.key == "Escape") {
      this.reset();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Starts hint mode. Reveals hints and focuses hint selection input
   */
  activate() {
    if (this.hints === null) {
      this.hints = labelAnchors();
      this.hintHolder = hintDOM(this.hints);
    }
    if (Object.keys(this.hints).length == 0) {
      return;
    }

    // Reset in case activate triggered multiple times
    this.reset();

    // Create input element to capture hint selection
    let input = document.createElement("input");
    input.type = "text";
    input.style.cssText = `
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    border-color: white !important;
    padding: 2pt !important;
    position: fixed !important;
    z-index: 2 !important;
    `;
    this.hintHolder.appendChild(input);
    input.addEventListener("input", this.handleInput.bind(this));
    input.addEventListener("keydown", this.handleEscape.bind(this));
    input.focus();

    // Reveal hints
    for (let hint of this.hintHolder.children) {
      hint.style.display = "";
    }
  }

  /** Resets hinting mode. Hides hints and removes hint selection input
   */
  reset() {
    if (this.hintHolder === null) {
      // Unnecessary but here just in case a refactor call reset() before
      // hintHolder is populated.
      return;
    }

    // Remove input element
    let inputs = this.hintHolder.getElementsByTagName("input");
    for (let input of inputs) {
      input.remove();
    }
    // Hide hints
    for (let hint of this.hintHolder.children) {
      hint.style.display = "none";
    }
  }
}

// Hinting state singleton
const status = new HintingStatus();

browser.runtime.onMessage.addListener(
  // eslint-disable-next-line no-unused-vars
  (_message, _sender, _sendMessage) => {
    status.activate();
  }
);
