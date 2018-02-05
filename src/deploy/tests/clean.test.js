import Shipit from 'shipit-cli';
import Clean from './../clean';

describe('deploy:clean task', () => {
  const shipit = new Shipit({
    environment: 'test',
  });

  shipit.releasesPath = 'gs://re-qa-turtle-rels-web/webapp/releases';

  Clean(shipit);

  let response = [];

  shipit.initConfig({
    test: {
      keepReleases: 4,
    },
  });

  beforeEach(() => {
    shipit.local = jest.fn((command) => {
      if (command.match(/ rm /)) {
        const parts = command.split(' ');
        // magic number 4 is -r in the gsutil command to remove
        const files = parts.slice(4);
        response.splice(response.length - files.length);
      }

      return Promise.resolve({stdout: response.join('\n')});
    });
  });

  afterEach(() => {
    shipit.local.mockRestore();
  });

  test('removes oldest versions', (done) => {

    response = [
      'gs://re-qa-turtle-rels-web/webapp/releases/1/',
      'gs://re-qa-turtle-rels-web/webapp/releases/2/',
      'gs://re-qa-turtle-rels-web/webapp/releases/3/',
      'gs://re-qa-turtle-rels-web/webapp/releases/4/',
      'gs://re-qa-turtle-rels-web/webapp/releases/5/',
      'gs://re-qa-turtle-rels-web/webapp/releases/6/',
    ];

    shipit.start('gs-deploy:clean', (err) => {
      if (err) { done(err); }
      expect(shipit.local.mock.calls).toEqual([
        ['gsutil ls -d gs://re-qa-turtle-rels-web/webapp/releases/*'],
        ['gsutil -m rm -r gs://re-qa-turtle-rels-web/webapp/releases/2/ gs://re-qa-turtle-rels-web/webapp/releases/1/'],
      ]);
      expect(response.length).toEqual(shipit.config.keepReleases);
      done();
    });
  });


  test('does not try to remove when we have not met keepReleases', (done) => {

    response = [
      'gs://re-qa-turtle-rels-web/webapp/releases/3/',
      'gs://re-qa-turtle-rels-web/webapp/releases/4/',
      'gs://re-qa-turtle-rels-web/webapp/releases/5/',
      'gs://re-qa-turtle-rels-web/webapp/releases/6/',
    ];

    shipit.start('gs-deploy:clean', (err) => {
      if (err) { done(err); }
      expect(shipit.local.mock.calls).toEqual([
        ['gsutil ls -d gs://re-qa-turtle-rels-web/webapp/releases/*'],
      ]);
      expect(response.length).toEqual(shipit.config.keepReleases);
      done();
    });
  });

});
