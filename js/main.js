(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  var indicator = document.querySelector('.nav-indicator');
  var navLinksEl = document.querySelector('.nav-links');
  if (indicator && navLinksEl) {
    var navItems = navLinksEl.querySelectorAll('a:not(.nav-cta)');
    var current = navLinksEl.querySelector('a[aria-current="page"]');
    function moveIndicatorTo(el) {
      if (!el) { indicator.style.opacity = '0'; return; }
      indicator.style.left = el.offsetLeft + 'px';
      indicator.style.width = el.offsetWidth + 'px';
      indicator.style.opacity = '1';
    }
    navItems.forEach(function (a) {
      a.addEventListener('mouseenter', function () { moveIndicatorTo(a); });
    });
    navLinksEl.addEventListener('mouseleave', function () { moveIndicatorTo(current); });
    window.addEventListener('resize', function () { moveIndicatorTo(current); });
    window.addEventListener('load', function () { moveIndicatorTo(current); });
    moveIndicatorTo(current);
  }

  var revealTargets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
