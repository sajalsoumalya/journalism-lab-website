/* ═══════════════════════════════════════════════════════════
   JOURNALISM LAB — INTERACTIVE QUIZ + UI SCRIPT
   ═══════════════════════════════════════════════════════════ */

// ─── Navbar scroll effect ─────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── Mobile menu ─────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const isOpen = mobileMenu.classList.contains('open');
  spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
  spans[1].style.opacity  = isOpen ? '0' : '1';
  spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
});
// Close on link click
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
  });
});

// ─── Quiz Engine ──────────────────────────────────────────────
const QUESTIONS = [
  {
    q: "When you witness something newsworthy, what's your first instinct?",
    options: [
      { text: "Grab a mic and describe it out loud",     score: "anchor"    },
      { text: "Reach for your camera immediately",       score: "photo"     },
      { text: "Start mentally drafting the headline",    score: "copy"      },
      { text: "Think about how to frame it on Instagram",score: "social"    },
    ]
  },
  {
    q: "Which of these activities sounds most exciting to you?",
    options: [
      { text: "Being live on set, reporting breaking news", score: "anchor"     },
      { text: "Editing a cinematic short video",            score: "video"      },
      { text: "Designing a powerful ad campaign",           score: "ad"         },
      { text: "Writing a thread that goes viral",           score: "copy"       },
    ]
  },
  {
    q: "What's your natural creative superpower?",
    options: [
      { text: "Eye for composition — I notice light and angles", score: "photo"      },
      { text: "My words flow — people feel what I write",        score: "copy"       },
      { text: "I make things look and feel amazing visually",    score: "video"      },
      { text: "I understand what people want to watch",          score: "reels"      },
    ]
  },
  {
    q: "Which platform do you consume the most content on?",
    options: [
      { text: "YouTube — long-form video, documentaries",  score: "video"      },
      { text: "Instagram Reels / TikTok",                  score: "reels"      },
      { text: "News websites and long-form articles",      score: "web"        },
      { text: "LinkedIn + Twitter for industry discussion",score: "ad"         },
    ]
  },
  {
    q: "What's your dream outcome from a journalism career?",
    options: [
      { text: "A face people trust — news anchor on national TV",     score: "anchor"     },
      { text: "Building an audience of millions online",               score: "influencer" },
      { text: "Behind the lens — photographing history in the making", score: "photo"      },
      { text: "Running full-scale digital campaigns for brands",       score: "social"     },
    ]
  }
];

const RESULTS = {
  anchor: {
    icon: '🎙️',
    title: 'You\'re a Natural Anchor',
    desc: 'Your instinct to perform, speak, and present makes you built for on-screen journalism. Anchoring, live reporting, and broadcast media are where you\'ll shine.'
  },
  video: {
    icon: '🎬',
    title: 'You\'re a Video Storyteller',
    desc: 'You think in frames and sequences. Video journalism, documentary filmmaking, and cinematic storytelling are your calling. Your editing tells the story.'
  },
  photo: {
    icon: '📸',
    title: 'You\'re a Visual Journalist',
    desc: 'You see the world through a lens. Photojournalism, editorial photography, and visual media are where your eye for truth and beauty come alive.'
  },
  copy: {
    icon: '✍️',
    title: 'You\'re a Copywriting Journalist',
    desc: 'Words are your weapon. Headlines, features, scripts, and long-form journalism — you craft language that makes people feel and act. The newsroom needs you.'
  },
  ad: {
    icon: '📢',
    title: 'You\'re an Ad & Campaign Strategist',
    desc: 'You understand persuasion, brand voice, and audience psychology. Advertising, media strategy, and integrated campaigns are your arena.'
  },
  social: {
    icon: '📱',
    title: 'You\'re a Social Media Journalist',
    desc: 'You speak platform fluently. From real-time news to community engagement, social media management in journalism is your superpower.'
  },
  reels: {
    icon: '🎞️',
    title: 'You\'re a Reels & Content Creator',
    desc: 'Short-form, punchy, engaging — your content instincts are razor sharp. You know what hooks people in the first 3 seconds. That\'s a rare skill.'
  },
  influencer: {
    icon: '⭐',
    title: 'You\'re an Influencer Journalist',
    desc: 'You have a magnetic presence. Building a personal brand, growing an audience, and creating trustworthy journalism at scale — that\'s your path.'
  },
  web: {
    icon: '🌐',
    title: 'You\'re a Web Journalist',
    desc: 'Digital natives, SEO-savvy, and long-form focused — you understand how journalism lives and breathes on the internet. Data, stories, and online publishing are your domain.'
  }
};

let currentQ = 0;
let scores    = {};

const questionWrap  = document.getElementById('questionWrap');
const quizResult    = document.getElementById('quizResult');
const progressFill  = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const retakeBtn     = document.getElementById('retakeBtn');

function renderQuestion(index) {
  const data = QUESTIONS[index];
  document.getElementById('quizQuestion').textContent = data.q;
  const optContainer = document.getElementById('quizOptions');
  optContainer.innerHTML = '';

  data.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className  = 'quiz-opt';
    btn.textContent = opt.text;
    btn.dataset.score = opt.score;
    btn.addEventListener('click', () => selectAnswer(opt.score, btn));
    optContainer.appendChild(btn);
  });

  // Progress
  const pct = ((index + 1) / QUESTIONS.length) * 100;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = (index + 1) + ' / ' + QUESTIONS.length;
}

function selectAnswer(score, btn) {
  // Highlight selection briefly
  btn.classList.add('selected');
  scores[score] = (scores[score] || 0) + 1;

  setTimeout(() => {
    currentQ++;
    if (currentQ < QUESTIONS.length) {
      renderQuestion(currentQ);
    } else {
      showResult();
    }
  }, 280);
}

function showResult() {
  questionWrap.style.display = 'none';
  quizResult.style.display   = 'block';
  progressFill.style.width   = '100%';
  progressLabel.textContent  = 'Done!';

  // Find top score
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const res  = RESULTS[top] || RESULTS.copy;

  document.getElementById('resultIcon').textContent  = res.icon;
  document.getElementById('resultTitle').textContent = res.title;
  document.getElementById('resultDesc').textContent  = res.desc;
}

retakeBtn.addEventListener('click', () => {
  currentQ = 0;
  scores   = {};
  quizResult.style.display  = 'none';
  questionWrap.style.display = 'block';
  renderQuestion(0);
});

// Init quiz
renderQuestion(0);

// ─── Register form ────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const data = new FormData(registerForm);
  const name = data.get('name') || 'there';

  // Swap form for success message
  registerForm.innerHTML = `
    <div class="form-success">
      <div class="form-success__icon">✅</div>
      <h3 class="form-success__title">You're in, ${name.split(' ')[0]}!</h3>
      <p class="form-success__body">
        We've received your application for Batch 1.<br />
        Prof. Dr. Minal Pareek's team will reach out within 24 hours on WhatsApp.<br /><br />
        <strong>Save the date: 26 October 2026, 9 PM</strong>
      </p>
    </div>
  `;
});

// ─── Fade-in on scroll (Intersection Observer) ────────────────
const revealEls = document.querySelectorAll(
  '.stat-card, .course-card, .field-pill, .timeline-item, .quiz-card'
);

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
