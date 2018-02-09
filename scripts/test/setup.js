expect.extend({
  calledWith(received, argument) {

    const message = `expected ${received} to include ${argument}`;
    const found = received.mock.calls.find((call) => {
      return call[0] === argument;
    });

    const pass = found && (found.length > 0);

    return {
      message,
      pass,
    };
  },
});

