chrome.permissions.contains({
  // <all_urls> seems to be required to use the webRequest APIs on Firefox (57 at least)
  // Even though it's not needed in Chrome, definitely sounds like a Firefox bug
  permissions: ['webRequest', 'webRequestBlocking'],
}, (hasWR) => {
  if (!hasWR) {
    return;
  }

  chrome.webRequest.onHeadersReceived.addListener((e) => {
    if (!e.responseHeaders) {
      return null;
    }

    const newHeaders = [...e.responseHeaders];
    const cspHeaderIdx = newHeaders.findIndex(h => h.name === 'content-security-policy');

    if (cspHeaderIdx > -1) {
      // Per https://bugzilla.mozilla.org/show_bug.cgi?id=1425672#c9
      // Adding blob: to the default-src directive fixes the whole thing
      newHeaders[cspHeaderIdx].value = newHeaders[cspHeaderIdx].value.replace(`default-src `, `default-src blob: `)
      newHeaders[cspHeaderIdx].value = newHeaders[cspHeaderIdx].value.replace(`script-src `, `script-src blob: `)
    }

    return {
      responseHeaders: newHeaders,
    };
  }, {
    urls: [
      'https://twitter.com/i/videos/*',
    ],
  }, ['responseHeaders', 'blocking']);
});