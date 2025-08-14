class TapAndSwipeGame {
  constructor() {
    this.stopCircleAnimation = null;
    this.stopSwipeAnimation = null;
    this.stopHoldAnimation = null;

    this.intervalId = null;
    this.speed = 2000;
    this.states = ['tap', 'swipe'];
    this.isGameActive = false;
    this.score = 0;

    this.activeTimeouts = [];
    this.activeAnimations = [];
  }

  createTapBubble() {
    const bubbleContainer = document.createElement('div');
    bubbleContainer.classList.add('bubble-container');
    bubbleContainer.id = `bubble-${Date.now()}`;

    const block = document.querySelector('#tap-and-swipe-block');
    const bubbleHtml = `@@include('../partials/_bubble_tap.html')`;

    bubbleContainer.innerHTML = bubbleHtml;
    block.appendChild(bubbleContainer);

    const rect = bubbleContainer.getBoundingClientRect();
    const bubbleWidth = rect.width;
    const bubbleHeight = rect.height;

    const maxX = Math.max(0, block.clientWidth - bubbleWidth);
    const maxY = Math.max(0, block.clientHeight - bubbleHeight);

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    bubbleContainer.style.left = `${randomX}px`;
    bubbleContainer.style.top = `${randomY}px`;

    this.animateBubbleTap({ id: bubbleContainer.id });

    const circleTimeout = setTimeout(() => {
      if (bubbleContainer.parentNode) {
        bubbleContainer.remove();
      }
    }, this.speed * 4);

    this.activeTimeouts.push(circleTimeout);

    return () => {
      clearTimeout(circleTimeout);
      const timeoutIndex = this.activeTimeouts.indexOf(circleTimeout);
      if (timeoutIndex > -1) {
        this.activeTimeouts.splice(timeoutIndex, 1);
      }
    };
  }

  animateBubbleTap({ id }) {
    const bubbleContainer = document.querySelector(`#${id}`);
    const bubble = bubbleContainer.querySelector('.bubble');
    const bubbleBorder = bubbleContainer.querySelector('.bubble-border');
    const turbulence = bubbleContainer.querySelector(`#wavy-border feTurbulence`);

    const petals = bubbleContainer.querySelector('#burst');
    const tl = gsap.timeline();

    this.activeAnimations.push(tl);

    tl.to(bubble, {
      width: 46,
      height: 46,
      backgroundColor: 'rgba(96, 129, 238, 0.2)',
      opacity: 1,
      duration: 1.5,
      ease: 'power1.inOut',
      onStart: () => {
        gsap.to(bubbleBorder, {
          width: 46,
          height: 46,
          duration: 0.5,
          ease: 'power1.inOut'
        });
      }
    });

    tl.to(bubble, {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(227, 0, 0, 0.7)',
      boxShadow:
        '0px 0px 6.3px 1px rgba(255, 133, 133, 1), inset 0px 0px 4px 0px rgba(245, 12, 0, 1)',
      duration: 2,
      ease: 'none',
      onStart: () => {
        gsap.to(bubbleBorder, {
          width: 60,
          height: 60,
          borderColor: 'rgba(245, 12, 0, 1)',
          borderWidth: 2.6,
          duration: 1.5,
          ease: 'none'
        });
      }
    });

    tl.to(bubble, {
      onStart: () => {
        bubble.style.filter = `url(#wavy-border)`;
        gsap.to(turbulence, {
          attr: { seed: 100 },
          duration: 0.3,
          repeat: -1,
          ease: 'none'
        });
      },
      duration: 0.3
    });

    tl.to(bubble, {
      opacity: 0,
      duration: 0.15,
      ease: 'none',
      onStart: () => {
        const tlP = gsap.timeline();
        tlP
          .to(petals, {
            scale: 0.8,
            opacity: 0.6,
            duration: 0.1,
            ease: 'none'
          })
          .to(petals, {
            scale: 1.2,
            opacity: 0,
            duration: 0.1,
            ease: 'none'
          });
      }
    });
  }

  createSwipe() {
    const lineContainer = document.createElement('div');
    lineContainer.classList.add('line-container');
    lineContainer.id = `swipe-${Date.now()}`;

    const block = document.querySelector('#tap-and-swipe-block');
    const lineHtml = `@@include('../partials/_swipe.html')`;

    lineContainer.innerHTML = lineHtml;
    block.appendChild(lineContainer);

    const rect = lineContainer.getBoundingClientRect();
    const lineWidth = rect.width;
    const lineHeight = rect.height;

    const maxX = Math.max(0, block.clientWidth - lineWidth);
    const maxY = Math.max(0, block.clientHeight - lineHeight);

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    lineContainer.style.left = `${randomX}px`;
    lineContainer.style.top = `${randomY}px`;

    this.animateSwipe({ id: lineContainer.id });

    const swipeTimeout = setTimeout(() => {
      if (lineContainer.parentNode) {
        lineContainer.remove();
      }
    }, this.speed * 4);

    this.activeTimeouts.push(swipeTimeout);

    return () => {
      clearTimeout(swipeTimeout);
      const timeoutIndex = this.activeTimeouts.indexOf(swipeTimeout);
      if (timeoutIndex > -1) {
        this.activeTimeouts.splice(timeoutIndex, 1);
      }
    };
  }

  animateSwipe({ id }) {
    const lineContainer = document.querySelector(`#${id}`);
    const line = lineContainer.querySelector('.line');
    const wave = lineContainer.querySelector('#wave');
    const splash = lineContainer.querySelector('#splash');

    const tl = gsap.timeline();

    this.activeAnimations.push(tl);

    tl.to(line, {
      opacity: 1,
      duration: 1.5,
      ease: 'power1.inOut',
      onStart: () => {
        gsap.to(lineContainer, {
          '--shadow': '0px -4px 6px rgba(69, 194, 248, 1)',
          duration: 1.5
        });
      }
    });

    tl.to(line, {
      '--start': 'rgba(248, 86, 58, 1)',
      '--mid': 'rgba(248, 86, 58, 0.4)',
      '--end': 'rgba(248, 86, 58, 0)',
      duration: 2.5,
      ease: 'power1.inOut',
      onStart: () => {
        gsap.to(lineContainer, {
          '--shadow': '0px -4px 6px rgba(238, 62, 31, 1)',
          duration: 2.5
        });
      }
    });

    tl.to(line, {
      opacity: 0,
      duration: 0.034,
      onStart: () => {
        gsap.to(splash, {
          opacity: 0.8,
          duration: 0.0085
        });

        gsap.to(wave, {
          opacity: 0.5,
          duration: 0.0085
        });
      },
      onComplete: () => {
        gsap.to(wave, {
          opacity: 0,
          duration: 0.0085
        });
        gsap.to(splash, {
          opacity: 0,
          duration: 0.0085
        });
      }
    });
  }

  createHold() {
    // TODO
  }

  animateHold() {
    // TODO
  }

  startGame() {
    if (!this.isGameActive) return;
    const randomState = this.states[Math.floor(Math.random() * this.states.length)];
    switch (randomState) {
      case 'tap': {
        this.stopCircleAnimation = this.createTapBubble();
        break;
      }
      case 'swipe': {
        this.stopSwipeAnimation = this.createSwipe();
        break;
      }
      case 'hold': {
        this.stopHoldAnimation = this.createHold();
        break;
      }
    }
  }

  init() {
    this.isGameActive = true;
    this.intervalId = setInterval(() => this.startGame(), this.speed);
  }

  destroy() {
    this.isGameActive = false;

    // Clear main interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear all active timeouts
    this.activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.activeTimeouts = [];

    // Kill all active animations
    this.activeAnimations.forEach((animation) => {
      if (animation.kill) animation.kill();
    });
    this.activeAnimations = [];

    // Clean up stop functions
    if (this.stopCircleAnimation && typeof this.stopCircleAnimation === 'function') {
      this.stopCircleAnimation();
      this.stopCircleAnimation = null;
    }
    if (this.stopSwipeAnimation && typeof this.stopSwipeAnimation === 'function') {
      this.stopSwipeAnimation();
      this.stopSwipeAnimation = null;
    }
    if (this.stopHoldAnimation && typeof this.stopHoldAnimation === 'function') {
      this.stopHoldAnimation();
      this.stopHoldAnimation = null;
    }

    // Remove any remaining game elements
    const block = document.querySelector('#tap-and-swipe-block');
    if (block) {
      const bubbles = block.querySelectorAll('.bubble-container');
      const lines = block.querySelectorAll('.line-container');

      bubbles.forEach((bubble) => bubble.remove());
      lines.forEach((line) => line.remove());
    }
  }
}

const tapAndSwipeGame = new TapAndSwipeGame();

window.addEventListener('DOMContentLoaded', () => {
  tapAndSwipeGame.init();
});

window.addEventListener('beforeunload', () => {
  tapAndSwipeGame.destroy();
});
