/* ═══════════════════════════════════════════════════════════════
   JOURNALISM LAB — INTERACTIVE APPLICATION SCRIPT
   - Navbar & Responsive Mobile Drawer
   - Interactive 5-Question Career Path Quiz Engine
   - CMMD Career Path Disclaimer
   - Alphanumeric Visual Captcha Security Verification Modal
   - Physics-based Confetti Popper Animation
   - Application Success Modal & Feedback
   - IntersectionObserver Fade-ins
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Navbar scroll effect ─────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // ─── Mobile menu drawer ───────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      const isOpen = mobileMenu.classList.contains('open');
      if (spans.length === 3) {
        spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
        spans[1].style.opacity   = isOpen ? '0' : '1';
        spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
      }
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        if (spans.length === 3) {
          spans[0].style.transform = '';
          spans[1].style.opacity   = '';
          spans[2].style.transform = '';
        }
      });
    });
  }

  // ─── Quiz Engine ──────────────────────────────────────────────
  const QUESTIONS = [
    {
      q: "When you witness something newsworthy, what's your first instinct?",
      options: [
        { text: "Grab a mic and describe it out loud",      score: "anchor"     },
        { text: "Reach for your camera immediately",        score: "photo"      },
        { text: "Start mentally drafting the headline",     score: "copy"       },
        { text: "Think about how to frame it on Instagram", score: "social"     },
      ]
    },
    {
      q: "Which of these activities sounds most exciting to you?",
      options: [
        { text: "Being live on set, reporting breaking news", score: "anchor"  },
        { text: "Editing a cinematic short video",             score: "video"   },
        { text: "Designing a powerful ad campaign",            score: "ad"      },
        { text: "Writing a thread that sparks national debate", score: "copy"   },
      ]
    },
    {
      q: "What's your natural creative superpower?",
      options: [
        { text: "Eye for composition — I notice light and angles", score: "photo" },
        { text: "My words flow — people feel what I write",        score: "copy"  },
        { text: "I make things look and feel amazing visually",    score: "video" },
        { text: "I understand what hooks audiences immediately",   score: "reels" },
      ]
    },
    {
      q: "Which platform do you consume the most content on?",
      options: [
        { text: "YouTube — long-form video, documentaries",       score: "video" },
        { text: "Instagram Reels & TikTok short video formats",    score: "reels" },
        { text: "News publications and investigative articles",    score: "web"   },
        { text: "LinkedIn and Twitter for industry conversations", score: "ad"    },
      ]
    },
    {
      q: "What's your dream outcome from a journalism career?",
      options: [
        { text: "A face people trust — news anchor on broadcast TV",    score: "anchor"     },
        { text: "Building an audience of millions online as a creator", score: "influencer" },
        { text: "Behind the lens — photographing history in the making",score: "photo"      },
        { text: "Running full-scale digital storytelling for brands",   score: "social"     },
      ]
    }
  ];

  // Font Awesome icons only — NO emojis!
  const RESULTS = {
    anchor: {
      icon: '<i class="fa-solid fa-microphone-lines"></i>',
      title: "You're a Natural Anchor",
      desc: "Your instinct to speak, command the room, and present makes you built for on-screen journalism. Anchoring, live reporting, and broadcast media are where you will shine."
    },
    video: {
      icon: '<i class="fa-solid fa-clapperboard"></i>',
      title: "You're a Video Storyteller",
      desc: "You think in frames, cuts, and emotional arcs. Video journalism, documentary filmmaking, and cinematic storytelling are your calling. Your edits tell the story."
    },
    photo: {
      icon: '<i class="fa-solid fa-camera"></i>',
      title: "You're a Visual Journalist",
      desc: "You see the world through a lens. Photojournalism, editorial photography, and visual storytelling are where your eye for truth, human expression, and composition come alive."
    },
    copy: {
      icon: '<i class="fa-solid fa-pen-nib"></i>',
      title: "You're a Copywriting Journalist",
      desc: "Words are your weapon. Headlines, investigative features, broadcast scripts, and editorial arguments — you craft language that makes people stop, feel, and take action."
    },
    ad: {
      icon: '<i class="fa-solid fa-bullhorn"></i>',
      title: "You're an Ad & Campaign Strategist",
      desc: "You understand persuasion, narrative positioning, and human psychology. Commercial storytelling, media strategy, and integrated campaigns are your natural arena."
    },
    social: {
      icon: '<i class="fa-solid fa-mobile-screen"></i>',
      title: "You're a Social Media Journalist",
      desc: "You speak modern digital platforms fluently. From real-time news distribution to community engagement, social journalism and digital distribution are your superpowers."
    },
    reels: {
      icon: '<i class="fa-solid fa-video"></i>',
      title: "You're a Reels & Content Creator",
      desc: "Short-form, punchy, and captivating — your instincts for pacing and hook retention are razor-sharp. You know how to stop the scroll in 3 seconds flat."
    },
    influencer: {
      icon: '<i class="fa-solid fa-star"></i>',
      title: "You're an Influencer Journalist",
      desc: "You possess a magnetic on-camera presence. Building a personal media brand, cultivating a loyal audience, and delivering authentic journalism at scale is your path."
    },
    web: {
      icon: '<i class="fa-solid fa-globe"></i>',
      title: "You're a Web Journalist",
      desc: "Digital-first, SEO-savvy, and research-focused — you understand how journalism thrives on the open internet. Digital publishing, newsletters, and interactive reports are your domain."
    }
  };

  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    let currentQ = 0;
    let scores = {};
    let pendingScore = null;
    let pendingBtn = null;
    let disclaimerAgreed = false;

    const questionWrap         = document.getElementById('questionWrap');
    const quizResult           = document.getElementById('quizResult');
    const progressFill         = document.getElementById('progressFill');
    const progressLabel        = document.getElementById('progressLabel');
    const retakeBtn            = document.getElementById('retakeBtn');
    const quizDisclaimerModal  = document.getElementById('quizDisclaimerModal');
    const quizDisclaimerOkBtn  = document.getElementById('quizDisclaimerOkBtn');
    const quizDisclaimerCloseBtn = document.getElementById('quizDisclaimerCloseBtn');

    function openQuizDisclaimer(score, btn) {
      pendingScore = score;
      pendingBtn = btn;
      if (quizDisclaimerModal) {
        quizDisclaimerModal.classList.add('active');
        quizDisclaimerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeQuizDisclaimer(proceed = false) {
      if (quizDisclaimerModal) {
        quizDisclaimerModal.classList.remove('active');
        quizDisclaimerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      if (proceed && pendingScore !== null) {
        disclaimerAgreed = true;
        scores[pendingScore] = (scores[pendingScore] || 0) + 1;
        currentQ++;
        if (currentQ < QUESTIONS.length) {
          renderQuestion(currentQ);
        } else {
          showResult();
        }
      } else {
        // Dismissed without clicking OK: reset selection so user can reselect
        if (pendingBtn) {
          pendingBtn.classList.remove('selected');
        }
      }
      pendingScore = null;
      pendingBtn = null;
    }

    if (quizDisclaimerOkBtn) {
      quizDisclaimerOkBtn.addEventListener('click', () => {
        closeQuizDisclaimer(true);
      });
    }

    if (quizDisclaimerCloseBtn) {
      quizDisclaimerCloseBtn.addEventListener('click', () => {
        closeQuizDisclaimer(false);
      });
    }

    if (quizDisclaimerModal) {
      quizDisclaimerModal.addEventListener('click', (e) => {
        if (e.target === quizDisclaimerModal) {
          closeQuizDisclaimer(false);
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && quizDisclaimerModal && quizDisclaimerModal.classList.contains('active')) {
        closeQuizDisclaimer(false);
      }
    });

    function renderQuestion(index) {
      const data = QUESTIONS[index];
      const qTitle = document.getElementById('quizQuestion');
      const optContainer = document.getElementById('quizOptions');

      if (qTitle) qTitle.textContent = data.q;
      if (optContainer) {
        optContainer.innerHTML = '';
        data.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'quiz-opt';
          btn.innerHTML = `<span>${opt.text}</span> <i class="fa-solid fa-arrow-right" style="opacity:0.4; font-size:0.8rem"></i>`;
          btn.dataset.score = opt.score;
          btn.addEventListener('click', () => selectAnswer(opt.score, btn));
          optContainer.appendChild(btn);
        });
      }

      const pct = ((index + 1) / QUESTIONS.length) * 100;
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressLabel) progressLabel.textContent = `${index + 1} / ${QUESTIONS.length}`;
    }

    function selectAnswer(score, btn) {
      // First question check: clicking any answer triggers Disclaimer Popup
      if (currentQ === 0 && !disclaimerAgreed) {
        const optContainer = document.getElementById('quizOptions');
        if (optContainer) {
          optContainer.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
        }
        btn.classList.add('selected');

        setTimeout(() => {
          openQuizDisclaimer(score, btn);
        }, 120);
        return;
      }

      btn.classList.add('selected');
      scores[score] = (scores[score] || 0) + 1;

      setTimeout(() => {
        currentQ++;
        if (currentQ < QUESTIONS.length) {
          renderQuestion(currentQ);
        } else {
          showResult();
        }
      }, 260);
    }

    function showResult() {
      if (questionWrap) questionWrap.style.display = 'none';
      if (quizResult) quizResult.style.display = 'block';
      if (progressFill) progressFill.style.width = '100%';
      if (progressLabel) progressLabel.innerHTML = '<i class="fa-solid fa-check"></i> Completed';

      // Find top score
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const topKey = sorted.length > 0 ? sorted[0][0] : 'copy';
      const res = RESULTS[topKey] || RESULTS.copy;

      const resIcon = document.getElementById('resultIcon');
      const resTitle = document.getElementById('resultTitle');
      const resDesc = document.getElementById('resultDesc');

      if (resIcon) resIcon.innerHTML = res.icon;
      if (resTitle) resTitle.textContent = res.title;
      if (resDesc) resDesc.textContent = res.desc;

      // Scroll to quiz card so user sees result cleanly
      if (quizCard) {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        currentQ = 0;
        scores = {};
        disclaimerAgreed = false;
        pendingScore = null;
        pendingBtn = null;
        if (quizResult) quizResult.style.display = 'none';
        if (questionWrap) questionWrap.style.display = 'block';
        renderQuestion(0);
      });
    }

    // Initialize first question
    renderQuestion(0);
  }

  // ─── Captcha Engine & Form Submission ─────────────────────────
  let currentCaptcha = '';
  const captchaModal     = document.getElementById('captchaModal');
  const captchaCloseBtn  = document.getElementById('captchaCloseBtn');
  const captchaCanvas    = document.getElementById('captchaCanvas');
  const captchaRefreshBtn= document.getElementById('captchaRefreshBtn');
  const captchaInput     = document.getElementById('captchaInput');
  const captchaVerifyBtn = document.getElementById('captchaVerifyBtn');
  const captchaError     = document.getElementById('captchaError');

  const successModal     = document.getElementById('successModal');
  const successCloseBtn  = document.getElementById('successCloseBtn');
  const successDismissBtn= document.getElementById('successDismissBtn');
  const successTitle     = document.getElementById('successTitle');

  let pendingFormData = null;
  let activeFormElement = null;

  function generateCaptchaCode(length = 5) {
    // Alphanumeric characters excluding confusing letters (O, 0, I, 1)
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function drawCaptcha() {
    if (!captchaCanvas) return;
    const ctx = captchaCanvas.getContext('2d');
    const width = captchaCanvas.width;
    const height = captchaCanvas.height;

    currentCaptcha = generateCaptchaCode(5);

    // Light mode clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle random interference lines
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.12})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random(), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.12 + Math.random() * 0.15})`;
      ctx.fill();
    }

    // Render characters
    const charSpacing = width / (currentCaptcha.length + 1);
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 28px "DM Mono", ui-monospace, monospace';

    const colors = ['#09090b', '#1e3a8a', '#b91c1c', '#047857', '#6d28d9', '#18181b'];

    for (let i = 0; i < currentCaptcha.length; i++) {
      const char = currentCaptcha[i];
      const x = charSpacing * (i + 0.9);
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 32 - 16) * Math.PI / 180;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(char, -10, 0);
      ctx.restore();
    }

    if (captchaInput) {
      captchaInput.value = '';
      captchaInput.focus();
    }
    if (captchaError) {
      captchaError.style.display = 'none';
    }
  }

  function openCaptchaModal(formElement, formData) {
    activeFormElement = formElement;
    pendingFormData = formData;
    if (captchaModal) {
      captchaModal.classList.add('active');
      captchaModal.setAttribute('aria-hidden', 'false');
      drawCaptcha();
    }
  }

  function closeCaptchaModal() {
    if (captchaModal) {
      captchaModal.classList.remove('active');
      captchaModal.setAttribute('aria-hidden', 'true');
    }
  }

  function openSuccessModal(name) {
    if (successTitle) {
      const firstName = (name || 'there').trim().split(' ')[0];
      successTitle.textContent = `You're in, ${firstName}!`;
    }
    if (successModal) {
      successModal.classList.add('active');
      successModal.setAttribute('aria-hidden', 'false');
    }
    // Launch Confetti Popper effect
    triggerConfetti();
  }

  function closeSuccessModal() {
    if (successModal) {
      successModal.classList.remove('active');
      successModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (captchaRefreshBtn) {
    captchaRefreshBtn.addEventListener('click', drawCaptcha);
  }

  if (captchaCloseBtn) {
    captchaCloseBtn.addEventListener('click', closeCaptchaModal);
  }

  if (captchaModal) {
    captchaModal.addEventListener('click', (e) => {
      if (e.target === captchaModal) closeCaptchaModal();
    });
  }

  if (successCloseBtn) successCloseBtn.addEventListener('click', closeSuccessModal);
  if (successDismissBtn) successDismissBtn.addEventListener('click', closeSuccessModal);
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeSuccessModal();
    });
  }

  // Captcha verification handler
  function handleCaptchaVerification() {
    if (!captchaInput) return;
    const entered = captchaInput.value.trim().toUpperCase();

    if (entered === currentCaptcha) {
      // Success!
      closeCaptchaModal();
      const applicantName = pendingFormData ? pendingFormData.get('name') : 'there';
      openSuccessModal(applicantName);

      // If active form exists, display inline confirmation or reset
      if (activeFormElement) {
        const firstName = applicantName ? applicantName.split(' ')[0] : 'there';
        activeFormElement.innerHTML = `
          <div class="form-success">
            <div class="form-success__icon"><i class="fa-solid fa-circle-check"></i></div>
            <h3 class="form-success__title">Application Confirmed, ${firstName}!</h3>
            <p class="form-success__body">
              Your inquiry for Founding Batch 1 has been securely recorded.<br />
              Prof. Dr. Minal Pareek's team will reach out directly on WhatsApp within 24 hours.<br /><br />
              <strong>Kickoff: 26 October 2026<br />Schedule: Monday to Friday · 9:00 PM to 10:00 PM IST</strong>
            </p>
          </div>
        `;
      }
    } else {
      // Captcha error
      if (captchaError) captchaError.style.display = 'flex';
      captchaInput.classList.add('error');
      setTimeout(() => captchaInput.classList.remove('error'), 400);
      drawCaptcha();
    }
  }

  if (captchaVerifyBtn) {
    captchaVerifyBtn.addEventListener('click', handleCaptchaVerification);
  }

  if (captchaInput) {
    captchaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCaptchaVerification();
      }
    });
  }

  // Attach submission listener to any registration forms on page
  const registerForms = document.querySelectorAll('form.register-form');
  registerForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const formData = new FormData(form);
      openCaptchaModal(form, formData);
    });
  });

  // ─── Confetti Popper Effect Engine ────────────────────────────
  const confettiCanvas = document.getElementById('confettiCanvas');
  let confettiAnimId = null;

  function triggerConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    let width = (confettiCanvas.width = window.innerWidth);
    let height = (confettiCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = confettiCanvas.width = window.innerWidth;
      height = confettiCanvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ['#ffffff', '#25D366', '#e63946', '#ffd166', '#c5a059', '#3a86ff', '#8338ec'];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() * 80 - 40),
        y: height / 2 - 40,
        w: 6 + Math.random() * 8,
        h: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 18,
        vy: -10 - Math.random() * 12,
        gravity: 0.35 + Math.random() * 0.15,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    const startTime = performance.now();
    const duration = 3800; // 3.8 seconds

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    function frame(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.rotation += p.rotSpeed;

        if (elapsed > duration * 0.6) {
          p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (elapsed < duration) {
        confettiAnimId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    confettiAnimId = requestAnimationFrame(frame);
  }

  // ─── Fade-in on scroll (Intersection Observer) ────────────────
  const revealEls = document.querySelectorAll(
    '.stat-card, .course-card, .quiz-card, .instructor-photo-card, .instructor-content'
  );

  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
      observer.observe(el);
    });
  }

});
