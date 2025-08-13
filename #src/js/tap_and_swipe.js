class TapAndSwipeGame {
  stopCircleAnimation = null;
  intervalId = null;
  speed = 2000;

  createTapBubble() {
    const bubbleContainer = document.createElement('div');
    bubbleContainer.classList.add('bubble-container');
    bubbleContainer.id = `bubble-${Date.now()}`;

    const block = document.querySelector('#tap-and-swipe-block');
    const bubbleHtml = `@@include('../partials/_bubble_tap.html')`;
    const maxX = block.clientWidth - 10;
    const maxY = block.clientHeight - 10;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    bubbleContainer.innerHTML = bubbleHtml;
    bubbleContainer.style.left = `${randomX}px`;
    bubbleContainer.style.top = `${randomY}px`;

    block.append(bubbleContainer);
    this.animateBubbleTap({ id: bubbleContainer.id });

    const circleTimeout = setTimeout(() => {
      bubbleContainer.remove();
    }, this.speed * 4);

    return () => {
      clearTimeout(circleTimeout);
    };
  }

  animateBubbleTap({ id }) {
    const bubbleContainer = document.querySelector(`#${id}`);
    const bubble = bubbleContainer.querySelector('.bubble');
    const bubbleBorder = bubbleContainer.querySelector('.bubble-border');
    const turbulence = bubbleContainer.querySelector(`#wavy-border feTurbulence`);

    const petals = bubbleContainer.querySelector('#burst');

    const tl = gsap.timeline();

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

  init() {
    this.stopCircleAnimation = this.createTapBubble();
    this.intervalId = setInterval(() => this.createTapBubble(), this.speed);
  }

  destroy() {
    clearInterval(this.intervalId);
    this.stopCircleAnimation();
  }
}

const tapAndSwipeGame = new TapAndSwipeGame();

window.addEventListener('DOMContentLoaded', () => {
  tapAndSwipeGame.init();
});

window.addEventListener('beforeunload', () => {
  tapAndSwipeGame.destroy();
});
