let textboxCounter = 0;
let textboxObserver = null;
let textboxData = new Map();
let addingOverlay = null;
let isReady = false;

// Initialize MutationObserver to detect when textboxes are removed by the website
function initTextboxObserver() {
  if (textboxObserver) return;
  
  textboxObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node.classList && node.classList.contains('textbox-overlay-container')) {
          const id = node.dataset.textboxId;
          if (id && textboxData.has(id)) {
            console.warn('Textbox removed by website - recovering...');
            setTimeout(() => {
              const data = textboxData.get(id);
              if (data && !document.querySelector(`[data-textbox-id="${id}"]`)) {
                createTextbox(data.left, data.top, data.value, parseInt(id));
              }
            }, 100);
          }
        }
      });
    });
  });
  
  textboxObserver.observe(document.body, { 
    childList: true, 
    subtree: false
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'addTextbox') {
    // Wait for DOM to be ready before showing overlay
    if (!isReady) {
      console.log('DOM not ready yet, waiting...');
      const checkReady = setInterval(() => {
        if (isReady) {
          clearInterval(checkReady);
          showAddingOverlay();
          sendResponse({ status: 'ready' });
        }
      }, 50);
    } else {
      showAddingOverlay();
      sendResponse({ status: 'ready' });
    }
  } else if (request.action === 'clearAll') {
    if (isReady) {
      clearAllTextboxes();
    }
    sendResponse({ status: 'cleared' });
  }
  
  return true;
});

// Create a full-screen overlay for adding textboxes
function showAddingOverlay() {
  console.log('Showing adding overlay');
  
  if (addingOverlay) {
    addingOverlay.remove();
  }
  
  // Create full-screen overlay
  addingOverlay = document.createElement('div');
  addingOverlay.id = 'textbox-adding-overlay';
  
  // Use setAttribute for maximum compatibility
  addingOverlay.setAttribute('style', 
    'position: fixed !important;' +
    'top: 0px !important;' +
    'left: 0px !important;' +
    'right: 0px !important;' +
    'bottom: 0px !important;' +
    'width: 100vw !important;' +
    'height: 100vh !important;' +
    'z-index: 2147483647 !important;' +
    'cursor: crosshair !important;' +
    'background: rgba(66, 133, 244, 0.08) !important;' +
    'display: flex !important;' +
    'align-items: center !important;' +
    'justify-content: center !important;' +
    'pointer-events: auto !important;' +
    'margin: 0 !important;' +
    'padding: 0 !important;' +
    'border: none !important;' +
    'outline: none !important;' +
    'visibility: visible !important;' +
    'opacity: 1 !important;' +
    'transform: none !important;'
  );
  
  // Create instruction text
  const instruction = document.createElement('div');
  instruction.setAttribute('style',
    'background: rgba(66, 133, 244, 0.95) !important;' +
    'color: white !important;' +
    'padding: 20px 40px !important;' +
    'border-radius: 8px !important;' +
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;' +
    'font-size: 18px !important;' +
    'font-weight: 500 !important;' +
    'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;' +
    'pointer-events: none !important;' +
    'z-index: 2147483647 !important;'
  );
  instruction.textContent = '🎯 Click anywhere to place a textbox (ESC to cancel)';
  
  addingOverlay.appendChild(instruction);
  
  // Add multiple event handlers for maximum compatibility
  const handleClick = (e) => {
    console.log('Overlay clicked');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Calculate position relative to page (not viewport)
    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;
    
    console.log('Creating textbox at:', x, y);
    createTextbox(x, y);
    
    // Remove overlay
    if (addingOverlay) {
      addingOverlay.remove();
      addingOverlay = null;
    }
    
    return false;
  };
  
  // Add both capture and bubble phase handlers
  addingOverlay.addEventListener('click', handleClick, true);
  addingOverlay.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }, true);
  
  // Add escape key handler
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      console.log('Escape pressed - canceling textbox addition');
      if (addingOverlay) {
        addingOverlay.remove();
        addingOverlay = null;
      }
      document.removeEventListener('keydown', escapeHandler, true);
    }
  };
  document.addEventListener('keydown', escapeHandler, true);
  
  // Append to documentElement (html tag) instead of body for better compatibility
  const targetElement = document.documentElement || document.body;
  targetElement.appendChild(addingOverlay);
  
  // Force overlay to be on top after a brief delay (for Gmail and similar apps)
  setTimeout(() => {
    if (addingOverlay && addingOverlay.parentNode) {
      // Re-append to ensure it's the last child
      targetElement.appendChild(addingOverlay);
      // Re-apply styles
      addingOverlay.style.setProperty('z-index', '2147483647', 'important');
      addingOverlay.style.setProperty('position', 'fixed', 'important');
      console.log('Overlay re-enforced');
    }
  }, 50);
  
  console.log('Overlay added to', targetElement.tagName);
}

