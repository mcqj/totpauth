// Provide basic hook implementations that work in tests
export const useRouter = () => ({ push: () => {} });
export const useFocusEffect = (cb) => { cb(); };
export const Stack = {
  Screen: ({ children }) => children,
};
export const useLoadedNavigation = () => ({ push: () => {} });
export const Link = ({ children }) => children;
export const Href = () => null;
