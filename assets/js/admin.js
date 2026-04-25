/* ====================================================
   ADMIN PANEL — admin.js
   Team Shivam Tripathi | Blog Management Logic
   ==================================================== */

'use strict';

// ── CONFIG: CHANGE THESE CREDENTIALS ──────────────────
const ADMIN_USERNAME = 'shivam';
const ADMIN_PASSWORD = 'lic@admin2024';
// ──────────────────────────────────────────────────────

// Storage Key
const STORAGE_KEY    = 'tst_blog_posts';
const SESSION_KEY    = 'tst_admin_session';
const MAX_LOGIN_TRIES = 5;
const LOCKOUT_MS      = 5 * 60 * 1000; // 5 minutes

// ── State ──
let posts           = [];
let editingPostId   = null;
let deleteTargetId  = null;
let filteredPosts   = [];

// ══════════════════════════════════════════════════════
// UTILITY HELPERS
// ══════════════════════════════════════════════════════

function generateId() {
  return 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg, type = 'success') {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toastIcon.textContent  = icons[type] || '✅';
  toastMsg.textContent   = msg;
  toast.className        = 'toast ' + type;
  toast.style.display    = 'flex';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

function updateTopbarDate() {
  const el = document.getElementById('topbar-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ══════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════

function loadPosts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    posts = data ? JSON.parse(data) : [];
  } catch {
    posts = [];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// ══════════════════════════════════════════════════════
// SEED DEFAULT POSTS (runs only once on first launch)
// ══════════════════════════════════════════════════════

const SEED_KEY = 'tst_blog_seeded_v4';

const DEFAULT_POSTS_DATA = [
  {
    id: 'default_1',
    title: 'How LIC Agents Earn Money \u2013 Complete Commission Structure Explained',
    excerpt: 'Understand the complete LIC agent commission structure \u2013 first-year, renewal commissions, bonuses, and how to maximize your earnings.',
    content: '<p>LIC agents have one of the most transparent and rewarding commission structures in the insurance industry. When you sell a new policy, you earn a <strong>first-year commission</strong> ranging from 2% to 35% of the annual premium depending on the policy type. After that, you receive <strong>renewal commissions</strong> every year the client pays their premium.</p><p>On top of this, top-performing agents receive <strong>bonus commissions</strong>, club memberships (like the Club Membership or MDRT), and other incentives from LIC. The more policies you sell and retain, the higher your passive income grows over time.</p><h2>Commission Breakdown</h2><p>Here is a simplified breakdown of how commissions work for a typical endowment plan:</p><ul><li><strong>First Year:</strong> 25%\u201335% of premium</li><li><strong>2nd &amp; 3rd Year:</strong> 7.5% of premium</li><li><strong>4th Year Onwards:</strong> 5% of premium</li></ul><p>The key to maximising earnings is building a large, loyal client base and ensuring policy renewals stay high. Renewals are passive income \u2014 you earn them without doing any additional work.</p>',
    category: 'Income',
    author: 'Shivam Tripathi',
    date: '2024-03-01',
    image: 'assets/images/blog-ai-1.png',
    slug: '',
    status: 'published',
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z'
  },
  {
    id: 'default_2',
    title: 'What Makes a Successful LIC Agent? 10 Habits of Top Performers',
    excerpt: 'Discover the habits and mindsets that separate top-performing LIC agents from the rest. Tips from 15+ years of field experience.',
    content: '<p>After 15+ years of working in the LIC field, I\'ve observed that the most successful agents share a specific set of habits. It\'s not just about selling \u2014 it\'s about building trust, staying consistent, and genuinely caring about clients\' financial futures.</p><h2>10 Habits of Top LIC Agents</h2><ol><li><strong>They follow up consistently</strong> \u2014 A lead never goes cold on their watch.</li><li><strong>They listen more than they talk</strong> \u2014 Understanding the client\'s need is priority #1.</li><li><strong>They know every product deeply</strong> \u2014 They can answer any policy question instantly.</li><li><strong>They set daily activity goals</strong> \u2014 Calls, meetings, and new leads are tracked every day.</li><li><strong>They maintain relationships after the sale</strong> \u2014 Birthdays, anniversaries, renewal reminders.</li><li><strong>They invest in self-development</strong> \u2014 Books, seminars, IRDA updates.</li><li><strong>They build referral systems</strong> \u2014 Every client becomes a source of 3\u20135 more clients.</li><li><strong>They dress and speak professionally</strong> \u2014 First impressions matter in finance.</li><li><strong>They are honest, always</strong> \u2014 Never mis-sell. Long-term reputation &gt; short-term gains.</li><li><strong>They never give up</strong> \u2014 Rejection is data, not defeat.</li></ol>',
    category: 'Success Stories',
    author: 'Shivam Tripathi',
    date: '2024-02-01',
    image: 'assets/images/blog-ai-2.png',
    slug: '',
    status: 'published',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 'default_3',
    title: 'How to Become a LIC Agent in Prayagraj \u2013 Complete 2024 Guide',
    excerpt: 'Step-by-step guide to becoming a LIC Agent in Prayagraj. Documents needed, IRDA exam details, and tips to start fast.',
    content: '<p>Becoming a LIC agent in Prayagraj is a straightforward process, but it requires preparation. Here is the complete step-by-step guide as of 2024.</p><h2>Eligibility</h2><ul><li>Minimum age: 18 years</li><li>Education: 10th pass (in rural areas), 12th pass (urban areas)</li><li>Must be an Indian citizen</li></ul><h2>Step-by-Step Process</h2><ol><li><strong>Contact a LIC Development Officer (DO)</strong> \u2014 in Prayagraj, reach us at Team Shivam Tripathi.</li><li><strong>Submit documents</strong> \u2014 Aadhar, PAN, 2 photos, educational certificates, and bank passbook copy.</li><li><strong>Complete 25-hour training</strong> \u2014 Mandatory IRDA-approved training, usually done over 5 days.</li><li><strong>Appear for IRDA exam</strong> \u2014 Online exam conducted by Insurance Institute of India. Pass mark is 35/50.</li><li><strong>Get your agent code</strong> \u2014 Once cleared, LIC issues your unique agent code and you can start selling!</li></ol><p>The entire process takes 2\u20134 weeks. Contact us today and we\u2019ll guide you through every step.</p>',
    category: 'Getting Started',
    author: 'Shivam Tripathi',
    date: '2024-01-01',
    image: 'assets/images/blog-ai-3.png',
    slug: '',
    status: 'published',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'default_4',
    title: 'How to Identify Fake LIC Agents \u2013 Protect Yourself from Fraud',
    excerpt: 'Important tips to verify a genuine LIC agent and protect yourself from insurance fraud. Always check agent credentials.',
    content: '<p>Insurance fraud is a serious problem in India. Every year, thousands of people lose money to fake agents who pose as genuine LIC representatives. Here\u2019s how to protect yourself.</p><h2>How to Verify a Genuine LIC Agent</h2><ul><li><strong>Ask for their Agent ID card</strong> \u2014 Every genuine LIC agent has a photo ID card issued by LIC with their agent code.</li><li><strong>Verify on LIC website</strong> \u2014 Visit licindia.in and check the agent\u2019s code in the \u201cFind an Agent\u201d section.</li><li><strong>Pay premium only to LIC</strong> \u2014 Never pay cash directly to an agent. Use LIC\u2019s online portal, bank, or cheque in favour of LIC.</li><li><strong>Get official receipts</strong> \u2014 Every payment should generate an LIC-branded receipt with a policy number.</li><li><strong>Call LIC helpline</strong> \u2014 1800-33-4433 (toll-free) to verify any agent or policy.</li></ul><h2>Red Flags to Watch Out For</h2><ul><li>Agent pressures you to \u201cinvest\u201d money in non-LIC schemes</li><li>Promises unrealistically high returns</li><li>Asks for cash payment only</li><li>Cannot produce a valid LIC agent ID card</li></ul>',
    category: 'Safety',
    author: 'Team Shivam Tripathi',
    date: '2023-12-01',
    image: 'assets/images/blog-ai-4.png',
    slug: '',
    status: 'published',
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  },
  {
    id: 'default_5',
    title: 'Top 5 LIC Policies for Maximum Returns in 2024',
    excerpt: 'Compare LIC\'s best performing plans for savings, investment, and protection. Find the right policy for your financial goals.',
    content: '<p>LIC offers over 30 active plans, but not all are equal. Here are the top 5 policies recommended for 2024 based on returns, safety, and flexibility.</p><h2>1. LIC Jeevan Anand (Plan 915)</h2><p>A classic endowment + whole life plan. You get a lump sum at maturity AND lifelong coverage continues. Ideal for long-term savings.</p><h2>2. LIC New Jeevan Labh (Plan 936)</h2><p>A limited premium, non-linked endowment plan. Pay for 16\u201325 years, get maturity benefits + bonus. Perfect for those who want to stop paying early.</p><h2>3. LIC Jeevan Umang (Plan 945)</h2><p>Whole life plan with annual survival benefit of 8% of sum assured every year from age 30 until death or policy surrender. Great passive income option.</p><h2>4. LIC Tech Term (Plan 954)</h2><p>Online-only pure term insurance. Maximum life cover at the lowest premium. Best for pure protection needs.</p><h2>5. LIC Dhan Rekha (Plan 863)</h2><p>A money-back plan with guaranteed additions. Gives regular payouts during the policy term. Ideal for planned financial goals like education or marriage.</p>',
    category: 'Financial Planning',
    author: 'Team Shivam Tripathi',
    date: '2023-11-01',
    image: 'assets/images/blog-ai-5.png',
    slug: '',
    status: 'published',
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2023-11-01T00:00:00.000Z'
  },
  {
    id: 'default_6',
    title: 'LIC vs Private Insurance Companies \u2013 Why LIC Wins Every Time',
    excerpt: 'An objective comparison of LIC with private insurance companies on claim settlement, trust, returns, and agent support.',
    content: '<p>A common question people ask is: \u201cWhy should I choose LIC over private insurers like HDFC Life, SBI Life, or ICICI Prudential?\u201d The answer lies in three core areas: <strong>trust, claim settlement, and returns</strong>.</p><h2>Claim Settlement Ratio (2022\u201323)</h2><ul><li><strong>LIC:</strong> 98.74% \u2014 Industry best, consistently year after year.</li><li><strong>Private sector average:</strong> 96\u201397%</li></ul><p>That 1\u20132% gap might seem small, but it represents thousands of families whose claims were rejected by private insurers.</p><h2>Government Backing</h2><p>LIC is backed by the Government of India. Your premiums are protected by sovereign guarantee. No private insurer can offer this security.</p><h2>Branch Accessibility</h2><p>LIC has over 2,000 branches across India. Private insurers are largely urban-focused.</p><h2>Agent Support</h2><p>LIC agents are trained, regulated, and accountable to the corporation. They undergo mandatory IRDA training and are accessible long-term \u2014 unlike private agents who frequently switch companies.</p>',
    category: 'Comparison',
    author: 'Shivam Tripathi',
    date: '2023-10-01',
    image: 'assets/images/blog-ai-6.png',
    slug: '',
    status: 'published',
    createdAt: '2023-10-01T00:00:00.000Z',
    updatedAt: '2023-10-01T00:00:00.000Z'
  },
  {
    id: 'default_7',
    title: 'The Power of Early Planning – Why Start LIC In Your 20s?',
    excerpt: 'Starting your LIC policy in your 20s allows you to secure maximum coverage at minimum premiums. Read why early planning is essential.',
    content: '<p>One of the biggest financial mistakes people make is delaying their life insurance until their 30s or 40s. The golden rule of insurance is: the younger you are, the cheaper the premium. Starting an LIC policy in your 20s gives you a massive advantage.</p><h2>Why Buy LIC in Your 20s?</h2><ul><li><strong>Lower Premiums:</strong> A term plan bought at age 25 can cost half of what it costs at age 35. You lock in that low rate for life.</li><li><strong>Longer Compounding:</strong> Endowment plans benefit greatly from time. Giving your investments 30-40 years to grow creates a massive maturity corpus through bonuses.</li><li><strong>Easier Approval:</strong> You are generally healthier in your 20s. Policies are issued quickly without heavy medical tests.</li><li><strong>Forced Savings:</strong> It builds a discipline of saving money before lifestyle inflation kicks in.</li></ul><p>Don’t wait for "the right time" to buy insurance. The right time is always right now.</p>',
    category: 'Financial Planning',
    author: 'Team Shivam Tripathi',
    date: '2024-04-15',
    image: 'assets/images/blog-ai-7.png',
    slug: '',
    status: 'published',
    createdAt: '2024-04-15T00:00:00.000Z',
    updatedAt: '2024-04-15T00:00:00.000Z'
  }
];

/**
 * Seeds/merges the 6 original blog posts into localStorage.
 * - Runs once per seed version (v2 triggers even if v1 already ran).
 * - Adds any default post that doesn't already exist (matched by ID).
 * - Never overwrites or deletes posts the admin has created/edited.
 */
function seedDefaultPosts() {
  // Already seeded at this version — skip
  if (localStorage.getItem(SEED_KEY)) return;

  const existing = localStorage.getItem(STORAGE_KEY);
  let currentPosts = [];
  try { currentPosts = existing ? JSON.parse(existing) : []; } catch (_) { currentPosts = []; }

  // Collect IDs already present
  const existingIds = new Set(currentPosts.map(function(p) { return p.id; }));

  // Add only the default posts that are missing
  var toAdd = DEFAULT_POSTS_DATA.filter(function(p) { return !existingIds.has(p.id); });

  // Update images for existing default posts
  let changed = false;
  currentPosts.forEach(p => {
    if (p.id && p.id.startsWith('default_')) {
      const def = DEFAULT_POSTS_DATA.find(d => d.id === p.id);
      if (def && p.image !== def.image) {
        p.image = def.image;
        changed = true;
      }
    }
  });

  if (toAdd.length > 0) {
    // Append defaults so they appear as the newest posts after reversal
    var merged = currentPosts.concat(toAdd);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } else if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPosts));
  }

  // Mark this seed version as done
  localStorage.setItem(SEED_KEY, 'true');
}

