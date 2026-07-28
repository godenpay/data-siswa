document.addEventListener('DOMContentLoaded', () => {
  if (auth.isLoggedIn()) {
    const user = auth.getUser();
    auth.renderNav(user.role);
  } else {
    auth.hideNav();
  }
  router.init();
});
