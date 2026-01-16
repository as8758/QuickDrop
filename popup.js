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
    // Prevent side panel from closing during drag
    e.stopPropagation();
  });
  
  block.addEventListener('dragend', (e) => {
    block.classList.remove('dragging');
    // Ensure side panel stays open after drag
    e.stopPropagation();
    // Keep focus on side panel to prevent it from closing
    if (window.focus) {
      window.focus();
    }
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
  if (profile.education && profile.education.length > 0) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="section-title">Education</div>';
    
    profile.education.forEach((edu, index) => {
      if (edu.school) {
        const block = createDataBlock(`University ${index + 1}`, edu.school, `school${index}`);
        if (block) section.appendChild(block);
      }
      if (edu.degree) {
        const block = createDataBlock(`Degree ${index + 1}`, edu.degree, `degree${index}`);
        if (block) section.appendChild(block);
      }
      if (edu.fieldOfStudy) {
        const block = createDataBlock(`Field of Study ${index + 1}`, edu.fieldOfStudy, `fieldOfStudy${index}`);
        if (block) section.appendChild(block);
      }
      if (edu.gpa) {
        const block = createDataBlock(`GPA ${index + 1}`, edu.gpa, `gpa${index}`);
        if (block) section.appendChild(block);
      }
    });
    
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
      if (work.location) {
        const block = createDataBlock(`Location ${index + 1}`, work.location, `location${index}`);
        if (block) section.appendChild(block);
      }
      if (work.fromMonth && work.fromYear) {
        let dateRange = `${work.fromMonth} ${work.fromYear}`;
        if (work.currentlyWorking) {
          dateRange += ' - Present';
        } else if (work.toMonth && work.toYear) {
          dateRange += ` - ${work.toMonth} ${work.toYear}`;
        } else if (work.toYear) {
          dateRange += ` - ${work.toYear}`;
        }
        const block = createDataBlock(`Date Range ${index + 1}`, dateRange, `dateRange${index}`);
        if (block) section.appendChild(block);
      }
      if (work.roleDescription) {
        const block = createDataBlock(`Role Description ${index + 1}`, work.roleDescription, `roleDescription${index}`);
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
  
  // Other section
  if (profile.other && profile.other.length > 0) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = '<div class="section-title">Other</div>';
    
    profile.other.forEach((field) => {
      if (field.label && field.value) {
        const block = createDataBlock(field.label, field.value, `other_${field.label}`);
        if (block) section.appendChild(block);
      }
    });
    
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
