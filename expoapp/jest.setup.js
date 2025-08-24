// Jest setup: keep toasts deterministic (no animations/timers)
jest.mock('./contexts/ToastContext', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({ show: jest.fn() }),
}));
