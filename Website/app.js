// ==========================================================================
// STRAVA-STYLE ENDSEM TRAINING HUB APPLICATION LOGIC
// Highly responsive, accessible, zero-slop architecture
// ==========================================================================

(function () {
  'use strict';

  // Helpers for Safe LocalStorage (react-best-practices: client-localstorage-schema)
  function getStoredBookmarks() {
    try {
      const raw = localStorage.getItem('endsem_bookmarks');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return new Set();
    }
  }

  function getStoredTheme() {
    try {
      const saved = localStorage.getItem('endsem_theme');
      if (saved) return saved;
    } catch (e) {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  // Precomputed index map for O(1) item lookups (react-best-practices: js-index-maps)
  let catalogMap = new Map();

  // State Management
  const state = {
    subject: 'all',
    category: 'all',
    examType: 'all',
    availability: 'all',
    bookmarksOnly: false,
    searchQuery: '',
    bookmarks: getStoredBookmarks(),
    theme: getStoredTheme(),
    activeModalItem: null
  };

  // DOM Elements
  const elements = {
    html: document.documentElement,
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    searchShortcutHint: document.querySelector('.search-shortcut-hint'),
    cardsGrid: document.getElementById('cardsGrid'),
    emptyState: document.getElementById('emptyState'),
    resultsCount: document.getElementById('resultsCount'),
    totalFilesCount: document.getElementById('totalFilesCount'),
    totalPyqsCount: document.getElementById('totalPyqsCount'),
    totalSubjectsCount: document.getElementById('totalSubjectsCount'),
    bookmarksCount: document.getElementById('bookmarksCount'),
    bookmarksFilterBtn: document.getElementById('bookmarksFilterBtn'),
    coachModalBtn: document.getElementById('coachModalBtn'),
    heroCoachBtn: document.getElementById('heroCoachBtn'),
    detailModal: document.getElementById('detailModal'),
    coachModal: document.getElementById('coachModal'),
    toastContainer: document.getElementById('toastContainer')
  };

  // Initialize Application
  function init() {
    if (typeof CATALOG_DATA !== 'undefined' && Array.isArray(CATALOG_DATA)) {
      catalogMap = new Map(CATALOG_DATA.map(item => [item.id, item]));
    }
    applyTheme(state.theme);
    setupEventListeners();
    updateDashboardStats();
    updateFilterCounts();
    setupTaglineReveal();
    initHeroEffects();
    renderFeed();
    updateBookmarkBadges();
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    elements.html.setAttribute('data-theme', theme);
    localStorage.setItem('endsem_theme', theme);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    if (!elements.themeIcon) return;
    const isDark = state.theme === 'dark';
    elements.themeIcon.innerHTML = isDark
      ? `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  // Bookmark Management
  function toggleBookmark(id) {
    if (state.bookmarks.has(id)) {
      state.bookmarks.delete(id);
      showToast('Removed from saved study list');
    } else {
      state.bookmarks.add(id);
      showToast('Saved to your study list');
    }
    localStorage.setItem('endsem_bookmarks', JSON.stringify(Array.from(state.bookmarks)));
    updateBookmarkBadges();
    renderFeed();
  }

  function updateBookmarkBadges() {
    if (elements.bookmarksCount) {
      elements.bookmarksCount.textContent = state.bookmarks.size;
    }
    if (elements.bookmarksFilterBtn) {
      elements.bookmarksFilterBtn.classList.toggle('active', state.bookmarksOnly);
    }
  }

  function updateFilterCounts() {
    if (typeof CATALOG_DATA === 'undefined') return;
    document.querySelectorAll('[data-subject]').forEach(btn => {
      const s = btn.getAttribute('data-subject');
      const count = s === 'all' ? CATALOG_DATA.length : CATALOG_DATA.filter(x => x.subject === s).length;
      const countEl = btn.querySelector('.chip-count');
      if (countEl) countEl.textContent = count;
    });
  }

  // Dashboard Tabular Numbers
  function updateDashboardStats() {
    if (typeof CATALOG_DATA === 'undefined') return;
    const realFiles = CATALOG_DATA.filter(item => item.available);
    const pyqs = CATALOG_DATA.filter(item => item.category === 'pyq' && item.available);

    if (elements.totalFilesCount) elements.totalFilesCount.textContent = realFiles.length;
    if (elements.totalPyqsCount) elements.totalPyqsCount.textContent = pyqs.length;
    if (elements.totalSubjectsCount) elements.totalSubjectsCount.textContent = '4';
  }

  // Mandatory Tagline Reveal (B11)
  function setupTaglineReveal() {
    const words = document.querySelectorAll('.reveal-word');
    if (!words.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      words.forEach(w => w.classList.add('revealed'));
      return;
    }

    const section = document.getElementById('taglineReveal');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          words.forEach((w, index) => {
            setTimeout(() => {
              w.classList.add('revealed');
            }, index * 55);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(section);
  }

  // Filter Catalog Data
  function getFilteredItems() {
    if (typeof CATALOG_DATA === 'undefined') return [];

    return CATALOG_DATA.filter(item => {
      // Subject Filter
      if (state.subject !== 'all' && item.subject !== state.subject) {
        return false;
      }

      // Category / Resource Type Filter
      if (state.category !== 'all') {
        if (state.category === 'pyq' && item.category !== 'pyq') return false;
        if (state.category === 'analysis' && item.category !== 'analysis') return false;
        if (state.category === 'notes' && (item.category !== 'notes' && item.category !== 'watchlist')) return false;
        if (state.category === 'syllabus' && item.category !== 'syllabus') return false;
      }

      // Exam Type Filter
      if (state.examType !== 'all') {
        if (state.examType === 'endsem' && item.marks !== 70) return false;
        if (state.examType === 'insem' && item.marks !== 30) return false;
      }

      // Availability Filter
      if (state.availability === 'available' && !item.available) return false;
      if (state.availability === 'placeholder' && item.available) return false;

      // Bookmarks Only Filter
      if (state.bookmarksOnly && !state.bookmarks.has(item.id)) {
        return false;
      }

      // Search Query
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSub = item.subtitle.toLowerCase().includes(q);
        const matchSubj = item.subjectName.toLowerCase().includes(q);
        const matchTerm = (item.term || '').toLowerCase().includes(q);
        const matchSummary = (item.summary || '').toLowerCase().includes(q);
        const matchTopics = (item.keyTopics || []).some(t => t.toLowerCase().includes(q));

        if (!matchTitle && !matchSub && !matchSubj && !matchTerm && !matchSummary && !matchTopics) {
          return false;
        }
      }

      return true;
    });
  }

  // Render Activity Feed Cards (Decluttered per landing page design)
  function renderFeed() {
    const items = getFilteredItems();

    if (elements.resultsCount) {
      elements.resultsCount.textContent = `Showing ${items.length} of ${CATALOG_DATA.length} study items`;
    }

    if (items.length === 0) {
      elements.cardsGrid.innerHTML = '';
      elements.emptyState.classList.add('visible');
      return;
    }

    elements.emptyState.classList.remove('visible');

    const html = items.map(item => {
      const isBookmarked = state.bookmarks.has(item.id);
      const isPlaceholder = !item.available;

      // Badge styling
      let badgeClass = 'card-badge';
      if (item.badgeType === 'accent') badgeClass += ' card-badge-accent';
      else if (item.badgeType === 'success') badgeClass += ' card-badge-success';
      else if (item.badgeType === 'primary') badgeClass += ' card-badge-primary';
      else if (item.badgeType === 'muted') badgeClass += ' card-badge-muted';

      // Subject Pill class
      const subjectClass = `card-subject-pill card-subject-${item.subject}`;

      // Topics Chips (up to 3)
      const topicsHtml = (item.keyTopics || []).slice(0, 3).map(topic =>
        `<span class="topic-tag">${escapeHtml(topic)}</span>`
      ).join('');

      // Metadata labels
      const pagesLabel = item.pages ? `${item.pages} pgs` : 'Pending';
      const marksLabel = item.marks ? `${item.marks} M` : 'Spec';
      const patternLabel = item.pattern || '2024';
      const termLabel = item.term || 'Core';

      return `
        <article class="activity-card ${isPlaceholder ? 'placeholder-card' : ''}" data-id="${item.id}">
          <div class="card-header">
            <span class="${subjectClass}">${escapeHtml(item.subjectShort)}</span>
            <div class="card-header-right">
              <span class="${badgeClass}">${escapeHtml(item.badge)}</span>
              <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-bookmark="${item.id}" aria-label="${isBookmarked ? 'Remove bookmark' : 'Bookmark this item'}" title="${isBookmarked ? 'Saved in study list' : 'Bookmark item'}">
                <svg viewBox="0 0 24 24">
                  ${isBookmarked
                    ? '<path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>'
                    : '<path fill="none" stroke="currentColor" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>'
                  }
                </svg>
              </button>
            </div>
          </div>

          <div class="card-body">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-subtitle">${escapeHtml(item.subtitle)}</p>

            <div class="card-meta-line">
              <span class="meta-pill numeric">${pagesLabel}</span>
              <span class="meta-dot" aria-hidden="true">•</span>
              <span class="meta-pill numeric">${marksLabel}</span>
              <span class="meta-dot" aria-hidden="true">•</span>
              <span class="meta-pill">${termLabel}</span>
              <span class="meta-dot" aria-hidden="true">•</span>
              <span class="meta-pill">${patternLabel}</span>
            </div>

            <div class="card-topics">
              ${topicsHtml}
            </div>
          </div>

          <div class="card-footer">
            <div class="card-actions-left">
              ${isPlaceholder
                ? `<span class="btn btn-sm btn-secondary" style="opacity: 0.6; cursor: not-allowed;" title="Syllabus placeholder for upcoming collection">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Not available
                   </span>`
                : `<a href="${encodeURI(item.path)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" title="Open document in new tab">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Open ${item.path.endsWith('.md') ? 'Guide' : 'PDF'}
                   </a>`
              }
              <button class="btn btn-sm btn-secondary" data-detail="${item.id}">
                Details
              </button>
            </div>
            ${!isPlaceholder ? `
              <button class="btn btn-sm btn-secondary" data-copy-path="${escapeHtml(item.projectPath || item.path)}" title="Copy relative path" aria-label="Copy local path">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              </button>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    elements.cardsGrid.innerHTML = html;
  }

  // Open Document Detail Modal (O(1) Map lookup)
  function openDetailModal(id) {
    const item = catalogMap.get(id) || (typeof CATALOG_DATA !== 'undefined' ? CATALOG_DATA.find(x => x.id === id) : null);
    if (!item) return;

    state.activeModalItem = item;

    document.getElementById('modalDetailTag').textContent = `${item.subjectName} • ${item.categoryLabel}`;
    document.getElementById('modalDetailTitle').textContent = item.title;
    document.getElementById('modalDetailSummary').textContent = item.summary || item.subtitle;

    document.getElementById('modalMetaPages').textContent = item.pages ? `${item.pages} Pages` : 'Pending';
    document.getElementById('modalMetaMarks').textContent = item.marks ? `${item.marks} Marks` : 'N/A';
    document.getElementById('modalMetaPattern').textContent = item.pattern || '2024 Pattern';
    document.getElementById('modalMetaTerm').textContent = item.term || 'General Spec';

    const topicsWrap = document.getElementById('modalDetailTopics');
    topicsWrap.innerHTML = (item.keyTopics || []).map(t =>
      `<span class="topic-tag" style="padding: 4px 10px; font-size: 12px;">${escapeHtml(t)}</span>`
    ).join('');

    const pathBox = document.getElementById('modalDetailPath');
    pathBox.textContent = item.projectPath || item.path;

    const actionContainer = document.getElementById('modalDetailActions');
    if (item.available) {
      actionContainer.innerHTML = `
        <button class="btn btn-secondary" id="modalCopyBtn">
          Copy Path
        </button>
        <a href="${encodeURI(item.path)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          Open Document
        </a>
      `;
      document.getElementById('modalCopyBtn').onclick = () => {
        copyToClipboard(item.projectPath || item.path);
        showToast('Relative path copied to clipboard');
      };
    } else {
      actionContainer.innerHTML = `
        <span class="btn btn-secondary" style="opacity: 0.6; cursor: not-allowed;">
          Not available as of now
        </span>
      `;
    }

    elements.detailModal.classList.add('open');
    elements.detailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    elements.detailModal.classList.remove('open');
    elements.detailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.activeModalItem = null;
  }

  // Socratic Coach Modal
  function openCoachModal() {
    elements.coachModal.classList.add('open');
    elements.coachModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCoachModal() {
    elements.coachModal.classList.remove('open');
    elements.coachModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Toast Notification System
  function showToast(message) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${escapeHtml(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  // Clipboard Helper
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  }

  // HTML Escape Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Theme Toggle
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      });
    }

    // Search Input
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        const hasQuery = state.searchQuery.length > 0;
        elements.searchClear.classList.toggle('visible', hasQuery);
        if (elements.searchShortcutHint) {
          elements.searchShortcutHint.classList.toggle('hidden', hasQuery);
        }
        renderFeed();
      });
    }

    // Search Clear Button
    if (elements.searchClear) {
      elements.searchClear.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        elements.searchClear.classList.remove('visible');
        if (elements.searchShortcutHint) {
          elements.searchShortcutHint.classList.remove('hidden');
        }
        renderFeed();
        elements.searchInput.focus();
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== elements.searchInput) {
        e.preventDefault();
        elements.searchInput.focus();
        elements.searchInput.select();
      }

      if (e.key === 'Escape') {
        if (elements.detailModal.classList.contains('open')) {
          closeDetailModal();
        } else if (elements.coachModal.classList.contains('open')) {
          closeCoachModal();
        } else if (state.searchQuery) {
          elements.searchInput.value = '';
          state.searchQuery = '';
          elements.searchClear.classList.remove('visible');
          renderFeed();
        }
      }
    });

    // Subject Filter Pills
    document.querySelectorAll('[data-subject]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-subject]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.subject = btn.getAttribute('data-subject');
        renderFeed();
      });
    });

    // Category Filter Chips
    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.category = btn.getAttribute('data-category');
        renderFeed();
      });
    });

    // Exam Type Chips
    document.querySelectorAll('[data-exam]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-exam]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.examType = btn.getAttribute('data-exam');
        renderFeed();
      });
    });

    // Availability Chips
    document.querySelectorAll('[data-avail]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-avail]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.availability = btn.getAttribute('data-avail');
        renderFeed();
      });
    });

    // Bookmarks Filter Toggle
    if (elements.bookmarksFilterBtn) {
      elements.bookmarksFilterBtn.addEventListener('click', () => {
        state.bookmarksOnly = !state.bookmarksOnly;
        elements.bookmarksFilterBtn.classList.toggle('active', state.bookmarksOnly);
        renderFeed();
      });
    }

    // Reset Filters from Empty State
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        state.subject = 'all';
        state.category = 'all';
        state.examType = 'all';
        state.availability = 'all';
        state.bookmarksOnly = false;
        state.searchQuery = '';
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.searchClear) elements.searchClear.classList.remove('visible');

        document.querySelectorAll('[data-subject]').forEach(b => b.classList.toggle('active', b.getAttribute('data-subject') === 'all'));
        document.querySelectorAll('[data-category]').forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === 'all'));
        document.querySelectorAll('[data-exam]').forEach(b => b.classList.toggle('active', b.getAttribute('data-exam') === 'all'));
        document.querySelectorAll('[data-avail]').forEach(b => b.classList.toggle('active', b.getAttribute('data-avail') === 'all'));
        if (elements.bookmarksFilterBtn) elements.bookmarksFilterBtn.classList.remove('active');

        renderFeed();
      });
    }

    // Card Actions Delegation
    elements.cardsGrid.addEventListener('click', (e) => {
      const bookmarkBtn = e.target.closest('[data-bookmark]');
      if (bookmarkBtn) {
        const id = bookmarkBtn.getAttribute('data-bookmark');
        toggleBookmark(id);
        return;
      }

      const detailBtn = e.target.closest('[data-detail]');
      if (detailBtn) {
        const id = detailBtn.getAttribute('data-detail');
        openDetailModal(id);
        return;
      }

      const copyBtn = e.target.closest('[data-copy-path]');
      if (copyBtn) {
        const path = copyBtn.getAttribute('data-copy-path');
        copyToClipboard(path);
        showToast('Relative path copied to clipboard');
        return;
      }
    });

    // Spotlight Cards Click
    document.querySelectorAll('.spotlight-card[data-target-id]').forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-target-id');
        openDetailModal(targetId);
      });
    });

    // Modal Close Triggers
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        closeDetailModal();
        closeCoachModal();
      });
    });

    elements.detailModal.addEventListener('click', (e) => {
      if (e.target === elements.detailModal) closeDetailModal();
    });

    elements.coachModal.addEventListener('click', (e) => {
      if (e.target === elements.coachModal) closeCoachModal();
    });

    if (elements.coachModalBtn) {
      elements.coachModalBtn.addEventListener('click', openCoachModal);
    }
    if (elements.heroCoachBtn) {
      elements.heroCoachBtn.addEventListener('click', openCoachModal);
    }

    const copyPromptBtn = document.getElementById('copyPromptBtn');
    if (copyPromptBtn) {
      copyPromptBtn.addEventListener('click', () => {
        const promptText = document.getElementById('coachPromptContent').textContent;
        copyToClipboard(promptText);
        showToast('Socratic Coach prompt copied to clipboard');
      });
    }
  }

  // ==========================================================================
  // HERO BACKGROUND: LAYER 1 (WebGL Wave) & LAYER 2 (Liquid Glass)
  // ==========================================================================
  function initHeroEffects() {
    const canvas = document.getElementById("webgl-canvas");
    if (!canvas) return;

    const vShaderEl = document.getElementById("js-vertex-shader");
    const fShaderEl = document.getElementById("js-fragment-shader");
    if (!vShaderEl || !fShaderEl) return;

    // Check if Three.js is loaded
    if (typeof THREE !== "undefined") {
      class Stage {
        constructor() {
          this.canvas = canvas;
          this.container = canvas.closest('.hero-section') || canvas.parentElement;

          const initialWidth = this.container ? this.container.clientWidth : window.innerWidth;
          const initialHeight = this.container ? this.container.clientHeight : 560;

          this.renderParam = {
            clearColor: 0x000000,
            width: initialWidth,
            height: initialHeight
          };

          this.cameraParam = {
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: 0,
            far: 1
          };

          this.scene = null;
          this.camera = null;
          this.renderer = null;
          this.isInitialized = false;
        }

        init() {
          this._setScene();
          this._setRender();
          this._setCamera();
          this.isInitialized = true;
        }

        _setScene() {
          this.scene = new THREE.Scene();
        }

        _setRender() {
          this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: false,
            powerPreference: "high-performance"
          });
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          this.renderer.setClearColor(new THREE.Color(this.renderParam.clearColor), 1.0);
          this.renderer.setSize(this.renderParam.width, this.renderParam.height, false);
        }

        _setCamera() {
          const w = this.container ? this.container.clientWidth : window.innerWidth;
          const h = this.container ? this.container.clientHeight : 560;

          if (!this.camera) {
            this.camera = new THREE.OrthographicCamera(
              this.cameraParam.left,
              this.cameraParam.right,
              this.cameraParam.top,
              this.cameraParam.bottom,
              this.cameraParam.near,
              this.cameraParam.far
            );
          }

          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          if (this.renderer) {
            this.renderer.setSize(w, h, false);
          }
        }

        _render() {
          if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
          }
        }

        onResize() {
          if (this.isInitialized) {
            this._setCamera();
          }
        }

        onRaf() {
          this._render();
        }
      }

      class Mesh {
        constructor(stage) {
          this.stage = stage;
          this.canvas = stage.canvas;
          const w = this.canvas ? this.canvas.width : window.innerWidth;
          const h = this.canvas ? this.canvas.height : 560;

          this.uniforms = {
            resolution: { type: "v2", value: [ w, h ] },
            time: { type: "f", value: 0.0 },
            xScale: { type: "f", value: 1.0 },
            yScale: { type: "f", value: 0.5 },
            distortion: { type: "f", value: 0.050 }
          };

          this.mesh = null;
        }

        init() {
          this._setMesh();
        }

        _setMesh() {
          const position = [
            -1.0, -1.0, 0.0,
             1.0, -1.0, 0.0,
            -1.0,  1.0, 0.0,
             1.0, -1.0, 0.0,
            -1.0,  1.0, 0.0,
             1.0,  1.0, 0.0
          ];

          const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", positions);

          const material = new THREE.RawShaderMaterial({
            vertexShader: vShaderEl.textContent,
            fragmentShader: fShaderEl.textContent,
            uniforms: this.uniforms,
            side: THREE.DoubleSide
          });

          this.mesh = new THREE.Mesh(geometry, material);
          this.stage.scene.add(this.mesh);
        }

        onResize() {
          if (this.canvas && this.uniforms.resolution) {
            this.uniforms.resolution.value = [this.canvas.width, this.canvas.height];
          }
        }

        onRaf() {
          this.uniforms.time.value += 0.01;
        }
      }

      const stage = new Stage();
      stage.init();

      const mesh = new Mesh(stage);
      mesh.init();

      window.addEventListener("resize", () => {
        stage.onResize();
        mesh.onResize();
      }, { passive: true });

      let isVisible = true;
      const heroSec = canvas.closest('.hero-section');
      if (heroSec && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        obs.observe(heroSec);
      }

      const _raf = () => {
        window.requestAnimationFrame(() => {
          if (isVisible) {
            stage.onRaf();
            mesh.onRaf();
          }
          _raf();
        });
      };
      _raf();
    } else {
      // High Performance Native WebGL Runner (Zero Dependencies)
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return;

      function createShader(gl, type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }

      const prog = gl.createProgram();
      gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vShaderEl.textContent));
      gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fShaderEl.textContent));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 0,  1, -1, 0, -1,  1, 0,
         1, -1, 0, -1,  1, 0,  1,  1, 0
      ]), gl.STATIC_DRAW);

      const posAttr = gl.getAttribLocation(prog, "position");
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 0, 0);

      const resLoc = gl.getUniformLocation(prog, "resolution");
      const timeLoc = gl.getUniformLocation(prog, "time");
      const xScaleLoc = gl.getUniformLocation(prog, "xScale");
      const yScaleLoc = gl.getUniformLocation(prog, "yScale");
      const distLoc = gl.getUniformLocation(prog, "distortion");

      gl.uniform1f(xScaleLoc, 1.0);
      gl.uniform1f(yScaleLoc, 0.5);
      gl.uniform1f(distLoc, 0.050);

      let time = 0;
      let isVisible = true;

      function resize() {
        const container = canvas.closest('.hero-section') || canvas.parentElement;
        const w = container ? container.clientWidth : window.innerWidth;
        const h = container ? container.clientHeight : 560;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
      }

      resize();
      window.addEventListener("resize", resize, { passive: true });

      const heroSec = canvas.closest('.hero-section');
      if (heroSec && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        obs.observe(heroSec);
      }

      function render() {
        if (isVisible) {
          time += 0.01;
          gl.uniform1f(timeLoc, time);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        window.requestAnimationFrame(render);
      }
      window.requestAnimationFrame(render);
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
