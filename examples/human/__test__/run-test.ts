import { main } from '../main'

describe('human script', () => {
  const log = console.log; // save original console.log function
  beforeEach(() => {
    console.log = jest.fn(); // create a new mock function for each test
  });
  afterAll(() => {
    console.log = log; // restore original console.log after all tests
  });

  it('should log expected data', async () => {
    await main();

    expect(console.log).toHaveBeenCalledWith(
      "This is Jesse Wright"
    );
    // Checking image was emitted
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("")
    );
    expect(console.log).toHaveBeenCalledWith(
      "Their date of birth is Mon Jan 10 2000"
    );
    expect(console.log).toHaveBeenCalledWith(
      "Their biological mother Leanne Wright was born on Sun Jan 10 1960"
    );
    expect(console.log).toHaveBeenCalledWith(
      "Their biological father Paul Wright was born on Sun Jan 10 1960"
    );
    // Note: This will only work when backed by a reasoning engine
    expect(console.log).toHaveBeenCalledWith(
      "The names of their ancestors include " +
        "\"Leanne Wright\", \"Paul Wright\", \"Marg\", \"Pete\", \"Betty\", \"Brian\""
    );
  })
})