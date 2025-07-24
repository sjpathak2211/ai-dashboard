// Polyfill for requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback: (handle: number) => void;
  }
}

if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(callback: IdleRequestCallback, options?: IdleRequestOptions) {
    const start = Date.now();
    return window.setTimeout(function() {
      callback({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      } as IdleDeadline);
    }, options?.timeout || 1);
  };
}

if (!window.cancelIdleCallback) {
  window.cancelIdleCallback = function(id: number) {
    clearTimeout(id);
  };
}

export {};