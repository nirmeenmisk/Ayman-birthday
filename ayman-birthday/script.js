(() => {
  'use strict';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  // =====================================
  // 1. OPENING SPRINKLES
  // =====================================

  const canvas = $('#sprinkleCanvas');
  const ctx = canvas.getContext('2d');

  let confetti = [];
  let animationFrame = null;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launchSprinkles(amount = 180) {

    resizeCanvas();

    const colors = [
      '#d4bd87',
      '#64c991',
      '#e8f2e9',
      '#2d9365',
      '#a6d9bd'
    ];

    confetti = Array.from({ length: amount }, () => ({
      x: Math.random() * window.innerWidth,
      y: -Math.random() * window.innerHeight * .8,
      vx: (Math.random() - .5) * 3.4,
      vy: 2 + Math.random() * 4.8,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .16,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > .45 ? 'rect' : 'circle',
      alpha: 1
    }));

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    animateSprinkles();
  }

  function animateSprinkles() {

    ctx.clearRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );

    confetti.forEach(piece => {

      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.spin;
      piece.vy += .025;
      piece.alpha -= .0018;

      ctx.save();

      ctx.globalAlpha = Math.max(0, piece.alpha);

      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);

      ctx.fillStyle = piece.color;

      if (piece.shape === 'rect') {

        ctx.fillRect(
          -piece.size / 2,
          -piece.size / 2,
          piece.size,
          piece.size * 1.8
        );

      } else {

        ctx.beginPath();

        ctx.arc(
          0,
          0,
          piece.size / 2,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      ctx.restore();

    });

    confetti = confetti.filter(
      piece =>
        piece.y < window.innerHeight + 30 &&
        piece.alpha > 0
    );

    if (confetti.length) {

      animationFrame =
        requestAnimationFrame(animateSprinkles);

    } else {

      ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );

      animationFrame = null;
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();


  // =====================================
  // 2. PASSWORD
  // =====================================

  const gate = $('#passwordGate');
  const content = $('#siteContent');

  const passwordForm = $('#passwordForm');
  const passwordInput = $('#passwordInput');
  const passwordError = $('#passwordError');

  let unlocked = false;

  passwordForm.addEventListener('submit', event => {

    event.preventDefault();

    const answer = passwordInput.value
      .trim()
      .replace(/\s+/g, '')
      .toLocaleLowerCase('ar');

    if (answer === 'نارو') {

      unlocked = true;

      passwordError.classList.remove('show');

      gate.classList.add('leave');
      content.classList.remove('hidden');

      launchSprinkles(230);

      startMusic();

      window.setTimeout(() => {
        gate.hidden = true;
      }, 850);

      initReveal();

    } else {

      passwordError.classList.remove('show');

      void passwordError.offsetWidth;

      passwordError.classList.add('show');

      passwordInput.select();
    }

  });


  // =====================================
  // 3. BACKGROUND MUSIC
  // =====================================

  let audioContext = null;
  let masterGain = null;
  let musicOn = false;

  function startMusic() {let audioContext;
let musicPlaying = false;
let masterGain;

function startMusic() {
    if (musicPlaying) return;

    audioContext = new (
        window.AudioContext || window.webkitAudioContext
    )();

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.025;
    masterGain.connect(audioContext.destination);

    const notes = [261.63, 329.63, 392.00, 329.63];
    let index = 0;

    function playNote() {
        if (!musicPlaying) return;

        const oscillator = audioContext.createOscillator();
        const volume = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = notes[index];

        volume.gain.setValueAtTime(0, audioContext.currentTime);
        volume.gain.linearRampToValueAtTime(
            0.15, audioContext.currentTime + 1
        );
        volume.gain.linearRampToValueAtTime(
            0, audioContext.currentTime + 3
        );

        oscillator.connect(volume);
        volume.connect(masterGain);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 3);

        index = (index + 1) % notes.length;

        setTimeout(playNote, 2500);
    }

    musicPlaying = true;
    playNote();
}}

  function stopMusic() {

    if (!audioContext || !masterGain) return;

    masterGain.gain.cancelScheduledValues(
      audioContext.currentTime
    );

    masterGain.gain.setTargetAtTime(
      0,
      audioContext.currentTime,
      .15
    );

    musicOn = false;

    $('#soundToggle').classList.add('muted');

    $('#soundLabel').textContent = 'SOUND OFF';
  }

  $('#soundToggle').addEventListener('click', () => {

    if (musicOn) {

      stopMusic();

    } else if (unlocked) {

      startMusic();

    }

  });


  // =====================================
  // 4. SCROLL ANIMATIONS
  // =====================================

  let revealObserver;

  function initReveal() {

    const elements = $$('.reveal');

    if (!('IntersectionObserver' in window)) {

      elements.forEach(element => {
        element.classList.add('visible');
      });

      return;
    }

    if (revealObserver) {
      revealObserver.disconnect();
    }

    revealObserver = new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add('visible');

          revealObserver.unobserve(entry.target);
        }

      });

    }, {
      threshold: .12
    });

    elements.forEach(element => {
      revealObserver.observe(element);
    });
  }


  // =====================================
  // 5. 21 CANDLES
  // =====================================

  const candlesGrid = $('#candlesGrid');

  const candlesLeft = $('#candlesLeft');

  const wishMessage = $('#wishMessage');

  let candleCount = 21;

  function renderCandles() {

    candlesGrid.innerHTML = '';

    for (let i = 0; i < 21; i++) {

      const candle = document.createElement('span');

      candle.className =
        `candle${i >= candleCount ? ' out' : ''}`;

      candle.setAttribute(
        'aria-label',
        `Candle ${i + 1}`
      );

      if (i < candleCount) {

        const flame = document.createElement('i');

        flame.className = 'flame';

        candle.appendChild(flame);
      }

      candlesGrid.appendChild(candle);
    }

    candlesLeft.textContent = String(candleCount);
  }

  $('#blowCandles').addEventListener('click', () => {

    if (candleCount === 0) {

      wishMessage.textContent =
        'كل الأمنيات الحلوة إلك يا أيمن 🤍';

      return;
    }

    const candles = $$('.candle', candlesGrid);

    let next = candleCount;

    $('#blowCandles').disabled = true;

    function blowNext() {

      if (next <= 0) {

        wishMessage.textContent =
          'Wish made. May this year be your best one yet. ✨';

        launchSprinkles(75);

        $('#blowCandles').disabled = false;

        return;
      }

      next--;

      candleCount = next;

      candles[next].classList.add('out');

      candles[next].innerHTML = '';

      candlesLeft.textContent = String(candleCount);

      window.setTimeout(blowNext, 85);
    }

    blowNext();

  });

  $('#relightCandles').addEventListener('click', () => {

    candleCount = 21;

    renderCandles();

    wishMessage.textContent =
      'Twenty-one wishes, all yours.';

    $('#blowCandles').disabled = false;

  });

  renderCandles();


  // =====================================
  // 6. SURPRISE GIFT
  // =====================================

  const giftBox = $('#giftBox');

  const giftMessage = $('#giftMessage');

  giftBox.addEventListener('click', () => {

    if (giftBox.classList.contains('opened')) return;

    giftBox.classList.add('opened');

    window.setTimeout(() => {

      giftMessage.classList.remove('hidden');

      giftMessage.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      launchSprinkles(95);

    }, 420);

  });


  // =====================================
  // 7. PHOTO GALLERY
  // =====================================

  const photoUpload = $('#photoUpload');

  const galleryGrid = $('#galleryGrid');

  const photoCount = $('#photoCount');

  let addedPhotos = 0;

  const objectUrls = [];

  photoUpload.addEventListener('change', event => {

    const files = Array.from(
      event.target.files || []
    ).filter(file => file.type.startsWith('image/'));

    files.forEach(file => {

      const url = URL.createObjectURL(file);

      objectUrls.push(url);

      const card = document.createElement('div');

      card.className = 'gallery-photo';

      const image = document.createElement('img');

      image.src = url;

      image.alt = `Birthday memory ${addedPhotos + 1}`;

      image.loading = 'lazy';

      const caption = document.createElement('span');

      caption.textContent =
        file.name.replace(/\.[^.]+$/, '').slice(0, 45) ||
        'A favourite memory';

      card.append(image, caption);

      galleryGrid.appendChild(card);

      addedPhotos++;
    });

    photoCount.textContent =
      `${addedPhotos} ${addedPhotos === 1 ? 'photo' : 'photos'} added`;

    photoUpload.value = '';

  });

  window.addEventListener('beforeunload', () => {

    objectUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });

  });


  // =====================================
  // 8. FUNNY QUIZ
  // =====================================

  const questions = [

    {
      question: 'مين أكثر شخص لازم يشكرك اليوم؟',

      options: [
        'نارو طبعاً',
        'أنا، على تحمّلي إلك',
        'الاثنين وبقوة',
        'السؤال نفسه مستفز'
      ],

      correct: 0,

      feedback: 'إجابة نموذجية. واضح إنك درست منيح 😂'
    },

    {
      question: 'لما نارو تحكيلك "بدي أحكيلك شغلة"...',

      options: [
        'بسمع بكل تركيز',
        'بجهّز حالي نفسياً',
        'بختفي خمس دقايق',
        'بحكي: شو عملت هالمرة؟'
      ],

      correct: 3,

      feedback: 'عندك خبرة سابقة، وهذا واضح.'
    },

    {
      question: 'شو أهم إنجاز بعمر 21؟',

      options: [
        'أحقق أحلامي',
        'أصير مليونير',
        'أضل صاحب نارو المفضل',
        'أنام 8 ساعات متواصلة'
      ],

      correct: 2,

      feedback: 'الأولويات عندك مرتّبة بشكل يثير الشك.'
    },

    {
      question: 'إذا صار بينكم تحدّي مين عنيد أكثر...',

      options: [
        'أنا أكيد',
        'نارو، بدون نقاش',
        'ما في فائز',
        'بنأجل التحدي لبعدين'
      ],

      correct: 1,

      feedback: 'الاعتراف بالحق فضيلة.'
    },

    {
      question: 'آخر سؤال: مين صحبيتك المفضلة؟',

      options: [
        'نارو',
        'Naro',
        'نارو وبس',
        'كل الإجابات صحيحة'
      ],

      correct: 3,

      feedback: 'هيك بنحب نشوفك. خلص نجحت! 🏆'
    }

  ];

  let questionIndex = 0;

  let answered = false;

  const questionText = $('#questionText');

  const quizOptions = $('#quizOptions');

  const quizFeedback = $('#quizFeedback');

  const nextQuestion = $('#nextQuestion');

  const quizResult = $('#quizResult');


  function renderQuestion() {

    const current = questions[questionIndex];

    answered = false;

    questionText.textContent = current.question;

    $('#questionNumber').textContent =
      `QUESTION ${String(questionIndex + 1).padStart(2, '0')} / 05`;

    $('#quizProgress').style.width =
      `${((questionIndex + 1) / questions.length) * 100}%`;

    quizFeedback.textContent = '';

    nextQuestion.classList.add('hidden');

    quizOptions.classList.remove('hidden');

    quizOptions.innerHTML = '';

    current.options.forEach((option, index) => {

      const button = document.createElement('button');

      button.type = 'button';

      button.className = 'quiz-option';

      button.textContent = option;

      button.addEventListener('click', () => {
        chooseAnswer(index, button);
      });

      quizOptions.appendChild(button);

    });

  }


  function chooseAnswer(index, button) {

    if (answered) return;

    answered = true;

    $$('.quiz-option', quizOptions).forEach(option => {
      option.disabled = true;
    });

    button.classList.add('selected');

    quizFeedback.textContent =
      questions[questionIndex].feedback;

    nextQuestion.textContent =
      questionIndex === questions.length - 1
        ? 'See your result ✦'
        : 'Next question ↗';

    nextQuestion.classList.remove('hidden');

  }


  nextQuestion.addEventListener('click', () => {

    if (!answered) return;

    if (questionIndex < questions.length - 1) {

      questionIndex++;

      renderQuestion();

    } else {

      quizOptions.classList.add('hidden');

      questionText.classList.add('hidden');

      quizFeedback.classList.add('hidden');

      nextQuestion.classList.add('hidden');

      quizResult.classList.remove('hidden');

    }

  });


  $('#restartQuiz').addEventListener('click', () => {

    questionIndex = 0;

    questionText.classList.remove('hidden');

    quizFeedback.classList.remove('hidden');

    quizResult.classList.add('hidden');

    renderQuestion();

  });


  renderQuestion();

})();