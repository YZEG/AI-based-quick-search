console.log('Hover Dict: loaded');

document.addEventListener('mouseup', function() {
  console.log('Hover Dict: mouseup triggered');
  
  var sel = window.getSelection();
  if (!sel) {
    console.log('Hover Dict: no selection');
    return;
  }
  
  var text = sel.toString().trim();
  console.log('Hover Dict: selected text: "' + text + '"');
  
  if (!text || text.length < 1) {
    console.log('Hover Dict: text too short or empty');
    return;
  }

  console.log('Hover Dict: showing popup');
  
  var popup = document.createElement('div');
  popup.style.cssText = 'position:fixed;left:100px;top:100px;width:250px;background:white;border:2px solid blue;border-radius:8px;padding:12px;z-index:999999;font-family:Arial;';
  popup.innerHTML = '<div style="font-weight:bold;color:blue;">Definition</div><div style="margin:8px 0;">Word: '+text+'</div><button style="width:100%;padding:8px;background:blue;color:white;border:none;border-radius:4px;">Get Definition</button>';
  
  document.body.appendChild(popup);
  
  popup.querySelector('button').onclick = function() {
    window.open('https://chat.deepseek.com/?prompt=' + encodeURIComponent('Explain: ' + text));
  };
  
  setTimeout(function() {
    document.addEventListener('click', function close() {
      popup.remove();
      document.removeEventListener('click', close);
    });
  }, 50);
});