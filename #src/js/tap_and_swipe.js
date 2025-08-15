import { STATES, INITIAL_SPEED } from './constants/index.js';
import { bubbleHtml, holdHtml, lineHtml } from './htmls/index.js';

class TapAndSwipeGame {
  constructor() {
    this.stopCircleAnimation = null;
    this.stopSwipeAnimation = null;
    this.stopHoldAnimation = null;

    this.intervalId = null;
    this.speed = 1000;
    this.states = [STATES.TAP, STATES.SWIPE, STATES.HOLD];
    this.isGameActive = false;
    this.score = 0;

    this.activeTimeouts = [];
    this.activeAnimations = [];

    this.isAnimationRunning = false;
    this.nextGameTimeout = null;

    this.currentState = null;

    this.animationSpeeds = INITIAL_SPEED;
  }

  createTapBubble() {
    const bubbleContainer = document.createElement('div');
    bubbleContainer.classList.add('bubble-container');
    bubbleContainer.id = `bubble-${Date.now()}`;

    const block = document.querySelector('#tap-and-swipe-block');

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

    let isClicked = false;
    let clickSuccessAnimation = null;

    const tl = gsap.timeline({
      onComplete: () => {
        this.cleanupBubbleClickHandler(bubbleContainer);
        this.isAnimationRunning = false;
        if (onComplete) onComplete();
      }
    });

    this.activeAnimations.push(tl);
    this.isAnimationRunning = true;

    const clickHandler = () => {
      if (isClicked) return;
      isClicked = true;

      tl.kill();

      clickSuccessAnimation = this.playBubbleSuccessAnimation({
        bubble,
        bubbleBorder,
        onComplete: () => {
          this.cleanupBubbleClickHandler(bubbleContainer);
          this.isAnimationRunning = false;
          if (onComplete) onComplete();
        }
      });
    };

    const touchStartHandler = (e) => {
      e.preventDefault();
      bubbleContainer._touchStarted = true;
    };

    const touchEndHandler = (e) => {
      e.preventDefault();
      if (bubbleContainer._touchStarted) {
        clickHandler(e);
      }
      bubbleContainer._touchStarted = false;
    };

    const touchMoveHandler = (e) => {
      bubbleContainer._touchStarted = false;
    };

    bubbleContainer._clickHandler = clickHandler;
    bubbleContainer._touchStartHandler = touchStartHandler;
    bubbleContainer._touchEndHandler = touchEndHandler;
    bubbleContainer._touchMoveHandler = touchMoveHandler;

    bubbleContainer.addEventListener('click', clickHandler);
    bubbleContainer.addEventListener('touchstart', touchStartHandler, { passive: false });
    bubbleContainer.addEventListener('touchend', touchEndHandler, { passive: false });
    bubbleContainer.addEventListener('touchmove', touchMoveHandler, { passive: false });

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

  playBubbleSuccessAnimation({ bubble, bubbleBorder, onComplete }) {
    const successTl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    this.activeAnimations.push(successTl);

    successTl.to(bubble, {
      width: 46,
      height: 46,
      backgroundColor: 'rgba(210, 217, 240, 0.7)',
      boxShadow:
        '0px 0px 6.3px 1px rgba(69, 194, 248, 1), inset 0px 0px 4px 0px rgba(69, 194, 248, 1)',
      duration: 0.1,
      ease: 'back.out(2)'
    });

    successTl.to(bubbleBorder, {
      width: 46,
      height: 46,
      borderColor: 'rgba(223,245,255, 1)',
      duration: 0.01,
      ease: 'back.out(2)'
    });

    successTl.to(
      bubble,
      {
        opacity: 0,
        scale: 0.5,
        duration: 0.2,
        ease: 'power2.in'
      },
      '-=0.2'
    );

    successTl.to(
      bubbleBorder,
      {
        opacity: 0,
        scale: 0.5,
        duration: 0.2,
        ease: 'power2.in'
      },
      '-=0.2'
    );

    return successTl;
  }

  cleanupBubbleClickHandler(bubbleContainer) {
    if (bubbleContainer) {
      // Remove click handler
      if (bubbleContainer._clickHandler) {
        bubbleContainer.removeEventListener('click', bubbleContainer._clickHandler);
        delete bubbleContainer._clickHandler;
      }

      // Remove touch handlers
      if (bubbleContainer._touchStartHandler) {
        bubbleContainer.removeEventListener('touchstart', bubbleContainer._touchStartHandler);
        delete bubbleContainer._touchStartHandler;
      }

      if (bubbleContainer._touchEndHandler) {
        bubbleContainer.removeEventListener('touchend', bubbleContainer._touchEndHandler);
        delete bubbleContainer._touchEndHandler;
      }

      if (bubbleContainer._touchMoveHandler) {
        bubbleContainer.removeEventListener('touchmove', bubbleContainer._touchMoveHandler);
        delete bubbleContainer._touchMoveHandler;
      }

      delete bubbleContainer._touchStarted;
    }
  }

  createSwipe() {
    const lineContainer = document.createElement('div');
    lineContainer.classList.add('line-container');
    lineContainer.id = `swipe-${Date.now()}`;

    const block = document.querySelector('#tap-and-swipe-block');

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

    bubbleContainer.innerHTML = holdHtml;
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

    if (this.nextGameTimeout) {
      clearTimeout(this.nextGameTimeout);
    }

    this.nextGameTimeout = setTimeout(() => {
      this.startGame();
    }, 500);

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
    this.intervalId = setInterval(() => {
      this.startGame();
      console.log(this.speed);
    }, this.speed);
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

      bubbles.forEach((bubble) => {
        this.cleanupBubbleClickHandler(bubble);
        bubble.remove();
      });
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
