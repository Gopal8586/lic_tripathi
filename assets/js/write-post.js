'use strict';
const STORAGE_KEY = 'tst_blog_posts';
const DRAFT_KEY   = 'tst_wp_draft';

/* ── Helpers ── */
const $  = id => document.getElementById(id);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

function toast(msg, icon='✅') {
  $('wp-toast-icon').textContent = icon;
  $('wp-toast-msg').textContent  = msg;
  const t = $('wp-toast');
  t.style.display = 'flex';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.style.display = 'none', 2800);
}

function getPosts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function savePosts(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
function uid()  { return 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2,7); }
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-'); }
function wordCount() {
  return ($('post-content').innerText || '').trim().split(/\s+/).filter(Boolean).length;
}

/* ── Autosave ── */
let autosaveTimer;
function triggerAutosave() {
  clearTimeout(autosaveTimer);
  $('autosave-status').textContent = '○ Unsaved changes…';
  autosaveTimer = setTimeout(() => {
    saveDraft();
    $('autosave-status').textContent = '● Auto-saved';
  }, 2000);
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(collectFormData()));
}

function collectFormData() {
  const tags = Array.from(document.querySelectorAll('.wp-tag-chip')).map(c => c.dataset.tag);
  const highlights = Array.from(document.querySelectorAll('.highlight-input')).map(i => i.value).filter(Boolean);
  return {
    id:         $('edit-post-id').value || uid(),
    title:      $('post-title').value.trim(),
    subtitle:   $('post-subtitle').value.trim(),
    excerpt:    $('post-excerpt').value.trim(),
    content:    $('post-content').innerHTML,
    category:   $('post-category').value.trim(),
    author:     $('post-author').value.trim(),
    date:       $('post-date').value,
    status:     $('post-status').value,
    schedule:   $('post-schedule').value,
    slug:       $('post-slug').value.trim(),
    recommended:$('post-recommended') ? $('post-recommended').value : '',
    image:      currentImage,
    imageAlt:   $('image-alt') ? $('image-alt').value.trim() : '',
    seoTitle:   $('seo-title').value.trim(),
    seoDesc:    $('seo-desc').value.trim(),
    seoKeyword: $('seo-keyword').value.trim(),
    tags, highlights
  };
}

/* ── Tabs ── */
document.querySelectorAll('.wp-tab').forEach(btn => {
  on(btn, 'click', () => {
    document.querySelectorAll('.wp-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.wp-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    $('panel-' + tab).classList.add('active');
    if (tab === 'preview') updatePreview();
    if (tab === 'seo')     updateSEO();
  });
});

/* ── Toolbar ── */
document.querySelectorAll('.wp-tbtn[data-cmd]').forEach(btn => {
  on(btn, 'click', () => {
    const cmd = btn.dataset.cmd;
    if (cmd === 'hiliteColor') { document.execCommand('hiliteColor', false, '#fff176'); return; }
    document.execCommand(cmd, false, null);
    $('post-content').focus();
  });
});

on($('block-type'), 'change', function() {
  const val = this.value;
  const ed  = $('post-content');
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const block = document.createElement(val);
  if (val === 'blockquote') block.style.cssText = 'border-left:4px solid #f5a623;background:#fffbeb;padding:12px 18px;margin:16px 0;font-style:italic;border-radius:0 8px 8px 0;';
  if (val === 'pre') block.style.cssText = 'background:#1e1e2e;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;';
  block.innerHTML = sel.toString() || '​';
  range.deleteContents();
  range.insertNode(block);
  this.value = 'p';
  ed.focus();
});

on($('font-size-sel'), 'change', function() {
  if (this.value) { document.execCommand('fontSize', false, this.value); this.value = ''; }
});

on($('font-name-sel'), 'change', function() {
  if (this.value) { document.execCommand('fontName', false, this.value); this.value = ''; }
});

on($('btn-link'), 'click', () => {
  savedRange = window.getSelection().rangeCount ? window.getSelection().getRangeAt(0) : null;
  if (savedRange) $('link-text').value = savedRange.toString();
  $('link-modal').style.display = 'flex';
});

on($('btn-callout'), 'click', () => {
  const box = document.createElement('div');
  box.className = 'wp-callout-box';
  box.contentEditable = 'true';
  box.innerHTML = '📌 <strong>Important:</strong> Write your callout message here.';
  insertAtCursor(box);
});

on($('btn-divider'), 'click', () => {
  const hr = document.createElement('hr');
  insertAtCursor(hr);
});

on($('btn-table'), 'click', () => {
  const tbl = document.createElement('table');
  tbl.style.cssText = 'width:100%;border-collapse:collapse;margin:16px 0;';
  tbl.innerHTML = ['<thead><tr><th style="border:1px solid #e2e6ef;padding:8px;background:#f7f8fc;">Column 1</th><th style="border:1px solid #e2e6ef;padding:8px;background:#f7f8fc;">Column 2</th><th style="border:1px solid #e2e6ef;padding:8px;background:#f7f8fc;">Column 3</th></tr></thead>',
    '<tbody><tr><td style="border:1px solid #e2e6ef;padding:8px;">Data</td><td style="border:1px solid #e2e6ef;padding:8px;">Data</td><td style="border:1px solid #e2e6ef;padding:8px;">Data</td></tr></tbody>'].join('');
  insertAtCursor(tbl);
});

function insertAtCursor(node) {
  const ed = $('post-content'); ed.focus();
  const sel = window.getSelection();
  if (sel.rangeCount) { const r = sel.getRangeAt(0); r.collapse(false); r.insertNode(node); }
  else ed.appendChild(node);
}

/* ── Inline Images ── */
on($('btn-inline-image'), 'click', () => $('inline-image-upload').click());

on($('inline-image-upload'), 'change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  insertInlineImage(file);
  this.value = ''; // reset
});

