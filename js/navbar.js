export function navbarEffects() {
  const navbar = document.getElementById('navb');
  let lastScrollPosition = 0;
  let isDesktop = window.innerWidth >= 1326;

  function handleScroll() {
    const currentScrollPosition = window.scrollY;

    if (currentScrollPosition > lastScrollPosition) {
      navbar.classList.add('active');
    } else {
      navbar.classList.remove('active');
    }

    lastScrollPosition = currentScrollPosition;
  }

  function checkViewportWidth() {
    isDesktop = window.innerWidth >= 1326;

    if (isDesktop) {
      window.addEventListener('scroll', handleScroll);
    } else {
      window.removeEventListener('scroll', handleScroll);
      navbar.classList.remove('active');
    }
  }
  checkViewportWidth();
  window.addEventListener('resize', checkViewportWidth);
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

  document.querySelectorAll('.navbar-nav a').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const elementRect = targetElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.scrollY;
        const elementHeight = elementRect.height;
        const viewportHeight = window.innerHeight;
        const offsetPosition = elementTop - ((viewportHeight - elementHeight) / 2) - (navHeight / 2);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (window.innerWidth < 1326) {
          navbar.classList.remove('active');
        }
      }
    });
  });
}

export function hamburnavbarEffectsMobile() {
  const navbar = document.getElementById('navb');
  const hamburguerBtn = document.getElementById('hamburguer');
  let lastScrollPosition = 0;
  let isDesktop = window.innerWidth >= 1326;

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

  function checkViewportWidth() {
    isDesktop = window.innerWidth >= 1326;

    if (isDesktop) {
      window.addEventListener('scroll', handleScroll);
    } else {
      window.removeEventListener('scroll', handleScroll);
      navbar.classList.remove('active');
      hamburguerBtn.classList.remove('hide');
      hamburguerBtn.classList.add('show');
    }
  }

  checkViewportWidth();
  window.addEventListener('resize', checkViewportWidth);
}