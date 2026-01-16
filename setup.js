// Setup page logic
let workEntryCount = 1;
let educationEntryCount = 1;
let otherFieldCount = 0;

// Load existing profile data and pre-fill form
async function loadExistingProfile() {
  const result = await chrome.storage.local.get(['profile']);
  if (!result.profile) return;
  
  const profile = result.profile;
  
  // Fill identity fields
  if (profile.identity) {
    if (profile.identity.firstName) document.getElementById('firstName').value = profile.identity.firstName;
    if (profile.identity.lastName) document.getElementById('lastName').value = profile.identity.lastName;
    if (profile.identity.legalName) document.getElementById('legalName').value = profile.identity.legalName;
    if (profile.identity.email) document.getElementById('email').value = profile.identity.email;
    if (profile.identity.phone) document.getElementById('phone').value = profile.identity.phone;
  }
  
  // Fill address fields
  if (profile.address) {
    if (profile.address.line1) document.getElementById('addressLine1').value = profile.address.line1;
    if (profile.address.city) document.getElementById('city').value = profile.address.city;
    if (profile.address.state) document.getElementById('state').value = profile.address.state;
    if (profile.address.zip) document.getElementById('zip').value = profile.address.zip;
    if (profile.address.country) document.getElementById('country').value = profile.address.country;
  }
  
  // Fill education entries
  if (profile.education && profile.education.length > 0) {
    profile.education.forEach((edu, index) => {
      if (index === 0) {
        // Use the existing first entry
        if (edu.school) document.getElementById('school0').value = edu.school;
        if (edu.degree) document.getElementById('degree0').value = edu.degree;
        if (edu.fieldOfStudy) document.getElementById('fieldOfStudy0').value = edu.fieldOfStudy;
        if (edu.gpa) document.getElementById('gpa0').value = edu.gpa;
      } else {
        // Add new entries for additional education
        addEducationEntry(edu);
      }
    });
    
    educationEntryCount = profile.education.length;
  }
  
  // Fill other custom fields
  if (profile.other && profile.other.length > 0) {
    profile.other.forEach((field) => {
      addOtherField(field.label, field.value);
    });
  }
  
  // Fill links fields
  if (profile.links) {
    if (profile.links.linkedin) document.getElementById('linkedin').value = profile.links.linkedin;
    if (profile.links.github) document.getElementById('github').value = profile.links.github;
    if (profile.links.portfolio) document.getElementById('portfolio').value = profile.links.portfolio;
    if (profile.links.resume) document.getElementById('resume').value = profile.links.resume;
  }
  
  // Fill work experience entries
  if (profile.work && profile.work.length > 0) {
    profile.work.forEach((work, index) => {
      if (index === 0) {
        // Use the existing first entry
        if (work.jobTitle) document.getElementById('jobTitle0').value = work.jobTitle;
        if (work.company) document.getElementById('company0').value = work.company;
        if (work.location) document.getElementById('location0').value = work.location;
        if (work.fromMonth) document.getElementById('fromMonth0').value = work.fromMonth;
        if (work.fromYear) document.getElementById('fromYear0').value = work.fromYear;
        if (work.toMonth) document.getElementById('toMonth0').value = work.toMonth;
        if (work.toYear) document.getElementById('toYear0').value = work.toYear;
        if (work.currentlyWorking) {
          document.getElementById('currentlyWorking0').checked = work.currentlyWorking;
          document.getElementById('toDateRow0').style.display = 'none';
        } else {
          document.getElementById('toDateRow0').style.display = 'grid';
        }
        if (work.roleDescription) document.getElementById('roleDescription0').value = work.roleDescription;
      } else {
        // Add new entries for additional work experiences
        addWorkEntry(work);
      }
    });
    
    workEntryCount = profile.work.length;
  }
}