$('post-content').addEventListener('paste', function(e) {
  if (e.clipboardData && e.clipboardData.items) {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = e.clipboardData.items[i].getAsFile();
        insertInlineImage(file);
        break;
      }
    }
  }
});

function insertInlineImage(file) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = document.createElement('img');
    img.src = evt.target.result;
    img.className = 'align-center'; // default
    img.alt = 'Inline image';
    
    // Add a paragraph wrapper so it's easier to type around it
    const p = document.createElement('p');
    p.appendChild(img);
    p.appendChild(document.createElement('br'));
    
    insertAtCursor(p);
    triggerAutosave();
  };
  reader.readAsDataURL(file);
}

let activeInlineImg = null;

on($('post-content'), 'click', function(e) {
  if (e.target.tagName === 'IMG') {
    activeInlineImg = e.target;
    
    // Position popup
    const popup = $('img-format-popup');
    popup.style.display = 'flex';
    
    // Remove active class from all images, add to this one
    document.querySelectorAll('.wp-content-editor img').forEach(img => img.classList.remove('img-active'));
    activeInlineImg.classList.add('img-active');
    
    // Update active button state
    document.querySelectorAll('.img-fmt-btn').forEach(btn => btn.classList.remove('active'));
    if (activeInlineImg.classList.contains('align-left')) document.querySelector('[data-align="align-left"]').classList.add('active');
    else if (activeInlineImg.classList.contains('align-right')) document.querySelector('[data-align="align-right"]').classList.add('active');
    else document.querySelector('[data-align="align-center"]').classList.add('active');
    
    const wrapperRect = document.querySelector('.wp-editor-wrapper').getBoundingClientRect();
    const imgRect = activeInlineImg.getBoundingClientRect();
    
    // Calculate relative to wrapper
    const top = imgRect.top - wrapperRect.top;
    const left = imgRect.left - wrapperRect.left + (imgRect.width / 2);
    
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
  } else {
    hideImgPopup();
  }
});

function hideImgPopup() {
  $('img-format-popup').style.display = 'none';
  if (activeInlineImg) {
    activeInlineImg.classList.remove('img-active');
    activeInlineImg = null;
  }
}

