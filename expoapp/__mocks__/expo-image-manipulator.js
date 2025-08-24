module.exports = {
  manipulateAsync: jest.fn(async (uri, actions, options) => ({ uri: uri })),
  SaveFormat: { JPEG: 'jpeg' },
};
