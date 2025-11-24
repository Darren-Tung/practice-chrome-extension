document.getElementById('addTextbox').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'addTextbox' }, (response) => {
      const status = document.getElementById('status');
      status.className = 'status active';
      status.textContent = 'Click anywhere on the page to place a textbox';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });
  
  document.getElementById('clearAll').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'clearAll' }, (response) => {
      const status = document.getElementById('status');
      status.className = 'status inactive';
      status.textContent = 'All textboxes cleared';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });