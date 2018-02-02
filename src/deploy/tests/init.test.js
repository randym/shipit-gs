import Shipit from 'shipit-cli';
import Init from './../init';

describe('deploy:init task', () => {
  const shipit = new Shipit({
    environment: 'test',
  });

  shipit.initConfig({
    test: {
      gsBucket: 'some-thing',
      deployTo: 'opt/app',
    },
  });

  Init(shipit);


  test('creates the currentPath', (done) => {
    shipit.start('deploy:init', (err) => {
      if (err) {
        done(err);
      }
      done();
    });
    expect(shipit.currentPath).toEqual('gs://some-thing/opt/app/current');
  });

  test('creates releasesPath', (done) => {
    shipit.start('deploy:init', (err) => {
      if (err) {
        done(err);
      }
      done();
    });
    expect(shipit.releasesPath).toEqual('gs://some-thing/opt/app/releases');
  });
});