function createTextbox(x, y, value = '', id = null) {
  console.log('createTextbox called with:', { x, y, value, id });
  
  if (id === null) {
    textboxCounter++;
    id = textboxCounter;
  } else {
    textboxCounter = Math.max(textboxCounter, id);
  }
  
  // Check if textbox with this ID already exists
  if (document.querySelector(`[data-textbox-id="${id}"]`)) {
    console.log('Textbox with id', id, 'already exists');
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.className = 'textbox-overlay-container';
  
  // Use setAttribute for maximum override power
  container.setAttribute('style',
    `position: absolute !important;` +
    `left: ${x}px !important;` +
    `top: ${y}px !important;` +
    `z-index: 2147483647 !important;` +
    `background: white !important;` +
    `border: 2px solid #4285f4 !important;` +
    `border-radius: 8px !important;` +
    `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;` +
    `min-width: 250px !important;` +
    `overflow: hidden !important;` +
    `pointer-events: auto !important;` +
    `display: block !important;` +
    `visibility: visible !important;` +
    `opacity: 1 !important;` +
    `transform: none !important;` +
    `margin: 0 !important;` +
    `padding: 0 !important;`
  );
  
  container.dataset.textboxId = id;
  
  // Store data for recovery
  textboxData.set(String(id), { left: x, top: y, value: value });
  
  // Create textbox
  const textbox = document.createElement('textarea');
  textbox.className = 'textbox-overlay-input';
  textbox.placeholder = 'Enter text here...';
  textbox.value = value;
  
  // Prevent website event handlers from interfering
  textbox.addEventListener('click', (e) => {
    e.stopPropagation();
  }, true);
  
  textbox.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  }, true);
  
  textbox.addEventListener('keydown', (e) => {
    e.stopPropagation();
  }, true);
  
  // Create header with drag handle and close button
  const header = document.createElement('div');
  header.className = 'textbox-overlay-header';
  
  const dragHandle = document.createElement('div');
  dragHandle.className = 'textbox-overlay-drag';
  dragHandle.textContent = '⋮⋮';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'textbox-overlay-close';
  closeBtn.textContent = '×';
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    textboxData.delete(String(id));
    container.remove();
    saveTextboxes();
  };
  
  header.appendChild(dragHandle);
  header.appendChild(closeBtn);
  
  container.appendChild(header);
  container.appendChild(textbox);
  
  // Append to body
  document.body.appendChild(container);
  
  // Force it to stay on top for difficult sites like Gmail
  setTimeout(() => {
    if (container.parentNode) {
      container.style.setProperty('z-index', '2147483647', 'important');
      container.style.setProperty('position', 'absolute', 'important');
      // Re-append to ensure it's on top
      document.body.appendChild(container);
    }
  }, 100);
  
  console.log('Textbox added to body');
  
  // Make draggable
  makeDraggable(container, header);
  
  // Add input event listener for auto-save
  textbox.addEventListener('input', () => {
    textboxData.set(String(id), {
      left: parseInt(container.style.left),
      top: parseInt(container.style.top),
      value: textbox.value
    });
    saveTextboxes();
  });
  
  // Focus the textbox only if it's newly created
  if (!value) {
    textbox.focus();
  }
  
  // Initialize observer if not already done
  initTextboxObserver();
  
  // Save to storage immediately
  saveTextboxes();
}

function makeDraggable(container, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    const newTop = (container.offsetTop - pos2);
    const newLeft = (container.offsetLeft - pos1);
    
    container.style.setProperty('top', newTop + "px", 'important');
    container.style.setProperty('left', newLeft + "px", 'important');
    
    // Update stored data
    const id = container.dataset.textboxId;
    if (id && textboxData.has(id)) {
      const data = textboxData.get(id);
      data.left = newLeft;
      data.top = newTop;
    }
  }
  
  function closeDragElement(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    document.onmouseup = null;
    document.onmousemove = null;
    saveTextboxes();
  }
}

function clearAllTextboxes() {
  const textboxes = document.querySelectorAll('.textbox-overlay-container');
  textboxes.forEach(textbox => textbox.remove());
  textboxData.clear();
  chrome.storage.local.remove(window.location.href);
}

function saveTextboxes() {
  const textboxes = document.querySelectorAll('.textbox-overlay-container');
  const data = Array.from(textboxes).map(container => ({
    id: container.dataset.textboxId,
    left: container.style.left,
    top: container.style.top,
    value: container.querySelector('textarea').value
  }));
  
  chrome.storage.local.set({ [window.location.href]: data });
}

function loadTextboxes() {
  chrome.storage.local.get(window.location.href, (result) => {
    const data = result[window.location.href];
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        createTextbox(
          parseInt(item.left),
          parseInt(item.top),
          item.value || '',
          parseInt(item.id)
        );
      });
    }
  });
}

// Auto-save on text change
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('textbox-overlay-input')) {
    saveTextboxes();
  }
});

// Wait for DOM to be ready before loading textboxes
function initExtension() {
  if (!document.body) {
    // Body not ready yet, wait a bit
    setTimeout(initExtension, 10);
    return;
  }
  
  isReady = true;
  console.log('Textbox Overlay content script initialized');
  loadTextboxes();
  
  // Re-append textboxes to body periodically for SPAs
  setInterval(() => {
    const textboxes = document.querySelectorAll('.textbox-overlay-container');
    textboxes.forEach(container => {
      if (!document.body.contains(container)) {
        document.body.appendChild(container);
      }
      container.style.setProperty('z-index', '2147483647', 'important');
    });
  }, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

console.log('Textbox Overlay content script loaded');
