console.log('Hover Dict: loaded');

var hdPopup = null;
var hdWord = '';
var aiConfig = {
  provider: 'none',
  openaiKey: '',
  openaiModel: 'gpt-3.5-turbo',
  deepseekKey: '',
  deepseekModel: 'deepseek-chat',
  mimoApiKey: '',
  customEndpoint: '',
  customKey: '',
  customModel: ''
};

chrome.storage.local.get(['aiProvider', 'openaiKey', 'openaiModel', 'deepseekKey', 'deepseekModel', 'mimoApiKey', 'customEndpoint', 'customKey', 'customModel'], function(result) {
  if (result.aiProvider) aiConfig.provider = result.aiProvider;
  if (result.openaiKey) aiConfig.openaiKey = result.openaiKey;
  if (result.openaiModel) aiConfig.openaiModel = result.openaiModel;
  if (result.deepseekKey) aiConfig.deepseekKey = result.deepseekKey;
  if (result.deepseekModel) aiConfig.deepseekModel = result.deepseekModel;
  if (result.mimoApiKey) aiConfig.mimoApiKey = result.mimoApiKey;
  if (result.customEndpoint) aiConfig.customEndpoint = result.customEndpoint;
  if (result.customKey) aiConfig.customKey = result.customKey;
  if (result.customModel) aiConfig.customModel = result.customModel;
});

function hdClosePopup() {
  if (hdPopup) {
    hdPopup.remove();
    hdPopup = null;
  }
}

function hdQueryWord(btn, result) {
  if (!btn || !result) return;
  
  btn.disabled = true;
  btn.textContent = '获取中...';
  result.innerHTML = '<div style="text-align:center;padding:10px;"><div style="width:20px;height:20px;border:2px solid #667eea;border-top-color:transparent;border-radius:50%;animation:hdSpin 1s linear infinite;margin:0 auto;"></div></div>';
  
  if (aiConfig.provider && aiConfig.provider !== 'none') {
    queryAI(hdWord, btn, result);
  } else {
    queryDictionary(hdWord, btn, result);
  }
}

function queryAI(word, btn, result) {
  if (aiConfig.provider === 'openai') {
    queryOpenAI(word, btn, result);
  } else if (aiConfig.provider === 'deepseek') {
    queryDeepSeek(word, btn, result);
  } else if (aiConfig.provider === 'mimo') {
    queryMimo(word, btn, result);
  } else if (aiConfig.provider === 'custom') {
    queryCustomAPI(word, btn, result);
  } else {
    queryDictionary(word, btn, result);
  }
}

function queryOpenAI(word, btn, result) {
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + aiConfig.openaiKey
    },
    body: JSON.stringify({
      model: aiConfig.openaiModel,
      messages: [
        {role: 'system', content: '你是一个中文词典助手，请用中文提供清晰、简洁的词语定义和解释。'},
        {role: 'user', content: '请用中文简洁解释"' + word + '"的意思，包括定义和例句。'}
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      result.innerHTML = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + formatAIResponse(data.choices[0].message.content) + '</div>';
    } else if (data.error) {
      result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">错误: ' + data.error.message + '</div>';
    } else {
      queryDictionary(word, btn, result);
    }
  })
  .catch(function(err) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">错误: ' + err.message + '</div>';
  });
}

function queryDeepSeek(word, btn, result) {
  fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + aiConfig.deepseekKey
    },
    body: JSON.stringify({
      model: aiConfig.deepseekModel,
      messages: [
        {role: 'system', content: '你是一个中文词典助手，请用中文提供清晰、简洁的词语定义和解释。'},
        {role: 'user', content: '请用中文简洁解释"' + word + '"的意思，包括定义和例句。'}
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      result.innerHTML = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + formatAIResponse(data.choices[0].message.content) + '</div>';
    } else if (data.error) {
      result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">错误: ' + data.error.message + '</div>';
    } else {
      queryDictionary(word, btn, result);
    }
  })
  .catch(function(err) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">错误: ' + err.message + '</div>';
  });
}

function queryMimo(word, btn, result) {
  fetch('https://api.mimomiao.cc/api/text', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      api_key: aiConfig.mimoApiKey,
      prompt: '请用中文简洁解释"' + word + '"的意思，包括定义和例句。',
      model: 'gpt-4'
    })
  })
  .then(function(r) { 
    if (!r.ok) {
      throw new Error('HTTP error: ' + r.status);
    }
    return r.json(); 
  })
  .then(function(data) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    if (data && data.response) {
      result.innerHTML = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + formatAIResponse(data.response) + '</div>';
    } else if (data.error) {
      result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">API错误: ' + data.error + '</div>';
    } else {
      result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">API未返回有效数据，正在尝试免费字典...</div>';
      setTimeout(function() {
        queryDictionary(word, btn, result);
      }, 1000);
    }
  })
  .catch(function(err) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">网络错误: 无法连接到API，正在尝试免费字典...</div>';
    setTimeout(function() {
      queryDictionary(word, btn, result);
    }, 1000);
  });
}

