(() => {
  const layout = document.querySelector('.resources-layout');
  const note = document.querySelector('.recommendation');
  const connector = document.querySelector('.note-connector path');
  const titles = [...document.querySelectorAll('.resource-title[data-note]')];
  const topicLinks = [...document.querySelectorAll('.resource-topics a')];
  const narrow = window.matchMedia('(max-width: 1000px)');
  let active = null;
  let dismissTimer;
  let dismissed = null;

  function positionNote() {
    if (!active) return;
    note.classList.toggle('is-inline', narrow.matches);
    if (narrow.matches) {
      active.closest('li').append(note);
      note.style.top = '';
      connector.setAttribute('d', '');
      return;
    }
    layout.append(note);
    const box = layout.getBoundingClientRect();
    const title = active.getBoundingClientRect();
    const top = Math.max(0, title.top - box.top - 32);
    note.style.top = `${top}px`;
    const target = note.getBoundingClientRect();
    const x1 = Math.min(title.right - box.left + 10, target.left - box.left - 22);
    const y1 = title.bottom - box.top + 3;
    const x2 = target.left - box.left - 12;
    const y2 = target.top - box.top + 16;
    const middle = x1 + (x2 - x1) / 2;
    connector.setAttribute('d', `M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2} ${y2}`);
  }

  function hide() {
    clearTimeout(dismissTimer);
    if (active) {
      active.classList.remove('is-noted');
      active.closest('li').querySelector('.note-toggle')?.setAttribute('aria-expanded', 'false');
    }
    active = null;
    note.hidden = true;
    connector.setAttribute('d', '');
  }

  function show(title) {
    clearTimeout(dismissTimer);
    if (dismissed === title) return;
    if (active !== title) hide();
    active = title;
    note.querySelector('p').textContent = title.dataset.note;
    note.hidden = false;
    title.classList.add('is-noted');
    title.closest('li').querySelector('.note-toggle')?.setAttribute('aria-expanded', 'true');
    positionNote();
  }

  const later = () => { dismissTimer = setTimeout(hide, 180); };
  for (const title of titles) {
    title.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') show(title); });
    title.addEventListener('pointerleave', () => { dismissed = null; if (document.activeElement !== title) later(); });
    title.addEventListener('focus', () => show(title));
    title.addEventListener('blur', () => { dismissed = null; later(); });
    title.closest('li').querySelector('.note-toggle')?.addEventListener('click', () => {
      dismissed = null;
      active === title ? hide() : show(title);
    });
  }
  note.addEventListener('pointerenter', () => clearTimeout(dismissTimer));
  note.addEventListener('pointerleave', () => { if (document.activeElement !== active) later(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { dismissed = active; hide(); }
  });
  document.addEventListener('pointerdown', event => {
    if (active && !active.closest('li').contains(event.target) && !note.contains(event.target)) hide();
  });
  window.addEventListener('resize', positionNote);
  const sections = [...document.querySelectorAll('.resource-section')];
  let anchorSelection = null;
  let scrollFrame = null;
  function selectTopic(selected) {
    for (const link of topicLinks) {
      if (link.hash === selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function updateTopic() {
    scrollFrame = null;
    if (anchorSelection) return selectTopic(anchorSelection);
    const atBottom = window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const current = atBottom ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= 100).at(-1) || sections[0];
    selectTopic(`#${current.id}`);
  }
  function queueTopicUpdate() {
    if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateTopic);
  }
  function followScroll() {
    anchorSelection = null;
    queueTopicUpdate();
  }
  function followAnchor() {
    anchorSelection = topicLinks.some(link => link.hash === location.hash) ? location.hash : null;
    updateTopic();
  }
  for (const link of topicLinks) {
    link.addEventListener('click', () => {
      anchorSelection = link.hash;
      selectTopic(anchorSelection);
    });
  }
  window.addEventListener('scroll', queueTopicUpdate, { passive: true });
  window.addEventListener('wheel', followScroll, { passive: true });
  window.addEventListener('touchmove', followScroll, { passive: true });
  // Scrollbar dragging also returns control to the section tracking.
  window.addEventListener('pointerdown', event => {
    if (!event.target.closest?.('.resource-topics')) anchorSelection = null;
  });
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) followScroll();
  });
  window.addEventListener('hashchange', followAnchor);
  window.addEventListener('resize', queueTopicUpdate);
  window.addEventListener('pageshow', followAnchor);
  updateTopic();
})();
