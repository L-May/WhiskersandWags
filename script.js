const apiKey = 'yBaOHuVWiXnOipMpiqLEBa5ziWBhfPtlfUDwJUNIb5AP4FdxNu';
const apiSecret = 'FcBRWdWtWISeC1IXoPcS9d0NokEePqLUskRUzDEB';
let accessToken = '';

const loader = document.getElementById('loader');
const message = document.getElementById('message');
const results = document.getElementById('results');


const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show-nav');
});


async function authenticate() {
  const res = await fetch('https://api.petfinder.com/v2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`
  });
  const data = await res.json();
  accessToken = data.access_token;
}

function showLoader(show) {
  loader.classList.toggle('hidden', !show);
}

function showMessage(msg) {
  message.textContent = msg;
}

function clearResults() {
  results.innerHTML = '';
  message.textContent = '';
}

function displayResults(items, type = 'animal') {
    clearResults();
    if (!items || items.length === 0) {
      showMessage('No results found.');
      return;
    }
  
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'result-item';
  
      let imageUrl = '';
      if (item.photos && item.photos.length > 0) {
        imageUrl = item.photos[0].medium || item.photos[0].small;
      }
  
      div.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${item.name}" class="result-img" loading="lazy" />` : ''}
        <div>
          <strong>${item.name}</strong><br>
          ${type === 'animal' ? `${item.breeds?.primary || ''}, ${item.age || ''}<br>` : ''}
          Location: ${item.contact?.address?.city || item.address?.city || ''}, ${item.contact?.address?.state || item.address?.state || ''}<br>
          ${item.email ? `Email: ${item.email}<br>` : ''}
          ${item.phone ? `Phone: ${item.phone}<br>` : ''}
          <a href="#" class="open-modal" data-id="${item.id}" data-type="${type}">More details</a>
        </div>
      `;
  
      results.appendChild(div);
    });
  
    document.querySelectorAll('.open-modal').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = link.dataset.id;
        const type = link.dataset.type;
        await showModal(id, type);
      });
    });
  }
  
  async function showModal(id, type) {
    await authenticate();
    const url = type === 'organization'
      ? `https://api.petfinder.com/v2/organizations/${id}`
      : `https://api.petfinder.com/v2/animals/${id}`;
  
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    const content = type === 'organization' ? data.organization : data.animal;
  
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
      <h3>${content.name}</h3>
      ${content.description ? `<p>${content.description}</p>` : ''}
      ${content.photos && content.photos[0] ? `<img src="${content.photos[0].medium}" style="width:100%; margin-top:1rem;" />` : ''}
      ${content.url ? `<p><a href="${content.url}" target="_blank">View on Petfinder</a></p>` : ''}
    `;
  
    document.getElementById('modal').classList.remove('hidden');
  }
  
  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('modal').classList.add('hidden');
  });
  
  window.addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
      document.getElementById('modal').classList.add('hidden');
    }
  });
  

async function searchByType() {
  const type = document.getElementById('animal-type').value.trim();
  if (!type) return showMessage('Enter a type (e.g., dog)');
  await authenticate();

  showLoader(true);
  clearResults();

  try {
    const res = await fetch(`https://api.petfinder.com/v2/animals?type=${type}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    displayResults(data.animals, 'animal');
  } catch (err) {
    showMessage('Error fetching data.');
  } finally {
    showLoader(false);
  }
}

async function searchByLocation() {
  const location = document.getElementById('animal-location').value.trim();
  if (!location) return showMessage('Enter a location');
  await authenticate();

  showLoader(true);
  clearResults();

  try {
    const res = await fetch(`https://api.petfinder.com/v2/animals?location=${location}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    displayResults(data.animals, 'animal');
  } catch (err) {
    showMessage('Error fetching data.');
  } finally {
    showLoader(false);
  }
}

async function searchOrganizations() {
  const location = document.getElementById('org-location').value.trim();
  if (!location) return showMessage('Enter a location');
  await authenticate();

  showLoader(true);
  clearResults();

  try {
    const res = await fetch(`https://api.petfinder.com/v2/organizations?location=${location}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    displayResults(data.organizations, 'organization');
  } catch (err) {
    showMessage('Error fetching data.');
  } finally {
    showLoader(false);
  }
}
