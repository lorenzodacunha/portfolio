const DESKTOP_MEDIA_QUERY = '(min-width: 1326px)';

export function navbarEffects() {
  const navbar = document.getElementById('navb');
  if (!navbar) return;
  let lastScrollPosition = 0;
  let scrollScheduled = false;
  let isListening = false;

  function handleScroll() {
    const currentScrollPosition = window.scrollY;

    if (currentScrollPosition > lastScrollPosition) {
      navbar.classList.add('active');
    } else {
      navbar.classList.remove('active');
    }

    lastScrollPosition = currentScrollPosition;
  }

  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      handleScroll();
    });
  }

  function toggleScrollListener(mediaQuery) {
    if (mediaQuery.matches && !isListening) {
      window.addEventListener('scroll', onScroll, { passive: true });
      isListening = true;
    } else if (!mediaQuery.matches && isListening) {
      window.removeEventListener('scroll', onScroll);
      navbar.classList.remove('active');
      isListening = false;
    }
  }

  const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  toggleScrollListener(desktopQuery);
  desktopQuery.addEventListener('change', toggleScrollListener);
}

export function hamburguerMenu() {
  document.getElementById('hamburguer').addEventListener('click', function () {
    const nav = document.getElementById('navb');
    const isactive = nav.classList.toggle('active');

    if (isactive)
      document.addEventListener('click', closeNavOnClickOutside);
    else
      document.removeEventListener('click', closeNavOnClickOutside);
  });

  function closeNavOnClickOutside(event) {
    const sidebar = document.getElementById('navb');
    const menuBtn = document.getElementById('hamburguer');
    const clickInsideSidebar = sidebar.contains(event.target);
    const clickOnMenuBtn = menuBtn.contains(event.target);

    if (!clickInsideSidebar && !clickOnMenuBtn) {
      sidebar.classList.remove('active');
      document.removeEventListener('click', closeNavOnClickOutside);
    }
  }
}


export function smoothScrollWithOffset() {
  const navbar = document.getElementById('navb');
  const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  let navHeight = 0;

  const measureNavHeight = () => {
    if (!navbar) return;
    navHeight = navbar.offsetHeight;
  };

  if (navbar) {
    requestAnimationFrame(measureNavHeight);
    if (typeof ResizeObserver !== 'undefined') {
      const navObserver = new ResizeObserver(entries => {
        if (!entries.length) return;
        navHeight = entries[0].contentRect.height;
      });
      navObserver.observe(navbar);
    } else {
      const scheduleMeasure = () => requestAnimationFrame(measureNavHeight);
      scheduleMeasure();
      window.addEventListener('resize', scheduleMeasure);
    }
  } else {
    requestAnimationFrame(measureNavHeight);
  }

  document.querySelectorAll('.navbar-nav a').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        const elementRect = targetElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.scrollY;
        const elementHeight = elementRect.height;
        const viewportHeight = window.innerHeight;
        const offsetPosition = elementTop - ((viewportHeight - elementHeight) / 2) - (navHeight / 2);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (!desktopQuery.matches) {
          navbar?.classList.remove('active');
        }
      }
    });
  });
}

export function hamburnavbarEffectsMobile() {
  const navbar = document.getElementById('navb');
  const hamburguerBtn = document.getElementById('hamburguer');
  if (!navbar || !hamburguerBtn) return;

  let lastScrollPosition = 0;
  let scrollScheduled = false;
  let isListening = false;

  function handleScroll() {
    const currentScrollPosition = window.scrollY;

    if (currentScrollPosition > lastScrollPosition) {
      navbar.classList.add('active');
      hamburguerBtn.classList.remove('show');
      hamburguerBtn.classList.add('hide');
    } else {
      navbar.classList.remove('active');
      hamburguerBtn.classList.remove('hide');
      hamburguerBtn.classList.add('show');
    }

    lastScrollPosition = currentScrollPosition;
  }

  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      handleScroll();
    });
  }

  function toggleScroll(mediaQuery) {
    if (mediaQuery.matches && !isListening) {
      window.addEventListener('scroll', onScroll, { passive: true });
      isListening = true;
    } else if (!mediaQuery.matches && isListening) {
      window.removeEventListener('scroll', onScroll);
      navbar.classList.remove('active');
      hamburguerBtn.classList.remove('hide');
      hamburguerBtn.classList.add('show');
      isListening = false;
    }
  }

  const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  toggleScroll(desktopQuery);
  desktopQuery.addEventListener('change', toggleScroll);
}
