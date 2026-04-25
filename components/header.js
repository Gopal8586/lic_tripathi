/**
 * Header Component — Team Shivam Tripathi
 * All pages now live at root level (all pages at root)
 */
import { initErrorHandling } from '../assets/js/error.js';

initErrorHandling();

const NAV_LINKS = [
  { label: 'Home',        href: '/',        id: 'home'       },
  { label: 'About Shivam', href: 'about',        id: 'about'      },
  { label: 'Bima Sakhi',  href: 'bima-sakhi',   id: 'bima-sakhi' },
  { label: 'Benefits',    href: 'benefits',      id: 'benefits'   },
  { label: 'Why LIC?',    href: 'why-lic',       id: 'why-lic'    },
  { label: 'Process',     href: 'process',       id: 'process'    },
  { label: 'Blog',        href: 'blog',          id: 'blog'       },
  { label: 'Contact',     href: 'contact',       id: 'contact'    },
  { label: 'FAQs',        href: 'faqs',          id: 'faqs'       },
];

export function renderHeader(activeId = '') {
  const linksHtml = NAV_LINKS.map(link => {
    const active = link.id === activeId ? ' class="active"' : '';
    return `<a href="${link.href}" id="nav-${link.id}"${active}>${link.label}</a>`;
  }).join('');

  const html = `
    <nav id="nav-bar" role="navigation" aria-label="Primary Navigation">
      <div class="container nav-inner">

        <!-- Logo & Brand Text -->
        <a href="/" class="nav-logo" aria-label="Team Shivam Tripathi Home">
          <img src="assets/images/shivam-logo.webp" alt="Team Shivam Tripathi" />
          <div class="nav-brand-text">
            <span class="brand-name">Team Shivam Tripathi</span>
            <span class="brand-slogan">Your Partner In Securing Futures</span>
          </div>
        </a>

        <!-- Nav links -->
        <div class="nav-menu" role="menubar">
          ${linksHtml}
        </div>

        <!-- Right side: Join button + mobile toggle -->
        <div class="nav-right">
          <button class="nav-join-btn tst-open-modal" id="join-lic-btn">Join LIC Now</button>
          <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle mobile menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>

      </div>
    </nav>

    <!-- Modal Popup Structure -->
    <div class="tst-modal-overlay" id="join-modal">
      <div class="tst-modal-container">
        <div class="tst-modal-close" id="modal-close">&times;</div>
        
        <div class="tst-modal-header">
          <h2>Start Your LIC Journey</h2>
          <p>Fill out the form below and we'll contact you to start your career as an LIC agent.</p>
        </div>

        <div class="tst-modal-body">
          <form class="tst-modal-form" id="modal-join-form">
            <div class="tst-form-group">
              <label for="m-name">Full Name</label>
              <input type="text" id="m-name" name="name" placeholder="Enter your full name" required />
            </div>

            <div class="tst-form-row">
              <div class="tst-form-group">
                <label for="m-mobile">Mobile Number</label>
                <input type="tel" id="m-mobile" name="mobile" placeholder="98765 43210" required />
              </div>
              <div class="tst-form-group">
                <label for="m-email">Email</label>
                <input type="email" id="m-email" name="email" placeholder="example@mail.com" />
              </div>
            </div>

            <div class="tst-form-row">
              <div class="tst-form-group">
                <label for="m-dob">Date of Birth</label>
                <input type="date" id="m-dob" name="dob" required />
              </div>
              <div class="tst-form-group">
                <label for="m-qual">Qualification</label>
                <select id="m-qual" name="qualification" required>
                  <option value="" disabled selected>Select</option>
                  <option value="10th">10th Pass</option>
                  <option value="12th">12th Pass</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                </select>
              </div>
            </div>

            <div class="tst-form-row">
              <div class="tst-form-group">
                <label for="m-city">City / Location</label>
                <input type="text" id="m-city" name="city" placeholder="e.g. Prayagraj" required />
              </div>
              <div class="tst-form-group">
                <label for="m-occ">Occupation</label>
                <select id="m-occ" name="occupation" required>
                  <option value="" disabled selected>Select</option>
                  <option value="Student">Student</option>
                  <option value="Job">Job / Service</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" class="tst-modal-submit" id="m-submit">Submit Application</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Modal Popup -->
    <div class="tst-modal-overlay" id="success-modal">
      <div class="tst-modal-container">
        <div class="tst-success-content">
          <div class="tst-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 id="success-title">Submission Successful!</h2>
          <p id="success-msg"></p>
          <button class="tst-success-btn" id="success-close-btn">Great!</button>
        </div>
      </div>
    </div>
  `;

  // Inject SmtpJS
  if (!document.getElementById('smtp-js')) {
    const script = document.createElement('script');
    script.id = 'smtp-js';
    script.src = 'https://smtpjs.com/v3/smtp.js';
    document.head.appendChild(script);
  }

  // Inject modal CSS dynamically
  if (!document.getElementById('tst-modal-css')) {
    const link = document.createElement('link');
    link.id = 'tst-modal-css';
    link.rel = 'stylesheet';
    link.href = 'assets/css/modal.css';
    document.head.appendChild(link);
  }

  const wrapper = document.createElement('div');
  wrapper.id = 'header-wrapper';
  wrapper.innerHTML = html;
  document.body.insertBefore(wrapper, document.body.firstChild);

  // Modal logic
  const modal = document.getElementById('join-modal');
  const closeBtn = document.getElementById('modal-close');
  const form = document.getElementById('modal-join-form');

  document.addEventListener('click', (e) => {
    if (e.target.closest('#join-lic-btn') || e.target.closest('.tst-open-modal')) {
      e.preventDefault();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = ''; 
  };

  const successModal = document.getElementById('success-modal');
  const successMsg = document.getElementById('success-msg');
  const successCloseBtn = document.getElementById('success-close-btn');

  window.showSuccessModal = (name) => {
    successMsg.innerHTML = `<strong>${name}</strong>, your form is submitted. Thanks for your interest to be a part of <strong>Team Shivam Tripathi</strong>.`;
    successModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeSuccess = () => {
    successModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  successCloseBtn?.addEventListener('click', closeSuccess);
  successModal?.addEventListener('click', (e) => {
    if (e.target === successModal) closeSuccess();
  });

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('m-submit');
    const originalText = submitBtn.innerText;
    
    const formData = {
      name: document.getElementById('m-name').value,
      email: document.getElementById('m-email').value,
      mobile: document.getElementById('m-mobile').value,
      dob: document.getElementById('m-dob').value,
      qualification: document.getElementById('m-qual').value,
      city: document.getElementById('m-city').value,
      occupation: document.getElementById('m-occ').value
    };

    submitBtn.innerText = 'Sending Application...';
    submitBtn.disabled = true;
    console.log('Form submission started', formData);

    fetch('send-email.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(async response => {
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (response.ok && data?.success) {
        form.reset();
        closeModal();
        window.showSuccessModal(formData.name);
      } else {
        const errMsg = data?.error || (response.status === 404 ? "Email script not found on server." : "Server error (PHP might not be configured)");
        throw new Error(errMsg);
      }
    })
    .catch(error => {
      console.error('Submission Error:', error);
      
      // Fallback for local simulation if script is missing or PHP fails
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        setTimeout(() => {
          form.reset();
          closeModal();
          window.showSuccessModal(formData.name + " (Local Simulation)");
        }, 1000);
      } else {
        alert("Submission failed: " + error.message);
      }
    })
    .finally(() => {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    });
  });

  // Mobile toggle
  const toggle = document.getElementById('mobile-toggle');
  const navBar = document.getElementById('nav-bar');
  toggle?.addEventListener('click', () => {
    const isOpen = navBar.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Active link highlighting
  if (!activeId) {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(link => {
      if (link.href === window.location.href ||
          (path.endsWith('/') && link.id === 'nav-home') ||
          (path.includes('about') && link.id === 'nav-about') ||
          (path.includes('bima-sakhi') && link.id === 'nav-bima-sakhi') ||
          (path.includes('benefits') && link.id === 'nav-benefits') ||
          (path.includes('why-lic') && link.id === 'nav-why-lic') ||
          (path.includes('process') && link.id === 'nav-process') ||
          (path.includes('blog') && link.id === 'nav-blog') ||
          (path.includes('contact') && link.id === 'nav-contact') ||
          (path.includes('faqs') && link.id === 'nav-faqs')) {
        link.classList.add('active');
      }
    });
  }

  // Sticky shadow on scroll
  window.addEventListener('scroll', () => {
    navBar.style.boxShadow = window.scrollY > 40
      ? '0 4px 20px rgba(0,0,0,.25)'
      : '0 2px 8px rgba(0,0,0,.1)';
  }, { passive: true });
}

