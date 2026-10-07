(() => {
  function updateAccountLinks(){
    let hasSession = false;
    try{
      hasSession = Boolean(localStorage.getItem('fsn_session') || sessionStorage.getItem('fsn_session'));
    }catch(error){
      console.warn('Account status is unavailable in this browser.', error);
    }
    document.querySelectorAll('[data-account-link]').forEach(link => {
      link.textContent = hasSession ? link.dataset.signedInLabel : 'Sign in';
    });
  }
  updateAccountLinks();

  document.querySelectorAll('[data-social-profile]').forEach(link => {
    const profileUrl = window.FotoStar.data.socialProfileUrls[link.dataset.socialProfile];
    if(profileUrl){
      link.href = profileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
    }else{
      link.removeAttribute('href');
      link.setAttribute('aria-disabled','true');
      link.tabIndex = -1;
    }
  });
})();
