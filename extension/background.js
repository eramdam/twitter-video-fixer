chrome.permissions.contains({
  // <all_urls> seems to be required to use the webRequest APIs on Firefox (57 at least)
  // Even though it's not needed in Chrome, definitely sounds like a Firefox bug
  permissions: ['webRequest', 'webRequestBlocking', '<all_urls>'],
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

    if (cspHeaderIdx === -1) {
      newHeaders.push({
        name: 'content-security-policy',
        value: ' ',
      });
    } else {
      newHeaders[cspHeaderIdx].value = ' ';
    }

    return {
      responseHeaders: newHeaders,
    };
  }, {
    urls: [
      // endpoint used by TweetDeck
      'https://twitter.com/i/videos/*',
      // endpoint used by the video widget
      'https://syndication.twitter.com/i/jot*',
      'https://cdn.*.twimg.com/*',
    ],
  }, ['responseHeaders', 'blocking']);
});