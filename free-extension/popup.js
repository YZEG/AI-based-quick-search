document.addEventListener('DOMContentLoaded', function() {
  var saveBtn = document.getElementById('saveBtn');
  var status = document.getElementById('status');

  chrome.storage.local.get(['mimoApiKey'], function(result) {
    if (result.mimoApiKey) document.getElementById('mimoKey').value = result.mimoApiKey;
  });

  saveBtn.addEventListener('click', function() {
    var mimoKey = document.getElementById('mimoKey').value.trim();
    if (!mimoKey) {
      showStatus('Please enter MIMO API Key', 'error');
      return;
    }
    chrome.storage.local.set({ mimoApiKey: mimoKey }, function() {
      showStatus('Configuration saved successfully!', 'success');
      setTimeout(function() {
        status.textContent = '';
        status.className = 'status';
      }, 2000);
    });
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type;
  }
});