// ══════════════════════════════════════════════════════
// AUTHENTICATION
// ══════════════════════════════════════════════════════

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function login() {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('admin-app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-form').reset();
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('login-error').textContent = '';
}

function getLockout() {
  const raw = localStorage.getItem('tst_lockout');
  return raw ? JSON.parse(raw) : { count: 0, until: 0 };
}

function setLockout(count, until) {
  localStorage.setItem('tst_lockout', JSON.stringify({ count, until }));
}

function resetLockout() {
  localStorage.removeItem('tst_lockout');
}

// ── Login Form Handling ──
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const lockout = getLockout();
  if (Date.now() < lockout.until) {
    window.location.href = '401.html';
    return;
  }

  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const btn      = document.getElementById('login-btn');
  const btnText  = document.getElementById('login-btn-text');
  const spinner  = document.getElementById('login-spinner');

  // Simulate loading
  btn.disabled    = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  setTimeout(() => {
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      resetLockout();
      login();
      showAdminApp();
    } else {
      const tries = (lockout.count || 0) + 1;
      if (tries >= MAX_LOGIN_TRIES) {
        setLockout(tries, Date.now() + LOCKOUT_MS);
        window.location.href = '401.html';
      } else {
        setLockout(tries, 0);
        showLoginError(`Invalid username or password. (${MAX_LOGIN_TRIES - tries} attempts left)`);
      }
    }
  }, 800);
});

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.classList.add('show');
  const input = document.getElementById('admin-password');
  input.value = '';
  input.focus();
}