document.querySelectorAll('.img-fmt-btn').forEach(btn => {
  on(btn, 'click', function(e) {
    e.preventDefault();
    if (!activeInlineImg) return;
    
    const align = this.dataset.align;
    if (align === 'delete') {
      activeInlineImg.remove();
      hideImgPopup();
    } else {
      activeInlineImg.className = align + ' img-active';
      document.querySelectorAll('.img-fmt-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    }
    triggerAutosave();
  });
});


/* ── Link modal ── */
let savedRange = null;
on($('link-cancel'), 'click', () => $('link-modal').style.display = 'none');
on($('link-insert'), 'click', () => {
  const url  = $('link-url').value.trim();
  const text = $('link-text').value.trim() || url;
  if (!url) return;
  const a = document.createElement('a');
  a.href = url; a.textContent = text;
  if ($('link-new-tab').checked) a.target = '_blank';
  if (savedRange) { const r = savedRange; r.deleteContents(); r.insertNode(a); }
  else $('post-content').appendChild(a);
  $('link-modal').style.display = 'none';
});

/* ── Templates ── */
const TEMPLATES = {
  simple: '<h2>Introduction</h2><p>Start with a compelling intro that hooks your reader and tells them what they will learn.</p><h2>Main Points</h2><p>Explain the core ideas here.</p><h2>Conclusion</h2><p>Summarise and include a call to action.</p>',
  story:  '<h2>The Beginning</h2><p>Set the scene. Who is the story about?</p><h2>The Challenge</h2><p>What problem or struggle did they face?</p><h2>The Turning Point</h2><p>What changed everything?</p><h2>The Result</h2><p>What outcome did they achieve?</p>',
  listicle: '<h2>1. First Point</h2><p>Explain this point clearly.</p><h2>2. Second Point</h2><p>Explain this point clearly.</p><h2>3. Third Point</h2><p>Explain this point clearly.</p><h2>Conclusion</h2><p>Wrap it up.</p>',
  howto: '<h2>What You Will Need</h2><ul><li>Item one</li><li>Item two</li></ul><h2>Step 1 — </h2><p>Instructions here.</p><h2>Step 2 — </h2><p>Instructions here.</p><h2>Step 3 — </h2><p>Instructions here.</p><h2>Final Result</h2><p>What will the reader achieve?</p>'
};
document.querySelectorAll('.wp-tpl-btn[data-tpl]').forEach(btn => {
  on(btn, 'click', () => {
    if ($('post-content').innerText.trim() && !confirm('Replace current content with template?')) return;
    $('post-content').innerHTML = TEMPLATES[btn.dataset.tpl] || '';
    updateStats(); updateTOC();
  });
});
on($('clear-editor'), 'click', () => { if (confirm('Clear all content?')) { $('post-content').innerHTML = ''; updateStats(); updateTOC(); } });

/* ── Stats & Reading time ── */
function updateStats() {
  const text = $('post-content').innerText || '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const paras = ($('post-content').querySelectorAll('p').length) || 0;
  const mins  = Math.max(1, Math.round(words / 200));
  $('stat-words').textContent     = words;
  $('stat-chars').textContent     = chars;
  $('stat-reading').textContent   = mins;
  $('stat-paragraphs').textContent= paras;
  $('word-count').textContent     = words + ' words';
  $('reading-time').textContent   = mins + ' min read';

  // Readability (simple heuristic)
  const avgSentLen = words / Math.max(1, (text.match(/[.!?]/g)||[]).length);
  let score = 100 - Math.min(100, avgSentLen * 2);
  let label = score > 70 ? '🟢 Easy' : score > 45 ? '🟡 Moderate' : '🔴 Hard';
  $('readability-fill').style.width = score + '%';
  $('readability-fill').style.background = score > 70 ? '#22c55e' : score > 45 ? '#f59e0b' : '#ef4444';
  $('readability-label').textContent = label;

  // Editor hints
  const hints = [
    '💡 Use H2 headings after every 200 words to break up your content',
    '💡 Short sentences improve readability — aim for under 20 words each',
    '💡 Add a bullet list to summarise key points',
    '💡 Strong conclusion = recap + clear call to action',
    '💡 Add your focus keyword naturally in the first paragraph'
  ];
  $('editor-hint').textContent = hints[Math.floor(Date.now()/15000) % hints.length];
}

/* ── TOC ── */
function updateTOC() {
  const headings = $('post-content').querySelectorAll('h2, h3');
  const toc = $('toc-list');
  if (!headings.length) { toc.innerHTML = '<p class="wp-hint" style="padding:8px 0">Add H2 headings to auto-generate TOC</p>'; return; }
  toc.innerHTML = Array.from(headings).map(h => `<div class="wp-toc-item ${h.tagName==='H3'?'h3':''}">${h.textContent.trim()}</div>`).join('');
}

/* ── Auto-slug ── */
on($('post-title'), 'input', function() {
  const val = this.value;
  const cnt = val.length;
  $('title-count').textContent = cnt + '/100';
  $('title-count').className = 'wp-char-count' + (cnt > 90 ? ' over' : cnt > 70 ? ' warn' : '');
  $('post-slug').value = slug(val);
  if (!$('seo-title').value) $('serp-title').textContent = val || 'Blog Title Here';
  triggerAutosave();
});

on($('post-excerpt'), 'input', function() {
  const cnt = this.value.length;
  $('excerpt-count').textContent = cnt + '/250';
  $('excerpt-count').className = 'wp-char-count' + (cnt > 230 ? ' over' : cnt > 200 ? ' warn' : '');
  if (!$('seo-desc').value) $('serp-desc').textContent = this.value || 'Meta description will appear here…';
  triggerAutosave();
});

on($('post-content'), 'input', () => { updateStats(); updateTOC(); triggerAutosave(); });

/* ── Schedule toggle ── */
on($('post-status'), 'change', function() {
  $('schedule-wrap').style.display = this.value === 'scheduled' ? 'block' : 'none';
});

/* ── Tags ── */
on($('tags-input'), 'keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = this.value.trim();
    if (!val) return;
    const chip = document.createElement('div');
    chip.className = 'wp-tag-chip'; chip.dataset.tag = val;
    chip.innerHTML = `${val}<button type="button">✕</button>`;
    chip.querySelector('button').onclick = () => chip.remove();
    $('tags-wrap').appendChild(chip);
    this.value = '';
  }
});

