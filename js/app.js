document.addEventListener('DOMContentLoaded', () => {
  if (auth.isLoggedIn()) {
    const user = auth.getUser();
    auth.renderUI(user.role);
    auth.highlightNav(router.current || 'dashboard');
  } else {
    auth.hideAll();
  }
  router.init();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error || e.message);
});
