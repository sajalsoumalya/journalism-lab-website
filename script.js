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

  const env = window.__ENV__ || window.firebaseConfig || {};

  // ─── Prohibit and sanitize URL parameter submissions ──────────
  if (window.location.search && (window.location.search.includes('name=') || window.location.search.includes('phone=') || window.location.search.includes('email='))) {
    try {
      window.history.replaceState(null, document.title, window.location.pathname);
    } catch (e) {}
  }

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

  // ─── International Telephone Input Helper (Free Library) ──────
  const itiMap = new WeakMap();

  function cleanDuplicateDialCode(input, iti) {
    if (!input) return;
    let val = input.value;
    if (!val || typeof val !== 'string') return;
    val = val.trim();
    if (!val) return;

    const instance = iti || itiMap.get(input);
    const countryData = instance ? instance.getSelectedCountryData() : null;
    const dialCode = countryData?.dialCode || '91';

    // If string begins with "+", let intl-tel-input detect country if needed
    if (val.startsWith('+') && instance && !input._isFormatting) {
      input._isFormatting = true;
      try {
        instance.setNumber(val);
      } catch (e) {}
      input._isFormatting = false;
      val = input.value.trim();
    }

    // Strip duplicate "+<dialCode>" from input text when displayed separately
    const regexPlus = new RegExp(`^\\+${dialCode}\\s*`);
    if (regexPlus.test(val)) {
      input.value = val.replace(regexPlus, '');
      return;
    }

    // If user/autofill pasted national format starting with country code e.g. "919062656165"
    if (dialCode === '91') {
      const digitsOnly = val.replace(/\D/g, '');
      if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        input.value = digitsOnly.slice(2);
      }
    }
  }

  function updateItiInputPadding(input) {
    if (!input) return;
    const itiContainer = input.closest('.iti');
    if (!itiContainer) return;
    const selectedCountry = itiContainer.querySelector('.iti__selected-country');
    if (selectedCountry) {
      const w = selectedCountry.offsetWidth || 82;
      const targetPadding = Math.max(92, w + 12);
      input.style.setProperty('padding-left', `${targetPadding}px`, 'important');
    }
  }

  function initIntlPhone(input) {
    if (!input) return null;
    if (itiMap.has(input)) {
      const existingIti = itiMap.get(input);
      updateItiInputPadding(input);
      return existingIti;
    }

    if (typeof window.intlTelInput !== 'function') {
      return null;
    }

    try {
      const iti = window.intlTelInput(input, {
        initialCountry: 'in',
        preferredCountries: ['in', 'us', 'ae', 'gb', 'sa', 'sg', 'ca', 'au'],
        separateDialCode: true,
        strictMode: true,
        dropdownContainer: document.body,
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js'
      });
      itiMap.set(input, iti);

      // Clean duplicate country codes on input, autofill, paste, and country change
      const cleanHandler = () => {
        cleanDuplicateDialCode(input, iti);
        updateItiInputPadding(input);
      };
      input.addEventListener('input', cleanHandler);
      input.addEventListener('change', cleanHandler);
      input.addEventListener('paste', () => setTimeout(cleanHandler, 10));
      input.addEventListener('blur', cleanHandler);
      input.addEventListener('countrychange', () => {
        cleanHandler();
        setTimeout(() => updateItiInputPadding(input), 20);
      });

      // Check on initial render & autofill delays
      if (input.value) cleanHandler();
      updateItiInputPadding(input);
      requestAnimationFrame(() => updateItiInputPadding(input));
      setTimeout(() => updateItiInputPadding(input), 60);
      setTimeout(cleanHandler, 300);
      setTimeout(cleanHandler, 1000);

      return iti;
    } catch (err) {
      console.warn('intl-tel-input initialization notice:', err);
      return null;
    }
  }

  // Standardize and uniformly format telephone numbers for database storage, telecalling, and WhatsApp
  function formatInternationalPhone(rawInput, iti) {
    if (!rawInput && !iti) return { formatted: '', dial: '', wa: '' };

    const raw = String(rawInput || '').trim();
    const rawDigits = raw.replace(/\D/g, '');
    if (rawDigits.length < 5) {
      return { formatted: '', dial: '', wa: '' };
    }

    let digitsOnly = '';
    let dialCode = '91';

    if (iti && typeof iti.getSelectedCountryData === 'function') {
      const countryData = iti.getSelectedCountryData();
      dialCode = (countryData && countryData.dialCode) ? String(countryData.dialCode) : '91';
      const e164 = iti.getNumber ? iti.getNumber() : '';
      if (e164 && e164.startsWith('+')) {
        digitsOnly = e164.replace(/\D/g, '');
      }
    }

    if (!digitsOnly) {
      if (raw.startsWith('+')) {
        const match = raw.match(/^\+(\d{1,4})[\s.-]+(.*)$/);
        if (match) {
          dialCode = match[1];
          const national = match[2].replace(/\D/g, '');
          digitsOnly = dialCode + national;
        } else {
          const d = rawDigits;
          if (d.startsWith('91') && d.length === 12) {
            dialCode = '91';
            digitsOnly = d;
          } else if (d.startsWith('1') && d.length === 11) {
            dialCode = '1';
            digitsOnly = d;
          } else if (d.startsWith('44') && d.length >= 11) {
            dialCode = '44';
            digitsOnly = d;
          } else {
            digitsOnly = d;
          }
        }
      } else {
        if (rawDigits.length === 10) {
          digitsOnly = dialCode + rawDigits;
        } else if (rawDigits.length === 11 && rawDigits.startsWith('0')) {
          digitsOnly = dialCode + rawDigits.slice(1);
        } else if (rawDigits.startsWith(dialCode)) {
          digitsOnly = rawDigits;
        } else {
          digitsOnly = dialCode + rawDigits;
        }
      }
    }

    if (digitsOnly.length === 10) {
      digitsOnly = dialCode + digitsOnly;
    }

    let nationalPart = '';
    if (digitsOnly.startsWith(dialCode)) {
      nationalPart = digitsOnly.slice(dialCode.length);
    } else {
      nationalPart = digitsOnly;
    }

    let formattedNational = nationalPart;
    if (dialCode === '91' && nationalPart.length === 10) {
      formattedNational = nationalPart.slice(0, 5) + ' ' + nationalPart.slice(5);
    } else if (dialCode === '1' && nationalPart.length === 10) {
      formattedNational = nationalPart.slice(0, 3) + ' ' + nationalPart.slice(3, 6) + ' ' + nationalPart.slice(6);
    }

    const formatted = `+${dialCode} ${formattedNational}`.trim();
    const dial = `+${digitsOnly}`;
    const wa = digitsOnly;

    return { formatted, dial, wa };
  }

  // Helper to populate registration form fields across the page
  function populateAllRegistrationForms(data) {
    if (!data) return;

    const regForms = document.querySelectorAll('form.register-form');
    regForms.forEach(form => {
      // Full Name
      const nameInput = form.querySelector('input[name="name"], #name');
      if (nameInput && data.name && data.name !== 'Not Available' && !data.name.startsWith('Quiz Lead')) {
        nameInput.value = data.name;
      }

      // Phone (WhatsApp Number)
      const phoneInput = form.querySelector('input[type="tel"][name="phone"], #phone');
      if (phoneInput && data.phone && data.phone !== 'Not Available') {
        const formIti = itiMap.get(phoneInput) || initIntlPhone(phoneInput);
        if (formIti) {
          formIti.setNumber(data.phone);
          cleanDuplicateDialCode(phoneInput, formIti);
        } else {
          phoneInput.value = data.phone;
        }
      }

      // Email
      const emailInput = form.querySelector('input[name="email"], #email');
      if (emailInput && data.email && data.email !== 'Not Available' && !data.email.includes('quiz-visitor')) {
        emailInput.value = data.email;
      }

      // Institution
      const instInput = form.querySelector('input[name="institution"], #institution');
      if (instInput && data.institution && data.institution !== 'Not Available' && data.institution !== '—') {
        instInput.value = data.institution;
      }

      // Role (Student or Professional)
      if (data.role && data.role !== 'Not Available') {
        const roleRadio = form.querySelector(`input[name="role"][value="${data.role}"]`);
        if (roleRadio) {
          roleRadio.checked = true;
        }
      }

      // Gender
      const genderSelect = form.querySelector('select[name="gender"], #gender');
      if (genderSelect && data.gender && data.gender !== 'Not Available') {
        genderSelect.value = data.gender;
      }
    });
  }

  // Auto-initialize any tel inputs found in the DOM
  document.querySelectorAll('input[type="tel"]').forEach(input => initIntlPhone(input));

  // Auto-populate registration forms from previously recorded quiz lead session
  try {
    const savedLeadProfile = JSON.parse(sessionStorage.getItem('journalismLab_leadProfile') || localStorage.getItem('journalismLab_leadProfile') || 'null');
    if (savedLeadProfile) {
      populateAllRegistrationForms(savedLeadProfile);
    }
  } catch (e) {}

  try {
    const rawAnswers = sessionStorage.getItem('cmmd_user_quiz_answers');
    if (rawAnswers) {
      window.userQuizAnswers = JSON.parse(rawAnswers);
    }
    const savedTitle = sessionStorage.getItem('cmmd_last_quiz_result_title');
    if (savedTitle) {
      window.lastQuizResultTitle = savedTitle;
    }
  } catch (e) {}

  // ─── CMMD Pathfinder Quiz Engine ────────────────────────────────
  const QUESTIONS = [
    {
      id: 'q1',
      q: "Q1. Which of these pictures can you relate to the most?",
      type: "image-cards",
      options: [
        {
          val: "A",
          image: "assets/images/quiz/q1-stage.png",
          title: "Someone speaking on a stage"
        },
        {
          val: "B",
          image: "assets/images/quiz/q1-office.png",
          title: "Someone working in an office"
        },
        {
          val: "C",
          image: "assets/images/quiz/q1-travel.png",
          title: "Someone travelling"
        }
      ]
    },
    {
      id: 'q2',
      q: "Q2. What do you notice first in this image?",
      image: "assets/images/quiz/q2-tiger-forest.png",
      type: "image-prompt",
      options: [
        { val: "A", text: "The forest." },
        { val: "B", text: "The tiger." },
        { val: "C", text: "Both." }
      ]
    },
    {
      id: 'q3',
      q: "Q3. What is the first word you notice in this image?",
      image: "assets/images/quiz/q3-word-puzzle.png",
      type: "text-word"
    },
    {
      id: 'q4',
      q: "Q4. What do you expect from your career?",
      type: "standard",
      options: [
        { val: "A", text: "Risk + Reward" },
        { val: "B", text: "Stability and Security" }
      ]
    },
    {
      id: 'q5',
      q: "Q5. How often do you read newspapers and books?",
      type: "standard",
      options: [
        { val: "A", text: "Every day" },
        { val: "B", text: "Once or twice a week" },
        { val: "C", text: "Once or twice a month" },
        { val: "D", text: "The night before exams" }
      ]
    },
    {
      id: 'q6',
      q: "Q6. How comfortable are you with using technology and digital tools?",
      type: "standard",
      options: [
        { val: "A", text: "I can troubleshoot even complex problems" },
        { val: "B", text: "I can troubleshoot basic problems" },
        { val: "C", text: "What is troubleshooting?" }
      ]
    },
    {
      id: 'q7',
      q: "Q7. Personal Details",
      sub: "Enter your contact details to reveal your personalized career diagnostic report.",
      type: "lead-capture"
    }
  ];

  // Font Awesome icons only — NO emojis!
  const CAREER_PROFILES = {
    'public-speaker': {
      title: "Public Speaker",
      family: "Public Speaking, Journalism & PR",
      icon: '<i class="fa-solid fa-microphone"></i>',
      desc: "You thrive in front of live audiences with a commanding voice, persuasive charisma, and structured articulation. Keynote talks, public forums, and event hosting are your natural stage."
    },
    'influencer': {
      title: "Digital Influencer",
      family: "Public Speaking, Journalism & PR",
      icon: '<i class="fa-solid fa-star"></i>',
      desc: "You possess a magnetic on-camera presence, natural digital charm, and the instinct to turn everyday experiences into compelling, highly shareable digital narratives."
    },
    'news-reporter': {
      title: "News Reporter",
      family: "Public Speaking, Journalism & PR",
      icon: '<i class="fa-solid fa-bullhorn"></i>',
      desc: "You have an unshakeable instinct for truth, investigative rigor, and the technical confidence to report breaking stories from the frontlines of history."
    },
    'professor': {
      title: "Media Professor",
      family: "Public Speaking, Journalism & PR",
      icon: '<i class="fa-solid fa-graduation-cap"></i>',
      desc: "Your intellectual depth, love for literature, and analytical mindset make you born to teach, research, and shape the critical thinking of future media leaders."
    },
    'pr-manager': {
      title: "PR Manager",
      family: "Public Speaking, Journalism & PR",
      icon: '<i class="fa-solid fa-handshake"></i>',
      desc: "Strategic, diplomatic, and articulate, you excel at brand positioning, crisis communication, and building authentic relationships between institutions and the public."
    },
    'anchor': {
      title: "Broadcast News Anchor",
      family: "Public Speaking, Journalism & PR",
      icon: '<i class="fa-solid fa-tv"></i>',
      desc: "Poised and authoritative under live studio lights, you possess the voice, presence, and editorial composure to anchor prime-time broadcast journalism."
    },
    'freelance-designer-editor': {
      title: "Freelance Graphics Designer / Video Editor",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-palette"></i>',
      desc: "You value creative freedom, technical agility, and high-impact visual storytelling. Delivering standout visual assets on your own terms is your calling."
    },
    'marketing-agency-founder': {
      title: "Marketing Agency Founder",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-rocket"></i>',
      desc: "Entrepreneurial, visionary, and risk-tolerant, you spot market gaps and assemble creative talent to build scalable client solutions and high-growth brands."
    },
    'analyst': {
      title: "Media & Data Analyst",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-chart-line"></i>',
      desc: "You cut through noise with numbers and evidence. Analyzing media patterns, audience consumption data, and industry trends gives you unique strategic leverage."
    },
    'copywriter': {
      title: "Copywriter",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-pen-nib"></i>',
      desc: "Words are your superpower. You craft evocative headlines, broadcast copy, and viral brand narratives that capture attention and compel action."
    },
    'social-media-manager': {
      title: "Social Media Manager",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-mobile-screen-button"></i>',
      desc: "You live on the pulse of internet culture and platform algorithms. Building loyal online communities and orchestrating viral distribution is second nature to you."
    },
    'video-editor': {
      title: "Video Editor",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-film"></i>',
      desc: "You think in pacing, rhythm, and emotional arcs. In the post-production studio, you transform raw footage into captivating cinematic narratives."
    },
    'graphics-designer': {
      title: "Graphics Designer",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-bezier-curve"></i>',
      desc: "You master typography, visual hierarchy, color theory, and spatial balance. Editorial layouts, brand identities, and visual assets come alive in your hands."
    },
    'creative-director': {
      title: "Creative Director",
      family: "Content, Editing, Design & Marketing",
      icon: '<i class="fa-solid fa-compass-drafting"></i>',
      desc: "You unify copy, design, strategy, and vision. Guiding multidisciplinary teams to produce groundbreaking creative campaigns is your ultimate zone of genius."
    },
    'ott-producer': {
      title: "OTT Producer",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-clapperboard"></i>',
      desc: "You synthesize high creative ambition with commercial scale, producing binge-worthy web series, documentaries, and digital streaming experiences."
    },
    'event-startup-founder': {
      title: "Event Management Startup Founder",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-lightbulb"></i>',
      desc: "You thrive on the adrenaline of large-scale live productions, experiential summits, and building experiential enterprises from the ground up."
    },
    'wildlife-photographer': {
      title: "Wildlife Photographer",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-mountain-sun"></i>',
      desc: "Endlessly patient, adventurous, and attuned to the wilderness, you brave challenging expeditions to document rare species and urgent conservation stories."
    },
    'multimedia-engineer': {
      title: "Multimedia Engineer",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-microchip"></i>',
      desc: "You are the backbone of modern media tech. Broadcast routing, high-bandwidth streaming infrastructure, and interactive AV systems are your domain."
    },
    'event-manager': {
      title: "Event Manager",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-calendar-check"></i>',
      desc: "Methodical, calm, and hyper-organized, you orchestrate seamless stage logistics, live venue coordination, and flawless technical run-downs."
    },
    'sound-engineer': {
      title: "Sound Engineer",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-headphones"></i>',
      desc: "You give stories their sonic depth. Audio mixing, broadcast acoustics, Foley soundscapes, and podcast mastering are where your precision shines."
    },
    'videographer': {
      title: "Videographer",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-video"></i>',
      desc: "Always behind the lens on the ground, you capture fluid motion, human authenticity, and natural light to create compelling visual documentaries."
    },
    'photographer': {
      title: "Photographer",
      family: "Photography, Video, Multimedia & Sound",
      icon: '<i class="fa-solid fa-camera-retro"></i>',
      desc: "With an impeccable eye for framing and human expression, you freeze pivotal moments in time across editorial photojournalism and studio portraits."
    }
  };

  // Deterministic Decision Tree logic according to Answer Logic - Sheet1
  function calculateCareerPath(ans) {
    const q1 = ans.q1 || 'A';
    const q4 = ans.q4 || 'A';
    const q5 = ans.q5 || 'B';
    const q6 = ans.q6 || 'B';

    const isQ5Daily = (q5 === 'A');
    const isQ6Advanced = (q6 === 'A');

    if (q1 === 'A') {
      // Q1: Speaking on a stage
      if (q4 === 'A') {
        // Q4: Risk + Reward
        return isQ5Daily ? 'public-speaker' : 'influencer';
      } else {
        // Q4: Stability and Security
        if (isQ5Daily) {
          return isQ6Advanced ? 'news-reporter' : 'professor';
        } else {
          return isQ6Advanced ? 'pr-manager' : 'anchor';
        }
      }
    } else if (q1 === 'B') {
      // Q1: Working in an office
      if (q4 === 'A') {
        // Q4: Risk + Reward
        return isQ6Advanced ? 'freelance-designer-editor' : 'marketing-agency-founder';
      } else {
        // Q4: Stability and Security
        if (isQ5Daily) {
          return isQ6Advanced ? 'analyst' : 'copywriter';
        } else {
          if (q6 === 'A') return 'social-media-manager';
          if (q6 === 'B') return 'video-editor';
          if (q6 === 'C') return 'graphics-designer';
          return 'creative-director';
        }
      }
    } else {
      // Q1: Travelling & in the field
      if (q4 === 'A') {
        // Q4: Risk + Reward
        if (isQ5Daily) {
          return isQ6Advanced ? 'ott-producer' : 'event-startup-founder';
        } else {
          return 'wildlife-photographer';
        }
      } else {
        // Q4: Stability and Security
        if (isQ5Daily) {
          return isQ6Advanced ? 'multimedia-engineer' : 'event-manager';
        } else {
          if (q6 === 'A') return 'multimedia-engineer';
          if (q6 === 'B') return 'sound-engineer';
          if (q6 === 'C') return 'videographer';
          return 'photographer';
        }
      }
    }
  }

  function getQuizAnswersDetail(answers) {
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return null;
    }

    const qLookup = {
      q1: {
        num: 'Q1',
        question: 'Which of these pictures can you relate to the most?',
        options: {
          A: 'Someone speaking on a stage',
          B: 'Someone working in an office',
          C: 'Someone travelling'
        }
      },
      q2: {
        num: 'Q2',
        question: 'What do you notice first in this image? (Tiger / Forest)',
        options: {
          A: 'The forest',
          B: 'The tiger',
          C: 'Both'
        }
      },
      q3: {
        num: 'Q3',
        question: 'First word noticed in word puzzle',
        custom: true
      },
      q4: {
        num: 'Q4',
        question: 'What do you expect from your career?',
        options: {
          A: 'Risk + Reward',
          B: 'Stability and Security'
        }
      },
      q5: {
        num: 'Q5',
        question: 'How often do you read newspapers and books?',
        options: {
          A: 'Every day',
          B: 'Once or twice a week',
          C: 'Once or twice a month',
          D: 'The night before exams'
        }
      },
      q6: {
        num: 'Q6',
        question: 'Comfort with technology and digital tools',
        options: {
          A: 'I can troubleshoot even complex problems',
          B: 'I can troubleshoot basic problems',
          C: 'What is troubleshooting?'
        }
      }
    };

    const list = [];
    ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].forEach(key => {
      if (answers[key] !== undefined && answers[key] !== null && String(answers[key]).trim() !== '') {
        const meta = qLookup[key];
        const val = String(answers[key]).trim();
        let displayVal = val;
        if (meta.options && meta.options[val]) {
          displayVal = `Option ${val}: ${meta.options[val]}`;
        } else if (meta.custom) {
          displayVal = val.length === 1 ? `Letter "${val}"` : `Word "${val}"`;
        }
        list.push({
          key: key,
          num: meta.num,
          question: meta.question,
          value: val,
          label: displayVal
        });
      }
    });

    return list.length > 0 ? list : null;
  }

  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    let currentQ = 0;
    let userAnswers = {};
    let pendingVal = null;
    let pendingBtn = null;
    let disclaimerAgreed = false;
    let isQuizFullscreen = false;

    const quizStartScreen      = document.getElementById('quizStartScreen');
    const quizStartBtn         = document.getElementById('quizStartBtn');
    const quizProgress         = document.getElementById('quizProgress');
    const quizFullscreenExit   = document.getElementById('quizFullscreenExit');
    const quizFsResultExitBtn  = document.getElementById('quizFsResultExitBtn');
    const questionWrap         = document.getElementById('questionWrap');
    const quizResult           = document.getElementById('quizResult');
    const progressFill         = document.getElementById('progressFill');
    const progressLabel        = document.getElementById('progressLabel');

    function isMobileDevice() {
      return (window.innerWidth <= 768) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function setQuizVisibility(el, visible, displayType = 'block') {
      if (!el) return;
      if (visible) {
        el.classList.remove('is-hidden');
        el.style.setProperty('display', displayType, 'important');
      } else {
        el.classList.add('is-hidden');
        el.style.setProperty('display', 'none', 'important');
      }
    }

    function saveQuizProgress() {
      try {
        sessionStorage.setItem('cmmd_quiz_progress', JSON.stringify({
          currentQ: currentQ,
          userAnswers: userAnswers,
          timestamp: Date.now()
        }));
        if (userAnswers && Object.keys(userAnswers).length > 0) {
          window.userQuizAnswers = { ...userAnswers };
          sessionStorage.setItem('cmmd_user_quiz_answers', JSON.stringify(userAnswers));
        }
      } catch (e) {}
    }

    function clearQuizProgress() {
      try {
        sessionStorage.removeItem('cmmd_quiz_progress');
      } catch (e) {}
    }

    function loadSavedProgress() {
      try {
        const raw = sessionStorage.getItem('cmmd_quiz_progress');
        if (raw) {
          const data = JSON.parse(raw);
          if (typeof data.currentQ === 'number' && data.currentQ >= 0 && data.currentQ < QUESTIONS.length) {
            currentQ = data.currentQ;
            userAnswers = data.userAnswers || {};
            if (userAnswers && Object.keys(userAnswers).length > 0) {
              window.userQuizAnswers = { ...userAnswers };
            }
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    function updateStartScreenUI() {
      if (!quizStartBtn) return;
      const hasProgress = (typeof currentQ === 'number' && currentQ > 0) || (userAnswers && Object.keys(userAnswers).length > 0);
      let restartWrap = document.getElementById('quizRestartWrap');
      const startNote = quizStartScreen ? quizStartScreen.querySelector('.quiz-start-note') : null;

      if (hasProgress && currentQ < QUESTIONS.length) {
        const qNum = Math.min(currentQ + 1, QUESTIONS.length);
        quizStartBtn.innerHTML = `Resume Quiz &bull; Question ${qNum} of ${QUESTIONS.length} <i class="fa-solid fa-arrow-right"></i>`;
        quizStartBtn.setAttribute('title', `Resume quiz at Question ${qNum}`);
        quizStartBtn.setAttribute('aria-label', `Resume quiz at Question ${qNum}`);

        if (startNote) {
          startNote.innerHTML = `Quiz paused &bull; Answers saved &bull; Question ${qNum} of ${QUESTIONS.length}`;
        }

        if (!restartWrap && quizStartScreen) {
          restartWrap = document.createElement('div');
          restartWrap.id = 'quizRestartWrap';
          restartWrap.style.marginTop = '0.75rem';
          restartWrap.style.display = 'flex';
          restartWrap.style.justifyContent = 'center';
          restartWrap.innerHTML = `
            <button type="button" id="quizRestartBtn" class="quiz-restart-btn">
              <i class="fa-solid fa-rotate-left"></i> Restart Quiz from Beginning
            </button>
          `;
          if (startNote) {
            quizStartScreen.insertBefore(restartWrap, startNote);
          } else {
            quizStartScreen.appendChild(restartWrap);
          }

          const restartBtn = document.getElementById('quizRestartBtn');
          if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
              e.preventDefault();
              currentQ = 0;
              userAnswers = {};
              clearQuizProgress();
              updateStartScreenUI();
              startQuiz(0);
            });
          }
        } else if (restartWrap) {
          restartWrap.style.display = 'flex';
        }
      } else {
        quizStartBtn.innerHTML = `Start Now <i class="fa-solid fa-arrow-right"></i>`;
        quizStartBtn.removeAttribute('title');
        quizStartBtn.removeAttribute('aria-label');

        if (startNote) {
          startNote.innerHTML = 'Free &bull; No Signup Required';
        }

        if (restartWrap) {
          restartWrap.style.display = 'none';
        }
      }
    }

    function enterMobileFullscreen() {
      isQuizFullscreen = true;
      document.body.classList.add('quiz-fullscreen-active');
      quizCard.classList.add('is-fullscreen');
      if (quizFullscreenExit) quizFullscreenExit.style.display = 'inline-flex';
      if (quizFsResultExitBtn) quizFsResultExitBtn.style.display = 'inline-flex';

      try {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          root.requestFullscreen().catch(() => {});
        } else if (root.webkitRequestFullscreen) {
          root.webkitRequestFullscreen().catch(() => {});
        }
      } catch (e) {}
    }

    function exitMobileFullscreen() {
      isQuizFullscreen = false;
      document.body.classList.remove('quiz-fullscreen-active');
      quizCard.classList.remove('is-fullscreen');
      if (quizFullscreenExit) quizFullscreenExit.style.display = 'none';
      if (quizFsResultExitBtn) quizFsResultExitBtn.style.display = 'none';

      try {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
          document.webkitExitFullscreen().catch(() => {});
        }
      } catch (e) {}
    }

    function handleQuizClose() {
      exitMobileFullscreen();
      // Ensure question and progress are completely hidden so no partial question/form ever shows
      setQuizVisibility(questionWrap, false);
      setQuizVisibility(quizProgress, false);
      setQuizVisibility(quizResult, false);
      // Show start screen with Resume button if incomplete
      setQuizVisibility(quizStartScreen, true, 'flex');
      saveQuizProgress();
      updateStartScreenUI();
      if (quizCard) {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    if (quizFullscreenExit) {
      quizFullscreenExit.addEventListener('click', (e) => {
        e.preventDefault();
        handleQuizClose();
      });
    }

    function openQuizTermsModal() {
      let modal = document.getElementById('quizTermsModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay modal-overlay--terms';
        modal.id = 'quizTermsModal';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'quizTermsModalTitle');
        modal.style.zIndex = '100001';
        modal.innerHTML = `
          <div class="modal-box modal-box--disclaimer">
            <button type="button" class="modal-close" id="quizTermsModalClose" aria-label="Close terms dialog">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="modal-header">
              <div class="modal-icon-badge">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <h3 class="modal-title" id="quizTermsModalTitle">Disclaimer &amp; Terms</h3>
              <p class="modal-sub">CMMD Career Diagnostic &bull; JournalismLab</p>
            </div>
            <div class="disclaimer-modal-body">
              <p>The CMMD Career Path Quiz provides general career guidance based on responses submitted by participants. Results are indicative only and should not be treated as professional career advice.</p>
              <p>All personal information collected will be stored securely in accordance with our privacy practices and will never be sold or rented to third parties.</p>
              <p>JournalismLab and CMMD shall not be held responsible for decisions or consequences arising from reliance on quiz results.</p>
            </div>
            <div class="disclaimer-modal-actions" style="margin-top:1.25rem;">
              <button type="button" class="btn btn--primary" id="quizTermsModalAccept" style="width:100%; justify-content:center;">
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const closeModal = () => {
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
        };

        const closeBtn = modal.querySelector('#quizTermsModalClose');
        const acceptBtn = modal.querySelector('#quizTermsModalAccept');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (acceptBtn) {
          acceptBtn.addEventListener('click', () => {
            const consentCheckbox = document.getElementById('quizDisclaimerConsent');
            if (consentCheckbox) consentCheckbox.checked = true;
            closeModal();
          });
        }
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
          }
        });
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }

    if (quizFsResultExitBtn) {
      quizFsResultExitBtn.addEventListener('click', () => {
        exitMobileFullscreen();
        if (quizCard) {
          quizCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    function startQuiz(forceIndex) {
      if (typeof forceIndex === 'number') {
        currentQ = forceIndex;
      }
      if (typeof currentQ !== 'number' || currentQ < 0 || currentQ >= QUESTIONS.length) {
        currentQ = 0;
        userAnswers = {};
      }

      if (isMobileDevice()) {
        enterMobileFullscreen();
      }

      setQuizVisibility(quizStartScreen, false);
      setQuizVisibility(quizProgress, true, 'flex');
      setQuizVisibility(questionWrap, true, 'flex');
      setQuizVisibility(quizResult, false);

      renderQuestion(currentQ);

      if (!isMobileDevice() && quizCard) {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    if (quizStartBtn) {
      quizStartBtn.addEventListener('click', () => startQuiz());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isQuizFullscreen) {
        handleQuizClose();
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && isQuizFullscreen) {
        handleQuizClose();
      }
    });
    document.addEventListener('webkitfullscreenchange', () => {
      if (!document.webkitFullscreenElement && isQuizFullscreen) {
        handleQuizClose();
      }
    });

    function renderQuestion(index) {
      const data = QUESTIONS[index];
      const qTitle = document.getElementById('quizQuestion');
      const optContainer = document.getElementById('quizOptions');

      // Remove any previously inserted media container so layout is cleanly handled inside optContainer
      const oldMedia = document.getElementById('quizQuestionMedia');
      if (oldMedia) oldMedia.remove();

      if (qTitle) qTitle.textContent = data.q;

      if (optContainer) {
        optContainer.innerHTML = '';

        if (data.type === 'image-cards') {
          // Type 1: 3-4 images in equal-height cards grid (Q1)
          optContainer.className = 'quiz-options quiz-options--cards';
          data.options.forEach(opt => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'quiz-opt-card';
            card.dataset.val = opt.val;
            card.innerHTML = `
              <div class="quiz-opt-card__img-wrap">
                <img src="${opt.image}" alt="${opt.title}" class="quiz-opt-card__img" loading="eager" />
              </div>
              <div class="quiz-opt-card__body">
                <span class="quiz-opt-card__badge">Option ${opt.val}</span>
                <h4 class="quiz-opt-card__title">${opt.title}</h4>
              </div>
              <div class="quiz-opt-card__action">
                <i class="fa-solid fa-arrow-right"></i>
              </div>
            `;
            card.addEventListener('click', () => selectAnswer(opt.val, card));
            optContainer.appendChild(card);
          });
        } else if (data.type === 'text-word' || data.type === 'text-letter') {
          // Type 2b: Text-input based answer with full uppercase word (Q3)
          optContainer.className = 'quiz-options quiz-options--split quiz-options--letter';

          const mediaCol = document.createElement('div');
          mediaCol.className = 'quiz-split-media';
          mediaCol.innerHTML = `
            <div class="quiz-split-img-box">
              <img src="${data.image}" alt="${data.q}" class="quiz-split-img" loading="eager" />
            </div>
          `;

          const letterCol = document.createElement('div');
          letterCol.className = 'quiz-split-letter-box';
          letterCol.innerHTML = `
            <div class="quiz-letter-prompt">
              <span class="quiz-letter-badge"><i class="fa-solid fa-font"></i> Word Puzzle</span>
              <h4 class="quiz-letter-heading">Type the First Word</h4>
              <p class="quiz-letter-sub">Look at the word puzzle on the left. Type the first word that caught your attention.</p>
            </div>

            <div class="quiz-letter-input-container">
              <input 
                type="text" 
                id="quizQ3Input" 
                class="quiz-word-input quiz-single-letter-input" 
                maxlength="30" 
                placeholder="e.g. LEADER"
                autocomplete="off" 
                autocapitalize="characters"
                spellcheck="false"
                inputmode="text"
              />
              <p class="quiz-letter-hint">Type the word you spotted &bull; Automatically uppercase</p>
            </div>

            <button type="button" class="btn btn--primary btn--full" id="quizQ3NextBtn" disabled style="justify-content:center; padding:0.9rem 1.5rem; font-size:1rem; border-radius:10px; font-weight:600;">
              Next Question &nbsp;<i class="fa-solid fa-arrow-right"></i>
            </button>
          `;

          optContainer.appendChild(mediaCol);
          optContainer.appendChild(letterCol);

          const q3Input = document.getElementById('quizQ3Input');
          const q3NextBtn = document.getElementById('quizQ3NextBtn');

          if (q3Input) {
            setTimeout(() => q3Input.focus(), 150);

            if (userAnswers['q3']) {
              q3Input.value = userAnswers['q3'];
              if (q3NextBtn) q3NextBtn.disabled = false;
            }

            q3Input.addEventListener('input', () => {
              // Convert to UPPERCASE letters only, allow full words up to 30 characters
              let clean = q3Input.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
              if (clean.length > 30) {
                clean = clean.slice(0, 30);
              }
              q3Input.value = clean;

              if (clean.length >= 1) {
                if (q3NextBtn) q3NextBtn.disabled = false;
              } else {
                if (q3NextBtn) q3NextBtn.disabled = true;
              }
            });

            q3Input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (q3NextBtn && !q3NextBtn.disabled) {
                  q3NextBtn.click();
                }
              }
            });
          }

          if (q3NextBtn) {
            q3NextBtn.addEventListener('click', () => {
              const word = q3Input ? q3Input.value.trim().toUpperCase() : '';
              if (word.length >= 1) {
                userAnswers['q3'] = word;
                currentQ++;
                saveQuizProgress();
                if (currentQ < QUESTIONS.length) {
                  renderQuestion(currentQ);
                } else {
                  showResult();
                }
              }
            });
          }
        } else if (data.image) {
          // Type 2: 1 image prompt with options in a balanced split 2-column layout (Q2)
          optContainer.className = 'quiz-options quiz-options--split';

          const mediaCol = document.createElement('div');
          mediaCol.className = 'quiz-split-media';
          mediaCol.innerHTML = `
            <div class="quiz-split-img-box">
              <img src="${data.image}" alt="${data.q}" class="quiz-split-img" loading="eager" />
            </div>
          `;

          const optionsCol = document.createElement('div');
          optionsCol.className = 'quiz-split-options';
          data.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-opt';
            btn.dataset.val = opt.val;
            btn.innerHTML = `
              <div class="quiz-opt-content">
                <span class="quiz-opt-letter">${opt.val}</span>
                <div class="quiz-opt-text-wrap">
                  <span class="quiz-opt-title">${opt.text}</span>
                  ${opt.subtitle ? `<span class="quiz-opt-sub">${opt.subtitle}</span>` : ''}
                </div>
              </div>
              <i class="fa-solid fa-arrow-right quiz-opt-arrow"></i>
            `;
            btn.addEventListener('click', () => selectAnswer(opt.val, btn));
            optionsCol.appendChild(btn);
          });

          optContainer.appendChild(mediaCol);
          optContainer.appendChild(optionsCol);
        } else if (data.type === 'lead-capture') {
          // Type 4: Lead Capture Question (Q7)
          optContainer.className = 'quiz-options quiz-options--lead';
          optContainer.innerHTML = `
            <form class="quiz-lead-form" id="quizLeadForm" novalidate>
              <div class="quiz-lead-grid">
                <div class="quiz-lead-field">
                  <label class="quiz-lead-label" for="quizLeadName">
                    <span>Full Name <span class="req">*</span></span>
                  </label>
                  <input type="text" id="quizLeadName" class="quiz-lead-input" placeholder="e.g. Rahul Sharma" autocomplete="name" required />
                </div>

                <div class="quiz-lead-field">
                  <label class="quiz-lead-label" for="quizLeadGender">
                    <span>Gender</span>
                  </label>
                  <select id="quizLeadGender" class="quiz-lead-select">
                    <option value="" selected disabled>Select Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div class="quiz-lead-field">
                  <label class="quiz-lead-label" for="quizLeadPhone">
                    <span>Mobile / WhatsApp <span class="req">*</span></span>
                  </label>
                  <div class="quiz-phone-input-wrap">
                    <input type="tel" id="quizLeadPhone" class="quiz-phone-input" placeholder="00000 00000" autocomplete="tel" inputmode="tel" required />
                  </div>
                  <p id="quizLeadPhoneError" class="quiz-field-error" style="display:none;">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Please enter a valid 10-digit mobile number.</span>
                  </p>
                </div>

                <div class="quiz-lead-field">
                  <label class="quiz-lead-label" for="quizLeadEmail">
                    <span>Email Address <span class="req">*</span></span>
                  </label>
                  <input type="email" id="quizLeadEmail" class="quiz-lead-input" placeholder="name@example.com" autocomplete="email" required />
                </div>

                <div class="quiz-lead-field">
                  <label class="quiz-lead-label">
                    <span>Current Role <span class="req">*</span></span>
                  </label>
                  <div class="quiz-role-toggle">
                    <label class="quiz-role-pill">
                      <input type="radio" name="quizRole" value="Student" checked />
                      <span>Student</span>
                    </label>
                    <label class="quiz-role-pill">
                      <input type="radio" name="quizRole" value="Professional" />
                      <span>Professional</span>
                    </label>
                  </div>
                </div>

                <div class="quiz-lead-field">
                  <label class="quiz-lead-label" for="quizLeadInst">
                    <span>Institution / Organisation</span>
                  </label>
                  <input type="text" id="quizLeadInst" class="quiz-lead-input" placeholder="College or Company name" />
                </div>
              </div>

              <!-- Terms Consent Checkbox -->
              <div class="quiz-terms-consent">
                <label class="quiz-terms-consent__label" for="quizDisclaimerConsent">
                  <input type="checkbox" id="quizDisclaimerConsent" checked required />
                  <span>By proceeding, you acknowledge and agree to these <button type="button" class="quiz-terms-link" id="quizTermsLink">terms</button>.</span>
                </label>
              </div>

              <div class="quiz-lead-actions">
                <button type="submit" class="btn btn--primary btn--full" id="quizLeadSubmitBtn" style="justify-content:center; padding:0.85rem 1.5rem; font-size:1.02rem; font-weight:700;">
                  Unlock Result &nbsp;<i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </form>
          `;

          // Initialize intl-tel-input for the phone input
          const phoneInput = document.getElementById('quizLeadPhone');
          if (phoneInput) {
            const iti = initIntlPhone(phoneInput);
            updateItiInputPadding(phoneInput);
            requestAnimationFrame(() => updateItiInputPadding(phoneInput));
            setTimeout(() => updateItiInputPadding(phoneInput), 60);
            if (window.userQuizPhone) {
              if (iti) {
                iti.setNumber(window.userQuizPhone);
                cleanDuplicateDialCode(phoneInput, iti);
                updateItiInputPadding(phoneInput);
              } else {
                phoneInput.value = window.userQuizPhone;
              }
            }
          }

          // Connect terms link click to disclaimer popup modal
          const termsLink = document.getElementById('quizTermsLink');
          if (termsLink) {
            termsLink.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuizTermsModal();
            });
          }

          // Handle lead capture form submission
          const leadForm = document.getElementById('quizLeadForm');
          if (leadForm) {
            try {
              const cachedProfile = JSON.parse(sessionStorage.getItem('journalismLab_leadProfile') || '{}');
              if (cachedProfile.name && document.getElementById('quizLeadName')) {
                document.getElementById('quizLeadName').value = cachedProfile.name;
              }
              if (cachedProfile.email && document.getElementById('quizLeadEmail')) {
                document.getElementById('quizLeadEmail').value = cachedProfile.email;
              }
              if (cachedProfile.institution && document.getElementById('quizLeadInst')) {
                document.getElementById('quizLeadInst').value = cachedProfile.institution;
              }
              if (cachedProfile.gender && document.getElementById('quizLeadGender')) {
                document.getElementById('quizLeadGender').value = cachedProfile.gender;
              }
              if (cachedProfile.role) {
                const roleRadio = leadForm.querySelector(`input[name="quizRole"][value="${cachedProfile.role}"]`);
                if (roleRadio) roleRadio.checked = true;
              }
            } catch (e) {}

            leadForm.querySelectorAll('input, select').forEach(input => {
              input.addEventListener('input', () => {
                try {
                  const draft = JSON.parse(sessionStorage.getItem('journalismLab_leadProfile') || '{}');
                  const n = document.getElementById('quizLeadName');
                  const em = document.getElementById('quizLeadEmail');
                  const inst = document.getElementById('quizLeadInst');
                  const g = document.getElementById('quizLeadGender');
                  const r = leadForm.querySelector('input[name="quizRole"]:checked');
                  if (n) draft.name = n.value.trim();
                  if (em) draft.email = em.value.trim();
                  if (inst) draft.institution = inst.value.trim();
                  if (g) draft.gender = g.value;
                  if (r) draft.role = r.value;
                  sessionStorage.setItem('journalismLab_leadProfile', JSON.stringify(draft));
                } catch (e) {}
              });
            });

            leadForm.addEventListener('submit', (e) => {
              e.preventDefault();

              const nameInput = document.getElementById('quizLeadName');
              const phoneInput = document.getElementById('quizLeadPhone');
              const emailInput = document.getElementById('quizLeadEmail');
              const instInput = document.getElementById('quizLeadInst');
              const genderSelect = document.getElementById('quizLeadGender');
              const roleRadio = leadForm.querySelector('input[name="quizRole"]:checked');
              const consentBox = document.getElementById('quizDisclaimerConsent');
              const phoneErr = document.getElementById('quizLeadPhoneError');

              const nameVal = nameInput ? nameInput.value.trim() : '';
              const emailVal = emailInput ? emailInput.value.trim() : '';
              const rawPhone = phoneInput ? phoneInput.value.trim() : '';
              const digits = rawPhone.replace(/\D/g, '');
              const iti = phoneInput ? (itiMap.get(phoneInput) || initIntlPhone(phoneInput)) : null;

              let phoneValid = false;
              if (iti) {
                const countryData = iti.getSelectedCountryData();
                const isIndia = (countryData && countryData.iso2 === 'in');
                phoneValid = iti.isValidNumber() || digits.length >= (isIndia ? 10 : 7);
              } else {
                phoneValid = digits.length >= 10;
              }

              if (!nameVal) {
                if (nameInput) {
                  nameInput.classList.add('error');
                  nameInput.focus();
                }
                return;
              } else if (nameInput) {
                nameInput.classList.remove('error');
              }

              if (!rawPhone || !phoneValid || digits.length < 7) {
                if (phoneErr) {
                  phoneErr.style.display = 'flex';
                  const errSpan = phoneErr.querySelector('span');
                  if (errSpan) {
                    const countryIso = iti ? iti.getSelectedCountryData()?.iso2 : 'in';
                    errSpan.textContent = countryIso === 'in'
                      ? 'Please enter a valid 10-digit mobile number.'
                      : 'Please enter a valid mobile number.';
                  }
                }
                if (phoneInput) {
                  phoneInput.classList.add('error');
                  phoneInput.focus();
                }
                return;
              } else {
                if (phoneErr) phoneErr.style.display = 'none';
                if (phoneInput) phoneInput.classList.remove('error');
              }

              if (!emailVal || !emailVal.includes('@')) {
                if (emailInput) {
                  emailInput.classList.add('error');
                  emailInput.focus();
                }
                return;
              } else if (emailInput) {
                emailInput.classList.remove('error');
              }

              if (consentBox && !consentBox.checked) {
                consentBox.focus();
                return;
              }

              const phoneObj = formatInternationalPhone(rawPhone, iti);
              window.userQuizPhone = phoneObj.formatted || rawPhone;
              window.userQuizPhoneDial = phoneObj.dial;
              window.userQuizPhoneWa = phoneObj.wa;

              // Calculate result profile using deterministic CMMD decision logic
              const profileKey = calculateCareerPath(userAnswers);
              const res = CAREER_PROFILES[profileKey] || CAREER_PROFILES['news-reporter'];

              const quizAnswersCopy = { ...userAnswers };
              const answersDetail = getQuizAnswersDetail(quizAnswersCopy);
              window.userQuizAnswers = quizAnswersCopy;
              window.lastQuizResultTitle = res.title || 'Completed';
              try {
                sessionStorage.setItem('cmmd_user_quiz_answers', JSON.stringify(quizAnswersCopy));
                sessionStorage.setItem('cmmd_last_quiz_result_title', window.lastQuizResultTitle);
              } catch (e) {}

              // Capture complete lead with actual user details
              const quizLead = {
                id: 'lead_quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                name: nameVal,
                phone: phoneObj.formatted || rawPhone,
                phoneDial: phoneObj.dial || '',
                phoneWa: phoneObj.wa || '',
                email: emailVal,
                institution: (instInput && instInput.value.trim()) || 'Not Available',
                role: (roleRadio ? roleRadio.value : 'Student'),
                gender: (genderSelect && genderSelect.value) || 'Not Available',
                message: 'Not Available',
                quizResult: res.title || 'Completed',
                quizAnswers: quizAnswersCopy,
                quizAnswersDetail: answersDetail,
                status: 'new',
                captchaVerified: true,
                captchaSecured: Boolean(captchaApiKey),
                submittedAt: new Date().toISOString(),
                submittedDisplay: new Date().toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }),
                source: window.location.pathname.includes('pathfinder') ? 'Pathfinder Quiz' : 'Diagnostic Quiz'
              };

              window.quizLeadCaptured = true;
              if (typeof window.recordLead === 'function') {
                window.recordLead(quizLead);
              }

              // Save profile to storage for pre-filling registration form on landing page or register.html
              const leadProfile = {
                name: nameVal,
                phone: phoneObj.formatted || rawPhone,
                phoneDial: phoneObj.dial || '',
                phoneWa: phoneObj.wa || '',
                email: emailVal,
                institution: (instInput && instInput.value.trim()) || '',
                role: (roleRadio ? roleRadio.value : 'Student'),
                gender: (genderSelect && genderSelect.value) || ''
              };

              try {
                sessionStorage.setItem('journalismLab_leadProfile', JSON.stringify(leadProfile));
                localStorage.setItem('journalismLab_leadProfile', JSON.stringify(leadProfile));
              } catch (e) {}

              // Auto-fill all fields in any registration forms on page
              populateAllRegistrationForms(leadProfile);

              showResult();
            });
          }
        } else {
          // Type 3: No image (Q4: 2 options, Q5/Q6: 4 options) centered vertically
          optContainer.className = 'quiz-options quiz-options--text' + (data.options.length <= 2 ? ' quiz-options--duo' : '');
          data.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-opt';
            btn.dataset.val = opt.val;
            btn.innerHTML = `
              <div class="quiz-opt-content">
                <span class="quiz-opt-letter">${opt.val}</span>
                <div class="quiz-opt-text-wrap">
                  <span class="quiz-opt-title">${opt.text}</span>
                  ${opt.subtitle ? `<span class="quiz-opt-sub">${opt.subtitle}</span>` : ''}
                </div>
              </div>
              <i class="fa-solid fa-arrow-right quiz-opt-arrow"></i>
            `;
            btn.addEventListener('click', () => selectAnswer(opt.val, btn));
            optContainer.appendChild(btn);
          });
        }
      }

      const pct = ((index + 1) / QUESTIONS.length) * 100;
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressLabel) progressLabel.textContent = `${index + 1} / ${QUESTIONS.length}`;
    }

    function selectAnswer(val, btn) {
      const optContainer = document.getElementById('quizOptions');
      if (optContainer) {
        optContainer.querySelectorAll('.quiz-opt, .quiz-opt-card').forEach(b => b.classList.remove('selected'));
      }
      btn.classList.add('selected');
      userAnswers[QUESTIONS[currentQ].id] = val;
      saveQuizProgress();

      setTimeout(() => {
        currentQ++;
        saveQuizProgress();
        if (currentQ < QUESTIONS.length) {
          renderQuestion(currentQ);
        } else {
          showResult();
        }
      }, 260);
    }

    function showResult() {
      clearQuizProgress();
      setQuizVisibility(questionWrap, false);
      setQuizVisibility(quizProgress, false);
      setQuizVisibility(quizStartScreen, false);
      setQuizVisibility(quizResult, true, 'block');
      if (progressFill) progressFill.style.width = '100%';
      if (progressLabel) progressLabel.innerHTML = '<i class="fa-solid fa-check"></i> Completed';

      // Evaluate result using deterministic CMMD Answer Logic
      const profileKey = calculateCareerPath(userAnswers);
      const res = CAREER_PROFILES[profileKey] || CAREER_PROFILES['news-reporter'];

      const resIcon = document.getElementById('resultIcon');
      const resTitle = document.getElementById('resultTitle');
      const resDesc = document.getElementById('resultDesc');
      const resFamily = document.getElementById('resultFamily');

      if (resFamily) {
        resFamily.textContent = res.family;
        resFamily.style.display = 'inline-block';
      }
      if (resIcon) resIcon.innerHTML = res.icon;
      if (resTitle) resTitle.textContent = res.title;
      if (resDesc) resDesc.textContent = res.desc;
      window.lastQuizResultTitle = res.title;
      window.userQuizAnswers = { ...userAnswers };
      try {
        sessionStorage.setItem('cmmd_user_quiz_answers', JSON.stringify(userAnswers));
        sessionStorage.setItem('cmmd_last_quiz_result_title', res.title);
      } catch (e) {}

      // Automatically capture quiz lead if mobile phone was entered
      if (window.userQuizPhone && !window.quizLeadCaptured) {
        window.quizLeadCaptured = true;
        const phoneObj = formatInternationalPhone(window.userQuizPhone);
        const quizAnswersCopy = { ...userAnswers };
        const answersDetail = getQuizAnswersDetail(quizAnswersCopy);

        const quizLead = {
          id: 'lead_quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          name: 'Not Available',
          phone: phoneObj.formatted || window.userQuizPhone,
          phoneDial: phoneObj.dial || window.userQuizPhoneDial || '',
          phoneWa: phoneObj.wa || window.userQuizPhoneWa || '',
          email: 'Not Available',
          institution: 'Not Available',
          role: 'Not Available',
          gender: 'Not Available',
          message: 'Not Available',
          quizResult: res.title || 'Completed',
          quizAnswers: quizAnswersCopy,
          quizAnswersDetail: answersDetail,
          status: 'new',
          captchaVerified: true,
          captchaSecured: (typeof captchaApiKey !== 'undefined' && Boolean(captchaApiKey)),
          submittedAt: new Date().toISOString(),
          submittedDisplay: new Date().toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          source: window.location.pathname.includes('pathfinder') ? 'Pathfinder Quiz' : 'Diagnostic Quiz'
        };

        if (typeof window.recordLead === 'function') {
          window.recordLead(quizLead);
        }
      }

      if (isQuizFullscreen && quizFsResultExitBtn) {
        quizFsResultExitBtn.style.display = 'inline-flex';
      }

      // Scroll to quiz card so user sees result cleanly
      if (quizCard) {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // If start screen is present on page, initialize Start / Resume state
    if (quizStartScreen) {
      setQuizVisibility(quizStartScreen, true, 'flex');
      setQuizVisibility(quizProgress, false);
      setQuizVisibility(questionWrap, false);
      setQuizVisibility(quizResult, false);
      loadSavedProgress();
      updateStartScreenUI();
    } else {
      renderQuestion(0);
    }
  }

  // ─── Captcha Engine & Form Submission ─────────────────────────
  const captchaApiKey = (env.CAPTCHA_API_KEY && !env.CAPTCHA_API_KEY.startsWith('${')) ? env.CAPTCHA_API_KEY :
                        (env.CAPTCHA_SITE_KEY && !env.CAPTCHA_SITE_KEY.startsWith('${')) ? env.CAPTCHA_SITE_KEY :
                        (env.captchaApiKey && !env.captchaApiKey.startsWith('${')) ? env.captchaApiKey : null;

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

  function openSuccessModal(name, isDuplicate = false) {
    if (successTitle) {
      const firstName = (name || 'there').trim().split(' ')[0];
      successTitle.textContent = isDuplicate ? `Welcome back, ${firstName}!` : `You're in, ${firstName}!`;
    }
    const successSub = successModal ? successModal.querySelector('.modal-sub') : null;
    if (successSub) {
      successSub.innerHTML = isDuplicate
        ? 'Your registration details have been updated. We already have your inquiry on file and will reach out via WhatsApp within 24 hours.'
        : 'Your seat application has been securely received. Prof. Dr. Minal Pareek will personally reach out on WhatsApp within 24 hours.';
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

      // Format phone number uniformly with country code via formatInternationalPhone
      const regPhoneInput = activeFormElement ? activeFormElement.querySelector('input[type="tel"][name="phone"], #phone') : document.querySelector('input[type="tel"]');
      const formIti = regPhoneInput ? (itiMap.get(regPhoneInput) || initIntlPhone(regPhoneInput)) : null;
      const rawInputVal = (regPhoneInput && regPhoneInput.value.trim()) || (pendingFormData ? pendingFormData.get('phone') : '') || window.userQuizPhone || '';

      const phoneObj = formatInternationalPhone(rawInputVal, formIti);
      const emailVal = (pendingFormData ? pendingFormData.get('email') : '') || '';

      // Check if applicant is already registered by phone or email
      const isDuplicate = findExistingLeadIndex(getStoredLeads(), { phone: phoneObj.formatted || rawInputVal, email: emailVal }) >= 0;
      openSuccessModal(applicantName, isDuplicate);

      // Check if user has attended the quiz
      let attendedQuizAnswers = window.userQuizAnswers;
      if (!attendedQuizAnswers) {
        try {
          const raw = sessionStorage.getItem('cmmd_user_quiz_answers');
          if (raw) attendedQuizAnswers = JSON.parse(raw);
        } catch (e) {}
      }

      const hasAttendedQuiz = attendedQuizAnswers && typeof attendedQuizAnswers === 'object' && Object.keys(attendedQuizAnswers).length > 0;
      const quizAnswersDetail = hasAttendedQuiz ? getQuizAnswersDetail(attendedQuizAnswers) : null;
      const finalQuizResult = hasAttendedQuiz
        ? (window.lastQuizResultTitle || 'Completed Career Diagnostic Quiz')
        : 'Direct Registration (Quiz not taken)';

      // Record lead in Firebase Realtime Database and LocalStorage (deduplicates automatically)
      const leadData = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        name: (pendingFormData ? pendingFormData.get('name') : '') || applicantName || 'Applicant',
        phone: phoneObj.formatted || window.userQuizPhone || 'Not Available',
        phoneDial: phoneObj.dial || window.userQuizPhoneDial || '',
        phoneWa: phoneObj.wa || window.userQuizPhoneWa || '',
        email: emailVal,
        institution: (pendingFormData ? pendingFormData.get('institution') : '') || '—',
        role: (pendingFormData ? pendingFormData.get('role') : '') || 'Student',
        gender: (pendingFormData ? pendingFormData.get('gender') : '') || 'Not Available',
        message: (pendingFormData ? pendingFormData.get('msg') : '') || '',
        quizResult: finalQuizResult,
        quizAnswers: hasAttendedQuiz ? attendedQuizAnswers : null,
        quizAnswersDetail: quizAnswersDetail,
        status: 'new',
        captchaVerified: true,
        captchaSecured: Boolean(captchaApiKey),
        submittedAt: new Date().toISOString(),
        submittedDisplay: new Date().toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        source: window.location.pathname.includes('register') ? 'Register Page' : 'Landing Page'
      };

      if (typeof recordLead === 'function') {
        recordLead(leadData);
      }

      // If active form exists, display inline confirmation or reset
      if (activeFormElement) {
        const firstName = applicantName ? applicantName.split(' ')[0] : 'there';
        activeFormElement.innerHTML = `
          <div class="form-success">
            <div class="form-success__icon"><i class="fa-solid fa-circle-check"></i></div>
            <h3 class="form-success__title">${isDuplicate ? 'Application Updated' : 'Application Confirmed'}, ${firstName}!</h3>
            <p class="form-success__body">
              ${isDuplicate
                ? 'Your registration details have been updated. We already have your inquiry on file and will reach out via WhatsApp within 24 hours.<br /><br />'
                : 'Your inquiry for Founding Batch 1 has been securely recorded.<br />Prof. Dr. Minal Pareek\'s team will reach out directly on WhatsApp within 24 hours.<br /><br />'
              }
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
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
      initIntlPhone(phoneInput);
      phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (phoneInput) {
        const formIti = itiMap.get(phoneInput) || initIntlPhone(phoneInput);
        const digits = phoneInput.value.replace(/\D/g, '');
        const isIndia = formIti && formIti.getSelectedCountryData()?.iso2 === 'in';
        const isValid = formIti ? (formIti.isValidNumber() || digits.length >= (isIndia ? 10 : 7)) : digits.length >= 7;

        if (!isValid) {
          phoneInput.setCustomValidity(isIndia ? 'Please enter a valid 10-digit mobile number.' : 'Please enter a valid telephone number.');
          phoneInput.reportValidity();
          return;
        } else {
          phoneInput.setCustomValidity('');
        }
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

  // ─── Firebase Realtime Database & Lead Management ─────────────
  function resolveFirebaseConfig() {
    const cfg = window.firebaseConfig || window.FIREBASE_CONFIG || window.__ENV__ || {};
    const clean = val => typeof val === 'string' ? val.trim().replace(/^["']|["']$/g, '') : '';
    const isValid = val => {
      const s = clean(val);
      return s !== '' && !s.startsWith('${');
    };

    const apiKey = isValid(cfg.apiKey) ? clean(cfg.apiKey) :
                   isValid(cfg.FIREBASE_API_KEY) ? clean(cfg.FIREBASE_API_KEY) : null;
    if (!apiKey) return null;

    const projectId = isValid(cfg.projectId) ? clean(cfg.projectId) :
                      isValid(cfg.FIREBASE_PROJECT_ID) ? clean(cfg.FIREBASE_PROJECT_ID) : undefined;

    const authDomain = isValid(cfg.authDomain) ? clean(cfg.authDomain) :
                       isValid(cfg.FIREBASE_AUTH_DOMAIN) ? clean(cfg.FIREBASE_AUTH_DOMAIN) :
                       (projectId ? `${projectId}.firebaseapp.com` : undefined);

    const databaseURL = isValid(cfg.databaseURL) ? clean(cfg.databaseURL) :
                        isValid(cfg.FIREBASE_DATABASE_URL) ? clean(cfg.FIREBASE_DATABASE_URL) :
                        (projectId ? `https://${projectId}-default-rtdb.firebaseio.com` : undefined);

    const storageBucket = isValid(cfg.storageBucket) ? clean(cfg.storageBucket) :
                          isValid(cfg.FIREBASE_STORAGE_BUCKET) ? clean(cfg.FIREBASE_STORAGE_BUCKET) :
                          (projectId ? `${projectId}.appspot.com` : undefined);

    const messagingSenderId = isValid(cfg.messagingSenderId) ? clean(cfg.messagingSenderId) :
                              isValid(cfg.FIREBASE_MESSAGING_SENDER_ID) ? clean(cfg.FIREBASE_MESSAGING_SENDER_ID) : undefined;

    const appId = isValid(cfg.appId) ? clean(cfg.appId) :
                  isValid(cfg.FIREBASE_APP_ID) ? clean(cfg.FIREBASE_APP_ID) : undefined;

    return {
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    };
  }

  let rtdb = null;
  let leadsRef = null;
  const LEADS_KEY = 'journalism_leads';
  const LOCAL_STORAGE_KEY = 'journalism_lab_leads';

  // Initialize Firebase RTDB if config is available
  if (typeof firebase !== 'undefined') {
    const fbConfig = resolveFirebaseConfig();
    if (fbConfig) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(fbConfig);
        }
        rtdb = firebase.database();
        leadsRef = rtdb.ref(LEADS_KEY);
      } catch (err) {
        console.warn('Firebase Realtime Database init notice:', err.message);
      }
    }
  }

  function isSamePhone(phoneA, phoneB) {
    if (!phoneA || !phoneB) return false;
    const strA = String(phoneA).trim();
    const strB = String(phoneB).trim();
    if (strA === 'Not Available' || strA === '—' || strB === 'Not Available' || strB === '—') return false;

    const digitsA = strA.replace(/\D/g, '');
    const digitsB = strB.replace(/\D/g, '');
    if (digitsA.length < 7 || digitsB.length < 7) return false;

    if (digitsA.length >= 10 && digitsB.length >= 10) {
      return digitsA.slice(-10) === digitsB.slice(-10);
    }
    return digitsA === digitsB;
  }

  function isSameEmail(emailA, emailB) {
    if (!emailA || !emailB) return false;
    const strA = String(emailA).trim().toLowerCase();
    const strB = String(emailB).trim().toLowerCase();
    if (!strA.includes('@') || !strB.includes('@')) return false;
    if (strA.startsWith('not available') || strB.startsWith('not available') || strA.includes('quiz-visitor') || strB.includes('quiz-visitor')) return false;
    return strA === strB;
  }

  function findExistingLeadIndex(leadsList, target) {
    if (!Array.isArray(leadsList) || !target) return -1;
    return leadsList.findIndex(item => {
      if (!item) return false;
      if (target.id && item.id === target.id) return true;
      if (isSamePhone(item.phone, target.phone)) return true;
      if (isSameEmail(item.email, target.email)) return true;
      return false;
    });
  }

  function normalizeLeads(leads) {
    if (!Array.isArray(leads)) return [];
    const deduped = [];

    leads.forEach(l => {
      if (!l) return;
      const isQuiz = (l.name && l.name.startsWith('Quiz Lead')) || (l.id && l.id.startsWith('lead_quiz_')) || (l.source && l.source.includes('Quiz'));
      if (isQuiz) {
        if (!l.adminVerified) {
          if (!l.name || l.name.startsWith('Quiz Lead')) {
            l.name = 'Not Available';
          }
          if (!l.role || l.role === 'Quiz Lead' || l.role === 'Student') {
            l.role = 'Not Available';
          }
        }
        if (!l.email || l.email.includes('quiz-visitor') || l.email === '—') {
          l.email = 'Not Available';
        }
        if (!l.institution || l.institution === '—') {
          l.institution = 'Not Available';
        }
        if (!l.message || l.message.startsWith('Completed Career Diagnostic Quiz')) {
          l.message = 'Not Available';
        }
      }
      if (l.phone && l.phone !== 'Not Available' && l.phone !== '—') {
        const phoneObj = formatInternationalPhone(l.phone);
        if (phoneObj.formatted) {
          l.phone = phoneObj.formatted;
        }
        if (!l.phoneDial && phoneObj.dial) {
          l.phoneDial = phoneObj.dial;
        }
        if (!l.phoneWa && phoneObj.wa) {
          l.phoneWa = phoneObj.wa;
        }
      }

      // Deduplicate: merge matching phone or email into a single clean applicant record
      const existingIdx = findExistingLeadIndex(deduped, l);
      if (existingIdx >= 0) {
        const existing = deduped[existingIdx];
        if ((!existing.name || existing.name === 'Not Available' || existing.name === 'Applicant') && l.name && l.name !== 'Not Available') {
          existing.name = l.name;
        }
        if ((!existing.email || existing.email === 'Not Available') && l.email && l.email !== 'Not Available') {
          existing.email = l.email;
        }
        if ((!existing.institution || existing.institution === 'Not Available') && l.institution && l.institution !== 'Not Available') {
          existing.institution = l.institution;
        }
        if ((!existing.gender || existing.gender === 'Not Available') && l.gender && l.gender !== 'Not Available') {
          existing.gender = l.gender;
        }
        if ((!existing.role || existing.role === 'Not Available') && l.role && l.role !== 'Not Available') {
          existing.role = l.role;
        }
        if ((!existing.quizAnswers || Object.keys(existing.quizAnswers).length === 0) && l.quizAnswers && Object.keys(l.quizAnswers).length > 0) {
          existing.quizAnswers = l.quizAnswers;
          existing.quizAnswersDetail = l.quizAnswersDetail || (typeof getQuizAnswersDetail === 'function' ? getQuizAnswersDetail(l.quizAnswers) : null);
        }
        if (existing.quizAnswers && !existing.quizAnswersDetail && typeof getQuizAnswersDetail === 'function') {
          existing.quizAnswersDetail = getQuizAnswersDetail(existing.quizAnswers);
        }
        if ((!existing.quizResult || existing.quizResult === 'Not taken' || existing.quizResult === 'Completed' || existing.quizResult.includes('Quiz not taken')) && l.quizResult && !l.quizResult.includes('Quiz not taken') && l.quizResult !== 'Not taken') {
          existing.quizResult = l.quizResult;
        }
        if (!existing.quizResult || existing.quizResult === 'Not taken') {
          if (existing.quizAnswers && Object.keys(existing.quizAnswers).length > 0) {
            existing.quizResult = 'Completed Career Diagnostic Quiz';
          } else {
            existing.quizResult = 'Direct Registration (Quiz not taken)';
          }
        }
        if ((!existing.message || existing.message === 'Not Available') && l.message && l.message !== 'Not Available') {
          existing.message = l.message;
        }
        existing.submissionCount = (existing.submissionCount || 1) + (l.submissionCount || 1);
      } else {
        if (!l.quizAnswers || Object.keys(l.quizAnswers).length === 0) {
          l.quizAnswers = null;
          l.quizAnswersDetail = null;
          if (!l.quizResult || l.quizResult === 'Not taken') {
            l.quizResult = 'Direct Registration (Quiz not taken)';
          }
        } else {
          if (!l.quizAnswersDetail && typeof getQuizAnswersDetail === 'function') {
            l.quizAnswersDetail = getQuizAnswersDetail(l.quizAnswers);
          }
        }
        deduped.push(l);
      }
    });

    return deduped;
  }

  function getStoredLeads() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return normalizeLeads(parsed);
    } catch (e) {
      return [];
    }
  }

  function setStoredLeads(leads) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }

  // Pre-seed demo leads if storage is empty
  if (getStoredLeads().length === 0) {
    setStoredLeads([
      {
        id: 'lead_seed_1',
        name: 'Aarav Sharma',
        phone: '+91 98765 43210',
        phoneDial: '+919876543210',
        phoneWa: '919876543210',
        email: 'aarav.sharma@example.com',
        institution: 'Delhi University',
        role: 'Student',
        gender: 'Male',
        message: 'Passionate about live broadcast anchoring and ground investigative reporting.',
        quizResult: 'Broadcast News Anchor',
        quizAnswers: { q1: 'A', q2: 'C', q3: 'LEADER', q4: 'B', q5: 'B', q6: 'C' },
        status: 'new',
        submittedAt: new Date(Date.now() - 7200000).toISOString(),
        submittedDisplay: 'Today · 2 hrs ago',
        source: 'Pathfinder Quiz'
      },
      {
        id: 'lead_seed_2',
        name: 'Priyanka Sen',
        phone: '+91 98300 12345',
        phoneDial: '+919830012345',
        phoneWa: '919830012345',
        email: 'priyanka.sen@media.in',
        institution: 'Freelance Media Strategist',
        role: 'Professional',
        gender: 'Female',
        message: 'Looking to transition from print copy to investigative video journalism.',
        quizResult: 'Direct Registration (Quiz not taken)',
        quizAnswers: null,
        status: 'contacted',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        submittedDisplay: 'Yesterday · 4:15 PM',
        source: 'Register Page'
      }
    ]);
  }

  window.recordLead = async function(leadData) {
    if (!leadData) return { isDuplicate: false, lead: null };

    if (leadData.phone && leadData.phone !== 'Not Available' && leadData.phone !== '—') {
      const pObj = formatInternationalPhone(leadData.phone);
      if (pObj.formatted) leadData.phone = pObj.formatted;
      if (!leadData.phoneDial && pObj.dial) leadData.phoneDial = pObj.dial;
      if (!leadData.phoneWa && pObj.wa) leadData.phoneWa = pObj.wa;
    }

    const current = getStoredLeads();
    const existingIndex = findExistingLeadIndex(current, leadData);

    let finalLead = leadData;
    let isDuplicate = false;

    if (existingIndex >= 0) {
      // Duplicate phone or email detected! Merge into existing record without duplicating entries
      isDuplicate = true;
      const existing = current[existingIndex];

      finalLead = {
        ...existing,
        ...leadData,
        id: existing.id || leadData.id,
        submittedAt: existing.submittedAt || leadData.submittedAt,
        submittedDisplay: existing.submittedDisplay || leadData.submittedDisplay,
        lastUpdated: new Date().toISOString(),
        submissionCount: (existing.submissionCount || 1) + 1
      };

      // Preserve non-empty values from existing if leadData has placeholder
      if (existing.name && existing.name !== 'Applicant' && existing.name !== 'Not Available' && (!leadData.name || leadData.name === 'Applicant' || leadData.name === 'Not Available')) {
        finalLead.name = existing.name;
      }
      if (existing.email && existing.email.includes('@') && (!leadData.email || !leadData.email.includes('@'))) {
        finalLead.email = existing.email;
      }
      if (existing.phone && existing.phone !== 'Not Available' && (!leadData.phone || leadData.phone === 'Not Available')) {
        finalLead.phone = existing.phone;
        finalLead.phoneDial = existing.phoneDial;
        finalLead.phoneWa = existing.phoneWa;
      }
      if (existing.institution && existing.institution !== '—' && existing.institution !== 'Not Available' && (!leadData.institution || leadData.institution === '—' || leadData.institution === 'Not Available')) {
        finalLead.institution = existing.institution;
      }
      if (existing.gender && existing.gender !== '—' && existing.gender !== 'Not Available' && (!leadData.gender || leadData.gender === '—' || leadData.gender === 'Not Available')) {
        finalLead.gender = existing.gender;
      }
      if (existing.role && existing.role !== '—' && existing.role !== 'Not Available' && (!leadData.role || leadData.role === '—' || leadData.role === 'Not Available')) {
        finalLead.role = existing.role;
      }

      // Merge quiz answers and result
      if (leadData.quizAnswers && Object.keys(leadData.quizAnswers).length > 0) {
        finalLead.quizAnswers = leadData.quizAnswers;
        finalLead.quizAnswersDetail = leadData.quizAnswersDetail || (typeof getQuizAnswersDetail === 'function' ? getQuizAnswersDetail(leadData.quizAnswers) : null);
        if (leadData.quizResult && !leadData.quizResult.includes('Quiz not taken') && leadData.quizResult !== 'Not taken') {
          finalLead.quizResult = leadData.quizResult;
        }
      } else if (existing.quizAnswers && Object.keys(existing.quizAnswers).length > 0) {
        finalLead.quizAnswers = existing.quizAnswers;
        finalLead.quizAnswersDetail = existing.quizAnswersDetail || (typeof getQuizAnswersDetail === 'function' ? getQuizAnswersDetail(existing.quizAnswers) : null);
        if (existing.quizResult && !existing.quizResult.includes('Quiz not taken') && existing.quizResult !== 'Not taken') {
          finalLead.quizResult = existing.quizResult;
        }
      } else {
        finalLead.quizAnswers = null;
        finalLead.quizAnswersDetail = null;
        if (!finalLead.quizResult || finalLead.quizResult === 'Not taken') {
          finalLead.quizResult = 'Direct Registration (Quiz not taken)';
        }
      }

      if (existing.source && leadData.source && existing.source !== leadData.source && !existing.source.includes(leadData.source)) {
        finalLead.source = `${existing.source} + ${leadData.source}`;
      }

      current.splice(existingIndex, 1);
      current.unshift(finalLead);
    } else {
      if (!finalLead.quizAnswers || Object.keys(finalLead.quizAnswers).length === 0) {
        finalLead.quizAnswers = null;
        finalLead.quizAnswersDetail = null;
        if (!finalLead.quizResult || finalLead.quizResult === 'Not taken') {
          finalLead.quizResult = 'Direct Registration (Quiz not taken)';
        }
      } else {
        if (!finalLead.quizAnswersDetail && typeof getQuizAnswersDetail === 'function') {
          finalLead.quizAnswersDetail = getQuizAnswersDetail(finalLead.quizAnswers);
        }
        if (!finalLead.quizResult || finalLead.quizResult === 'Not taken') {
          finalLead.quizResult = window.lastQuizResultTitle || 'Completed Career Diagnostic Quiz';
        }
      }
      current.unshift(finalLead);
    }

    setStoredLeads(current);

    if (leadsRef) {
      try {
        await leadsRef.child(finalLead.id).set(finalLead);
      } catch (err) {
        console.warn('Firebase RTDB write notice:', err);
      }
    }

    if (document.getElementById('adminPanel') && typeof renderAdminTable === 'function') {
      allAdminLeads = getStoredLeads();
      updateAdminStats();
      renderAdminTable();
    }

    return { isDuplicate, lead: finalLead };
  };

  // ─── Admin Login & Panel Engine ───────────────────────────────
  let allAdminLeads = [];
  let currentAdminFilter = 'all';
  let adminSearchQuery = '';

  const rawAdminEmails = (env.ADMIN_EMAILS && !env.ADMIN_EMAILS.startsWith('${')) ? env.ADMIN_EMAILS :
                         (env.ADMIN_EMAIL && !env.ADMIN_EMAIL.startsWith('${')) ? env.ADMIN_EMAIL :
                         'admin@journalismlab.in,soumalya9862@gmail.com,minalpareek18@gmail.com';

  const authorizedAdminEmails = rawAdminEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const adminPassword = (env.ADMIN_PASSWORD && !env.ADMIN_PASSWORD.startsWith('${')) ? env.ADMIN_PASSWORD : 'JLab@2026!';

  function openAdminLogin() {
    if (document.getElementById('adminLoginOverlay')) return;

    const defaultEmailPlaceholder = authorizedAdminEmails[0] || 'admin@journalismlab.in';

    const modalHTML = `
      <div class="modal-overlay active" id="adminLoginOverlay" style="z-index:10006;">
        <div class="modal-box modal-box--admin-login">
          <button type="button" class="modal-close" id="adminLoginCloseBtn" aria-label="Close login dialog">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="modal-header">
            <div class="modal-icon-badge" style="background:#09090b; color:#ffffff; border-color:#09090b;">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <h3 class="modal-title">Admin Access</h3>
            <p class="modal-sub">Sign in to manage student registrations & cohort applicants.</p>
          </div>
          <form id="adminLoginForm">
            <div class="form-group">
              <label for="adminEmailInput" style="color:var(--text-secondary)">Admin Email</label>
              <input type="email" id="adminEmailInput" placeholder="${defaultEmailPlaceholder}" required />
            </div>
            <div class="form-group" style="margin-top:0.75rem;">
              <label for="adminPassInput" style="color:var(--text-secondary)">Password</label>
              <input type="password" id="adminPassInput" placeholder="••••••••" required />
            </div>
            <div id="adminLoginErr" class="admin-login-error" style="display:none;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span id="adminLoginErrMsg">Invalid credentials. Please verify your email and password.</span>
            </div>
            <button type="submit" class="btn btn--primary btn--full" style="margin-top:1.25rem;">
              Access Admin Panel <i class="fa-solid fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const overlay = document.getElementById('adminLoginOverlay');
    const passInput = document.getElementById('adminPassInput');
    const form = document.getElementById('adminLoginForm');
    const closeBtn = document.getElementById('adminLoginCloseBtn');
    const errBox = document.getElementById('adminLoginErr');
    const errMsg = document.getElementById('adminLoginErrMsg');

    setTimeout(() => {
      const emailInput = document.getElementById('adminEmailInput');
      if (emailInput && !emailInput.value) {
        emailInput.focus();
      } else if (passInput) {
        passInput.focus();
      }
    }, 120);

    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredEmail = document.getElementById('adminEmailInput').value.trim().toLowerCase();
      const enteredPass  = passInput.value;

      const isEmailAuthorized = (authorizedAdminEmails.length === 0 || authorizedAdminEmails.includes(enteredEmail));
      const isPassValid = (enteredPass === adminPassword);

      if (isEmailAuthorized && isPassValid) {
        overlay.remove();
        openAdminPanel();
      } else {
        if (errMsg) {
          if (!isEmailAuthorized) {
            errMsg.textContent = 'Access Denied: This email is not authorized for administrator access.';
          } else {
            errMsg.textContent = 'Incorrect password. Please verify your administrator credentials.';
          }
        }
        errBox.style.display = 'flex';
        passInput.value = '';
        passInput.focus();
      }
    });
  }

  function buildAdminPanelHTML() {
    return `
      <div class="admin-panel" id="adminPanel">
        <header class="admin-header">
          <div class="admin-header__brand">
            ● Journalism<em>Lab</em>
            <span class="admin-header__badge">
              <i class="fa-solid fa-database"></i> Firebase RTDB Admin
            </span>
          </div>

          <div class="admin-header__actions">
            <div class="admin-search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="adminSearchInput" placeholder="Search name, phone, email, institution…" autocomplete="off" />
            </div>
            <button type="button" class="btn btn--sm btn--ghost" id="adminExportCsvBtn" title="Export CSV spreadsheet">
              <i class="fa-solid fa-file-csv"></i> Export CSV
            </button>
            <button type="button" class="btn btn--sm btn--ghost" id="adminRefreshBtn" title="Sync latest data">
              <i class="fa-solid fa-arrows-rotate"></i> Refresh
            </button>
            <button type="button" class="btn btn--sm btn--primary" id="adminCloseBtn">
              <i class="fa-solid fa-xmark"></i> Exit Admin
            </button>
          </div>
        </header>

        <main class="admin-body">
          <div class="admin-stats-row">
            <div class="admin-stat">
              <span class="admin-stat__num" id="statTotalLeads">0</span>
              <span class="admin-stat__label"><i class="fa-solid fa-users"></i> Total Registrations</span>
            </div>
            <div class="admin-stat">
              <span class="admin-stat__num stat--new" id="statNewLeads">0</span>
              <span class="admin-stat__label"><i class="fa-solid fa-bell"></i> New Inquiries</span>
            </div>
            <div class="admin-stat">
              <span class="admin-stat__num stat--contacted" id="statContactedLeads">0</span>
              <span class="admin-stat__label"><i class="fa-solid fa-comments"></i> In Contact</span>
            </div>
            <div class="admin-stat">
              <span class="admin-stat__num stat--confirmed" id="statConfirmedLeads">0</span>
              <span class="admin-stat__label"><i class="fa-solid fa-circle-check"></i> Confirmed (Batch 1)</span>
            </div>
          </div>

          <div class="admin-table-wrap">
            <div class="admin-table-header">
              <h3>Applicant Directory</h3>
              <span id="adminTableCount" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">
                Showing 0 applicants
              </span>
            </div>

            <div class="admin-filters" id="adminFilters">
              <button type="button" class="admin-filter-btn active" data-filter="all">All Registrations</button>
              <button type="button" class="admin-filter-btn" data-filter="new">New</button>
              <button type="button" class="admin-filter-btn" data-filter="contacted">Contacted</button>
              <button type="button" class="admin-filter-btn" data-filter="confirmed">Confirmed</button>
              <button type="button" class="admin-filter-btn" data-filter="student">Students</button>
              <button type="button" class="admin-filter-btn" data-filter="professional">Professionals</button>
            </div>

            <div style="overflow-x:auto;">
              <table class="admin-table" id="adminTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Applicant Name</th>
                    <th>Role</th>
                    <th>Gender</th>
                    <th>WhatsApp & Phone</th>
                    <th>Email</th>
                    <th>Current Institution</th>
                    <th>Quiz Career Result</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="adminTableBody">
                  <tr><td colspan="11" style="text-align:center; padding:2.5rem; color:var(--text-muted);">Loading registrations…</td></tr>
                </tbody>
              </table>
            </div>

            <div class="admin-actions-bar">
              <span id="adminCountMeta" style="font-size:0.8rem; color:var(--text-muted);"></span>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn--sm btn--ghost" id="adminAddMockBtn">
                  <i class="fa-solid fa-plus"></i> Add Test Lead
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  function openAdminPanel() {
    if (document.getElementById('adminPanel')) {
      document.getElementById('adminPanel').classList.add('open');
      loadAdminLeads();
      return;
    }

    document.body.insertAdjacentHTML('beforeend', buildAdminPanelHTML());
    const panel = document.getElementById('adminPanel');
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Controls
    document.getElementById('adminCloseBtn').addEventListener('click', () => {
      panel.classList.remove('open');
      document.body.style.overflow = '';
      if (window.location.hash === '#admin') {
        history.replaceState(null, null, window.location.pathname);
      }
    });

    const searchInput = document.getElementById('adminSearchInput');
    searchInput.addEventListener('input', (e) => {
      adminSearchQuery = e.target.value.toLowerCase().trim();
      renderAdminTable();
    });

    const filterContainer = document.getElementById('adminFilters');
    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.admin-filter-btn');
      if (!btn) return;
      filterContainer.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAdminFilter = btn.dataset.filter;
      renderAdminTable();
    });

    document.getElementById('adminRefreshBtn').addEventListener('click', loadAdminLeads);
    document.getElementById('adminExportCsvBtn').addEventListener('click', exportLeadsCSV);

    document.getElementById('adminAddMockBtn').addEventListener('click', () => {
      const testNames = ['Tanvi Mukherjee', 'Rohan Bose', 'Meera Kapoor', 'Aditya Verma'];
      const colleges = ['Jadavpur University', 'St. Xavier\'s College', 'Amity Media School', 'Symbiosis Media'];
      const roles = ['Student', 'Professional'];
      const mockArchetypes = ['Public Speaker', 'Broadcast News Anchor', 'News Reporter', 'PR Manager', 'Digital Influencer'];

      const randomName = testNames[Math.floor(Math.random() * testNames.length)];
      const randomCollege = colleges[Math.floor(Math.random() * colleges.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const genders = ['Female', 'Male', 'Non-binary / Other', 'Prefer not to say'];
      const randomGender = genders[Math.floor(Math.random() * genders.length)];
      const randomDigits = String(Math.floor(9000000000 + Math.random() * 999999999));
      const phoneObj = formatInternationalPhone(randomDigits);

      const isQuizMock = Math.random() > 0.5;
      const mockAnswers = isQuizMock ? {
        q1: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        q2: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        q3: ['LEADER', 'FOCUS', 'STORY', 'TRUTH'][Math.floor(Math.random() * 4)],
        q4: ['A', 'B'][Math.floor(Math.random() * 2)],
        q5: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        q6: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      } : null;

      const randomResult = isQuizMock
        ? mockArchetypes[Math.floor(Math.random() * mockArchetypes.length)]
        : 'Direct Registration (Quiz not taken)';

      const mockLead = {
        id: 'lead_' + Date.now(),
        name: randomName,
        phone: phoneObj.formatted,
        phoneDial: phoneObj.dial,
        phoneWa: phoneObj.wa,
        email: randomName.toLowerCase().replace(' ', '.') + '@gmail.com',
        institution: randomCollege,
        role: randomRole,
        gender: randomGender,
        message: 'Interested in learning from Prof. Dr. Minal Pareek in Batch 01.',
        quizResult: randomResult,
        quizAnswers: mockAnswers,
        quizAnswersDetail: isQuizMock ? getQuizAnswersDetail(mockAnswers) : null,
        status: 'new',
        submittedAt: new Date().toISOString(),
        submittedDisplay: 'Just now',
        source: isQuizMock ? 'Pathfinder Quiz (Test)' : 'Register Page (Test)'
      };

      window.recordLead(mockLead);
    });

    loadAdminLeads();
  }

  function loadAdminLeads() {
    if (leadsRef) {
      leadsRef.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          allAdminLeads = normalizeLeads(Object.keys(val).map(key => ({
            id: key,
            ...val[key]
          })).reverse());
          setStoredLeads(allAdminLeads);
        } else {
          allAdminLeads = normalizeLeads(getStoredLeads());
        }
        updateAdminStats();
        renderAdminTable();
      }, (err) => {
        console.warn('Realtime Database listener notice:', err);
        allAdminLeads = normalizeLeads(getStoredLeads());
        updateAdminStats();
        renderAdminTable();
      });
    } else {
      allAdminLeads = normalizeLeads(getStoredLeads());
      updateAdminStats();
      renderAdminTable();
    }
  }

  function updateAdminStats() {
    const total = allAdminLeads.length;
    const countNew = allAdminLeads.filter(l => l.status === 'new').length;
    const countContacted = allAdminLeads.filter(l => l.status === 'contacted').length;
    const countConfirmed = allAdminLeads.filter(l => l.status === 'confirmed').length;

    const elTotal = document.getElementById('statTotalLeads');
    const elNew = document.getElementById('statNewLeads');
    const elContacted = document.getElementById('statContactedLeads');
    const elConfirmed = document.getElementById('statConfirmedLeads');

    if (elTotal) elTotal.textContent = total;
    if (elNew) elNew.textContent = countNew;
    if (elContacted) elContacted.textContent = countContacted;
    if (elConfirmed) elConfirmed.textContent = countConfirmed;
  }

  function filterAdminLeads() {
    return allAdminLeads.filter(lead => {
      const isQuizLead = !lead.name || lead.name.trim() === '' || lead.name === 'Not Available' || lead.name.startsWith('Quiz Lead');
      const roleLower = (lead.role || '').toLowerCase();
      const isRoleNA = !lead.role || lead.role === 'Not Available' || lead.role === 'Quiz Lead' || (isQuizLead && roleLower === 'student');

      if (currentAdminFilter === 'new' && lead.status !== 'new') return false;
      if (currentAdminFilter === 'contacted' && lead.status !== 'contacted') return false;
      if (currentAdminFilter === 'confirmed' && lead.status !== 'confirmed') return false;
      if (currentAdminFilter === 'student' && (isRoleNA || roleLower !== 'student')) return false;
      if (currentAdminFilter === 'professional' && (isRoleNA || roleLower !== 'professional')) return false;

      if (adminSearchQuery) {
        const pool = [
          isQuizLead ? 'not available' : (lead.name || ''),
          lead.phone,
          lead.phoneDial,
          lead.phoneWa,
          lead.email,
          lead.gender,
          lead.institution,
          isRoleNA ? 'not available' : lead.role,
          lead.quizResult,
          lead.message
        ].join(' ').toLowerCase();

        if (!pool.includes(adminSearchQuery)) return false;
      }

      return true;
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function openLeadProfileModal(id) {
    const lead = allAdminLeads.find(l => l.id === id);
    if (!lead) return;

    // Remove existing profile overlay if already open
    const existing = document.getElementById('adminProfileOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'adminProfileOverlay';
    overlay.style.zIndex = '10010';

    function renderModal(isEditing = false, showSuccess = false) {
      const isQuizLead = !lead.name || lead.name.trim() === '' || lead.name === 'Not Available' || lead.name.startsWith('Quiz Lead');
      const displayName = isQuizLead ? '<span style="color:var(--text-secondary); font-style:italic;">Not Available</span>' : escapeHTML(lead.name);
      
      const roleLower = (lead.role || '').toLowerCase();
      const isRoleNA = !lead.role || lead.role === 'Not Available' || lead.role === 'Quiz Lead' || (isQuizLead && roleLower === 'student');

      const answersDetail = lead.quizAnswersDetail || (lead.quizAnswers ? getQuizAnswersDetail(lead.quizAnswers) : null);
      const hasQuiz = Boolean(lead.quizAnswers && Object.keys(lead.quizAnswers).length > 0) &&
                      !(lead.quizResult && lead.quizResult.includes('Quiz not taken'));

      let roleBadge = '';
      if (isRoleNA) {
        roleBadge = `<span class="role-badge role-badge--na"><i class="fa-solid fa-circle-question"></i> <span>Not Available</span></span>`;
      } else if (roleLower === 'professional') {
        roleBadge = `<span class="role-badge role-badge--professional"><i class="fa-solid fa-briefcase"></i> <span>Professional</span></span>`;
      } else {
        roleBadge = `<span class="role-badge role-badge--student"><i class="fa-solid fa-user-graduate"></i> <span>Student</span></span>`;
      }

      const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
      const phoneObj = formatInternationalPhone(lead.phone);
      const waNumber = lead.phoneWa || phoneObj.wa || (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone);
      const dialNumber = lead.phoneDial || phoneObj.dial || (cleanPhone ? '+' + (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone) : '');
      const displayPhone = lead.phone || phoneObj.formatted || 'Not Available';
      const waName = !isQuizLead ? lead.name : 'there';
      const waText = encodeURIComponent(`Hi ${waName}, this is Prof. Dr. Minal Pareek's team regarding your JournalismLab application!`);

      const genderVal = (lead.gender && lead.gender !== '—' && lead.gender !== 'Not Available') ? lead.gender : '';

      const isIncomplete = isQuizLead || isRoleNA || (!lead.institution || lead.institution === '—' || lead.institution === 'Not Available');

      if (!isEditing) {
        overlay.innerHTML = `
          <div class="modal-box modal-box--profile" role="dialog" aria-labelledby="profileCardTitle">
            <button type="button" class="modal-close" id="adminProfileCloseBtn" aria-label="Close profile card">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="profile-card-header">
              <div class="profile-card-identity">
                <div class="profile-card-avatar">
                  <i class="fa-solid ${isQuizLead ? 'fa-id-card-clip' : 'fa-user'}"></i>
                </div>
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; flex-wrap:wrap;">
                    <h3 class="profile-card-name" id="profileCardTitle">${displayName}</h3>
                    <button type="button" class="btn btn--xs btn--ghost" id="adminProfileHeaderEditBtn" title="Edit student details while connected on call">
                      <i class="fa-solid fa-pen-to-square"></i> Edit Details
                    </button>
                  </div>
                  <div class="profile-card-badges">
                    ${roleBadge}
                    ${genderVal ? `
                      <span class="role-badge" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1;">
                        <i class="fa-solid fa-venus-mars"></i> <span>${escapeHTML(genderVal)}</span>
                      </span>
                    ` : ''}
                    <span class="role-badge status-${lead.status || 'new'}">
                      <i class="fa-solid fa-circle-dot"></i> <span style="text-transform:capitalize;">${escapeHTML(lead.status || 'new')}</span>
                    </span>
                    ${hasQuiz ? `
                      <span class="role-badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;">
                        <i class="fa-solid fa-compass"></i> <span>${escapeHTML(lead.quizResult || 'Quiz Completed')}</span>
                      </span>
                    ` : `
                      <span class="role-badge" style="background:#f8fafc; color:#64748b; border:1px solid #cbd5e1;">
                        <i class="fa-solid fa-file-pen"></i> <span>Direct Registration</span>
                      </span>
                    `}
                    <span class="role-badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">
                      <i class="fa-solid fa-route"></i> <span>${escapeHTML(lead.source || 'Website')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            ${showSuccess ? `
              <div class="profile-save-success">
                <i class="fa-solid fa-circle-check"></i>
                <span>Student profile details saved and synced to database!</span>
              </div>
            ` : ''}

            ${isIncomplete ? `
              <div class="profile-quiz-banner">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <i class="fa-solid fa-circle-info" style="color:var(--crimson); font-size:1rem;"></i>
                  <div style="font-size:0.82rem; color:var(--text-secondary); line-height:1.4;">
                    <strong>Incomplete Info:</strong> Student name or college missing. Fill them in while on the call.
                  </div>
                </div>
                <button type="button" class="btn btn--xs btn--primary" id="adminProfileBannerEditBtn">
                  <i class="fa-solid fa-user-pen"></i> Fill Details
                </button>
              </div>
            ` : ''}

            <div class="profile-card-grid">
              <div class="profile-field-item">
                <div class="profile-field-label">Mobile / WhatsApp Number</div>
                <div class="profile-field-value" style="display:flex; align-items:center; gap:0.5rem;">
                  <a href="tel:${escapeHTML(dialNumber || lead.phone || '')}" style="color:var(--text-primary); text-decoration:none; font-family:var(--font-mono); font-weight:700;">
                    ${escapeHTML(displayPhone)}
                  </a>
                  ${waNumber ? `
                    <a href="https://wa.me/${waNumber}?text=${waText}" target="_blank" rel="noopener noreferrer" style="color:#25d366; font-size:1.05rem;" title="Chat on WhatsApp">
                      <i class="fa-brands fa-whatsapp"></i>
                    </a>
                  ` : ''}
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Email Address</div>
                <div class="profile-field-value">
                  ${lead.email && lead.email !== '—' && lead.email !== 'Not Available' && !lead.email.includes('quiz-visitor') ? `
                    <a href="mailto:${escapeHTML(lead.email)}" style="color:var(--text-primary); text-decoration:underline;">
                      ${escapeHTML(lead.email)}
                    </a>
                  ` : '<span style="color:var(--text-muted); font-style:italic;">Not Available</span>'}
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Applicant Role</div>
                <div class="profile-field-value">
                  ${isRoleNA ? '<span style="color:var(--text-muted); font-style:italic;">Not Available</span>' : escapeHTML(lead.role)}
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Gender</div>
                <div class="profile-field-value">
                  ${genderVal ? escapeHTML(genderVal) : '<span style="color:var(--text-muted); font-style:italic;">Not Available</span>'}
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Current Institution</div>
                <div class="profile-field-value">
                  ${lead.institution && lead.institution !== '—' && lead.institution !== 'Not Available' ? escapeHTML(lead.institution) : '<span style="color:var(--text-muted); font-style:italic;">Not Available</span>'}
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Diagnosed Career Archetype / Mode</div>
                <div class="profile-field-value" style="font-weight:700; color:var(--text-primary);">
                  ${hasQuiz
                    ? `<i class="fa-solid fa-compass" style="color:var(--crimson); margin-right:0.3rem;"></i> ${escapeHTML(lead.quizResult || 'Quiz Completed')}`
                    : `<span style="color:var(--text-muted); font-size:0.85rem; font-weight:600;"><i class="fa-solid fa-file-pen" style="margin-right:0.3rem;"></i> Direct Registration (Quiz not taken)</span>`
                  }
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Submission Date &amp; Time</div>
                <div class="profile-field-value" style="font-family:var(--font-mono); font-size:0.82rem; color:var(--text-secondary);">
                  ${escapeHTML(lead.submittedDisplay || lead.submittedAt || '—')}
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Lead Registration ID</div>
                <div class="profile-field-value" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">
                  ${escapeHTML(lead.id)}
                </div>
              </div>
            </div>

            ${hasQuiz && answersDetail && answersDetail.length > 0 ? `
              <div class="profile-quiz-answers-box">
                <div class="profile-quiz-answers-header">
                  <h4>
                    <i class="fa-solid fa-list-check" style="color:var(--crimson);"></i>
                    Career Diagnostic Responses (${answersDetail.length} Questions Answered)
                  </h4>
                  <span class="role-badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-size:0.72rem;">
                    <i class="fa-solid fa-check"></i> Diagnostic Completed
                  </span>
                </div>
                <div class="profile-quiz-answers-grid">
                  ${answersDetail.map(item => `
                    <div class="profile-quiz-q-item">
                      <div class="profile-quiz-q-num">
                        <span>${escapeHTML(item.num)}</span>
                        <span style="font-size:0.65rem; color:var(--text-muted); font-weight:500;">Answered</span>
                      </div>
                      <div class="profile-quiz-q-text">${escapeHTML(item.question)}</div>
                      <div class="profile-quiz-q-ans">${escapeHTML(item.label)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div class="profile-quiz-answers-box" style="background:var(--bg-subtle); border:1px dashed var(--border-medium); display:flex; align-items:center; gap:0.85rem; padding:1rem 1.15rem;">
                <div style="width:38px; height:38px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:1rem; flex-shrink:0;">
                  <i class="fa-solid fa-file-pen"></i>
                </div>
                <div style="font-size:0.83rem; color:var(--text-secondary); line-height:1.45;">
                  <strong style="color:var(--text-primary); font-size:0.88rem;">Direct Registration (Quiz not taken)</strong><br />
                  This applicant registered directly via the registration form without attending the career diagnostic quiz.
                </div>
              </div>
            `}

            <div class="profile-message-box">
              <div class="profile-field-label" style="margin-bottom:0.35rem;">
                <i class="fa-solid fa-comment-dots"></i> Application Notes / Call Remarks
              </div>
              <p>${(lead.message && lead.message !== 'Not Available' && !lead.message.startsWith('Completed Career Diagnostic Quiz')) ? escapeHTML(lead.message) : '<em style="color:var(--text-muted); font-style:italic;">Not Available</em>'}</p>
            </div>

            <div class="profile-card-footer">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <label for="profileCardStatusSelect" style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">
                  Status:
                </label>
                <select id="profileCardStatusSelect" class="admin-status-select status-${lead.status || 'new'}">
                  <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                  <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                  <option value="confirmed" ${lead.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="rejected" ${lead.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
              </div>

              <div style="display:flex; align-items:center; gap:0.5rem;">
                ${cleanPhone ? `
                  <a href="https://wa.me/${waNumber}?text=${waText}" target="_blank" rel="noopener noreferrer" class="btn btn--sm" style="background:#25d366; color:#ffffff; border-color:#25d366;">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp
                  </a>
                ` : ''}
                <button type="button" class="btn btn--sm btn--ghost" id="adminProfileFooterEditBtn">
                  <i class="fa-solid fa-pen-to-square"></i> Edit Details
                </button>
                <button type="button" class="btn btn--sm btn--primary" id="adminProfileDoneBtn">
                  Done
                </button>
              </div>
            </div>
          </div>
        `;

        // Attach View Mode handlers
        const closeProfile = () => overlay.remove();
        overlay.querySelector('#adminProfileCloseBtn').addEventListener('click', closeProfile);
        overlay.querySelector('#adminProfileDoneBtn').addEventListener('click', closeProfile);

        const hEdit = overlay.querySelector('#adminProfileHeaderEditBtn');
        if (hEdit) hEdit.addEventListener('click', () => renderModal(true));

        const bEdit = overlay.querySelector('#adminProfileBannerEditBtn');
        if (bEdit) bEdit.addEventListener('click', () => renderModal(true));

        const fEdit = overlay.querySelector('#adminProfileFooterEditBtn');
        if (fEdit) fEdit.addEventListener('click', () => renderModal(true));

        const statusSelect = overlay.querySelector('#profileCardStatusSelect');
        if (statusSelect) {
          statusSelect.addEventListener('change', async () => {
            const newStatus = statusSelect.value;
            statusSelect.className = `admin-status-select status-${newStatus}`;
            lead.status = newStatus;
            setStoredLeads(allAdminLeads);
            updateAdminStats();
            renderAdminTable();

            if (leadsRef) {
              try {
                await leadsRef.child(lead.id).update({ status: newStatus });
              } catch (err) {
                console.warn('Realtime Database status update notice:', err);
              }
            }
          });
        }
      } else {
        // Edit Mode
        overlay.innerHTML = `
          <div class="modal-box modal-box--profile" role="dialog" aria-labelledby="profileEditTitle">
            <button type="button" class="modal-close" id="adminProfileCloseBtn" aria-label="Cancel editing">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="profile-card-header">
              <div class="profile-card-identity">
                <div class="profile-card-avatar" style="background:#fef2f2; border-color:#fecaca; color:var(--crimson);">
                  <i class="fa-solid fa-user-pen"></i>
                </div>
                <div>
                  <h3 class="profile-card-name" id="profileEditTitle" style="font-size:1.25rem;">Edit Student Information</h3>
                  <p style="margin:0; font-size:0.8rem; color:var(--text-muted);">
                    Record or update details while speaking with the student on call / WhatsApp
                  </p>
                </div>
              </div>
            </div>

            <form id="adminLeadEditForm" class="profile-edit-form">
              <div class="profile-edit-grid">
                <div class="profile-edit-group">
                  <label class="profile-field-label" for="editLeadName">Student Full Name *</label>
                  <input type="text" id="editLeadName" class="profile-edit-input" value="${isQuizLead ? '' : escapeHTML(lead.name)}" placeholder="Enter student's full name" required />
                </div>

                <div class="profile-edit-group">
                  <label class="profile-field-label" for="editLeadRole">Applicant Role</label>
                  <select id="editLeadRole" class="profile-edit-input">
                    <option value="Student" ${lead.role !== 'Professional' ? 'selected' : ''}>Student</option>
                    <option value="Professional" ${lead.role === 'Professional' ? 'selected' : ''}>Professional</option>
                  </select>
                </div>

                <div class="profile-edit-group">
                  <label class="profile-field-label" for="editLeadGender">Gender</label>
                  <select id="editLeadGender" class="profile-edit-input">
                    <option value="Not Available" ${(!genderVal || genderVal === 'Not Available') ? 'selected' : ''}>Not Available</option>
                    <option value="Female" ${genderVal === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Male" ${genderVal === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Non-binary / Other" ${genderVal === 'Non-binary / Other' ? 'selected' : ''}>Non-binary / Other</option>
                    <option value="Prefer not to say" ${genderVal === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
                  </select>
                </div>

                <div class="profile-edit-group">
                  <label class="profile-field-label" for="editLeadPhone">Mobile / WhatsApp Number *</label>
                  <input type="tel" id="editLeadPhone" class="profile-edit-input" value="${escapeHTML(displayPhone === 'Not Available' ? '' : displayPhone)}" placeholder="+91 00000 00000" required />
                </div>

                <div class="profile-edit-group">
                  <label class="profile-field-label" for="editLeadEmail">Email Address</label>
                  <input type="email" id="editLeadEmail" class="profile-edit-input" value="${lead.email && !lead.email.includes('quiz-visitor') && lead.email !== 'Not Available' ? escapeHTML(lead.email) : ''}" placeholder="e.g. student@gmail.com" />
                </div>

                <div class="profile-edit-group">
                  <label class="profile-field-label" for="editLeadInstitution">College / University / Organization</label>
                  <input type="text" id="editLeadInstitution" class="profile-edit-input" value="${lead.institution && lead.institution !== '—' && lead.institution !== 'Not Available' ? escapeHTML(lead.institution) : ''}" placeholder="e.g. Jadavpur University, Media Dept" />
                </div>

                <div class="profile-edit-group">
                  <label class="profile-field-label" for="editLeadStatus">Inquiry / Enrollment Status</label>
                  <select id="editLeadStatus" class="profile-edit-input">
                    <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="confirmed" ${lead.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="rejected" ${lead.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                  </select>
                </div>

                <div class="profile-edit-group" style="grid-column: 1 / -1;">
                  <label class="profile-field-label" for="editLeadMessage">Call Remarks / Conversation Notes</label>
                  <textarea id="editLeadMessage" class="profile-edit-input" rows="3" placeholder="Add notes from your conversation (batch preference, topics of interest, questions asked, etc.)...">${(lead.message && lead.message !== 'Not Available' && !lead.message.startsWith('Completed Career Diagnostic Quiz')) ? escapeHTML(lead.message) : ''}</textarea>
                </div>
              </div>

              <div class="profile-edit-actions">
                <button type="button" class="btn btn--sm btn--ghost" id="adminProfileCancelEditBtn">
                  <i class="fa-solid fa-xmark"></i> Cancel
                </button>
                <button type="submit" class="btn btn--sm btn--primary" id="adminProfileSaveBtn">
                  <i class="fa-solid fa-check"></i> Save to Database
                </button>
              </div>
            </form>
          </div>
        `;

        // Attach Edit Mode handlers
        const closeProfile = () => overlay.remove();
        overlay.querySelector('#adminProfileCloseBtn').addEventListener('click', closeProfile);
        overlay.querySelector('#adminProfileCancelEditBtn').addEventListener('click', () => renderModal(false));

        const editForm = overlay.querySelector('#adminLeadEditForm');
        editForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const enteredName = overlay.querySelector('#editLeadName').value.trim();
          const enteredRole = overlay.querySelector('#editLeadRole').value;
          const enteredGender = overlay.querySelector('#editLeadGender').value;
          const enteredPhone = overlay.querySelector('#editLeadPhone').value.trim();
          const enteredEmail = overlay.querySelector('#editLeadEmail').value.trim();
          const enteredInst = overlay.querySelector('#editLeadInstitution').value.trim();
          const enteredStatus = overlay.querySelector('#editLeadStatus').value;
          const enteredMsg = overlay.querySelector('#editLeadMessage').value.trim();

          const pObj = formatInternationalPhone(enteredPhone);

          lead.name = enteredName || 'Not Available';
          lead.role = enteredRole || 'Not Available';
          lead.gender = enteredGender || 'Not Available';
          lead.phone = pObj.formatted || enteredPhone || 'Not Available';
          lead.phoneDial = pObj.dial || lead.phoneDial || '';
          lead.phoneWa = pObj.wa || lead.phoneWa || '';
          lead.email = enteredEmail || 'Not Available';
          lead.institution = enteredInst || 'Not Available';
          lead.status = enteredStatus;
          lead.message = enteredMsg || 'Not Available';
          lead.adminVerified = true;

          // Save to LocalStorage
          setStoredLeads(allAdminLeads);
          updateAdminStats();
          renderAdminTable();

          // Save to Firebase RTDB
          if (leadsRef) {
            try {
              await leadsRef.child(lead.id).update({
                name: lead.name,
                role: lead.role,
                gender: lead.gender,
                phone: lead.phone,
                phoneDial: lead.phoneDial,
                phoneWa: lead.phoneWa,
                email: lead.email,
                institution: lead.institution,
                status: lead.status,
                message: lead.message,
                adminVerified: true
              });
            } catch (err) {
              console.warn('Firebase RTDB update notice:', err);
            }
          }

          // Return to View Mode with success message
          renderModal(false, true);
        });
      }
    }

    renderModal(false);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    const countMeta = document.getElementById('adminCountMeta');
    const tableCount = document.getElementById('adminTableCount');
    if (!tbody) return;

    const filtered = filterAdminLeads();

    if (countMeta) countMeta.textContent = `Showing ${filtered.length} of ${allAdminLeads.length} total registrations`;
    if (tableCount) tableCount.textContent = `${filtered.length} results`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align:center; padding:3rem; color:var(--text-muted); font-style:italic;">
            No registrations found matching the current search or filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((lead, idx) => {
      const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
      const phoneObj = formatInternationalPhone(lead.phone);
      const waNumber = lead.phoneWa || phoneObj.wa || (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone);
      const dialNumber = lead.phoneDial || phoneObj.dial || (cleanPhone ? '+' + (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone) : '');
      const displayPhone = lead.phone || phoneObj.formatted || '—';
      const isQuizLead = !lead.name || lead.name.trim() === '' || lead.name === 'Not Available' || lead.name.startsWith('Quiz Lead');
      const displayName = isQuizLead ? '<span style="color:var(--text-secondary); font-weight:600; font-style:italic;">Not Available</span>' : `<strong>${escapeHTML(lead.name)}</strong>`;
      const waName = !isQuizLead ? lead.name : 'there';
      const waText = encodeURIComponent(`Hi ${waName}, this is Prof. Dr. Minal Pareek's team regarding your JournalismLab application!`);

      const roleLower = (lead.role || '').toLowerCase();
      const isRoleNA = !lead.role || lead.role === 'Not Available' || lead.role === 'Quiz Lead' || (isQuizLead && roleLower === 'student');

      let roleBadge = '';
      if (isRoleNA) {
        roleBadge = `<span class="role-badge role-badge--na"><i class="fa-solid fa-circle-question"></i> <span>Not Available</span></span>`;
      } else if (roleLower === 'professional') {
        roleBadge = `<span class="role-badge role-badge--professional"><i class="fa-solid fa-briefcase"></i> <span>Professional</span></span>`;
      } else {
        roleBadge = `<span class="role-badge role-badge--student"><i class="fa-solid fa-user-graduate"></i> <span>Student</span></span>`;
      }

      const genderVal = (lead.gender && lead.gender !== '—' && lead.gender !== 'Not Available') ? lead.gender : '';
      const genderDisplay = genderVal
        ? `<span class="role-badge" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1;"><i class="fa-solid fa-venus-mars"></i> <span>${escapeHTML(genderVal)}</span></span>`
        : `<span style="color:var(--text-muted); font-size:0.82rem; font-style:italic;">Not Available</span>`;

      const hasQuiz = Boolean(lead.quizAnswers && Object.keys(lead.quizAnswers).length > 0) &&
                      !(lead.quizResult && lead.quizResult.includes('Quiz not taken'));
      let quizResultCell = '';
      if (hasQuiz) {
        quizResultCell = `
          <span class="role-badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;" title="Diagnosed archetype from quiz responses">
            <i class="fa-solid fa-compass"></i> <span>${escapeHTML(lead.quizResult || 'Quiz Completed')}</span>
          </span>
        `;
      } else {
        quizResultCell = `
          <span class="role-badge" style="background:#f8fafc; color:#64748b; border:1px solid #cbd5e1; font-size:0.75rem; text-align:left;" title="Direct application without taking career quiz">
            <i class="fa-solid fa-file-pen"></i> <span>Direct Registration<br><small style="font-size:0.68rem; font-weight:500; opacity:0.85;">(Quiz not taken)</small></span>
          </span>
        `;
      }

      const statusClass = `status-${lead.status || 'new'}`;

      return `
        <tr>
          <td style="color:var(--text-light); font-family:var(--font-mono); font-size:0.75rem;">${idx + 1}</td>
          <td>
            <button type="button" class="admin-applicant-link admin-view-lead-btn" data-id="${escapeHTML(lead.id)}" title="Click to view student profile card">
              ${displayName}
            </button>
            ${(lead.submissionCount && lead.submissionCount > 1) ? `<span class="role-badge" style="background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; font-size:0.68rem; margin-left:0.35rem;" title="${lead.submissionCount} submissions received"><i class="fa-solid fa-repeat"></i> ${lead.submissionCount}x</span>` : ''}
            ${(lead.message && lead.message !== 'Not Available' && !lead.message.startsWith('Completed Career Diagnostic Quiz')) ? `<div style="font-size:0.75rem; color:var(--text-muted); max-width:240px; margin-top:2px;"><em>"${escapeHTML(lead.message)}"</em></div>` : ''}
          </td>
          <td>
            ${roleBadge}
          </td>
          <td>
            ${genderDisplay}
          </td>
          <td>
            <a href="tel:${escapeHTML(dialNumber || lead.phone || '')}" style="color:var(--text-primary); text-decoration:none; font-family:var(--font-mono); font-size:0.8rem;">
              ${escapeHTML(displayPhone)}
            </a>
          </td>
          <td>
            ${lead.email && lead.email !== '—' && lead.email !== 'Not Available' && !lead.email.includes('quiz-visitor') ? `
              <a href="mailto:${escapeHTML(lead.email)}" style="color:var(--text-muted); text-decoration:none; font-size:0.8rem;">
                ${escapeHTML(lead.email)}
              </a>
            ` : '<span style="color:var(--text-muted); font-size:0.8rem; font-style:italic;">Not Available</span>'}
          </td>
          <td style="font-size:0.82rem; color:var(--text-secondary); max-width:180px;">
            ${(lead.institution && lead.institution !== '—' && lead.institution !== 'Not Available') ? escapeHTML(lead.institution) : '<span style="color:var(--text-muted); font-style:italic;">Not Available</span>'}
          </td>
          <td>
            ${quizResultCell}
          </td>
          <td>
            <select class="admin-status-select ${statusClass}" data-id="${escapeHTML(lead.id)}">
              <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
              <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
              <option value="confirmed" ${lead.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            </select>
          </td>
          <td style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">
            ${escapeHTML(lead.submittedDisplay || '—')}
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:0.35rem;">
              <button type="button" class="admin-action-btn admin-view-action admin-view-lead-btn" data-id="${escapeHTML(lead.id)}" title="View Student Profile Card">
                <i class="fa-solid fa-eye"></i>
              </button>
              ${waNumber ? `
                <a href="https://wa.me/${waNumber}?text=${waText}" target="_blank" rel="noopener noreferrer" class="admin-action-btn admin-wa-action" title="Open WhatsApp chat">
                  <i class="fa-brands fa-whatsapp"></i>
                </a>
              ` : ''}
              <button type="button" class="admin-action-btn admin-del-action admin-delete-lead-btn" data-id="${escapeHTML(lead.id)}" title="Delete lead">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // View profile card listeners
    tbody.querySelectorAll('.admin-view-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        openLeadProfileModal(id);
      });
    });

    // Status change listener
    tbody.querySelectorAll('.admin-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = select.dataset.id;
        const newStatus = select.value;
        select.className = `admin-status-select status-${newStatus}`;

        const found = allAdminLeads.find(l => l.id === id);
        if (found) found.status = newStatus;
        setStoredLeads(allAdminLeads);
        updateAdminStats();

        if (leadsRef) {
          try {
            await leadsRef.child(id).update({ status: newStatus });
          } catch (err) {
            console.warn('Realtime Database status update notice:', err);
          }
        }
      });
    });

    // Delete button listener
    tbody.querySelectorAll('.admin-delete-lead-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Are you sure you want to permanently delete this registration lead?')) return;

        allAdminLeads = allAdminLeads.filter(l => l.id !== id);
        setStoredLeads(allAdminLeads);
        updateAdminStats();
        renderAdminTable();

        if (leadsRef) {
          try {
            await leadsRef.child(id).remove();
          } catch (err) {
            console.warn('Realtime Database lead delete notice:', err);
          }
        }
      });
    });
  }

  function exportLeadsCSV() {
    const leads = filterAdminLeads();
    if (!leads.length) {
      alert('No leads available to export with current filters.');
      return;
    }

    const headers = [
      '#',
      'Full Name',
      'Role',
      'Gender',
      'WhatsApp Number',
      'Email Address',
      'Current Institution',
      'Quiz Career Match / Direct Status',
      'Quiz Answers (Q1 to Q6)',
      'Status',
      'Submission Timestamp',
      'Source Page',
      'Notes / Message'
    ];

    const rows = leads.map((l, idx) => {
      const isQuizLead = !l.name || l.name === 'Not Available' || l.name.startsWith('Quiz Lead');
      const roleLower = (l.role || '').toLowerCase();
      const isRoleNA = !l.role || l.role === 'Not Available' || l.role === 'Quiz Lead' || (isQuizLead && roleLower === 'student');

      const expName = isQuizLead ? 'Not Available' : (l.name || 'Not Available');
      const expRole = isRoleNA ? 'Not Available' : (l.role || 'Not Available');
      const expGender = (!l.gender || l.gender === '—' || l.gender === 'Not Available') ? 'Not Available' : l.gender;
      const expEmail = (!l.email || l.email === '—' || l.email.includes('quiz-visitor') || l.email === 'Not Available') ? 'Not Available' : l.email;
      const expInst = (!l.institution || l.institution === '—' || l.institution === 'Not Available') ? 'Not Available' : l.institution;
      const expMsg = (!l.message || l.message === 'Not Available' || l.message.startsWith('Completed Career Diagnostic Quiz')) ? 'Not Available' : l.message;

      const hasQuiz = Boolean(l.quizAnswers && Object.keys(l.quizAnswers).length > 0) &&
                      !(l.quizResult && l.quizResult.includes('Quiz not taken'));
      const ansDetail = l.quizAnswersDetail || (l.quizAnswers ? getQuizAnswersDetail(l.quizAnswers) : null);
      const expAnswers = (hasQuiz && ansDetail && ansDetail.length)
        ? ansDetail.map(d => `${d.num}: ${d.label}`).join(' | ')
        : (hasQuiz && l.quizAnswers
          ? Object.entries(l.quizAnswers).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' | ')
          : 'Quiz not taken (Direct registration)');

      const expResult = hasQuiz
        ? (l.quizResult || 'Quiz Completed')
        : 'Direct Registration (Quiz not taken)';

      return [
        idx + 1,
        expName,
        expRole,
        expGender,
        l.phone || '',
        expEmail,
        expInst,
        expResult,
        expAnswers,
        l.status || 'new',
        l.submittedAt || '',
        l.source || 'Website',
        expMsg.replace(/"/g, '""').replace(/\n/g, ' ')
      ];
    });

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `journalism_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ─── Triggers to open Admin Portal ───────────────────────────
  let footerTapCount = 0;
  const taglines = document.querySelectorAll('.footer__tagline');
  taglines.forEach(tagline => {
    tagline.style.cursor = 'pointer';
    tagline.addEventListener('click', () => {
      footerTapCount++;
      if (footerTapCount >= 3) {
        footerTapCount = 0;
        window.location.href = 'admin.html';
      }
    });
  });

  document.querySelectorAll('a[href="#admin"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'admin.html';
    });
  });

  if (window.location.hash === '#admin') {
    window.location.href = 'admin.html';
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
      window.location.href = 'admin.html';
    }
  });

});
