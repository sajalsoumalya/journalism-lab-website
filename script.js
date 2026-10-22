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

  function initIntlPhone(input) {
    if (!input) return null;
    if (itiMap.has(input)) return itiMap.get(input);

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
      const cleanHandler = () => cleanDuplicateDialCode(input, iti);
      input.addEventListener('input', cleanHandler);
      input.addEventListener('change', cleanHandler);
      input.addEventListener('paste', () => setTimeout(cleanHandler, 10));
      input.addEventListener('blur', cleanHandler);
      input.addEventListener('countrychange', cleanHandler);

      // Check on initial render & autofill delays
      if (input.value) cleanHandler();
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

  // Auto-initialize any tel inputs found in the DOM
  document.querySelectorAll('input[type="tel"]').forEach(input => initIntlPhone(input));

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
          title: "Someone speaking on a stage",
          subtitle: "Public speaking, journalism, presentation, communication and public relations."
        },
        {
          val: "B",
          image: "assets/images/quiz/q1-office.png",
          title: "Someone working in an office",
          subtitle: "Content, editing, graphic design, research, digital marketing and management."
        },
        {
          val: "C",
          image: "assets/images/quiz/q1-travel.png",
          title: "Someone travelling & in the field",
          subtitle: "Photography, wildlife photography, videography, multimedia production and sound."
        }
      ]
    },
    {
      id: 'q2',
      q: "Q2. What do you notice first in this image?",
      image: "assets/images/quiz/q2-tiger-forest.png",
      type: "image-prompt",
      options: [
        { val: "A", text: "The forest.", subtitle: "You see the big-picture environment and context first." },
        { val: "B", text: "The tiger.", subtitle: "You focus immediately on central focal subjects and key tensions." },
        { val: "C", text: "Both simultaneously.", subtitle: "You intuitively connect environment and subjects together." }
      ]
    },
    {
      id: 'q3',
      q: "Q3. What is the first word you notice in this image?",
      image: "assets/images/quiz/q3-word-puzzle.png",
      type: "image-prompt",
      options: [
        { val: "A", text: "RESPECT", subtitle: "Driven by credibility, recognition, and professional honor." },
        { val: "B", text: "MONEY", subtitle: "Driven by financial independence, commercial scale, and enterprise." },
        { val: "C", text: "GAME", subtitle: "Driven by strategic challenges, competition, and dynamic stakes." },
        { val: "D", text: "SUCCESS", subtitle: "Driven by milestone achievements, mastery, and visible excellence." }
      ]
    },
    {
      id: 'q4',
      q: "Q4. What do you expect from your career?",
      type: "standard",
      options: [
        {
          val: "A",
          text: "Risk + Reward",
          subtitle: "High-adrenaline opportunities, entrepreneurial freedom, performance breakthroughs."
        },
        {
          val: "B",
          text: "Stability and Security",
          subtitle: "Structured pathways, dependable organizational backing, sustainable growth."
        }
      ]
    },
    {
      id: 'q5',
      q: "Q5. How often do you read newspapers and books?",
      type: "standard",
      options: [
        { val: "A", text: "Every day", subtitle: "Voracious consumer of in-depth investigative print, literature & media." },
        { val: "B", text: "Once or twice a week", subtitle: "Regular weekend reading and long-form analysis." },
        { val: "C", text: "Once or twice a month", subtitle: "Periodic deep dives into select topics and authors." },
        { val: "D", text: "The night before exams / As needed", subtitle: "Pragmatic, on-demand reader when a concrete objective arises." }
      ]
    },
    {
      id: 'q6',
      q: "Q6. How comfortable are you with using technology and digital tools?",
      type: "standard",
      options: [
        {
          val: "A",
          text: "I can troubleshoot even complex problems",
          subtitle: "Fluent with technical setups, debugging, workflows & advanced tools."
        },
        {
          val: "B",
          text: "I can troubleshoot basic problems",
          subtitle: "Confident with daily digital workflows, common software & standard devices."
        },
        {
          val: "C",
          text: "What is troubleshooting?",
          subtitle: "I prefer spontaneous creative expression over technical troubleshooting."
        },
        {
          val: "D",
          text: "Specialized in creative studio software & cameras",
          subtitle: "Hands-on mastery of editing suites, design canvas, or camera gear."
        }
      ]
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

  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    let currentQ = 0;
    let userAnswers = {};
    let pendingVal = null;
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

    function openQuizDisclaimer(val, btn) {
      pendingVal = val;
      pendingBtn = btn;
      const phoneInput = document.getElementById('quizUserPhone');
      const phoneErr = document.getElementById('quizPhoneError');
      if (phoneErr) phoneErr.style.display = 'none';
      if (phoneInput) {
        phoneInput.classList.remove('error');
        const iti = initIntlPhone(phoneInput);
        if (window.userQuizPhone && !phoneInput.value) {
          if (iti) {
            iti.setNumber(window.userQuizPhone);
            cleanDuplicateDialCode(phoneInput, iti);
          } else {
            phoneInput.value = window.userQuizPhone;
          }
        }
      }
      if (quizDisclaimerModal) {
        quizDisclaimerModal.classList.add('active');
        quizDisclaimerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
      setTimeout(() => {
        if (phoneInput) phoneInput.focus();
      }, 150);
    }

    function closeQuizDisclaimer(proceed = false) {
      if (quizDisclaimerModal) {
        quizDisclaimerModal.classList.remove('active');
        quizDisclaimerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      if (proceed && pendingVal !== null) {
        disclaimerAgreed = true;
        userAnswers[QUESTIONS[currentQ].id] = pendingVal;
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
      pendingVal = null;
      pendingBtn = null;
    }

    const quizUserPhone = document.getElementById('quizUserPhone');
    const quizPhoneError = document.getElementById('quizPhoneError');

    if (quizUserPhone) {
      initIntlPhone(quizUserPhone);

      quizUserPhone.addEventListener('input', () => {
        const iti = itiMap.get(quizUserPhone);
        const digits = quizUserPhone.value.replace(/\D/g, '');
        const isValid = iti ? (iti.isValidNumber() || digits.length >= 7) : digits.length >= 10;
        if (isValid) {
          if (quizPhoneError) quizPhoneError.style.display = 'none';
          quizUserPhone.classList.remove('error');
        }
      });

      quizUserPhone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (quizDisclaimerOkBtn) quizDisclaimerOkBtn.click();
        }
      });
    }

    if (quizDisclaimerOkBtn) {
      quizDisclaimerOkBtn.addEventListener('click', () => {
        const phoneInput = document.getElementById('quizUserPhone');
        const phoneErr = document.getElementById('quizPhoneError');
        const iti = phoneInput ? (itiMap.get(phoneInput) || initIntlPhone(phoneInput)) : null;
        const rawValue = phoneInput ? phoneInput.value.trim() : '';
        const digits = rawValue.replace(/\D/g, '');

        const phoneObj = formatInternationalPhone(rawValue, iti);
        const fullNumber = phoneObj.formatted || rawValue;

        if (iti) {
          const countryData = iti.getSelectedCountryData();
          const isIndia = (countryData && countryData.iso2 === 'in');
          isValid = iti.isValidNumber() || digits.length >= (isIndia ? 10 : 7);
        } else {
          isValid = digits.length >= 10;
        }

        if (!rawValue || !isValid || digits.length < 7) {
          if (phoneErr) {
            phoneErr.style.display = 'flex';
            const errSpan = phoneErr.querySelector('span');
            if (errSpan) {
              const countryIso = iti ? iti.getSelectedCountryData()?.iso2 : 'in';
              errSpan.textContent = countryIso === 'in'
                ? 'Please enter a valid 10-digit mobile number to proceed.'
                : 'Please enter a valid mobile number to proceed.';
            }
          }
          if (phoneInput) {
            phoneInput.classList.add('error');
            phoneInput.focus();
          }
          return;
        }

        if (phoneErr) phoneErr.style.display = 'none';
        if (phoneInput) phoneInput.classList.remove('error');

        window.userQuizPhone = fullNumber;
        window.userQuizPhoneDial = phoneObj.dial;
        window.userQuizPhoneWa = phoneObj.wa;

        // Auto-fill phone field in any registration forms on page
        const regPhoneInputs = document.querySelectorAll('input[type="tel"][name="phone"], #phone');
        regPhoneInputs.forEach(input => {
          const regIti = itiMap.get(input) || initIntlPhone(input);
          if (regIti) {
            regIti.setNumber(fullNumber);
            cleanDuplicateDialCode(input, regIti);
          } else {
            input.value = fullNumber;
          }
        });

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
              <span class="quiz-opt-card__badge">Option ${opt.val}</span>
              <h4 class="quiz-opt-card__title">${opt.title}</h4>
              <p class="quiz-opt-card__desc">${opt.subtitle}</p>
            `;
            card.addEventListener('click', () => selectAnswer(opt.val, card));
            optContainer.appendChild(card);
          });
        } else if (data.image) {
          // Type 2: 1 image prompt with options in a balanced split 2-column layout (Q2, Q3)
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
      // First question check: clicking any answer triggers Disclaimer Popup
      if (currentQ === 0 && !disclaimerAgreed) {
        const optContainer = document.getElementById('quizOptions');
        if (optContainer) {
          optContainer.querySelectorAll('.quiz-opt, .quiz-opt-card').forEach(b => b.classList.remove('selected'));
        }
        btn.classList.add('selected');

        setTimeout(() => {
          openQuizDisclaimer(val, btn);
        }, 120);
        return;
      }

      btn.classList.add('selected');
      userAnswers[QUESTIONS[currentQ].id] = val;

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

      // Automatically capture quiz lead if mobile phone was entered
      if (window.userQuizPhone && !window.quizLeadCaptured) {
        window.quizLeadCaptured = true;
        const phoneObj = formatInternationalPhone(window.userQuizPhone);
        const quizLead = {
          id: 'lead_quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          name: 'Not Available',
          phone: phoneObj.formatted || window.userQuizPhone,
          phoneDial: phoneObj.dial || window.userQuizPhoneDial || '',
          phoneWa: phoneObj.wa || window.userQuizPhoneWa || '',
          email: 'Not Available',
          institution: 'Not Available',
          role: 'Not Available',
          message: 'Not Available',
          quizResult: res.title || 'Completed',
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

      // Scroll to quiz card so user sees result cleanly
      if (quizCard) {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        currentQ = 0;
        userAnswers = {};
        disclaimerAgreed = false;
        pendingVal = null;
        pendingBtn = null;
        window.quizLeadCaptured = false;
        if (quizResult) quizResult.style.display = 'none';
        if (questionWrap) questionWrap.style.display = 'block';
        renderQuestion(0);
      });
    }

    // Initialize first question
    renderQuestion(0);
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

      // Format phone number uniformly with country code via formatInternationalPhone
      const regPhoneInput = activeFormElement ? activeFormElement.querySelector('input[type="tel"][name="phone"], #phone') : document.querySelector('input[type="tel"]');
      const formIti = regPhoneInput ? (itiMap.get(regPhoneInput) || initIntlPhone(regPhoneInput)) : null;
      const rawInputVal = (regPhoneInput && regPhoneInput.value.trim()) || (pendingFormData ? pendingFormData.get('phone') : '') || window.userQuizPhone || '';

      const phoneObj = formatInternationalPhone(rawInputVal, formIti);

      // Record lead in Firebase Realtime Database and LocalStorage
      const leadData = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        name: (pendingFormData ? pendingFormData.get('name') : '') || applicantName || 'Applicant',
        phone: phoneObj.formatted || window.userQuizPhone || 'Not Available',
        phoneDial: phoneObj.dial || window.userQuizPhoneDial || '',
        phoneWa: phoneObj.wa || window.userQuizPhoneWa || '',
        email: (pendingFormData ? pendingFormData.get('email') : '') || '',
        institution: (pendingFormData ? pendingFormData.get('institution') : '') || '—',
        role: (pendingFormData ? pendingFormData.get('role') : '') || 'Student',
        message: (pendingFormData ? pendingFormData.get('msg') : '') || '',
        quizResult: window.lastQuizResultTitle || 'Not taken',
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

  function normalizeLeads(leads) {
    if (!Array.isArray(leads)) return [];
    return leads.map(l => {
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
      return l;
    });
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
        message: 'Passionate about live broadcast anchoring and ground investigative reporting.',
        quizResult: "You're a Natural Anchor",
        status: 'new',
        submittedAt: new Date(Date.now() - 7200000).toISOString(),
        submittedDisplay: 'Today · 2 hrs ago',
        source: 'Landing Page'
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
        message: 'Looking to transition from print copy to investigative video journalism.',
        quizResult: "You're a Video Storyteller",
        status: 'contacted',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        submittedDisplay: 'Yesterday · 4:15 PM',
        source: 'Register Page'
      }
    ]);
  }

  window.recordLead = async function(leadData) {
    if (leadData && leadData.phone && leadData.phone !== 'Not Available' && leadData.phone !== '—') {
      const pObj = formatInternationalPhone(leadData.phone);
      if (pObj.formatted) leadData.phone = pObj.formatted;
      if (!leadData.phoneDial && pObj.dial) leadData.phoneDial = pObj.dial;
      if (!leadData.phoneWa && pObj.wa) leadData.phoneWa = pObj.wa;
    }
    const current = getStoredLeads();
    current.unshift(leadData);
    setStoredLeads(current);

    if (leadsRef) {
      try {
        await leadsRef.child(leadData.id).set(leadData);
      } catch (err) {
        console.warn('Firebase RTDB write notice:', err);
      }
    }

    if (document.getElementById('adminPanel') && typeof renderAdminTable === 'function') {
      allAdminLeads = getStoredLeads();
      updateAdminStats();
      renderAdminTable();
    }
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
                  <tr><td colspan="10" style="text-align:center; padding:2.5rem; color:var(--text-muted);">Loading registrations…</td></tr>
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
      const results = ['You\'re a Natural Anchor', 'You\'re a Video Storyteller', 'You\'re a Visual Journalist', 'You\'re a Copywriting Journalist'];

      const randomName = testNames[Math.floor(Math.random() * testNames.length)];
      const randomCollege = colleges[Math.floor(Math.random() * colleges.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      const randomDigits = String(Math.floor(9000000000 + Math.random() * 999999999));
      const phoneObj = formatInternationalPhone(randomDigits);

      const mockLead = {
        id: 'lead_' + Date.now(),
        name: randomName,
        phone: phoneObj.formatted,
        phoneDial: phoneObj.dial,
        phoneWa: phoneObj.wa,
        email: randomName.toLowerCase().replace(' ', '.') + '@gmail.com',
        institution: randomCollege,
        role: randomRole,
        message: 'Interested in learning from Prof. Dr. Minal Pareek in Batch 01.',
        quizResult: randomResult,
        status: 'new',
        submittedAt: new Date().toISOString(),
        submittedDisplay: 'Just now',
        source: 'Admin Direct Test'
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
                    <span class="role-badge status-${lead.status || 'new'}">
                      <i class="fa-solid fa-circle-dot"></i> <span style="text-transform:capitalize;">${escapeHTML(lead.status || 'new')}</span>
                    </span>
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
                <div class="profile-field-label">Current Institution</div>
                <div class="profile-field-value">
                  ${lead.institution && lead.institution !== '—' && lead.institution !== 'Not Available' ? escapeHTML(lead.institution) : '<span style="color:var(--text-muted); font-style:italic;">Not Available</span>'}
                </div>
              </div>

              <div class="profile-field-item">
                <div class="profile-field-label">Diagnosed Career Archetype</div>
                <div class="profile-field-value" style="font-weight:700; color:var(--text-primary);">
                  <i class="fa-solid fa-compass" style="color:var(--crimson); margin-right:0.3rem;"></i>
                  ${escapeHTML(lead.quizResult || 'Not taken')}
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
          const enteredPhone = overlay.querySelector('#editLeadPhone').value.trim();
          const enteredEmail = overlay.querySelector('#editLeadEmail').value.trim();
          const enteredInst = overlay.querySelector('#editLeadInstitution').value.trim();
          const enteredStatus = overlay.querySelector('#editLeadStatus').value;
          const enteredMsg = overlay.querySelector('#editLeadMessage').value.trim();

          const pObj = formatInternationalPhone(enteredPhone);

          lead.name = enteredName || 'Not Available';
          lead.role = enteredRole || 'Not Available';
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
          <td colspan="10" style="text-align:center; padding:3rem; color:var(--text-muted); font-style:italic;">
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

      const statusClass = `status-${lead.status || 'new'}`;

      return `
        <tr>
          <td style="color:var(--text-light); font-family:var(--font-mono); font-size:0.75rem;">${idx + 1}</td>
          <td>
            <button type="button" class="admin-applicant-link admin-view-lead-btn" data-id="${escapeHTML(lead.id)}" title="Click to view student profile card">
              ${displayName}
            </button>
            ${(lead.message && lead.message !== 'Not Available' && !lead.message.startsWith('Completed Career Diagnostic Quiz')) ? `<div style="font-size:0.75rem; color:var(--text-muted); max-width:240px; margin-top:2px;"><em>"${escapeHTML(lead.message)}"</em></div>` : ''}
          </td>
          <td>
            ${roleBadge}
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
          <td style="font-size:0.82rem; font-weight:600; color:var(--text-primary);">
            ${escapeHTML(lead.quizResult || 'Not taken')}
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
      'WhatsApp Number',
      'Email Address',
      'Current Institution',
      'Quiz Career Match',
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
      const expEmail = (!l.email || l.email === '—' || l.email.includes('quiz-visitor') || l.email === 'Not Available') ? 'Not Available' : l.email;
      const expInst = (!l.institution || l.institution === '—' || l.institution === 'Not Available') ? 'Not Available' : l.institution;
      const expMsg = (!l.message || l.message === 'Not Available' || l.message.startsWith('Completed Career Diagnostic Quiz')) ? 'Not Available' : l.message;

      return [
        idx + 1,
        expName,
        expRole,
        l.phone || '',
        expEmail,
        expInst,
        l.quizResult || 'Not taken',
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