// Password toggle
document.getElementById('toggle-pw-btn').addEventListener('click', function() {
  const input   = document.getElementById('admin-password');
  const eyeShow = document.getElementById('eye-show');
  const eyeHide = document.getElementById('eye-hide');
  if (input.type === 'password') {
    input.type = 'text';
    eyeShow.style.display = 'none';
    eyeHide.style.display = 'inline';
  } else {
    input.type = 'password';
    eyeShow.style.display = 'inline';
    eyeHide.style.display = 'none';
  }
});

// ══════════════════════════════════════════════════════
// SHOW ADMIN APP
// ══════════════════════════════════════════════════════

function showAdminApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display    = 'flex';
  loadPosts();
  updateTopbarDate();
  renderDashboard();
  navigateTo('dashboard');
}

// ══════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════

function navigateTo(section) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === section);
  });

  // Update sections
  document.querySelectorAll('.admin-section').forEach(el => {
    el.classList.toggle('active', el.id === 'section-' + section);
  });

  // Update topbar title
  const titles = {
    dashboard:  'Dashboard',
    'all-posts': 'All Posts',
    'new-post':  editingPostId ? 'Edit Post' : 'Write New Post'
  };
  document.getElementById('topbar-title').textContent = titles[section] || '';

  // Refresh data for section
  if (section === 'dashboard')  renderDashboard();
  if (section === 'all-posts')  renderPostsList();
  if (section === 'new-post' && !editingPostId)  resetPostForm();

  // Close sidebar on mobile
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Wire up all data-section buttons and links
document.addEventListener('click', function(e) {
  const target = e.target.closest('[data-section]');
  if (!target) return;
  const section = target.dataset.section;
  if (!section) return;
  e.preventDefault();

  if (section === 'new-post') {
    window.location.href = 'write-post.html';
    return;
  }

  navigateTo(section);
});

