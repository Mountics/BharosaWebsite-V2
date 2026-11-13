// Shared page behaviour for the static Bharosa site.
(function () {
  var EMAIL = 'info@bharosa.com.au';

  // Mobile / tablet menu
  var nav = document.querySelector('nav[aria-label="Main"]');
  var burger = nav && nav.querySelector('.r-burger');
  var links = nav && nav.querySelector('.r-links');
  if (burger && links) {
    links.id = links.id || 'main-menu';
    burger.setAttribute('aria-controls', links.id);
    burger.setAttribute('aria-expanded', 'false');

    // The top contact strip is hidden on phones, so repeat its key links in the menu.
    var contact = document.querySelector('.r-topbar a[href$="contact.html"]');
    if (contact) {
      var extra = document.createElement('a');
      extra.href = contact.getAttribute('href');
      extra.textContent = 'Contact Us';
      extra.className = 'r-nav-link r-mobile-extra';
      extra.style.color = '#2f3b3d';
      links.insertBefore(extra, links.querySelector('.r-btn'));
    }

    var setOpen = function (open) {
      nav.classList.toggle('r-menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('r-menu-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('r-menu-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100) setOpen(false);
    });
  }

  // Testimonial slider: arrows slide the row of testimonials sideways.
  document.querySelectorAll('.r-tst-track').forEach(function (track) {
    var rail = track.querySelector('.r-tst-rail');
    var slides = track.querySelectorAll('.r-tst-fig');
    var current = 0;
    var show = function (i, moveFocus) {
      current = (i + slides.length) % slides.length;
      if (rail) rail.style.transform = 'translateX(calc(' + (-100 * current) + '% - ' + (24 * current) + 'px))';
      slides.forEach(function (fig, n) {
        if (n === current) fig.removeAttribute('data-inactive');
        else fig.setAttribute('data-inactive', '');
      });
      // Keep keyboard focus on the same arrow in the newly shown slide.
      if (moveFocus) slides[current].querySelector('button[aria-label="' + moveFocus + '"]').focus({ preventScroll: true });
    };
    track.addEventListener('click', function (e) {
      var btn = e.target.closest('button[aria-label$="testimonial"]');
      if (!btn) return;
      var label = btn.getAttribute('aria-label');
      show(current + (label.indexOf('Next') === 0 ? 1 : -1), label);
    });
    if (slides.length < 2) {
      track.querySelectorAll('button[aria-label$="testimonial"]').forEach(function (b) {
        b.parentElement.style.display = 'none';
      });
    }
    show(0);
  });

  // Message character counters ("0 / 150")
  document.querySelectorAll('textarea[maxlength]').forEach(function (ta) {
    var label = ta.closest('label');
    var counter = label && Array.prototype.find.call(label.querySelectorAll('span'), function (s) {
      return /^\d+ \/ \d+$/.test(s.textContent.trim());
    });
    if (!counter) return;
    counter.setAttribute('aria-live', 'polite');
    var update = function () {
      counter.textContent = ta.value.length + ' / ' + ta.maxLength;
    };
    ta.addEventListener('input', update);
    update();
  });

  // Forms: no server yet, so validate and hand the message to the visitor's email app.
  function fieldLabel(el) {
    var label = el.closest('label');
    if (!label) return el.name || 'Field';
    var clone = label.cloneNode(true);
    clone.querySelectorAll('input, textarea, select, [data-hint]').forEach(function (n) { n.remove(); });
    return clone.textContent.replace(/\(required\)|\d+ \/ \d+/g, '').replace(/\s+/g, ' ').trim();
  }

  // Label for a group of radio buttons or checkboxes: the legend of its fieldset.
  function groupLabel(el) {
    var fs = el.closest('fieldset');
    var legend = fs && fs.querySelector('legend');
    var text = legend ? legend.textContent : (el.name || 'Field');
    return text.replace(/\(required\)/, '').replace(/\s+/g, ' ').trim();
  }

  // First field that stops a form being sent: a native validity problem, or an
  // "at least one" checkbox group with nothing ticked. Disabled (hidden) fields are skipped.
  function firstProblem(scope) {
    var fields = scope.querySelectorAll('input, select, textarea, fieldset[data-require-one]');
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (el.matches(':disabled')) continue;
      if (el.tagName === 'FIELDSET') {
        if (!el.querySelector('input:checked')) return { el: el.querySelector('input'), name: groupLabel(el.querySelector('input')) };
      } else if (!el.checkValidity()) {
        var isGroup = el.type === 'radio' ||
          (el.type === 'checkbox' && scope.querySelectorAll('input[name="' + el.name + '"]').length > 1);
        return { el: el, name: isGroup ? groupLabel(el) : fieldLabel(el) };
      }
    }
    return null;
  }

  // Questions that only appear for certain answers. data-show-when="name=value" shows the
  // block when that answer is picked; hidden blocks are disabled so they are not checked or sent.
  document.querySelectorAll('[data-show-when]').forEach(function (block) {
    var rule = block.dataset.showWhen.split('=');
    var form = block.closest('form');
    var update = function () {
      var on = !!form.querySelector('input[name="' + rule[0] + '"][value="' + rule[1] + '"]:checked');
      block.hidden = !on;
      block.disabled = !on;
    };
    form.addEventListener('change', update);
    update();
  });

  // Multi-step forms: one fieldset[data-step-title] at a time, checked before moving on.
  document.querySelectorAll('form[data-steps]').forEach(function (form) {
    var steps = form.querySelectorAll('[data-step-title]');
    var markers = document.querySelectorAll('[data-step-marker]');
    var current = 0;
    var go = function (i, focus) {
      current = i;
      steps.forEach(function (s, n) { s.hidden = n !== i; });
      markers.forEach(function (m, n) {
        m.dataset.state = n < i ? 'done' : (n === i ? 'current' : 'todo');
        if (n === i) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current');
      });
      form.querySelector('[data-step-back]').hidden = i === 0;
      form.querySelector('[data-step-next]').hidden = i === steps.length - 1;
      form.querySelector('[type=submit]').hidden = i !== steps.length - 1;
      var count = form.querySelector('[data-step-count]');
      if (count) count.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      if (focus) {
        steps[i].querySelector('h2').focus();
        form.scrollIntoView({ block: 'start' });
      }
    };
    // Enter on an earlier step moves forward instead of sending.
    form.beforeSend = function () {
      if (current === steps.length - 1) return true;
      form.querySelector('[data-step-next]').click();
      return false;
    };
    form.goToStepOf = function (el) {
      steps.forEach(function (s, n) { if (s.contains(el)) go(n, false); });
    };
    form.querySelector('[data-step-next]').addEventListener('click', function () {
      var status = form.querySelector('.r-form-status');
      var bad = firstProblem(steps[current]);
      if (bad) {
        status.dataset.kind = 'error';
        status.textContent = 'Please check this field: ' + bad.name + '.';
        status.hidden = false;
        bad.el.focus();
        return;
      }
      status.hidden = true;
      go(current + 1, true);
    });
    form.querySelector('[data-step-back]').addEventListener('click', function () {
      form.querySelector('.r-form-status').hidden = true;
      go(current - 1, true);
    });
    go(0, false);
  });

  // Property photo gallery: clicking a thumbnail shows it in the large frame.
  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var main = gallery.querySelector('[data-gallery-main]');
    var thumbs = gallery.querySelectorAll('[data-gallery-src]');
    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        main.src = btn.dataset.gallerySrc;
        main.alt = btn.dataset.galleryAlt;
        thumbs.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      });
    });
  });

  // SIL vacancy filter: show only the property cards that match.
  document.querySelectorAll('form[data-filter]').forEach(function (form) {
    var section = form.closest('section');
    var cards = section.querySelectorAll('article[data-beds]');
    var count = section.querySelector('.sv-count');
    var empty = section.querySelector('.sv-empty');
    var apply = function () {
      var q = form.q.value.trim().toLowerCase();
      var beds = parseInt(form.beds.value, 10) || 0;
      var baths = parseInt(form.baths.value, 10) || 0;
      var ratio = form.ratio.value;
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (!q || c.dataset.search.indexOf(q) !== -1) &&
          Number(c.dataset.beds) >= beds &&
          Number(c.dataset.baths) >= baths &&
          (!ratio || c.dataset.ratios.split(' ').indexOf(ratio) !== -1);
        c.hidden = !ok;
        c.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      count.textContent = shown + (shown === 1 ? ' property found' : ' properties found');
      empty.hidden = shown > 0;
    };
    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    form.addEventListener('reset', function () { setTimeout(apply, 0); });
  });

  document.querySelectorAll('form:not([data-filter])').forEach(function (form) {
    form.setAttribute('novalidate', '');
    var status = document.createElement('p');
    status.className = 'r-form-status';
    status.setAttribute('role', 'status');
    status.hidden = true;
    form.appendChild(status);

    var show = function (kind, text) {
      status.dataset.kind = kind;
      status.textContent = text;
      status.hidden = false;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.beforeSend && !form.beforeSend()) return;
      var bad = firstProblem(form);
      if (bad) {
        if (form.goToStepOf) form.goToStepOf(bad.el);
        show('error', 'Please check this field: ' + bad.name + '.');
        bad.el.focus();
        return;
      }

      var lines = [];
      var seenGroups = {};
      var lastStep = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.matches(':disabled') || el.tagName === 'BUTTON' || el.tagName === 'FIELDSET') return;
        var step = el.closest('[data-step-title]');
        if (step && step !== lastStep) {
          lastStep = step;
          lines.push('', '== ' + step.dataset.stepTitle + ' ==');
        }
        if (el.type === 'radio' || (el.type === 'checkbox' && form.querySelectorAll('input[name="' + el.name + '"]').length > 1)) {
          if (seenGroups[el.name]) return;
          seenGroups[el.name] = true;
          var picked = Array.prototype.filter.call(form.querySelectorAll('input[name="' + el.name + '"]'), function (c) { return c.checked; })
            .map(function (c) { return c.value; });
          lines.push(groupLabel(el) + ': ' + (picked.join(', ') || '-'));
        } else if (el.type === 'checkbox') {
          lines.push(fieldLabel(el) + ': ' + (el.checked ? 'Yes' : 'No'));
        } else {
          // Fields inside a titled sub-section (e.g. "Emergency contact") get its name as a prefix.
          var sub = el.closest('fieldset.rf-sub');
          var prefix = sub ? sub.querySelector('legend').textContent.trim() + ', ' : '';
          lines.push(prefix + fieldLabel(el) + ': ' + (el.value.trim() || '-'));
        }
      });

      var subject = 'Website enquiry: ' + document.title.split('|')[0].trim();
      form.dataset.lastMail = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n').trim());
      window.location.href = form.dataset.lastMail;
      show('ok', 'Your email app should now open with your message ready to send. If it does not, email ' +
        EMAIL + ' or call 1800 862 427.');
    });
  });
})();
