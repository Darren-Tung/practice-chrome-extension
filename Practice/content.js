let isAddingTextbox = false;
let textboxCounter = 0;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addTextbox') {
    isAddingTextbox = true;
    document.body.style.cursor = 'crosshair';
    sendResponse({ status: 'ready' });
  } else if (request.action === 'clearAll') {
    clearAllTextboxes();
    sendResponse({ status: 'cleared' });
  }
});

// Handle click events to place textboxes
document.addEventListener('click', (e) => {
  if (isAddingTextbox) {
    e.preventDefault();
    e.stopPropagation();
    
    const x = e.pageX;
    const y = e.pageY;
    
    createTextbox(x, y);
    
    isAddingTextbox = false;
    document.body.style.cursor = 'default';
  }
}, true);

function createTextbox(x, y) {
  textboxCounter++;
  
  // Create container
  const container = document.createElement('div');
  container.className = 'textbox-overlay-container';
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  container.dataset.textboxId = textboxCounter;
  
  // Create textbox
  const textbox = document.createElement('textarea');
  textbox.className = 'textbox-overlay-input';
  textbox.placeholder = 'Enter text here...';
  
  // Create header with drag handle and close button
  const header = document.createElement('div');
  header.className = 'textbox-overlay-header';
  
  const dragHandle = document.createElement('div');
  dragHandle.className = 'textbox-overlay-drag';
  dragHandle.textContent = '⋮⋮';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'textbox-overlay-close';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => container.remove();
  
  header.appendChild(dragHandle);
  header.appendChild(closeBtn);
  
  container.appendChild(header);
  container.appendChild(textbox);
  document.body.appendChild(container);
  
  // Make draggable
  makeDraggable(container, header);
  
  // Focus the textbox
  textbox.focus();
  
  // Save to storage
  saveTextboxes();
}

function makeDraggable(container, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    container.style.top = (container.offsetTop - pos2) + "px";
    container.style.left = (container.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    saveTextboxes();
  }
}

function clearAllTextboxes() {
  const textboxes = document.querySelectorAll('.textbox-overlay-container');
  textboxes.forEach(textbox => textbox.remove());
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
        textboxCounter++;
        const container = document.createElement('div');
        container.className = 'textbox-overlay-container';
        container.style.left = item.left;
        container.style.top = item.top;
        container.dataset.textboxId = item.id;
        
        const textbox = document.createElement('textarea');
        textbox.className = 'textbox-overlay-input';
        textbox.value = item.value || '';
        textbox.placeholder = 'Enter text here...';
        
        const header = document.createElement('div');
        header.className = 'textbox-overlay-header';
        
        const dragHandle = document.createElement('div');
        dragHandle.className = 'textbox-overlay-drag';
        dragHandle.textContent = '⋮⋮';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'textbox-overlay-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => {
          container.remove();
          saveTextboxes();
        };
        
        header.appendChild(dragHandle);
        header.appendChild(closeBtn);
        container.appendChild(header);
        container.appendChild(textbox);
        document.body.appendChild(container);
        
        makeDraggable(container, header);
        
        textbox.addEventListener('input', saveTextboxes);
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

// Load existing textboxes on page load
loadTextboxes();