document.getElementById('addTextbox').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      console.error('No active tab found');
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, { action: 'addTextbox' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message);
        // Try to inject the content script if it's not loaded
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, () => {
          // Try sending message again
          chrome.tabs.sendMessage(tab.id, { action: 'addTextbox' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Still failed:', chrome.runtime.lastError.message);
            } else {
              showStatus('Click anywhere on the page to place a textbox', 'active');
            }
          });
        });
      } else {
        showStatus('Click anywhere on the page to place a textbox', 'active');
      }
    });
  } catch (error) {
    console.error('Error in addTextbox:', error);
  }
});

document.getElementById('clearAll').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      console.error('No active tab found');
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, { action: 'clearAll' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message);
      } else {
        showStatus('All textboxes cleared', 'inactive');
      }
    });
  } catch (error) {
    console.error('Error in clearAll:', error);
  }
});

function showStatus(message, className) {
  const status = document.getElementById('status');
  status.className = 'status ' + className;
  status.textContent = message;
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 2000);
}