// Helper function to add work entry with data
function addWorkEntry(workData = null) {
  const container = document.getElementById('workExperienceContainer');
  const newEntry = document.createElement('div');
  newEntry.className = 'work-entry';
  const index = workEntryCount;
  newEntry.innerHTML = `
    <div class="form-group">
      <label for="jobTitle${index}">Job Title *</label>
      <input type="text" id="jobTitle${index}" name="jobTitle${index}" required value="${workData?.jobTitle || ''}">
    </div>
    <div class="form-group">
      <label for="company${index}">Company *</label>
      <input type="text" id="company${index}" name="company${index}" required value="${workData?.company || ''}">
    </div>
    <div class="form-group">
      <label for="location${index}">Location</label>
      <input type="text" id="location${index}" name="location${index}" value="${workData?.location || ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="fromMonth${index}">From (Month)</label>
        <input type="text" id="fromMonth${index}" name="fromMonth${index}" placeholder="e.g., Aug 2025" value="${workData?.fromMonth || ''}">
      </div>
      <div class="form-group">
        <label for="fromYear${index}">From (Year)</label>
        <input type="text" id="fromYear${index}" name="fromYear${index}" placeholder="e.g., 2025" value="${workData?.fromYear || ''}">
      </div>
    </div>
    <div class="form-row" id="toDateRow${index}" style="display: ${workData?.currentlyWorking ? 'none' : 'grid'};">
      <div class="form-group">
        <label for="toMonth${index}">To (Month)</label>
        <input type="text" id="toMonth${index}" name="toMonth${index}" placeholder="e.g., Dec 2025" value="${workData?.toMonth || ''}">
      </div>
      <div class="form-group">
        <label for="toYear${index}">To (Year)</label>
        <input type="text" id="toYear${index}" name="toYear${index}" placeholder="e.g., 2025" value="${workData?.toYear || ''}">
      </div>
    </div>
    <div class="form-group">
      <label>
        <input type="checkbox" id="currentlyWorking${index}" name="currentlyWorking${index}" ${workData?.currentlyWorking ? 'checked' : ''}>
        I currently work here
      </label>
    </div>
    <div class="form-group">
      <label for="roleDescription${index}">Role Description</label>
      <textarea id="roleDescription${index}" name="roleDescription${index}" rows="3">${workData?.roleDescription || ''}</textarea>
    </div>
  `;
  container.appendChild(newEntry);
  
  // Attach event listener for checkbox toggle (CSP compliant)
  const checkbox = document.getElementById(`currentlyWorking${index}`);
  const toDateRow = document.getElementById(`toDateRow${index}`);
  if (checkbox && toDateRow) {
    checkbox.addEventListener('change', function() {
      toDateRow.style.display = this.checked ? 'none' : 'grid';
    });
  }
  
  workEntryCount++;
}

// Helper function to add education entry with data
function addEducationEntry(eduData = null) {
  const container = document.getElementById('educationContainer');
  const newEntry = document.createElement('div');
  newEntry.className = 'education-entry';
  const index = educationEntryCount;
  newEntry.innerHTML = `
    <div class="form-group">
      <label for="school${index}">School / University *</label>
      <input type="text" id="school${index}" name="school${index}" required value="${eduData?.school || ''}">
    </div>
    <div class="form-group">
      <label for="degree${index}">Degree *</label>
      <input type="text" id="degree${index}" name="degree${index}" required placeholder="e.g., Bachelors, Masters" value="${eduData?.degree || ''}">
    </div>
    <div class="form-group">
      <label for="fieldOfStudy${index}">Field of Study</label>
      <input type="text" id="fieldOfStudy${index}" name="fieldOfStudy${index}" value="${eduData?.fieldOfStudy || ''}">
    </div>
    <div class="form-group">
      <label for="gpa${index}">GPA (Optional)</label>
      <input type="text" id="gpa${index}" name="gpa${index}" placeholder="e.g., 3.8" value="${eduData?.gpa || ''}">
    </div>
  `;
  container.appendChild(newEntry);
  educationEntryCount++;
}

