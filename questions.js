const SECTIONS = {
  JS: "JavaScript",
  IFRAME: "iFrame & Embedding",
  SUPPORT: "Support Troubleshooting",
};

const QUESTIONS = [
  // ─── JavaScript (5 questions) ────────────────────────────────────────────
  {
    id: 1,
    section: "JS",
    text: "What will the following code log to the console?",
    code: `console.log(typeof null);`,
    options: [
      { text: '"null"', correct: false },
      { text: '"object"', correct: true },
      { text: '"undefined"', correct: false },
      { text: '"string"', correct: false },
    ],
    explanation: '`typeof null` returns "object" — a long-standing quirk in JavaScript.',
  },
  {
    id: 2,
    section: "JS",
    text: "A customer's page runs this snippet. What does `result` equal?",
    code: `const arr = [1, 2, 3, 4, 5];
const result = arr.filter(n => n % 2 === 0).map(n => n * 10);`,
    options: [
      { text: "[2, 4]", correct: false },
      { text: "[20, 40]", correct: true },
      { text: "[10, 20, 30, 40, 50]", correct: false },
      { text: "[1, 3, 5]", correct: false },
    ],
    explanation: "filter keeps even numbers (2, 4), then map multiplies each by 10 → [20, 40].",
  },
  {
    id: 3,
    section: "JS",
    text: "Which of the following correctly describes the difference between `==` and `===` in JavaScript?",
    options: [
      { text: "They are identical; `===` is just an alias for `==`.", correct: false },
      { text: "`==` checks value only (with type coercion); `===` checks value AND type.", correct: true },
      { text: "`===` performs type coercion; `==` does not.", correct: false },
      { text: "`==` can only compare numbers; `===` compares all types.", correct: false },
    ],
    explanation: "`===` (strict equality) does not coerce types, while `==` (loose equality) does.",
  },
  {
    id: 4,
    section: "JS",
    text: "What is the output of the following code?",
    code: `let x = 10;
(function() {
  console.log(x);
  let x = 20;
})();`,
    options: [
      { text: "10", correct: false },
      { text: "20", correct: false },
      { text: "undefined", correct: false },
      { text: "ReferenceError", correct: true },
    ],
    explanation:
      "`let` is hoisted but not initialised (temporal dead zone). Accessing `x` before its declaration inside the IIFE throws a ReferenceError.",
  },
  {
    id: 5,
    section: "JS",
    text: "A customer wants to listen for a message from an embedded iPaper publication. Which event should they attach a listener to?",
    code: `window.addEventListener('_____', function(event) {
  console.log(event.data);
});`,
    options: [
      { text: '"load"', correct: false },
      { text: '"message"', correct: true },
      { text: '"postMessage"', correct: false },
      { text: '"iframe"', correct: false },
    ],
    explanation:
      'Cross-origin communication via `postMessage` is received through the "message" event on the `window` object.',
  },

  // ─── iFrame & Embedding (5 questions) ────────────────────────────────────
  {
    id: 6,
    section: "IFRAME",
    text: "A customer reports their iPaper publication iframe shows a blank white page. The browser console shows: `Refused to display … in a frame because it set 'X-Frame-Options' to 'SAMEORIGIN'`. What is the most likely cause?",
    options: [
      { text: "The publication URL is incorrect.", correct: false },
      {
        text: "The customer's own website has an X-Frame-Options header that blocks framing.",
        correct: false,
      },
      {
        text: "The resource being framed sends X-Frame-Options: SAMEORIGIN, preventing cross-origin embedding.",
        correct: true,
      },
      { text: "The iframe src must use HTTP, not HTTPS.", correct: false },
    ],
    explanation:
      "X-Frame-Options: SAMEORIGIN on the framed resource means it will only load if the parent page shares the same origin.",
  },
  {
    id: 7,
    section: "IFRAME",
    text: "Which HTML attribute should a customer add to an iframe to allow it to use the Fullscreen API and autoplay audio?",
    options: [
      { text: "`scrolling=\"no\"`", correct: false },
      { text: "`sandbox=\"allow-scripts allow-same-origin\"`", correct: false },
      { text: "`allow=\"fullscreen; autoplay\"`", correct: true },
      { text: "`permissions=\"fullscreen autoplay\"`", correct: false },
    ],
    explanation:
      'The `allow` attribute on iframes controls Permissions Policy features like fullscreen and autoplay.',
  },
  {
    id: 8,
    section: "IFRAME",
    text: "A customer embeds an iPaper publication with the snippet below but reports the iframe height never adjusts to fit the content. What is the most appropriate fix?",
    code: `<iframe src="https://viewer.ipaper.io/demo/pub/"
        width="100%" height="600px" frameborder="0">
</iframe>`,
    options: [
      { text: "Change `height` to `100%`.", correct: false },
      { text: "Add `scrolling=\"yes\"` to the iframe.", correct: false },
      {
        text: "Use the iPaper postMessage API to receive height-change events and update the iframe height dynamically.",
        correct: true,
      },
      { text: "Remove the `width` attribute.", correct: false },
    ],
    explanation:
      "Because iframes are cross-origin, the parent page cannot read the content height directly. The iPaper postMessage API broadcasts size events that the parent page can use to resize the iframe.",
  },
  {
    id: 9,
    section: "IFRAME",
    text: "A customer pastes the following embed code on their WordPress site but sees nothing rendered. They confirm the URL is valid. What should you check first?",
    code: `<iframe src="https://viewer.ipaper.io/customer/pub/"
        width="800" height="500">
</iframe>`,
    options: [
      { text: "Whether the iframe uses HTTP instead of HTTPS.", correct: false },
      {
        text: "Whether the WordPress editor stripped or escaped the iframe tag (many themes/plugins block raw HTML iframes).",
        correct: true,
      },
      { text: "Whether the width is set in pixels instead of percent.", correct: false },
      { text: "Whether the customer is using Chrome.", correct: false },
    ],
    explanation:
      "WordPress (especially the block/Gutenberg editor) and many security plugins strip raw iframe HTML by default. The customer likely needs to use a custom HTML block or a trusted iframe plugin.",
  },
  {
    id: 10,
    section: "IFRAME",
    text: "What does the browser's Same-Origin Policy prevent in the context of iframes?",
    options: [
      { text: "It prevents iframes from being styled with CSS.", correct: false },
      {
        text: "It prevents JavaScript in a parent page from reading or manipulating the DOM of a cross-origin iframe.",
        correct: true,
      },
      { text: "It prevents iframes from loading HTTPS resources.", correct: false },
      { text: "It prevents iframes from being wider than the viewport.", correct: false },
    ],
    explanation:
      "The Same-Origin Policy blocks DOM access across origins, which is why postMessage is used for safe cross-origin communication.",
  },

  // ─── Support Troubleshooting (5 questions) ───────────────────────────────
  {
    id: 11,
    section: "SUPPORT",
    text: "A customer emails: \"My publication looks fine on desktop but on mobile the text is tiny and users have to pinch-zoom.\" What is the first thing you would check?",
    options: [
      { text: "Whether the publication PDF uses embedded fonts.", correct: false },
      {
        text: "Whether the customer's page includes a proper viewport meta tag.",
        correct: true,
      },
      { text: "Whether the customer is using an Android device.", correct: false },
      { text: "Whether the publication file size exceeds 50 MB.", correct: false },
    ],
    explanation:
      'A missing or incorrect `<meta name="viewport" content="width=device-width, initial-scale=1">` is the most common reason mobile sites appear zoomed out.',
  },
  {
    id: 12,
    section: "SUPPORT",
    text: "A customer says: \"Our analytics show zero page-views in iPaper even though we can see traffic in Google Analytics.\" Which of the following is the most likely cause?",
    options: [
      {
        text: "Their Google Analytics tracking ID is wrong.",
        correct: false,
      },
      {
        text: "A browser content-blocker or ad-blocker is blocking the iPaper analytics script on the viewer.",
        correct: false,
      },
      {
        text: "The iPaper statistics tracker is not enabled or the publication is not published correctly in iPaper.",
        correct: true,
      },
      {
        text: "The customer's domain is not whitelisted in iPaper.",
        correct: false,
      },
    ],
    explanation:
      "iPaper has its own internal statistics separate from Google Analytics. Zero page-views in iPaper while GA shows traffic suggests the iPaper stats feature is not configured or the publication isn't live.",
  },
  {
    id: 13,
    section: "SUPPORT",
    text: "When investigating a bug report, which of the following is the best first step?",
    options: [
      { text: "Escalate immediately to the development team.", correct: false },
      { text: "Ask the customer to clear their cache and try again.", correct: false },
      {
        text: "Reproduce the issue in a controlled environment using the same browser, OS, and steps the customer described.",
        correct: true,
      },
      { text: "Close the ticket and wait for more reports.", correct: false },
    ],
    explanation:
      "Reproducing the issue first lets you confirm it is real, gather exact error details, and provide the development team with actionable information.",
  },
  {
    id: 14,
    section: "SUPPORT",
    text: "A customer asks why their embedded publication loads slowly for end-users in Australia when their company is based in Denmark. What is the most relevant technical concept to explain?",
    options: [
      { text: "Browser compatibility issues.", correct: false },
      { text: "Network latency and CDN (Content Delivery Network) geography.", correct: true },
      { text: "JavaScript execution speed.", correct: false },
      { text: "PDF colour profile encoding.", correct: false },
    ],
    explanation:
      "Physical distance between user and server increases latency. A CDN with edge nodes closer to Australia would significantly reduce load times.",
  },
  {
    id: 15,
    section: "SUPPORT",
    text: "A customer reports a CORS error in their browser console when trying to fetch data from the iPaper API directly from their front-end JavaScript. What is the correct approach to advise?",
    options: [
      { text: "Tell the customer to disable CORS in their browser.", correct: false },
      { text: "Tell the customer to add `mode: 'no-cors'` to their fetch call.", correct: false },
      {
        text: "Advise the customer to make the API call from their own back-end server and proxy the result to the front-end.",
        correct: true,
      },
      { text: "Tell the customer the iPaper API does not exist.", correct: false },
    ],
    explanation:
      "`no-cors` does not solve CORS for readable responses. The correct pattern is a server-side proxy that makes the authenticated API call and forwards the result — CORS only applies to browser-to-server requests.",
  },
];
