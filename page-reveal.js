(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Animate content only; the shared navigation is visible immediately.
  const items = document.querySelectorAll(
    '.blog-timeline h2, .blog-timeline li, .showcase-project, ' +
    '.resource-topics, .resource-section h2, .resource-item'
  );
  items.forEach((item, index) => {
    item.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      {
        duration: 420,
        delay: Math.min(index * 55, 550),
        easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)',
        fill: 'backwards'
      }
    );
  });
})();