// Sidebar nav items
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const section = this.dataset.section;
    if (section === 'new-post') {
      window.location.href = 'write-post.html';
      return;
    }
    navigateTo(section);
  });
});

// ══════════════════════════════════════════════════════
// SIDEBAR MOBILE
// ══════════════════════════════════════════════════════

function openSidebar() {
  document.getElementById('admin-sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}

function closeSidebar() {
  document.getElementById('admin-sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

document.getElementById('menu-toggle-btn').addEventListener('click', openSidebar);
document.getElementById('sidebar-close-btn').addEventListener('click', closeSidebar);
document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
document.getElementById('logout-btn').addEventListener('click', logout);

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════

function renderDashboard() {
  const total     = posts.length;
  const published = posts.filter(p => p.status === 'published').length;
  const drafts    = posts.filter(p => p.status === 'draft').length;
  const cats      = [...new Set(posts.map(p => p.category).filter(Boolean))].length;

  document.getElementById('total-posts-count').textContent     = total;
  document.getElementById('published-posts-count').textContent = published;
  document.getElementById('draft-posts-count').textContent     = drafts;
  document.getElementById('categories-count').textContent      = cats;
  document.getElementById('posts-count-badge').textContent     = total;

  updateCategoryFilter();
  renderRecentPosts();
}

function renderRecentPosts() {
  const container = document.getElementById('recent-posts-list');
  const recent    = [...posts].reverse().slice(0, 5);

  if (!recent.length) {
    container.innerHTML = `<p class="empty-state-sm">No posts yet. <a href="#" data-section="new-post">Create your first post →</a></p>`;
    return;
  }

  container.innerHTML = recent.map(p => `
    <div class="recent-post-item">
      <span class="rpi-cat">${sanitizeHTML(p.category || 'Uncategorized')}</span>
      <span class="rpi-title">${sanitizeHTML(p.title)}</span>
      <span class="rpi-status ${p.status === 'published' ? 'status-published' : 'status-draft'}">
        ${p.status === 'published' ? '● Live' : '○ Draft'}
      </span>
      <span class="rpi-date">${formatDate(p.date)}</span>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════
// ALL POSTS
// ══════════════════════════════════════════════════════

function renderPostsList() {
  const container  = document.getElementById('posts-list');
  const noPostsMsg = document.getElementById('no-posts-msg');
  const search     = document.getElementById('search-posts').value.toLowerCase();
  const catFilter  = document.getElementById('filter-category').value;
  const statusFilter = document.getElementById('filter-status').value;

  filteredPosts = posts.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search) ||
      (p.category || '').toLowerCase().includes(search) ||
      (p.excerpt || '').toLowerCase().includes(search);
    const matchCat    = !catFilter  || p.category === catFilter;
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  if (!posts.length) {
    container.innerHTML = '';
    if (noPostsMsg) noPostsMsg.style.display = 'block';
    return;
  }

  if (noPostsMsg) noPostsMsg.style.display = 'none';

  if (!filteredPosts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No posts found</h3>
        <p>Try a different search or filter.</p>
      </div>`;
    return;
  }

  container.innerHTML = [...filteredPosts].reverse().map(p => `
    <div class="post-card" data-id="${p.id}">
      ${p.image
        ? `<img class="post-card-thumb" src="${sanitizeHTML(p.image)}" alt="${sanitizeHTML(p.title)}" onerror="this.style.display='none'" />`
        : `<div class="post-card-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.8rem;">📄</div>`
      }
      <div class="post-card-body">
        <div class="post-card-top">
          <span class="post-cat-tag">${sanitizeHTML(p.category || 'Uncategorized')}</span>
          <span class="post-status-badge ${p.status === 'published' ? 'status-published' : 'status-draft'}">
            ${p.status === 'published' ? '● Published' : '○ Draft'}
          </span>
        </div>
        <p class="post-card-title">${sanitizeHTML(p.title)}</p>
        <p class="post-card-excerpt">${sanitizeHTML(p.excerpt || '')}</p>
        <div class="post-card-meta">
          <span>👤 ${sanitizeHTML(p.author || 'Admin')}</span>
          <span>📅 ${formatDate(p.date)}</span>
          <span>🆔 ${p.id}</span>
        </div>
      </div>
      <div class="post-card-actions">
        <button class="action-btn btn-preview" data-id="${p.id}" title="Preview post" aria-label="Preview">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
        </button>
        <button class="action-btn btn-edit" data-id="${p.id}" title="Edit post" aria-label="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="action-btn btn-delete" data-id="${p.id}" title="Delete post" aria-label="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  // Wire buttons
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => editPost(btn.dataset.id));
  });
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
  });
  container.querySelectorAll('.btn-preview').forEach(btn => {
    btn.addEventListener('click', () => previewPost(btn.dataset.id));
  });
}

// Search and filter listeners
document.getElementById('search-posts').addEventListener('input', renderPostsList);
document.getElementById('filter-category').addEventListener('change', renderPostsList);
document.getElementById('filter-status').addEventListener('change', renderPostsList);

// Update category dropdown from posts data
function updateCategoryFilter() {
  const select = document.getElementById('filter-category');
  const cats   = [...new Set(posts.map(p => p.category).filter(Boolean))].sort();
  const current = select.value;

  select.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${sanitizeHTML(c)}" ${c === current ? 'selected' : ''}>${sanitizeHTML(c)}</option>`).join('');
}

// ══════════════════════════════════════════════════════
// POST FORM
// ══════════════════════════════════════════════════════

function resetPostForm() {
  document.getElementById('post-form').reset();
  document.getElementById('edit-post-id').value = '';
  document.getElementById('post-content').innerHTML = '';
  document.getElementById('post-date').value = getTodayISO();
  document.getElementById('title-char-count').textContent  = '0 / 100';
  document.getElementById('excerpt-char-count').textContent = '0 / 200';
  clearImagePreview();
  editingPostId = null;
}

function editPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  editingPostId = id;

  document.getElementById('edit-post-id').value    = post.id;
  document.getElementById('post-title').value       = post.title    || '';
  document.getElementById('post-excerpt').value     = post.excerpt  || '';
  document.getElementById('post-content').innerHTML = post.content  || '';
  document.getElementById('post-category').value    = post.category || '';
  document.getElementById('post-author').value      = post.author   || 'Shivam Tripathi';
  document.getElementById('post-status').value      = post.status   || 'published';
  document.getElementById('post-date').value        = post.date     || getTodayISO();
  document.getElementById('post-image').value       = post.image    || '';
  document.getElementById('post-slug').value        = post.slug     || '';

  // Update char counts
  updateCharCount('post-title', 'title-char-count', 100);
  updateCharCount('post-excerpt', 'excerpt-char-count', 200);

  // Update image preview if exists
  if (post.image) showImagePreview(post.image);
  else clearImagePreview();

  // Update form titles
  document.getElementById('post-form-title').textContent    = 'Edit Post';
  document.getElementById('post-form-subtitle').textContent = `Editing: ${post.title}`;
  document.getElementById('publish-btn-text').textContent        = 'Update Post';
  document.getElementById('publish-btn-bottom-text').textContent = 'Update Post';

  navigateTo('new-post');
}

// ── Save/Publish ──
function savePost(status) {
  const title    = document.getElementById('post-title').value.trim();
  const excerpt  = document.getElementById('post-excerpt').value.trim();
  const content  = document.getElementById('post-content').innerHTML.trim();
  const category = document.getElementById('post-category').value.trim();
  const author   = document.getElementById('post-author').value.trim();
  const date     = document.getElementById('post-date').value;
  const image    = document.getElementById('post-image').value.trim();
  const slug     = document.getElementById('post-slug').value.trim();

  // Validate
  if (!title)    { showToast('Please enter a post title.', 'error'); return false; }
  if (!excerpt)  { showToast('Please enter a short excerpt.', 'error'); return false; }
  if (!content || content === '' || content === '<br>') {
    showToast('Please write the post content.', 'error'); return false;
  }
  if (!category) { showToast('Please enter a category.', 'error'); return false; }

  if (editingPostId) {
    // UPDATE
    const idx = posts.findIndex(p => p.id === editingPostId);
    if (idx !== -1) {
      posts[idx] = {
        ...posts[idx],
        title, excerpt, content, category, author,
        date, image, slug,
        status,
        updatedAt: new Date().toISOString()
      };
    }
    showToast(status === 'published' ? 'Post updated & published! ✨' : 'Post saved as draft.', 'success');
  } else {
    // CREATE
    const newPost = {
      id: generateId(),
      title, excerpt, content, category, author,
      date: date || getTodayISO(),
      image, slug, status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    posts.push(newPost);
    showToast(status === 'published' ? 'Post published successfully! 🎉' : 'Post saved as draft.', 'success');
  }

  savePosts();
  editingPostId = null;
  renderDashboard();
  navigateTo('all-posts');
  return true;
}

// Form submit → publish
document.getElementById('post-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const status = document.getElementById('post-status').value || 'published';
  savePost(status);
});

// Save as draft buttons
document.getElementById('btn-save-draft').addEventListener('click', function() {
  document.getElementById('post-status').value = 'draft';
  savePost('draft');
});

document.getElementById('btn-save-draft-bottom').addEventListener('click', function() {
  document.getElementById('post-status').value = 'draft';
  savePost('draft');
});

// Cancel
document.getElementById('btn-cancel-post').addEventListener('click', function() {
  editingPostId = null;
  navigateTo('all-posts');
});

// ── Character Counters ──
function updateCharCount(inputId, countId, max) {
  const el    = document.getElementById(inputId);
  const count = document.getElementById(countId);
  if (!el || !count) return;
  const len = el.value.length;
  count.textContent = `${len} / ${max}`;
  count.style.color = len > max * 0.9 ? '#ff6b6b' : '';
}

document.getElementById('post-title').addEventListener('input', () => {
  updateCharCount('post-title', 'title-char-count', 100);
});

document.getElementById('post-excerpt').addEventListener('input', () => {
  updateCharCount('post-excerpt', 'excerpt-char-count', 200);
});

// ── Rich Text Editor Toolbar ──
document.querySelectorAll('.editor-btn').forEach(btn => {
  btn.addEventListener('mousedown', function(e) {
    e.preventDefault(); // Don't lose focus
    const cmd = this.dataset.cmd;

    if (cmd === 'h2' || cmd === 'h3') {
      document.execCommand('formatBlock', false, cmd);
    } else if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false, null);
    }

    document.getElementById('post-content').focus();
  });
});

// ── Image Preview ──
document.getElementById('post-image-file').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const base64 = event.target.result;
    document.getElementById('post-image').value = base64;
    showImagePreview(base64);
  };
  reader.readAsDataURL(file);
});