/* ── Highlights ── */
on($('add-highlight'), 'click', () => {
  const div = document.createElement('div');
  div.className = 'highlight-item';
  div.innerHTML = `<input type="text" class="wp-input highlight-input" placeholder="Key point…" /><button class="highlight-remove" title="Remove">✕</button>`;
  div.querySelector('.highlight-remove').onclick = () => div.remove();
  $('highlights-list').appendChild(div);
});
document.querySelectorAll('.highlight-remove').forEach(btn => { on(btn, 'click', () => btn.closest('.highlight-item').remove()); });

/* ── Image Upload ── */
let currentImage = '';
const dropZone = $('image-drop-zone');
const fileInput = $('image-file-input');

['dragenter','dragover'].forEach(ev => on(dropZone, ev, e => { e.preventDefault(); dropZone.classList.add('drag-over'); }));
['dragleave','drop'].forEach(ev => on(dropZone, ev, e => { e.preventDefault(); dropZone.classList.remove('drag-over'); }));
on(dropZone, 'drop', e => { const file = e.dataTransfer.files[0]; if (file) handleImageFile(file); });
on(fileInput, 'change', function() { if (this.files[0]) handleImageFile(this.files[0]); });

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) { toast('Please select an image file', '⚠️'); return; }
  if (file.size > 5 * 1024 * 1024) { toast('Image too large (max 5MB)', '⚠️'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    currentImage = e.target.result;
    $('image-preview').src = currentImage;
    $('upload-inner').style.display    = 'none';
    $('image-preview-wrap').style.display = 'block';

    // Lightbox on click
    $('image-preview').onclick = () => {
      $('lightbox-img').src = currentImage;
      $('img-lightbox').style.display = 'flex';
    };

    toast('Image uploaded!');
  };
  reader.readAsDataURL(file);
}
on($('remove-image'), 'click', () => {
  currentImage = '';
  $('image-preview').src = '';
  $('upload-inner').style.display    = 'flex';
  $('image-preview-wrap').style.display = 'none';
  fileInput.value = '';
});

/* ── SEO ── */
on($('seo-title'), 'input', function() {
  const c = this.value.length;
  $('seo-title-count').textContent = c+'/60';
  $('seo-title-count').className = 'wp-char-count'+(c>55?' over':c>45?' warn':'');
  $('serp-title').textContent = this.value || $('post-title').value || 'Blog Title Here';
  updateSEO();
});
on($('seo-desc'), 'input', function() {
  const c = this.value.length;
  $('seo-desc-count').textContent = c+'/160';
  $('seo-desc-count').className = 'wp-char-count'+(c>155?' over':c>140?' warn':'');
  $('serp-desc').textContent = this.value || $('post-excerpt').value || 'Meta description will appear here…';
  updateSEO();
});
on($('seo-keyword'), 'input', updateSEO);

