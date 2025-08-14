export const STATES = {
  TAP: 'tap',
  SWIPE: 'swipe',
  HOLD: 'hold'
};

export const INITIAL_SPEED = {
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
    phase1Duration: 0.3,

    // Phase 2: Color transition
    phase2Duration: 2.4,

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
