(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const savedTheme = localStorage.getItem('kemisola-theme');
  const preferredDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (preferredDark ? 'dark' : 'light');

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem('kemisola-theme', theme);
    themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    metaTheme?.setAttribute('content', theme === 'dark' ? '#0d0e0d' : '#f6f3ea');
  }

  setTheme(initialTheme);
  themeToggle?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    menuToggle.setAttribute('aria-expanded', String(willOpen));
  });

  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (!menu?.hidden && !menu.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  function scrollPageToTop() {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduceMotion ? 'auto' : 'smooth';
    const scroller = document.scrollingElement || document.documentElement;

    try {
      scroller.scrollTo({ top: 0, left: 0, behavior });
      window.scrollTo({ top: 0, left: 0, behavior });
    } catch (_) {
      scroller.scrollTop = 0;
      window.scrollTo(0, 0);
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  document.querySelectorAll('[data-back-to-top], .back-to-top, .brand[href="#page-top"]').forEach(control => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      scrollPageToTop();
      if (window.location.hash === '#page-top') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });
  });

  const floater = document.querySelector('[data-contact-floater]');
  const floaterHandle = floater?.querySelector('.floater-handle');
  const floaterToggle = floater?.querySelector('[data-floater-toggle]');

  if (floater && floaterHandle) {
    let drag = null;

    function setFloaterExpanded(expanded) {
      floater.dataset.expanded = String(expanded);
      floaterToggle?.setAttribute('aria-expanded', String(expanded));
      floaterToggle?.setAttribute('aria-label', expanded ? 'Close quick contact' : 'Open quick contact');
      floaterToggle?.setAttribute('title', expanded ? 'Close quick contact' : 'Open quick contact');
      try { localStorage.setItem('kemisola-contact-floater-expanded', String(expanded)); } catch (_) {}
    }

    const savedExpanded = localStorage.getItem('kemisola-contact-floater-expanded') === 'true';
    setFloaterExpanded(savedExpanded);
    floaterToggle?.addEventListener('click', () => {
      setFloaterExpanded(floater.dataset.expanded !== 'true');
    });

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    function applySavedPosition() {
      try {
        const saved = JSON.parse(localStorage.getItem('kemisola-contact-floater-position') || 'null');
        if (!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) return;
        const rect = floater.getBoundingClientRect();
        floater.style.left = `${clamp(saved.left, 8, window.innerWidth - rect.width - 8)}px`;
        floater.style.top = `${clamp(saved.top, 8, window.innerHeight - rect.height - 8)}px`;
        floater.style.right = 'auto';
        floater.style.bottom = 'auto';
      } catch (_) {}
    }

    floaterHandle.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const rect = floater.getBoundingClientRect();
      drag = { pointerId: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
      floaterHandle.setPointerCapture?.(event.pointerId);
      floater.style.left = `${rect.left}px`;
      floater.style.top = `${rect.top}px`;
      floater.style.right = 'auto';
      floater.style.bottom = 'auto';
      event.preventDefault();
    });

    floaterHandle.addEventListener('pointermove', (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const rect = floater.getBoundingClientRect();
      const left = clamp(event.clientX - drag.dx, 8, window.innerWidth - rect.width - 8);
      const top = clamp(event.clientY - drag.dy, 8, window.innerHeight - rect.height - 8);
      floater.style.left = `${left}px`;
      floater.style.top = `${top}px`;
    });

    const endDrag = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag = null;
      const rect = floater.getBoundingClientRect();
      try {
        localStorage.setItem('kemisola-contact-floater-position', JSON.stringify({ left: rect.left, top: rect.top }));
      } catch (_) {}
    };

    floaterHandle.addEventListener('pointerup', endDrag);
    floaterHandle.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', () => {
      const rect = floater.getBoundingClientRect();
      const left = clamp(rect.left, 8, window.innerWidth - rect.width - 8);
      const top = clamp(rect.top, 8, window.innerHeight - rect.height - 8);
      if (floater.style.left) {
        floater.style.left = `${left}px`;
        floater.style.top = `${top}px`;
      }
    });

    applySavedPosition();
  }

  /* Targeted update: selected-impact wording */
  const impactIntro = document.querySelector('#impact .section-heading p');
  if (impactIntro) {
    impactIntro.textContent = 'I have never walked into a finished CRM department and simply carried on from where someone else stopped. Each time, I had to start with the questions, the gaps and the customer problems in front of me. I learned by building, testing, fixing what did not work and turning those lessons into a CRM function the wider business could depend on. This is now the fourth time I am building a CRM function from the ground up, and each one has taught me something different.';
  }

  /* Targeted update: clickable 01 / 02 / 03 CRM architecture boxes */
  const architectureCore = document.querySelector('.architecture-core');
  const architectureSteps = architectureCore ? Array.from(architectureCore.children).slice(0, 3) : [];

  if (architectureCore && architectureSteps.length) {
    const interactionStyles = document.createElement('style');
    interactionStyles.id = 'kemisola-architecture-click-styles';
    interactionStyles.textContent = `
      .architecture-core > div {
        transition: background .22s ease, color .22s ease, border-color .22s ease, box-shadow .22s ease, transform .22s ease;
      }

      .architecture-core > div[role="button"] {
        cursor: pointer;
        outline: none;
      }

      .architecture-core > div[role="button"]:focus-visible {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 42%, transparent);
      }

      .architecture-core.architecture-interactive .core-focus {
        background: var(--surface);
        color: var(--text);
        border-color: var(--line);
        box-shadow: none;
      }

      .architecture-core.architecture-interactive .core-focus small {
        color: var(--accent-strong);
      }

      .architecture-core.architecture-interactive .core-focus span {
        color: var(--muted);
      }

      .architecture-core.architecture-interactive > div.architecture-step-active {
        background: var(--accent);
        color: #111;
        border-color: var(--accent);
        box-shadow: 0 15px 34px color-mix(in srgb, var(--accent) 22%, transparent);
        transform: translateY(-2px);
      }

      .architecture-core.architecture-interactive > div.architecture-step-active small,
      .architecture-core.architecture-interactive > div.architecture-step-active strong,
      .architecture-core.architecture-interactive > div.architecture-step-active span {
        color: #111;
      }

      .architecture-core.architecture-interactive > div.architecture-step-active strong {
        font-weight: 950;
      }

      .architecture-core.architecture-interactive > div.architecture-step-active span {
        font-weight: 700;
      }
    `;
    document.head.appendChild(interactionStyles);

    const activateArchitectureStep = (selectedStep) => {
      architectureCore.classList.add('architecture-interactive');
      architectureSteps.forEach((step) => {
        const active = step === selectedStep;
        step.classList.toggle('architecture-step-active', active);
        step.setAttribute('aria-pressed', String(active));
      });
    };

    architectureSteps.forEach((step, index) => {
      step.setAttribute('role', 'button');
      step.setAttribute('tabindex', '0');
      step.setAttribute('aria-pressed', 'false');
      step.setAttribute('aria-label', `CRM architecture step ${index + 1}: ${step.querySelector('strong')?.textContent || ''}`);

      step.addEventListener('click', () => activateArchitectureStep(step));
      step.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateArchitectureStep(step);
        }
      });
    });
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    : null;

  document.querySelectorAll('.reveal').forEach(el => {
    if (observer) observer.observe(el);
    else el.classList.add('is-visible');
  });
})();