function setCheck(id, pass) {
  const el = $(id);
  el.className = 'seo-check-item ' + (pass ? 'pass' : 'fail');
  el.querySelector('.chk-icon').textContent = '';
}
function updateSEO() {
  const kw      = ($('seo-keyword').value || '').toLowerCase();
  const title   = ($('seo-title').value   || $('post-title').value || '').toLowerCase();
  const desc    = ($('seo-desc').value    || $('post-excerpt').value || '').toLowerCase();
  const content = ($('post-content').innerText || '').toLowerCase();
  const tLen    = ($('seo-title').value || $('post-title').value || '').length;
  const dLen    = ($('seo-desc').value  || $('post-excerpt').value || '').length;
  const hasH2   = !!$('post-content').querySelector('h2');
  const words   = wordCount();
  const hasAlt  = !!($('image-alt') && $('image-alt').value.trim());

  const checks = [
    ['chk-keyword-title',   kw && title.includes(kw)],
    ['chk-keyword-desc',    kw && desc.includes(kw)],
    ['chk-keyword-content', kw && content.includes(kw)],
    ['chk-img-alt',         hasAlt],
    ['chk-title-len',       tLen >= 40 && tLen <= 70],
    ['chk-desc-len',        dLen >= 120 && dLen <= 160],
    ['chk-headings',        hasH2],
    ['chk-word-count',      words >= 300]
  ];
  let passed = 0;
  checks.forEach(([id, ok]) => { setCheck(id, ok); if (ok) passed++; });

  const score = Math.round((passed / checks.length) * 100);
  $('seo-score-num').textContent = score;
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (score / 100) * circumference;
  const ring = $('seo-ring');
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  const labels = {
    label: score >= 70 ? '🟢 Good SEO' : score >= 40 ? '🟡 Needs Work' : '🔴 Poor SEO',
    sub:   score >= 70 ? 'Your post is well-optimised!' : score >= 40 ? 'Fix the red items below' : 'Fill in SEO fields'
  };
  $('seo-score-label').textContent = labels.label;
  $('seo-score-sub').textContent   = labels.sub;
}

