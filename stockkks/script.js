// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
  // Setup mobile menu toggle
  setupMobileMenu();
  
  // Setup URL parameter handling for category filters
  handleURLParameters();
  
  // Only run on admin page
  if (window.location.pathname.includes('admin')) {
    const token = localStorage.getItem('token');
    if (token) {
      // Show upload section if token exists
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('upload-section').style.display = 'block';
      document.getElementById('logout-btn').style.display = 'block';
    }
  } else {
    // On index page, load videos automatically
    if (document.getElementById('results')) {
      searchVideos();
    }
  }
});

// 🔐 Admin Logout
function logout() {
  localStorage.removeItem('token');
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('upload-section').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'none';
  // Clear form fields
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

// 🔐 Admin Login
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Login failed: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('upload-section').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'block';
      } else {
        alert('Login failed: ' + (data.message || 'Unknown error'));
      }
    })
    .catch(err => {
      console.error(err);
      alert('Login failed: ' + err.message);
    });
}

// 🎥 Upload Video
function uploadVideo() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to upload videos');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('upload-section').style.display = 'none';
    return;
  }
  
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const keywords = document.getElementById('keywords').value;
  const category = document.getElementById('category').value;
  const videoFile = document.getElementById('videoFile').files[0];
  
  // Validate inputs
  if (!title || !description || !keywords || !category || !videoFile) {
    alert('Please fill all fields and select a video file');
    return;
  }
  
  // Show loading indicator
  const uploadBtn = document.querySelector('#upload-section button');
  const originalText = uploadBtn.textContent;
  uploadBtn.textContent = 'Uploading...';
  uploadBtn.disabled = true;
  
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('keywords', keywords);
  formData.append('category', category);
  formData.append('video', videoFile);

  fetch('/api/videos/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: formData
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      alert('Upload successful!');
      console.log(data);
      // Reset form
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
      document.getElementById('keywords').value = '';
      document.getElementById('category').value = '';
      document.getElementById('videoFile').value = '';
    })
    .catch(err => {
      console.error(err);
      alert('Upload failed: ' + err.message);
    })
    .finally(() => {
      // Reset button
      uploadBtn.textContent = originalText;
      uploadBtn.disabled = false;
    });
}

// 🔍 Search Videos
function searchVideos() {
  const keyword = document.getElementById('searchInput')?.value || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  const url = `/api/videos/search?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`;
  
  const results = document.getElementById('results');
  if (!results) return; // Not on the search page
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loading');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
  }
  
  results.innerHTML = '';

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }
      return res.json();
    })
    .then(videos => {
      results.innerHTML = '';
      
      if (videos.length === 0) {
        results.innerHTML = '<div class="no-results">No videos found. Try a different search.</div>';
        return;
      }
        videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        // Create a nicer description (truncate if too long)
        const shortDescription = video.description.length > 120 
          ? video.description.substring(0, 120) + '...' 
          : video.description;
          
        card.innerHTML = `
          <video src="${video.cloudinary_url}" controls poster="${video.cloudinary_url.replace(/\.[^/.]+$/, ".jpg")}" preload="metadata"></video>
          <div class="video-info">
            <h3>${video.title}</h3>
            <p>${shortDescription}</p>
            <a href="${video.cloudinary_url}" download><i class="fas fa-download"></i> Download</a>
          </div>
        `;
        results.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      results.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> Error loading videos: ${err.message}</div>`;
    })    .finally(() => {
      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
    });
}

// 📱 Mobile Menu Toggle
function setupMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (navLinks && navLinks.classList.contains('active')) {
      if (!event.target.closest('.nav-links') && !event.target.closest('.mobile-menu-btn')) {
        navLinks.classList.remove('active');
      }
    }
  });
}

// 🔗 Handle URL Parameters
function handleURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  if (category && document.getElementById('categoryFilter')) {
    document.getElementById('categoryFilter').value = category;
    searchVideos();
  }
}

// 📨 Contact Form Submission
function submitContactForm(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value || 'Contact Form Inquiry';
  const message = document.getElementById('message').value;
  
  // Show submission feedback
  const form = document.getElementById('contactForm');
  const formContent = form.innerHTML;
  
  // Display loading indicator
  form.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Sending your message...</p>
    </div>
  `;
  
  // Send data to the server
  fetch('/api/contact/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      email,
      subject,
      message
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Success message
      form.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <i class="fas fa-check-circle" style="font-size: 3rem; color: #4CAF50; margin-bottom: 20px;"></i>
          <h3>Thank You!</h3>
          <p>${data.message || 'Your message has been sent successfully. We\'ll get back to you as soon as possible.'}</p>
          <button type="button" onclick="resetContactForm()" style="margin-top: 20px;">
            <i class="fas fa-paper-plane"></i> Send Another Message
          </button>
        </div>
      `;
    } else {
      // Error message
      form.innerHTML = formContent;
      alert(data.message || 'Failed to send your message. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error submitting form:', error);
    form.innerHTML = formContent;
    alert('An error occurred while sending your message. Please try again later.');
  });
  
  return false;
}

// Reset contact form to original state
function resetContactForm() {
  location.reload();
}

