console.log('Background script loaded');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received:', request);

  if (request.action === 'queryAPI') {
    console.log('Querying MiMo API for word:', request.word);

    var url = 'https://api.xiaomimimo.com/v1/chat/completions';
    var body = JSON.stringify({
      model: 'mimo-v2.5-pro',
      messages: [
        { role: 'user', content: '用一段话简洁解释"' + request.word + '"的含义，不超过100字，不要编号、标题、换行，直接输出解释内容。' }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('Sending request to:', url);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + request.config.key
      },
      body: body
    })
    .then(function(r) {
      console.log('Response status:', r.status, r.statusText);
      return r.json();
    })
    .then(function(data) {
      console.log('Response data:', data);
      if (data.error) {
        sendResponse({ error: data.error.message || data.error });
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        sendResponse({ text: data.choices[0].message.content });
      } else {
        sendResponse({ error: 'API未返回有效数据', raw: JSON.stringify(data) });
      }
    })
    .catch(function(err) {
      console.error('Fetch error:', err.name, err.message);
      sendResponse({ error: err.name + ': ' + err.message });
    });

    return true;
  }
});
