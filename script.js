(() => {
  const body=document.body;
  const menu=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav-links');


  // Restored opening ident from the original AgentBlazer experience.
  // It is isolated from the rest of the site's interactions so other glitch/transition
  // effects remain disabled.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introSeen = window.sessionStorage.getItem('agentblazer-intro-seen') === '1';
  const navigation = performance.getEntriesByType('navigation')[0];
  const isHardRefresh = navigation && navigation.type === 'reload';
  const shouldShowIntro = !introSeen || isHardRefresh;

  if (!prefersReducedMotion && shouldShowIntro && document.body) {
    window.sessionStorage.setItem('agentblazer-intro-seen','1');
    const intro = document.createElement('div');
    intro.className = 'intro-screen';
    intro.setAttribute('role','dialog');
    intro.setAttribute('aria-label','AgentBlazer Club opening ident');
    intro.innerHTML = `
      <div class="intro-grid" aria-hidden="true"></div>
      <div class="intro-vignette" aria-hidden="true"></div>
      <div class="intro-reel" aria-hidden="true">
        <div class="reel-track reel-track-a">
          <img src="assets/images/inauguration-1.png"><img src="assets/images/workshop-1.jpg">
          <img src="assets/images/promptops-1.jpg"><img src="assets/images/inauguration-2.png">
        </div>
        <div class="reel-track reel-track-b">
          <img src="assets/images/workshop-2.jpg"><img src="assets/images/promptops-2.jpg">
          <img src="assets/images/inauguration-1.png"><img src="assets/images/workshop-1.jpg">
        </div>
      </div>
      <div class="intro-crosshair" aria-hidden="true"><i></i><i></i></div>
      <div class="intro-lockup">
        <div class="intro-overline"><span>EST. 2025</span><span>ST JOSEPH ENGINEERING COLLEGE</span><span>CSE / 001</span></div>
        <div class="intro-mark"><img src="assets/images/agentblazer-logo.jpg" alt="AgentBlazer Club"></div>
        <div class="intro-kicker">A STUDENT INNOVATION MOVEMENT</div>
        <div class="intro-title"><b>AGENT</b><span>BLAZER</span></div>
        <div class="intro-status"><span></span> THE FLOOR IS OPEN / 2025—26</div>
      </div>
      <button class="intro-skip" type="button">Enter the club ↗</button>`;
    document.body.prepend(intro);
    document.body.classList.add('intro-active');

    let closed=false;
    const closeIntro=()=>{
      if(closed)return;
      closed=true;
      intro.classList.add('is-glitching');
      window.setTimeout(()=>intro.classList.add('is-leaving'),520);
      window.setTimeout(()=>{
        intro.remove();
        document.body.classList.remove('intro-active');
      },1250);
    };
    intro.querySelector('.intro-skip').addEventListener('click',closeIntro);
    intro.addEventListener('click',e=>{if(e.target===intro)closeIntro()});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'||e.key==='Enter')closeIntro();
    });
    window.setTimeout(closeIntro,3200);
  }

  // Mobile navigation — intentionally simple and reliable.
  if(menu&&nav){
    menu.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
  }

  // Scroll progress + compact header state.
  const progress=document.createElement('div');
  progress.className='scroll-progress';
  progress.setAttribute('aria-hidden','true');
  body.appendChild(progress);
  const updateScroll=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=`${max>0?(window.scrollY/max)*100:0}%`;
    document.querySelector('.site-header')?.classList.toggle('scrolled',window.scrollY>12);
  };
  window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();

  // Calm reveal system. No loaders, fake glitches, route blockers or forced transitions.
  const targets=document.querySelectorAll('.section,.page-hero,.card,.gallery figure,.hero-visual,.hero-actions,.hero-stats,.section-head,.stat-band,.marquee');
  targets.forEach((el,i)=>{el.classList.add('reveal');if(el.matches('.card,.gallery figure,.stat'))el.style.setProperty('--reveal-delay',`${Math.min((i%6)*45,225)}ms`)});
  if(!prefersReducedMotion&&'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    targets.forEach(el=>observer.observe(el));
  }else targets.forEach(el=>el.classList.add('is-visible'));

  // Event filters.
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const value=btn.dataset.filter;
    document.querySelectorAll('.event[data-category]').forEach(card=>card.classList.toggle('filter-hidden',value!=='all'&&card.dataset.category!==value));
  }));


  // Club logo viewer: both the hero logo and the dedicated identity block open the same lightbox.
  const logoModal=document.querySelector('.logo-modal');
  const logoModalImg=logoModal?.querySelector('img');
  const openLogo=()=>{
    if(!logoModal||!logoModalImg)return;
    logoModal.classList.add('show');
    logoModal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  };
  document.querySelectorAll('.logo-display').forEach(el=>el.addEventListener('click',()=>{
    if(!el.classList.contains('is-revealed') && !el.classList.contains('is-revealing')){
      // Add a short physical "signal lock" shake as the hidden logo is revealed.
      el.classList.add('is-revealing');
      el.setAttribute('aria-expanded','true');
      window.setTimeout(()=>{
        el.classList.remove('is-revealing');
        el.classList.add('is-revealed');
        openLogo();
      }, 680);
    }
  }));

  // Discourage casual copying of page text/assets. Form fields remain selectable/editable.
  const editableTarget = target => target.closest('input, textarea, select, [contenteditable="true"]');
  document.addEventListener('copy', e => {
    if(!editableTarget(e.target)) e.preventDefault();
  });
  document.addEventListener('cut', e => {
    if(!editableTarget(e.target)) e.preventDefault();
  });
  document.addEventListener('contextmenu', e => {
    if(!editableTarget(e.target)) e.preventDefault();
  });
  document.addEventListener('dragstart', e => {
    if(!editableTarget(e.target)) e.preventDefault();
  });
  document.addEventListener('keydown', e => {
    if(editableTarget(e.target)) return;
    if((e.ctrlKey||e.metaKey) && ['c','x','u'].includes(e.key.toLowerCase())){
      e.preventDefault();
    }
  });
  const closeLogo=()=>{
    logoModal?.classList.remove('show');
    logoModal?.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  };
  logoModal?.querySelector('[data-close-modal]')?.addEventListener('click',closeLogo);
  logoModal?.addEventListener('click',e=>{if(e.target===logoModal)closeLogo()});

  // Gallery lightbox.
  const modal=document.querySelector('.modal');const modalImg=modal?.querySelector('img');
  const closeModal=()=>{modal?.classList.remove('show');document.body.classList.remove('modal-open')};
  document.querySelectorAll('[data-lightbox]').forEach(img=>img.addEventListener('click',()=>{
    if(!modal||!modalImg)return;modalImg.src=img.dataset.lightbox;modalImg.alt=img.alt;modal.classList.add('show');document.body.classList.add('modal-open');
  }));
  document.querySelector('[data-close-modal]')?.addEventListener('click',closeModal);
  modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

  // Contact form feedback without pretending a backend exists.
  const form=document.querySelector('.form');
  if(form){
    form.addEventListener('submit',e=>{
      e.preventDefault();
      let note=form.querySelector('.form-success');
      if(!note){note=document.createElement('div');note.className='notice form-success';form.appendChild(note)}
      note.textContent='Signal received on this demo build. Connect the form to your club email or backend before deployment.';
      form.reset();
    });
  }

  document.querySelectorAll('.year').forEach(e=>e.textContent=new Date().getFullYear());
})();
