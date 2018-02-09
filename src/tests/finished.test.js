import Shipit from 'shipit-cli';
import Finished from './../finished';

describe('n:finish task', () => {
  const shipit = new Shipit({
    environment: 'test',
  });

  Finished(shipit, 'n');

  beforeEach(() => {
    shipit.emit = jest.fn();
  });

  afterEach(() => {
    shipit.emit.mockRestore();
  });

  test('emits finished event', (done) => {
    shipit.start('n:finished', (err) => {
      expect(shipit.emit).calledWith('n:finished');
      done(err);
    });
  });
});

