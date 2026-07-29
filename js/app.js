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

/* Close sidebar on Escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});
