import Shipit from 'shipit-cli';
import Init from './../init';

describe('n:init task', () => {
  const shipit = new Shipit({
    environment: 'test',
  });

  shipit.initConfig({
    test: {
      gsBucket: 'some-thing',
      gsDeployTo: 'opt/app',
    },
  });

  Init(shipit, 'n');


  test('creates the currentPath', (done) => {
    shipit.start('n:init', (err) => {
      expect(shipit.currentPath).toEqual('gs://some-thing/opt/app/current');
      done(err);
    });
  });

  test('creates releasesPath', (done) => {
    shipit.start('n:init', (err) => {
      expect(shipit.releasesPath).toEqual('gs://some-thing/opt/app/releases');
      done(err);
    });
  });
});
