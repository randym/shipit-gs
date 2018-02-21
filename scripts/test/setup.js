expect.extend({
  calledWith(received, argument) {

    const calls = received.mock.calls.map((call) => {
      return call[0];
    });

    function message() {
      return `expected ["${calls.join('", "')}"] to include ${argument}`;
    }

    const pass = (calls.indexOf(argument) > -1);

    return {
      message,
      pass,
    };
  },
});

