// Content script - handles drag & drop and paste functionality
let draggedValue = null;

// Listen for drag events
document.addEventListener('dragenter', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    e.target.style.border = '2px solid #667eea';
  }
});

document.addEventListener('dragleave', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    e.target.style.border = '';
  }
});

document.addEventListener('dragover', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
});

document.addEventListener('drop', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    e.preventDefault();
    e.target.style.border = '';
    
    const value = e.dataTransfer.getData('text/plain');
    if (value) {
      insertValue(e.target, value);
    }
  }
});

// Insert value into input field (works with React/Angular forms)
function insertValue(element, value) {
  // Set the value
  element.value = value;
  
  // Trigger events for React/Angular compatibility
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  // For React specifically
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;
  
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Focus the element
  element.focus();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pasteValue') {
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      insertValue(activeElement, request.value);
      sendResponse({ success: true });
    } else {
      // Try to find the last focused input
      const inputs = document.querySelectorAll('input, textarea');
      if (inputs.length > 0) {
        const lastInput = inputs[inputs.length - 1];
        lastInput.focus();
        insertValue(lastInput, request.value);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No input field found' });
      }
    }
    
    return true;
  }
  
  if (request.action === 'getValue') {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      sendResponse({ value: activeElement.value });
    } else {
      sendResponse({ value: '' });
    }
    return true;
  }
});

// Listen for context menu clicks
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'contextMenuInsert') {
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      insertValue(activeElement, request.value);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No input field focused' });
    }
    
    return true;
  }
});