/* ── Preview ── */
document.querySelectorAll('.wp-dev-btn').forEach(btn => {
  on(btn, 'click', function() {
    document.querySelectorAll('.wp-dev-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const frame = $('preview-frame');
    frame.className = 'wp-preview-frame ' + this.dataset.device;
  });
});

function updatePreview() {
  const title     = $('post-title').value    || 'Untitled Post';
  const subtitle  = $('post-subtitle').value || '';
  const excerpt   = $('post-excerpt').value  || '';
  const content   = $('post-content').innerHTML || '';
  const author    = $('post-author').value   || 'Shivam Tripathi';
  const date      = $('post-date').value     || new Date().toISOString().slice(0,10);
  const category  = $('post-category').value || 'General';
  const imgSrc    = currentImage;
  const words     = wordCount();
  const mins      = Math.max(1, Math.round(words / 200));
  const highlights = Array.from(document.querySelectorAll('.highlight-input')).map(i => i.value).filter(Boolean);

  $('preview-inner').innerHTML = `
    ${imgSrc ? `<img class="preview-img" src="${imgSrc}" alt="${$('image-alt')?$('image-alt').value:title}" />` : ''}
    <div class="preview-meta">
      <span>📂 ${category}</span>
      <span>✍️ ${author}</span>
      <span>📅 ${new Date(date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
      <span>🕐 ${mins} min read</span>
    </div>
    <h1>${title}</h1>
    ${subtitle ? `<p style="font-size:1.1rem;color:#5a6278;margin-bottom:12px;">${subtitle}</p>` : ''}
    ${excerpt  ? `<div class="preview-excerpt">${excerpt}</div>` : ''}
    ${highlights.length ? `<div class="preview-highlights"><h4>✅ Key Highlights</h4><ul>${highlights.map(h=>`<li>${h}</li>`).join('')}</ul></div>` : ''}
    <div>${content}</div>
  `;
}

/* ── Publish / Save ── */
function buildPost(status) {
  const data = collectFormData();
  if (!data.title) { toast('Please enter a title', '⚠️'); return null; }
  if (!data.excerpt) { toast('Please enter a description', '⚠️'); return null; }
  if (!data.content || !$('post-content').innerText.trim()) { toast('Please write some content', '⚠️'); return null; }
  if (!data.category) { toast('Please add a category', '⚠️'); return null; }
  data.status = status;
  data.updatedAt = new Date().toISOString();
  if (!data.createdAt) data.createdAt = data.updatedAt;
  return data;
}

function publishPost(status) {
  const post = buildPost(status);
  if (!post) return;
  const posts = getPosts();
  const idx = posts.findIndex(p => p.id === post.id);
  if (idx >= 0) posts[idx] = post; else posts.push(post);
  savePosts(posts);
  localStorage.removeItem(DRAFT_KEY);
  toast(status === 'draft' ? 'Draft saved!' : 'Post published!', status === 'draft' ? '💾' : '🚀');
  setTimeout(() => { window.location.href = 'admin.html'; }, 1000);
}

on($('btn-publish'),         'click', () => publishPost('published'));
on($('btn-save-draft'),      'click', () => publishPost('draft'));
on($('sidebar-publish'),     'click', () => publishPost($('post-status').value === 'draft' ? 'draft' : 'published'));
on($('sidebar-save-draft'),  'click', () => publishPost('draft'));
on($('btn-preview-post'),    'click', () => {
  document.querySelector('.wp-tab[data-tab="preview"]').click();
});

/* ── Copy Link removed ── */

/* ── Load existing post (edit mode) ── */
function loadPost(id) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return;
  $('edit-post-id').value  = post.id;
  $('post-title').value    = post.title    || '';
  $('post-subtitle').value = post.subtitle  || '';
  $('post-excerpt').value  = post.excerpt   || '';
  $('post-content').innerHTML = post.content || '';
  $('post-category').value = post.category  || '';
  $('post-author').value   = post.author    || 'Shivam Tripathi';
  $('post-date').value     = post.date      || '';
  $('post-status').value   = post.status    || 'published';
  $('post-slug').value     = post.slug      || '';
  $('seo-title').value     = post.seoTitle  || '';
  $('seo-desc').value      = post.seoDesc   || '';
  $('seo-keyword').value   = post.seoKeyword|| '';
  if ($('post-recommended')) $('post-recommended').value = post.recommended || '';
  if (post.image) { currentImage = post.image; $('image-preview').src = post.image; $('upload-inner').style.display='none'; $('image-preview-wrap').style.display='block'; }
  if (post.imageAlt && $('image-alt')) $('image-alt').value = post.imageAlt;
  (post.tags || []).forEach(tag => { const chip=document.createElement('div'); chip.className='wp-tag-chip'; chip.dataset.tag=tag; chip.innerHTML=`${tag}<button type="button">✕</button>`; chip.querySelector('button').onclick=()=>chip.remove(); $('tags-wrap').appendChild(chip); });
  if (post.highlights && post.highlights.length) {
    $('highlights-list').innerHTML = '';
    post.highlights.forEach(h => { const div=document.createElement('div'); div.className='highlight-item'; div.innerHTML=`<input type="text" class="wp-input highlight-input" value="${h}" /><button class="highlight-remove">✕</button>`; div.querySelector('.highlight-remove').onclick=()=>div.remove(); $('highlights-list').appendChild(div); });
  }
  updateStats(); updateTOC(); updateSEO();
}

/* ── Draft restore ── */
function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (!confirm('Restore unsaved draft: "' + (d.title || 'Untitled') + '"?')) return;
    $('edit-post-id').value  = d.id    || '';
    $('post-title').value    = d.title || '';
    $('post-subtitle').value = d.subtitle || '';
    $('post-excerpt').value  = d.excerpt  || '';
    $('post-content').innerHTML = d.content || '';
    $('post-category').value = d.category  || '';
    $('post-author').value   = d.author    || 'Shivam Tripathi';
    $('post-date').value     = d.date      || '';
    $('post-status').value   = d.status    || 'published';
    if ($('post-recommended')) $('post-recommended').value = d.recommended || '';
    updateStats(); updateTOC();
  } catch {}
}

/* ── INIT ── */
(function init() {
  // Populate Recommended Posts Dropdown
  const posts = getPosts();
  const recSel = $('post-recommended');
  if (recSel && posts.length > 0) {
    posts.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.title || 'Untitled Post';
      recSel.appendChild(opt);
    });
  }

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');
  if (editId) {
    loadPost(editId);
  } else {
    loadDraft();
  }
  $('post-date').value = $('post-date').value || new Date().toISOString().slice(0,10);
  updateStats(); updateTOC(); updateSEO();
  setInterval(updateSEO, 5000);
})();
