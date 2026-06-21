document.addEventListener('DOMContentLoaded', function() {
  var saveBtn = document.getElementById('saveBtn');
  var status = document.getElementById('status');
  var freeModeCheckbox = document.getElementById('freeMode');
  var apiKeySection = document.getElementById('apiKeySection');
  var freeModeNote = document.getElementById('freeModeNote');

  function toggleSections() {
    if (freeModeCheckbox.checked) {
      apiKeySection.style.display = 'none';
      freeModeNote.style.display = 'block';
    } else {
      apiKeySection.style.display = 'block';
      freeModeNote.style.display = 'none';
    }
  }

  chrome.storage.local.get(['mimoApiKey', 'freeMode'], function(result) {
    if (result.mimoApiKey) document.getElementById('mimoKey').value = result.mimoApiKey;
    if (result.freeMode) freeModeCheckbox.checked = true;
    toggleSections();
  });

  freeModeCheckbox.addEventListener('change', toggleSections);

  saveBtn.addEventListener('click', function() {
    var freeMode = freeModeCheckbox.checked;
    var config = { freeMode: freeMode };

    if (!freeMode) {
      var mimoKey = document.getElementById('mimoKey').value.trim();
      if (!mimoKey) {
        showStatus('Please enter MIMO API Key or enable Free Mode', 'error');
        return;
      }
      config.mimoApiKey = mimoKey;
    }

    chrome.storage.local.set(config, function() {
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
