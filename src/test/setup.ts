import '@testing-library/jest-dom';

// Polyfill ResizeObserver for jsdom (used by ChamferedFrame)
global.ResizeObserver = class ResizeObserver {
  private callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
