/**
 * joystick.js — Floating Virtual Joystick for Mobile
 */
const Joystick = {
  _active: false,
  _origin: { x: 0, y: 0 },
  _radius: 50,
  _zone: null,
  _base: null,
  _knob: null,

  init() {
    this._zone = document.getElementById('joystick-zone');
    this._base = document.getElementById('joystick-base');
    this._knob = document.getElementById('joystick-knob');

    if (!this._zone) return;

    // Detect if mobile
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) 
                   || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
    
    if (isMobile) {
      this._zone.style.display = 'block';
      this._bindEvents();
    }
  },

  _bindEvents() {
    this._zone.addEventListener('touchstart', e => this._onDown(e), { passive: false });
    window.addEventListener('touchmove', e => this._onMove(e), { passive: false });
    window.addEventListener('touchend', () => this._onUp(), { passive: false });
    window.addEventListener('touchcancel', () => this._onUp(), { passive: false });
  },

  _onDown(e) {
    e.preventDefault();
    const t = e.targetTouches[0];
    this._active = true;
    this._origin = { x: t.clientX, y: t.clientY };
    
    this._base.style.left = t.clientX + 'px';
    this._base.style.top = t.clientY + 'px';
    this._base.style.opacity = '1';
    this._knob.style.transform = 'translate(-50%, -50%)';
  },

  _onMove(e) {
    if (!this._active) return;
    const t = e.targetTouches[0];
    const dx = t.clientX - this._origin.x;
    const dy = t.clientY - this._origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, this._radius);
    const moveX = Math.cos(angle) * clampedDist;
    const moveY = Math.sin(angle) * clampedDist;

    this._knob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

    // Send vector to MapInput (-1.0 to 1.0)
    if (window.MapInput) {
      MapInput.setVector(moveX / this._radius, moveY / this._radius);
    }
  },

  _onUp() {
    this._active = false;
    this._base.style.opacity = '0.3';
    this._knob.style.transform = 'translate(-50%, -50%)';
    if (window.MapInput) MapInput.setVector(0, 0);
  }
};

document.addEventListener('DOMContentLoaded', () => Joystick.init());