document.getElementById('btn-preview-img').addEventListener('click', function() {
  const src = document.getElementById('post-image').value.trim();
  if (!src) { showToast('Please enter an image path.', 'warning'); return; }
  showImagePreview(src);
});

function showImagePreview(src) {
  const img  = document.getElementById('image-preview');
  const ph   = document.getElementById('image-preview-placeholder');
  img.src    = src;
  img.style.display = 'block';
  if (ph) ph.style.display = 'none';

  img.onerror = function() {
    img.style.display = 'none';
    if (ph) { ph.style.display = 'block'; ph.textContent = '⚠️ Image not found or invalid URL'; }
  };

  img.onload = function() {
    img.style.display = 'block';
    if (ph) ph.style.display = 'none';
  };

  // Lightbox on click
  img.onclick = function() {
    const lb = document.getElementById('img-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    if (lb && lbImg) {
      lbImg.src = src;
      lb.style.display = 'flex';
    }
  };
}

// Close lightbox with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const lb = document.getElementById('img-lightbox');
    if (lb) lb.style.display = 'none';
  }
});

function clearImagePreview() {
  const img = document.getElementById('image-preview');
  const ph  = document.getElementById('image-preview-placeholder');
  img.src   = '';
  img.style.display = 'none';
  if (ph) { ph.style.display = 'block'; ph.textContent = 'Image preview will appear here'; }
}

