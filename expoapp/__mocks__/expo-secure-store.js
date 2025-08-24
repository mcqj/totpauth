const store = {};

module.exports = {
  getItemAsync: jest.fn(async (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null)),
  setItemAsync: jest.fn(async (k, v) => { store[k] = v; }),
  deleteItemAsync: jest.fn(async (k) => { delete store[k]; }),
  // helper for tests to reset the store
  __reset: () => {
    for (const k of Object.keys(store)) delete store[k];
  }
};
