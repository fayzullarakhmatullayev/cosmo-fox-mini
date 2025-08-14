const STATES = {
  TAP: 'tap',
  SWIPE: 'swipe',
  HOLD: 'hold'
};

class TapAndSwipeGame {
  constructor() {
    this.stopCircleAnimation = null;
    this.stopSwipeAnimation = null;
    this.stopHoldAnimation = null;

    this.intervalId = null;
    this.speed = 1000;
    this.states = [STATES.HOLD, STATES.SWIPE, STATES.TAP];
    this.isGameActive = false;
    this.score = 0;

    this.activeTimeouts = [];
    this.activeAnimations = [];

    this.isAnimationRunning = false;
    this.nextGameTimeout = null;

    this.currentState = null;

    this.animationSpeeds = {
      bubble: {
        // Phase 1: Initial growth (blue bubble)
        phase1Duration: 0.3,
        phase1BorderDuration: 0.2,

        // Phase 2: Color change to red and size increase
        phase2Duration: 2,
        phase2BorderDuration: 1.5,

        // Phase 3: Turbulence effect
        phase3Duration: 0.3,
        turbulenceDuration: 0.3,

        // Phase 4: Final explosion
        explosionDuration: 0.15,
        petalsDuration: 0.1,

        // Total animation time (calculated automatically)
        get totalDuration() {
          return (
            this.phase1Duration + this.phase2Duration + this.phase3Duration + this.explosionDuration
          );
        }
      },
      swipe: {
        // Phase 1: Line appearance
        phase1Duration: 1.5,

        // Phase 2: Color transition
        phase2Duration: 2.5,

        // Phase 3: Explosion effect
        phase3Duration: 0.034,
        waveEffectDuration: 0.0085,

        // Total animation time (calculated automatically)
        get totalDuration() {
          return this.phase1Duration + this.phase2Duration + this.phase3Duration;
        }
      },
      // Delay between animations
      delayBetweenAnimations: 500
    };
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

    this.animateBubbleTap({
      id: bubbleContainer.id,
      onComplete: () => {
        this.scheduleNextGame();
      }
    });

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

  animateBubbleTap({ id, onComplete }) {
    const bubbleContainer = document.querySelector(`#${id}`);
    const bubble = bubbleContainer.querySelector('.bubble');
    const bubbleBorder = bubbleContainer.querySelector('.bubble-border');
    const turbulence = bubbleContainer.querySelector(`#wavy-border feTurbulence`);

    const petals = bubbleContainer.querySelector('#burst');
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimationRunning = false;
        if (onComplete) onComplete();
      }
    });

    this.activeAnimations.push(tl);
    this.isAnimationRunning = true;

    tl.to(bubble, {
      width: 46,
      height: 46,
      backgroundColor: 'rgba(96, 129, 238, 0.2)',
      opacity: 1,
      duration: this.animationSpeeds.bubble.phase1Duration,
      ease: 'power1.inOut',
      onStart: () => {
        if (bubbleBorder) {
          gsap.to(bubbleBorder, {
            width: 46,
            height: 46,
            duration: this.animationSpeeds.bubble.phase1BorderDuration,
            ease: 'power1.inOut'
          });
        }
      }
    });

    tl.to(bubble, {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(227, 0, 0, 0.7)',
      boxShadow:
        '0px 0px 6.3px 1px rgba(255, 133, 133, 1), inset 0px 0px 4px 0px rgba(245, 12, 0, 1)',
      duration: this.animationSpeeds.bubble.phase2Duration,
      ease: 'none',
      onStart: () => {
        if (bubbleBorder) {
          gsap.to(bubbleBorder, {
            width: 60,
            height: 60,
            borderColor: 'rgba(245, 12, 0, 1)',
            borderWidth: 2.6,
            duration: this.animationSpeeds.bubble.phase2BorderDuration,
            ease: 'none'
          });
        }
      }
    });

    tl.to(bubble, {
      onStart: () => {
        bubble.style.filter = `url(#wavy-border)`;
        if (turbulence) {
          gsap.to(turbulence, {
            attr: { seed: 100 },
            duration: this.animationSpeeds.bubble.turbulenceDuration,
            repeat: -1,
            ease: 'none'
          });
        }
      },
      duration: this.animationSpeeds.bubble.phase3Duration
    });

    tl.to(bubble, {
      opacity: 0,
      duration: this.animationSpeeds.bubble.explosionDuration,
      ease: 'none',
      onStart: () => {
        if (petals) {
          const tlP = gsap.timeline();
          tlP
            .to(petals, {
              scale: 0.8,
              opacity: 0.6,
              duration: this.animationSpeeds.bubble.petalsDuration,
              ease: 'none'
            })
            .to(petals, {
              scale: 1.2,
              opacity: 0,
              duration: this.animationSpeeds.bubble.petalsDuration,
              ease: 'none'
            });
        }
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

    this.animateSwipe({
      id: lineContainer.id,
      onComplete: () => {
        this.scheduleNextGame();
      }
    });

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

  animateSwipe({ id, onComplete }) {
    const lineContainer = document.querySelector(`#${id}`);
    const line = lineContainer.querySelector('.line');
    const wave = lineContainer.querySelector('#wave');
    const splash = lineContainer.querySelector('#splash');

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimationRunning = false;
        if (onComplete) onComplete();
      }
    });

    this.activeAnimations.push(tl);
    this.isAnimationRunning = true;

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
    const bubbleContainer = document.createElement('div');
    bubbleContainer.classList.add('bubble-container');
    bubbleContainer.id = `bubble-${Date.now()}`;

    const block = document.querySelector('#tap-and-swipe-block');
    const bubbleHtml = `@@include('../partials/_hold.html')`;

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

    this.animateHold({
      id: bubbleContainer.id,
      onComplete: () => {
        this.scheduleNextGame();
      }
    });

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

  animateHold({ id, onComplete }) {
    const bubbleContainer = document.querySelector(`#${id}`);
    const bubble = bubbleContainer.querySelector('.bubble');
    const bubbleText = bubbleContainer.querySelector('.bubble-text');
    const bubbleBorder = bubbleContainer.querySelector('.bubble-border');
    const turbulence = bubbleContainer.querySelector(`#wavy-border feTurbulence`);

    const petals = bubbleContainer.querySelector('#burst');
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimationRunning = false;
        if (onComplete) onComplete();
      }
    });

    this.activeAnimations.push(tl);
    this.isAnimationRunning = true;

    tl.to(bubble, {
      width: 46,
      height: 46,
      backgroundColor: 'rgba(96, 129, 238, 0.2)',
      opacity: 1,
      duration: this.animationSpeeds.bubble.phase1Duration,
      ease: 'power1.inOut',
      onStart: () => {
        if (bubbleBorder) {
          gsap.to(bubbleBorder, {
            width: 46,
            height: 46,
            duration: this.animationSpeeds.bubble.phase1BorderDuration,
            ease: 'power1.inOut'
          });
        }
      }
    });

    tl.to(bubble, {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(227, 0, 0, 0.7)',
      boxShadow:
        '0px 0px 6.3px 1px rgba(255, 133, 133, 1), inset 0px 0px 4px 0px rgba(245, 12, 0, 1)',
      duration: this.animationSpeeds.bubble.phase2Duration,
      ease: 'none',
      onStart: () => {
        if (bubbleBorder) {
          gsap.to(bubbleBorder, {
            width: 60,
            height: 60,
            borderColor: 'rgba(245, 12, 0, 1)',
            borderWidth: 2.6,
            duration: this.animationSpeeds.bubble.phase2BorderDuration,
            ease: 'none'
          });
          gsap.to(bubbleText, {
            '--text-color': 'rgba(255, 133, 133, 1)',
            duration: this.animationSpeeds.bubble.phase2BorderDuration
          });
        }
      }
    });

    tl.to(bubble, {
      onStart: () => {
        bubble.style.filter = `url(#wavy-border)`;
        if (turbulence) {
          gsap.to(turbulence, {
            attr: { seed: 100 },
            duration: this.animationSpeeds.bubble.turbulenceDuration,
            repeat: -1,
            ease: 'none'
          });
        }
      },
      duration: this.animationSpeeds.bubble.phase3Duration
    });

    tl.to(bubble, {
      opacity: 0,
      duration: this.animationSpeeds.bubble.explosionDuration,
      ease: 'none',
      onStart: () => {
        if (petals) {
          const tlP = gsap.timeline();
          tlP
            .to(petals, {
              scale: 0.8,
              opacity: 0.6,
              duration: this.animationSpeeds.bubble.petalsDuration,
              ease: 'none'
            })
            .to(petals, {
              scale: 1.2,
              opacity: 0,
              duration: this.animationSpeeds.bubble.petalsDuration,
              ease: 'none'
            });
        }
      }
    });
  }

  scheduleNextGame() {
    if (!this.isGameActive) return;

    // Clear any existing timeout
    if (this.nextGameTimeout) {
      clearTimeout(this.nextGameTimeout);
    }

    // Schedule the next game element to appear after a delay
    this.nextGameTimeout = setTimeout(() => {
      this.startGame();
    }, 500); // 500ms delay between animations, adjust as needed

    this.activeTimeouts.push(this.nextGameTimeout);
  }

  startGame() {
    if (!this.isGameActive || this.isAnimationRunning) return;
    this.currentState = this.states[Math.floor(Math.random() * this.states.length)];

    switch (this.currentState) {
      case STATES.TAP: {
        this.speed = this.animationSpeeds.bubble.totalDuration * 1000;
        this.stopCircleAnimation = this.createTapBubble();
        break;
      }
      case STATES.SWIPE: {
        this.speed = this.animationSpeeds.swipe.totalDuration * 1000;
        this.stopSwipeAnimation = this.createSwipe();
        break;
      }
      case STATES.HOLD: {
        this.speed = this.animationSpeeds.bubble.totalDuration * 1000;
        this.stopHoldAnimation = this.createHold();
        break;
      }
    }

    console.log(this.currentState);
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