// ══════════════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════════════

function confirmDelete(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  deleteTargetId = id;
  document.getElementById('delete-modal-msg').textContent =
    `Are you sure you want to delete "${post.title}"? This cannot be undone.`;
  document.getElementById('delete-modal').style.display = 'flex';
}

document.getElementById('delete-cancel-btn').addEventListener('click', function() {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
});

document.getElementById('delete-confirm-btn').addEventListener('click', function() {
  if (!deleteTargetId) return;
  posts = posts.filter(p => p.id !== deleteTargetId);
  savePosts();
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
  showToast('Post deleted successfully.', 'info');
  renderDashboard();
  renderPostsList();
});

// Close modal on overlay click
document.getElementById('delete-modal').addEventListener('click', function(e) {
  if (e.target === this) {
    deleteTargetId = null;
    this.style.display = 'none';
  }
});

// ══════════════════════════════════════════════════════
// POST PREVIEW MODAL
// ══════════════════════════════════════════════════════

function previewPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  const html = `
    ${post.image ? `<img src="${sanitizeHTML(post.image)}" alt="${sanitizeHTML(post.title)}" onerror="this.style.display='none'" />` : ''}
    <h1>${sanitizeHTML(post.title)}</h1>
    <div class="preview-meta">
      <span>👤 ${sanitizeHTML(post.author || 'Admin')}</span>
      <span>🏷️ ${sanitizeHTML(post.category || 'Uncategorized')}</span>
      <span>📅 ${formatDate(post.date)}</span>
      <span class="${post.status === 'published' ? 'status-published' : 'status-draft'} rpi-status">
        ${post.status === 'published' ? '● Published' : '○ Draft'}
      </span>
    </div>
    <div class="preview-excerpt">${sanitizeHTML(post.excerpt || '')}</div>
    <div>${post.content || ''}</div>
  `;

  document.getElementById('preview-content').innerHTML = html;
  document.getElementById('preview-modal').style.display = 'flex';
}

document.getElementById('preview-close-btn').addEventListener('click', function() {
  document.getElementById('preview-modal').style.display = 'none';
});

document.getElementById('preview-modal').addEventListener('click', function(e) {
  if (e.target === this) this.style.display = 'none';
});

// ══════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════════════

document.addEventListener('keydown', function(e) {
  // ESC → close modals
  if (e.key === 'Escape') {
    document.getElementById('delete-modal').style.display  = 'none';
    document.getElementById('preview-modal').style.display = 'none';
    deleteTargetId = null;
  }
  // Ctrl+S → save draft (when in new-post section)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    const active = document.querySelector('.admin-section.active');
    if (active && active.id === 'section-new-post') {
      e.preventDefault();
      savePost('draft');
    }
  }
});

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════

(function init() {
  // Seed the 6 default posts into localStorage on first ever run
  seedDefaultPosts();

  if (isLoggedIn()) {
    showAdminApp();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-app').style.display    = 'none';
  }

  // Pre-fill today's date
  const dateInput = document.getElementById('post-date');
  if (dateInput) dateInput.value = getTodayISO();

  // Update time every minute
  setInterval(updateTopbarDate, 60000);
})();