function queryCustomAPI(word, btn, result) {
  fetch(aiConfig.customEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + aiConfig.customKey
    },
    body: JSON.stringify({
      model: aiConfig.customModel,
      messages: [
        {role: 'system', content: '你是一个中文词典助手，请用中文提供清晰、简洁的词语定义和解释。'},
        {role: 'user', content: '请用中文简洁解释"' + word + '"的意思，包括定义和例句。'}
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      result.innerHTML = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + formatAIResponse(data.choices[0].message.content) + '</div>';
    } else if (data.response) {
      result.innerHTML = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + formatAIResponse(data.response) + '</div>';
    } else if (data.error) {
      result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">错误: ' + (data.error.message || data.error) + '</div>';
    } else {
      queryDictionary(word, btn, result);
    }
  })
  .catch(function(err) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">错误: ' + err.message + '</div>';
  });
}

function formatAIResponse(content) {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function isChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

function queryDictionary(word, btn, result) {
  var lang = isChinese(word) ? 'zh' : 'en';
  var label = isChinese(word) ? '例句' : 'Example';
  
  fetch('https://api.dictionaryapi.dev/api/v2/entries/' + lang + '/' + encodeURIComponent(word))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data[0] && data[0].meanings && data[0].meanings[0] && data[0].meanings[0].definitions && data[0].meanings[0].definitions[0]) {
        btn.disabled = false;
        btn.textContent = '获取释义';
        var def = data[0].meanings[0].definitions[0].definition;
        var example = data[0].meanings[0].definitions[0].example || '';
        var html = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + def;
        if (example) {
          html += '<div style="margin-top:8px;font-size:12px;color:#666;border-left:2px solid #667eea;padding-left:8px;">' + label + ': ' + example + '</div>';
        }
        html += '</div>';
        result.innerHTML = html;
      } else {
        queryWikipedia(word, btn, result);
      }
    })
    .catch(function(err) {
      queryWikipedia(word, btn, result);
    });
}

function queryWikipedia(word, btn, result) {
  var lang = isChinese(word) ? 'zh' : 'en';
  var linkText = isChinese(word) ? '在维基百科查看更多' : 'Read more on Wikipedia';
  
  fetch('https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(word))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      btn.disabled = false;
      btn.textContent = '获取释义';
      if (data && data.extract) {
        var html = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + data.extract;
        if (data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) {
          html += '<div style="margin-top:8px;font-size:11px;"><a href="' + data.content_urls.desktop.page + '" target="_blank" style="color:#667eea;">' + linkText + ' →</a></div>';
        }
        html += '</div>';
        result.innerHTML = html;
      } else {
        showNotFound(btn, result);
      }
    })
    .catch(function(err) {
      showNotFound(btn, result);
    });
}

function showNotFound(btn, result) {
  btn.disabled = false;
  btn.textContent = '获取释义';
  result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">未找到释义。</div>';
}

document.addEventListener('mouseup', function(e) {
  if (hdPopup) {
    if (hdPopup.contains(e.target)) {
      return;
    }
    hdPopup.remove();
    hdPopup = null;
  }
  
  var sel = window.getSelection();
  if (!sel) return;
  
  var text = sel.toString().trim();
  if (!text || text.length < 1 || text.length > 50) return;
  
  hdWord = text;
  
  try {
    var range = sel.getRangeAt(0);
    if (!range) return;
    
    var rect = range.getBoundingClientRect();
    var x = Math.min(rect.right + 10, window.innerWidth - 320);
    var y = Math.max(rect.top - 220, 10);
    
    hdPopup = document.createElement('div');
    hdPopup.id = 'hd-popup';
    hdPopup.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:300px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
    
    hdPopup.innerHTML = 
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 15px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;">' +
        '<span style="font-weight:600;font-size:14px;">释义</span>' +
        '<button id="hd-close-btn" style="width:24px;height:24px;border:none;border-radius:50%;background:rgba(255,255,255,0.2);color:white;font-size:18px;cursor:pointer;line-height:1;">×</button>' +
      '</div>' +
      '<div style="padding:15px;">' +
        '<div style="margin-bottom:12px;">' +
          '<div style="font-size:11px;color:#888;margin-bottom:4px;">词语</div>' +
          '<div style="font-size:14px;font-weight:600;color:#333;background:#f0f0f0;padding:8px 10px;border-radius:6px;">' + text + '</div>' +
        '</div>' +
        '<button id="hd-btn" style="width:100%;padding:10px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">获取释义</button>' +
        '<div id="hd-result" style="margin-top:12px;min-height:20px;"></div>' +
      '</div>';
    
    document.body.appendChild(hdPopup);
    
    var closeBtn = hdPopup.querySelector('#hd-close-btn');
    var queryBtn = hdPopup.querySelector('#hd-btn');
    var resultDiv = hdPopup.querySelector('#hd-result');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hdClosePopup();
      });
    }
    
    if (queryBtn && resultDiv) {
      queryBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hdQueryWord(queryBtn, resultDiv);
      });
    }
    
    setTimeout(function() {
      document.addEventListener('click', function handler(e) {
        if (hdPopup && !hdPopup.contains(e.target)) {
          hdPopup.remove();
          hdPopup = null;
        }
        document.removeEventListener('click', handler);
      });
    }, 50);
    
  } catch(err) {
    console.error('Error creating popup:', err);
  }
});

var style = document.createElement('style');
style.textContent = '@keyframes hdSpin {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
document.head.appendChild(style);