// Helper function to add other custom field
function addOtherField(label = '', value = '') {
  const container = document.getElementById('otherContainer');
  const newEntry = document.createElement('div');
  newEntry.className = 'other-entry';
  const index = otherFieldCount;
  newEntry.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label for="otherLabel${index}">Field Label</label>
        <input type="text" id="otherLabel${index}" name="otherLabel${index}" placeholder="e.g., Certifications" value="${label}">
      </div>
      <div class="form-group">
        <label for="otherValue${index}">Value</label>
        <input type="text" id="otherValue${index}" name="otherValue${index}" value="${value}">
      </div>
    </div>
  `;
  container.appendChild(newEntry);
  otherFieldCount++;
}

document.getElementById('addWorkEntry').addEventListener('click', () => {
  addWorkEntry();
});

document.getElementById('addEducationEntry').addEventListener('click', () => {
  addEducationEntry();
});

document.getElementById('addOtherField').addEventListener('click', () => {
  addOtherField();
});

// Handle "currently working" checkbox toggle for first entry
document.getElementById('currentlyWorking0')?.addEventListener('change', function() {
  const toDateRow = document.getElementById('toDateRow0');
  if (toDateRow) {
    toDateRow.style.display = this.checked ? 'none' : 'grid';
  }
});

// Load existing profile when page loads
loadExistingProfile();

document.getElementById('setupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const profile = {
    identity: {
      firstName: formData.get('firstName') || '',
      lastName: formData.get('lastName') || '',
      legalName: formData.get('legalName') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || ''
    },
    address: {
      line1: formData.get('addressLine1') || '',
      city: formData.get('city') || '',
      state: formData.get('state') || '',
      zip: formData.get('zip') || '',
      country: formData.get('country') || 'United States'
    },
    education: [],
    work: [],
    other: [],
    links: {
      linkedin: formData.get('linkedin') || '',
      github: formData.get('github') || '',
      portfolio: formData.get('portfolio') || '',
      resume: formData.get('resume') || ''
    }
  };

  // Collect education entries
  for (let i = 0; i < educationEntryCount; i++) {
    const school = formData.get(`school${i}`);
    const degree = formData.get(`degree${i}`);
    
    if (school && degree) {
      profile.education.push({
        school: school,
        degree: degree,
        fieldOfStudy: formData.get(`fieldOfStudy${i}`) || '',
        gpa: formData.get(`gpa${i}`) || ''
      });
    }
  }

  // Collect work experience entries
  for (let i = 0; i < workEntryCount; i++) {
    const jobTitle = formData.get(`jobTitle${i}`);
    const company = formData.get(`company${i}`);
    
    if (jobTitle && company) {
      profile.work.push({
        jobTitle: jobTitle,
        company: formData.get(`company${i}`) || '',
        location: formData.get(`location${i}`) || '',
        fromMonth: formData.get(`fromMonth${i}`) || '',
        fromYear: formData.get(`fromYear${i}`) || '',
        toMonth: formData.get(`toMonth${i}`) || '',
        toYear: formData.get(`toYear${i}`) || '',
        currentlyWorking: formData.get(`currentlyWorking${i}`) === 'on',
        roleDescription: formData.get(`roleDescription${i}`) || ''
      });
    }
  }

  // Collect other custom fields
  for (let i = 0; i < otherFieldCount; i++) {
    const label = formData.get(`otherLabel${i}`);
    const value = formData.get(`otherValue${i}`);
    
    if (label && value) {
      profile.other.push({
        label: label,
        value: value
      });
    }
  }

  // Save to chrome storage
  await chrome.storage.local.set({ 
    profile: profile,
    setupComplete: true 
  });

  // Show success message
  const form = document.getElementById('setupForm');
  form.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <h2 style="color: #667eea; margin-bottom: 20px;">✅ Setup Complete!</h2>
      <p style="color: #666; margin-bottom: 30px;">Your information has been saved. You can now use QuickDrop!</p>
      <p style="color: #999; font-size: 14px;">This page will close automatically in <span id="countdown">10</span> seconds...</p>
    </div>
  `;
  
  // Auto-close after 10 seconds
  let countdown = 10;
  const countdownElement = document.getElementById('countdown');
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdownElement) {
      countdownElement.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      window.close();
    }
  }, 1000);
});
