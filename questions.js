// Question types: 'mcq' | 'fix'
// fix questions have: brokenCode, lang, validate(code) -> bool, fixHint

const SECTIONS = {
  JS:     "JavaScript",
  IFRAME: "iFrame & Embedding",
  IPAPER: "iPaper Platform",
};

const QUESTIONS = [

  // ═══════════════════════════════════════════════════════
  //  JAVASCRIPT  (3 MCQ + 2 fix = 5)
  // ═══════════════════════════════════════════════════════

  {
    id: 1, type: "mcq", section: "JS",
    text: "What does the following code log to the console?",
    code: `console.log(typeof null);`,
    lang: "js",
    options: [
      { text: '"null"',      correct: false },
      { text: '"object"',    correct: true  },
      { text: '"undefined"', correct: false },
      { text: '"boolean"',   correct: false },
    ],
    explanation: '`typeof null` returns "object" — a well-known quirk in JavaScript that has existed since its first version.',
  },

  {
    id: 2, type: "mcq", section: "JS",
    text: "Which of the following correctly explains the difference between `==` and `===`?",
    options: [
      { text: "`==` checks value and type; `===` checks value only.",                             correct: false },
      { text: "`==` performs type coercion before comparing; `===` requires both value and type to match.", correct: true  },
      { text: "They are identical — `===` is just an alias.",                                      correct: false },
      { text: "`===` can only compare strings; `==` compares all types.",                          correct: false },
    ],
    explanation: "Strict equality (`===`) never coerces types. `5 === '5'` is false, but `5 == '5'` is true because `==` converts the string to a number first.",
  },

  {
    id: 3, type: "mcq", section: "JS",
    text: "A customer wants to receive messages sent from an embedded iPaper flipbook. Which window event should they listen to?",
    code: `window.addEventListener('?', function(event) {
  console.log(event.data);
});`,
    lang: "js",
    options: [
      { text: '"load"',        correct: false },
      { text: '"message"',     correct: true  },
      { text: '"postMessage"', correct: false },
      { text: '"iframe"',      correct: false },
    ],
    explanation: 'Cross-origin communication uses `postMessage()` on the sender side and the `"message"` event on the receiver\'s `window` object.',
  },

  // ── Fix #1 ──────────────────────────────────────────────
  {
    id: 4, type: "fix", section: "JS",
    text: "This function is supposed to check if a value is exactly the number 42 — but it's too loose. Fix the comparison so it also checks the type.",
    lang: "js",
    brokenCode: `function isFortyTwo(val) {
  if (val == 42) {
    return true;
  }
  return false;
}`,
    validate: (code) => code.includes("===") && !code.replace(/===/, "").includes("=="),
    fixHint: "Hint: loose equality (`==`) allows type coercion. There is a stricter alternative.",
    explanation: "Using `===` (strict equality) ensures `isFortyTwo('42')` returns false, because the string '42' is not the same type as the number 42.",
  },

  // ── Fix #2 ──────────────────────────────────────────────
  {
    id: 5, type: "fix", section: "JS",
    text: "This code should log 'Button clicked!' when the button is pressed, but nothing happens. There's a typo — find and fix it.",
    lang: "js",
    brokenCode: `const btn = document.querySelector('#submitBtn');

btn.addEventListner('click', function() {
  console.log('Button clicked!');
});`,
    validate: (code) => code.includes("addEventListener") && !code.includes("addEventListner"),
    fixHint: "Hint: look very carefully at the method name on line 3.",
    explanation: '`addEventListner` is a typo — the correct method is `addEventListener`. JavaScript method names are case-sensitive and must be spelled exactly right.',
  },

  // ═══════════════════════════════════════════════════════
  //  IFRAME & EMBEDDING  (3 MCQ + 2 fix = 5)
  // ═══════════════════════════════════════════════════════

  {
    id: 6, type: "mcq", section: "IFRAME",
    text: "A customer's browser console shows: `Refused to display in a frame because it set 'X-Frame-Options' to 'SAMEORIGIN'`. What does this mean?",
    options: [
      { text: "The iframe src URL has a typo.",                                                                            correct: false },
      { text: "The resource being framed only allows itself to be embedded by pages on the same origin.",                  correct: true  },
      { text: "The customer's own page has blocked all iframes.",                                                          correct: false },
      { text: "The iframe needs an HTTPS URL.",                                                                            correct: false },
    ],
    explanation: "X-Frame-Options: SAMEORIGIN on the embedded resource means it will only load inside an iframe if the parent page shares the same domain and protocol.",
  },

  {
    id: 7, type: "mcq", section: "IFRAME",
    text: "According to iPaper's documentation, what happens if you resize the flipbook's container? Which element should you resize?",
    options: [
      { text: "Resize the `<iframe>` element directly.",                     correct: false },
      { text: "Resize the outer wrapper `<div>` that contains the iframe.",  correct: true  },
      { text: "Resize both the iframe and its wrapper.",                      correct: false },
      { text: "You cannot dynamically resize an embedded flipbook.",          correct: false },
    ],
    explanation: "iPaper's docs explicitly state: 'Dynamically resizing the div will work. Do make sure you resize the outer element and not the iframe.'",
  },

  {
    id: 8, type: "mcq", section: "IFRAME",
    text: "A customer embeds an iPaper flipbook using an iframe but reports it looks tiny on their page with lots of whitespace around it. What is the simplest fix?",
    options: [
      { text: "Set `scrolling=\"yes\"` on the iframe.",                                              correct: false },
      { text: "Set `width=\"100%\"` and `height=\"100%\"` directly on the iframe element.",          correct: false },
      { text: "Set `width=\"100%\"` on the iframe and increase the `height` value to better fill the space.", correct: false },
      { text: "Set a `max-width` or fixed size on the wrapper `<div>` containing the iframe and experiment until it fits the layout.", correct: true  },
    ],
    explanation: "Whitespace around the flipbook usually means the containing element is wider than the flipbook renders at. iPaper's docs recommend setting a `max-width` or explicit size on the outer wrapper div rather than resizing the iframe itself.",
  },

  // ── Fix #3 ──────────────────────────────────────────────
  {
    id: 9, type: "fix", section: "IFRAME",
    text: "This iframe embeds an iPaper flipbook but video enrichments won't go fullscreen and autoplay is blocked. Add the missing attributes to fix both issues.",
    lang: "html",
    brokenCode: `<iframe
  src="https://viewer.ipaper.io/demo/brochure/"
  width="100%"
  height="600"
  frameborder="0">
</iframe>`,
    validate: (code) =>
      code.includes("allow=") &&
      code.toLowerCase().includes("fullscreen") &&
      code.toLowerCase().includes("autoplay") &&
      code.toLowerCase().includes("allowfullscreen"),
    fixHint: "Hint: iPaper docs say you need an `allow` attribute with specific values, plus a backwards-compat attribute.",
    explanation: 'Add `allow="autoplay; fullscreen;"` and the `allowfullscreen` attribute. The `allow` attribute controls the Permissions Policy for features like autoplay and fullscreen inside the iframe.',
  },

  // ── Fix #4 ──────────────────────────────────────────────
  {
    id: 10, type: "fix", section: "IFRAME",
    text: "A customer reports unexpected whitespace around their full-page flipbook embed. The wrapper div is missing the one CSS property that fixes this. Add it.",
    lang: "html",
    brokenCode: `<!DOCTYPE html>
<html style="height: 100%">
<body style="height: 100%">

  <div style="height: 100%; width: 100%;">
    <iframe
      src="https://viewer.ipaper.io/demo/brochure/"
      scrolling="no"
      frameborder="0"
      style="width: 100%; height: 100%"
      allow="autoplay; fullscreen;"
      allowfullscreen>
    </iframe>
  </div>

</body>
</html>`,
    validate: (code) =>
      code.includes("overflow") && code.includes("hidden"),
    fixHint: "Hint: iPaper's full-page embed guide says the wrapper div needs a specific overflow setting.",
    explanation: "Adding `overflow: hidden` to the wrapper div prevents the browser rendering whitespace or scrollbars around the iframe. This is a required step in iPaper's official full-page embed guide.",
  },

  // ═══════════════════════════════════════════════════════
  //  iPAPER PLATFORM  (5 MCQ)
  // ═══════════════════════════════════════════════════════

  {
    id: 11, type: "mcq", section: "IPAPER",
    text: "A customer asks why their Google Analytics shows flipbook page-views but they see zero events in their GA dashboard. What is most likely missing?",
    options: [
      { text: "Their GA tracking ID is wrong.",                                                                  correct: false },
      { text: "GA events from iPaper are only tracked when a user interacts — page-views alone don't generate events.", correct: false },
      { text: "They haven't configured the iPaper GA integration, so no events are being sent.",                 correct: true  },
      { text: "GA4 doesn't support custom events.",                                                              correct: false },
    ],
    explanation: "iPaper sends events (link clicks, searches, video plays, etc.) only when the Google Analytics integration is set up inside iPaper CMS. Page-views may work through other GA tracking already on the customer's site.",
  },

  {
    id: 12, type: "mcq", section: "IPAPER",
    text: "In Google Analytics 4 (GA4), what prefix does iPaper add to all its event names?",
    options: [
      { text: '"ga_"',    correct: false },
      { text: '"ip_"',    correct: false },
      { text: '"ipf_"',   correct: true  },
      { text: '"ipaper_"',correct: false },
    ],
    explanation: 'GA4 does not collect event categories by default, so iPaper prepends `ipf_` (iPaper Flipbook) to all event names. For example, a search event becomes `ipf_search`.',
  },

  {
    id: 13, type: "mcq", section: "IPAPER",
    text: "A customer wants to share a link that takes visitors directly to page 12 of their flipbook. Which URL is correct?",
    options: [
      { text: "`https://catalog.company.com/brochure/?GoToPage=12`",       correct: false },
      { text: "`https://catalog.company.com/brochure/?Page=12`",           correct: true  },
      { text: "`https://catalog.company.com/brochure/?page=12`",           correct: false },
      { text: "`https://catalog.company.com/brochure/#page-12`",           correct: false },
    ],
    explanation: "The `Page` query string parameter (capital P) is the supported way to deep-link to a specific page. Linking to a non-existing page will send the user to page 1.",
  },

  {
    id: 14, type: "mcq", section: "IPAPER",
    text: "A customer has a popup frame enrichment on their flipbook. The framed page should close its own popup when a user completes a form. What JavaScript should the framed page run?",
    options: [
      { text: "`window.close()`",                                            correct: false },
      { text: "`parent.close()`",                                            correct: false },
      { text: "`parent.postMessage('closePopup', '*')`",                     correct: true  },
      { text: "`document.dispatchEvent(new Event('closePopup'))`",           correct: false },
    ],
    explanation: "iPaper listens for a `postMessage` with the value `'closePopup'` (or an object with `command: 'closePopup'`) sent to the parent window. This is the official supported way to close a popup frame from within.",
  },

  {
    id: 15, type: "mcq", section: "IPAPER",
    text: "A customer uses Google Tag Manager (GTM) for tracking AND has also added an Analytics Tracking ID directly in iPaper CMS. What problem will this cause?",
    options: [
      { text: "GTM will block all iPaper events.",                                                             correct: false },
      { text: "Page-views and events will be tracked twice (or more), inflating their analytics data.",        correct: true  },
      { text: "The iPaper integration will stop working.",                                                     correct: false },
      { text: "No problem — they work independently and won't interfere.",                                     correct: false },
    ],
    explanation: "iPaper's docs warn: if GTM is used to send data to GA, you must NOT also add a direct Analytics Tracking ID in iPaper, as this results in page-views and events being tracked multiple times. Stick to one method.",
  },

];
