// Background service worker
let profileData = null;

// Open side panel when extension icon is clicked (if side panel API is available)
// This keeps the panel open during drag-and-drop operations
if (chrome.sidePanel) {
  chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
  });
  
  // Also set default side panel path
  chrome.sidePanel.setOptions({
    path: 'popup.html',
    enabled: true
  });
}

// Load profile data on startup
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['setupComplete']);
  
  if (!result.setupComplete) {
    // Open setup page on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
  }
  
  // Create context menu
  createContextMenu();
});

// Create context menu
async function createContextMenu() {
  // Remove existing menu items
  await chrome.contextMenus.removeAll();
  
  // Load profile data
  const result = await chrome.storage.local.get(['profile']);
  profileData = result.profile;
  
  if (!profileData) return;
  
  // Create parent menu
  chrome.contextMenus.create({
    id: 'quickdrop-parent',
    title: 'Insert from QuickDrop',
    contexts: ['editable']
  });
  
  // Add identity fields
  if (profileData.identity) {
    if (profileData.identity.firstName) {
      chrome.contextMenus.create({
        id: 'firstName',
        parentId: 'quickdrop-parent',
        title: `First Name: ${profileData.identity.firstName}`,
        contexts: ['editable']
      });
    }
    if (profileData.identity.lastName) {
      chrome.contextMenus.create({
        id: 'lastName',
        parentId: 'quickdrop-parent',
        title: `Last Name: ${profileData.identity.lastName}`,
        contexts: ['editable']
      });
    }
    if (profileData.identity.email) {
      chrome.contextMenus.create({
        id: 'email',
        parentId: 'quickdrop-parent',
        title: `Email: ${profileData.identity.email}`,
        contexts: ['editable']
      });
    }
    if (profileData.identity.phone) {
      chrome.contextMenus.create({
        id: 'phone',
        parentId: 'quickdrop-parent',
        title: `Phone: ${profileData.identity.phone}`,
        contexts: ['editable']
      });
    }
  }
  
  // Add address fields
  if (profileData.address) {
    if (profileData.address.line1) {
      chrome.contextMenus.create({
        id: 'addressLine1',
        parentId: 'quickdrop-parent',
        title: `Address: ${profileData.address.line1}`,
        contexts: ['editable']
      });
    }
    if (profileData.address.city) {
      chrome.contextMenus.create({
        id: 'city',
        parentId: 'quickdrop-parent',
        title: `City: ${profileData.address.city}`,
        contexts: ['editable']
      });
    }
    if (profileData.address.state) {
      chrome.contextMenus.create({
        id: 'state',
        parentId: 'quickdrop-parent',
        title: `State: ${profileData.address.state}`,
        contexts: ['editable']
      });
    }
    if (profileData.address.zip) {
      chrome.contextMenus.create({
        id: 'zip',
        parentId: 'quickdrop-parent',
        title: `ZIP: ${profileData.address.zip}`,
        contexts: ['editable']
      });
    }
  }
  
  // Add education fields
  if (profileData.education) {
    if (profileData.education.school) {
      chrome.contextMenus.create({
        id: 'school',
        parentId: 'quickdrop-parent',
        title: `University: ${profileData.education.school}`,
        contexts: ['editable']
      });
    }
    if (profileData.education.degree) {
      chrome.contextMenus.create({
        id: 'degree',
        parentId: 'quickdrop-parent',
        title: `Degree: ${profileData.education.degree}`,
        contexts: ['editable']
      });
    }
  }
}

// Normalize name capitalization
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!profileData) {
    const result = await chrome.storage.local.get(['profile']);
    profileData = result.profile;
  }
  
  if (!profileData) return;
  
  let value = '';
  const menuId = info.menuItemId;
  
  // Get value based on menu ID
  if (menuId === 'firstName') {
    value = normalizeName(profileData.identity?.firstName || '');
  } else if (menuId === 'lastName') {
    value = normalizeName(profileData.identity?.lastName || '');
  } else if (menuId === 'email') {
    value = profileData.identity?.email || '';
  } else if (menuId === 'phone') {
    value = profileData.identity?.phone || '';
  } else if (menuId === 'addressLine1') {
    value = profileData.address?.line1 || '';
  } else if (menuId === 'city') {
    value = profileData.address?.city || '';
  } else if (menuId === 'state') {
    value = profileData.address?.state || '';
  } else if (menuId === 'zip') {
    value = profileData.address?.zip || '';
  } else if (menuId === 'school') {
    value = profileData.education?.school || '';
  } else if (menuId === 'degree') {
    value = profileData.education?.degree || '';
  }
  
  if (value) {
    // Inject into the active tab
    chrome.tabs.sendMessage(tab.id, {
      action: 'contextMenuInsert',
      value: value
    });
  }
});

// Update context menu when storage changes
chrome.storage.onChanged.addListener(() => {
  createContextMenu();
});
