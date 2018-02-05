import Shipit from 'shipit-cli';
import Clean from './../clean';

describe('deploy:clean task', () => {
  const shipit = new Shipit({
    environment: 'test',
  });

  shipit.releasesPath = 'gs://re-qa-turtle-rels-web/webapp/releases';

  Clean(shipit);

  shipit.initConfig({
    test: {
      keepReleases: 4,
      gsBucket: 'gs://re-qa-turtle-rels-web',
    },
  });

  const response = [
    'gs://re-qa-turtle-rels-web/webapp/releases/1/',
    'gs://re-qa-turtle-rels-web/webapp/releases/2/',
    'gs://re-qa-turtle-rels-web/webapp/releases/3/',
    'gs://re-qa-turtle-rels-web/webapp/releases/4/',
    'gs://re-qa-turtle-rels-web/webapp/releases/5/',
    'gs://re-qa-turtle-rels-web/webapp/releases/6/',
  ];

  beforeAll(() => {
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

  afterAll(() => {
    shipit.local.mockRestore();
  });

  test('exectutes the expected commands on remote', (done) => {
    shipit.start('gs-deploy:clean', (err) => {
      if (err) {
        done(err);
      }
      expect(response.length).toEqual(shipit.config.keepReleases);
      done();
    });
  });
});
