// Popup logic
let profileData = null;

// Normalize name capitalization
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Format data for display
function formatValue(key, value) {
  if (!value) return '';
  
  // Normalize names
  if (key.includes('Name') || key === 'firstName' || key === 'lastName') {
    return normalizeName(value);
  }
  
  return value;
}

// Create a draggable data block
function createDataBlock(label, value, dataKey) {
  if (!value) return null;
  
  const block = document.createElement('div');
  block.className = 'data-block';
  block.draggable = true;
  block.dataset.key = dataKey;
  block.dataset.value = formatValue(dataKey, value);
  
  block.innerHTML = `
    <div class="block-content">
      <div class="block-label">${label}</div>
      <div class="block-value">${formatValue(dataKey, value)}</div>
    </div>
    <div class="block-actions">
      <button class="action-btn copy" title="Copy">📋</button>
    </div>
  `;
  
  // Drag start
  block.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', block.dataset.value);
    e.dataTransfer.effectAllowed = 'copy';
    block.classList.add('dragging');
    // Prevent popup from closing by keeping focus
    e.dataTransfer.setData('application/x-keep-open', 'true');
  });
  
  block.addEventListener('dragend', (e) => {
    block.classList.remove('dragging');
    // Try to keep popup open by focusing back
    setTimeout(() => {
      if (document.hasFocus) {
        window.focus();
      }
    }, 100);
  });
  
  // Click to paste into focused field
  block.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, {
        action: 'pasteValue',
        value: block.dataset.value
      }).catch(() => {
        // If content script isn't available, copy to clipboard instead
        navigator.clipboard.writeText(block.dataset.value);
        alert(`Copied to clipboard! Paste manually into the form field.`);
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(block.dataset.value);
      alert(`Copied to clipboard! Paste manually into the form field.`);
    }
  });
  
  // Copy button
  block.querySelector('.copy').addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(block.dataset.value);
    const btn = e.target;
    const original = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => {
      btn.textContent = original;
    }, 1000);
  });
  
  return block;
}

// Render profile data
function renderProfile(profile) {
  const container = document.getElementById('dataContainer');
  container.innerHTML = '';
  
  if (!profile) {
    container.innerHTML = '<div class="empty-state"><p>No profile data found.</p></div>';
    return;
  }
  
  // Identity section
  if (profile.identity) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="section-title">Identity</div>';
    
    if (profile.identity.firstName) {
      const block = createDataBlock('First Name', profile.identity.firstName, 'firstName');
      if (block) section.appendChild(block);
    }
    if (profile.identity.lastName) {
      const block = createDataBlock('Last Name', profile.identity.lastName, 'lastName');
      if (block) section.appendChild(block);
    }
    if (profile.identity.legalName) {
      const block = createDataBlock('Legal Name', profile.identity.legalName, 'legalName');
      if (block) section.appendChild(block);
    }
    if (profile.identity.email) {
      const block = createDataBlock('Email', profile.identity.email, 'email');
      if (block) section.appendChild(block);
    }
    if (profile.identity.phone) {
      const block = createDataBlock('Phone', profile.identity.phone, 'phone');
      if (block) section.appendChild(block);
    }
    
    container.appendChild(section);
  }
  
  // Address section
  if (profile.address) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="section-title">Address</div>';
    
    if (profile.address.line1) {
      const block = createDataBlock('Address Line 1', profile.address.line1, 'addressLine1');
      if (block) section.appendChild(block);
    }
    if (profile.address.city) {
      const block = createDataBlock('City', profile.address.city, 'city');
      if (block) section.appendChild(block);
    }
    if (profile.address.state) {
      const block = createDataBlock('State', profile.address.state, 'state');
      if (block) section.appendChild(block);
    }
    if (profile.address.zip) {
      const block = createDataBlock('ZIP', profile.address.zip, 'zip');
      if (block) section.appendChild(block);
    }
    
    container.appendChild(section);
  }
  
  // Education section
  if (profile.education) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="section-title">Education</div>';
    
    if (profile.education.school) {
      const block = createDataBlock('University', profile.education.school, 'school');
      if (block) section.appendChild(block);
    }
    if (profile.education.degree) {
      const block = createDataBlock('Degree', profile.education.degree, 'degree');
      if (block) section.appendChild(block);
    }
    if (profile.education.fieldOfStudy) {
      const block = createDataBlock('Field of Study', profile.education.fieldOfStudy, 'fieldOfStudy');
      if (block) section.appendChild(block);
    }
    if (profile.education.gpa) {
      const block = createDataBlock('GPA', profile.education.gpa, 'gpa');
      if (block) section.appendChild(block);
    }
    
    container.appendChild(section);
  }
  
  // Work section
  if (profile.work && profile.work.length > 0) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="section-title">Work Experience</div>';
    
    profile.work.forEach((work, index) => {
      if (work.jobTitle) {
        const block = createDataBlock(`Job Title ${index + 1}`, work.jobTitle, `jobTitle${index}`);
        if (block) section.appendChild(block);
      }
      if (work.company) {
        const block = createDataBlock(`Company ${index + 1}`, work.company, `company${index}`);
        if (block) section.appendChild(block);
      }
    });
    
    container.appendChild(section);
  }
  
  // Links section
  if (profile.links) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="section-title">Links</div>';
    
    if (profile.links.linkedin) {
      const block = createDataBlock('LinkedIn', profile.links.linkedin, 'linkedin');
      if (block) section.appendChild(block);
    }
    if (profile.links.github) {
      const block = createDataBlock('GitHub', profile.links.github, 'github');
      if (block) section.appendChild(block);
    }
    if (profile.links.portfolio) {
      const block = createDataBlock('Portfolio', profile.links.portfolio, 'portfolio');
      if (block) section.appendChild(block);
    }
    if (profile.links.resume) {
      const block = createDataBlock('Resume', profile.links.resume, 'resume');
      if (block) section.appendChild(block);
    }
    
    container.appendChild(section);
  }
}

// Load profile data
async function loadProfile() {
  const result = await chrome.storage.local.get(['profile', 'setupComplete']);
  
  if (!result.setupComplete || !result.profile) {
    document.getElementById('setupPrompt').style.display = 'block';
    document.getElementById('dataContainer').style.display = 'none';
  } else {
    profileData = result.profile;
    document.getElementById('setupPrompt').style.display = 'none';
    document.getElementById('dataContainer').style.display = 'block';
    renderProfile(profileData);
  }
}

// Setup button
document.getElementById('setupBtn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
  // Don't close if it's a side panel
  if (window.location.protocol !== 'chrome-extension:') {
    window.close();
  }
});

// Edit button
document.getElementById('editBtn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
  // Don't close if it's a side panel
  if (window.location.protocol !== 'chrome-extension:') {
    window.close();
  }
});

// Initialize
loadProfile();
