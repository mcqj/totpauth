// Jest setup: keep toasts deterministic (no animations/timers)
// Suppress a noisy act(...) console.error emitted by provider async
// initialization during tests. This keeps test output clean while we
// keep real provider behavior. If you'd prefer to fix root cause we
// can mock the provider or load path for specific tests instead.
const originalConsoleError = console.error;
console.error = (...args) => {
  try {
    // Build a string from all args to handle cases where the warning
    // is emitted as multiple arguments or as an Error object.
    const combined = args
      .map((a) => {
        if (typeof a === 'string') return a;
        if (a && typeof a.message === 'string') return a.message;
        try { return String(a); } catch { return ''; }
      })
      .join(' ');

    // Suppress variants of the noisy warning that mention CredentialsProvider
    if (combined.includes('not wrapped in act') && combined.includes('CredentialsProvider')) {
      // suppress this specific noisy warning
      return;
    }
  } catch (e) {
    // fall through to default
  }
  originalConsoleError(...args);
};

jest.mock('./contexts/ToastContext', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({ show: jest.fn() }),
}));
