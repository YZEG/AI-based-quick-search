document.addEventListener('DOMContentLoaded', function() {
  var providerSelect = document.getElementById('providerSelect');
  var saveBtn = document.getElementById('saveBtn');
  var status = document.getElementById('status');
  
  var configSections = {
    none: null,
    openai: document.getElementById('openaiConfig'),
    deepseek: document.getElementById('deepseekConfig'),
    mimo: document.getElementById('mimoConfig'),
    custom: document.getElementById('customConfig')
  };
  
  chrome.storage.local.get(['aiProvider', 'openaiKey', 'openaiModel', 'deepseekKey', 'deepseekModel', 'mimoApiKey', 'customEndpoint', 'customKey', 'customModel'], function(result) {
    if (result.aiProvider) {
      providerSelect.value = result.aiProvider;
      showConfigSection(result.aiProvider);
    }
    
    if (result.openaiKey) document.getElementById('openaiKey').value = result.openaiKey;
    if (result.openaiModel) document.getElementById('openaiModel').value = result.openaiModel;
    if (result.deepseekKey) document.getElementById('deepseekKey').value = result.deepseekKey;
    if (result.deepseekModel) document.getElementById('deepseekModel').value = result.deepseekModel;
    if (result.mimoApiKey) document.getElementById('mimoKey').value = result.mimoApiKey;
    if (result.customEndpoint) document.getElementById('customEndpoint').value = result.customEndpoint;
    if (result.customKey) document.getElementById('customKey').value = result.customKey;
    if (result.customModel) document.getElementById('customModel').value = result.customModel;
  });
  
  function showConfigSection(provider) {
    Object.values(configSections).forEach(function(section) {
      if (section) section.classList.remove('active');
    });
    
    if (configSections[provider]) {
      configSections[provider].classList.add('active');
    }
  }
  
  providerSelect.addEventListener('change', function() {
    showConfigSection(this.value);
  });
  
  saveBtn.addEventListener('click', function() {
    var provider = providerSelect.value;
    var config = {
      aiProvider: provider
    };
    
    if (provider === 'openai') {
      var openaiKey = document.getElementById('openaiKey').value.trim();
      if (!openaiKey) {
        showStatus('Please enter OpenAI API Key', 'error');
        return;
      }
      config.openaiKey = openaiKey;
      config.openaiModel = document.getElementById('openaiModel').value;
    } else if (provider === 'deepseek') {
      var deepseekKey = document.getElementById('deepseekKey').value.trim();
      if (!deepseekKey) {
        showStatus('Please enter DeepSeek API Key', 'error');
        return;
      }
      config.deepseekKey = deepseekKey;
      config.deepseekModel = document.getElementById('deepseekModel').value;
    } else if (provider === 'mimo') {
      var mimoKey = document.getElementById('mimoKey').value.trim();
      if (!mimoKey) {
        showStatus('Please enter MIMO API Key', 'error');
        return;
      }
      config.mimoApiKey = mimoKey;
    } else if (provider === 'custom') {
      var customEndpoint = document.getElementById('customEndpoint').value.trim();
      var customKey = document.getElementById('customKey').value.trim();
      var customModel = document.getElementById('customModel').value.trim();
      
      if (!customEndpoint) {
        showStatus('Please enter Custom API Endpoint', 'error');
        return;
      }
      if (!customKey) {
        showStatus('Please enter Custom API Key', 'error');
        return;
      }
      if (!customModel) {
        showStatus('Please enter Model Name', 'error');
        return;
      }
      
      config.customEndpoint = customEndpoint;
      config.customKey = customKey;
      config.customModel = customModel;
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