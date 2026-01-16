// Setup page logic
let workEntryCount = 1;

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
  
  // Fill education fields
  if (profile.education) {
    if (profile.education.school) document.getElementById('school').value = profile.education.school;
    if (profile.education.degree) document.getElementById('degree').value = profile.education.degree;
    if (profile.education.fieldOfStudy) document.getElementById('fieldOfStudy').value = profile.education.fieldOfStudy;
    if (profile.education.gpa) document.getElementById('gpa').value = profile.education.gpa;
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
        if (work.currentlyWorking) document.getElementById('currentlyWorking0').checked = work.currentlyWorking;
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
        <input type="text" id="fromMonth${index}" name="fromMonth${index}" placeholder="e.g., 8" value="${workData?.fromMonth || ''}">
      </div>
      <div class="form-group">
        <label for="fromYear${index}">From (Year)</label>
        <input type="text" id="fromYear${index}" name="fromYear${index}" placeholder="e.g., 2025" value="${workData?.fromYear || ''}">
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
  workEntryCount++;
}

document.getElementById('addWorkEntry').addEventListener('click', () => {
  addWorkEntry();
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
    education: {
      school: formData.get('school') || '',
      degree: formData.get('degree') || '',
      fieldOfStudy: formData.get('fieldOfStudy') || '',
      gpa: formData.get('gpa') || ''
    },
    work: [],
    links: {
      linkedin: formData.get('linkedin') || '',
      github: formData.get('github') || '',
      portfolio: formData.get('portfolio') || '',
      resume: formData.get('resume') || ''
    }
  };

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
        currentlyWorking: formData.get(`currentlyWorking${i}`) === 'on',
        roleDescription: formData.get(`roleDescription${i}`) || ''
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
      <p style="color: #999; font-size: 14px;">Click the extension icon to start filling forms.</p>
    </div>
  `;
});
