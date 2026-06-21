console.log('Hover Dict: loaded');

var hdPopup = null;
var hdWord = '';
var mimoKey = '';
var freeMode = false;

chrome.storage.local.get(['mimoApiKey', 'freeMode'], function(result) {
  if (result.mimoApiKey) mimoKey = result.mimoApiKey;
  if (result.freeMode) freeMode = result.freeMode;
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

  if (freeMode) {
    queryDictionary(hdWord, btn, result);
    return;
  }

  if (!mimoKey) {
    btn.disabled = false;
    btn.textContent = '获取释义';
    result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">请先在扩展设置中填写 API Key 或开启 Free Mode</div>';
    return;
  }

  var msg = { action: 'queryAPI', word: hdWord, config: { key: mimoKey } };

  chrome.runtime.sendMessage(msg, function(response) {
      btn.disabled = false;
      btn.textContent = '获取释义';

      if (chrome.runtime.lastError) {
        result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">扩展通信错误: ' + chrome.runtime.lastError.message + '</div>';
        return;
      }

      if (response && response.text) {
        result.innerHTML = '<div style="color:#333;font-size:13px;line-height:1.5;padding:10px;background:#f8f9fa;border-radius:6px;">' + formatAIResponse(response.text) + '</div>';
      } else if (response && response.error) {
        result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">错误: ' + response.error + '</div>';
      } else {
        queryDictionary(hdWord, btn, result);
      }
    }
  );
}

function formatAIResponse(content) {
  return content
    .replace(/\n+/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
}

function isChinese(text) {
  return /[一-龥]/.test(text);
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
    .catch(function() {
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
    .catch(function() {
      showNotFound(btn, result);
    });
}

function showNotFound(btn, result) {
  btn.disabled = false;
  btn.textContent = '获取释义';
  result.innerHTML = '<div style="color:#dc3545;font-size:12px;text-align:center;padding:10px;">未找到释义。</div>';
}

function showPopup() {
  if (hdPopup) {
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
}

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
    e.preventDefault();
    showPopup();
  }

  if (e.code === 'Escape' && hdPopup) {
    hdClosePopup();
  }
});

var style = document.createElement('style');
style.textContent = '@keyframes hdSpin {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
document.head.appendChild(style);
