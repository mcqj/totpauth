module.exports = {
  documentDirectory: 'file:///app-docs/',
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async ({ from, to }) => {}),
  moveAsync: jest.fn(async ({ from, to }) => {}),
  deleteAsync: jest.fn(async (p) => {}),
};
