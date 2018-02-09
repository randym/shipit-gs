import Shipit from 'shipit-cli';
import Rollback from './../rollback';

describe('rollback', () => {

  const shipit = new Shipit({
    environment: 'test',
  });

  let response = [];

  shipit.initConfig({
    test: {
      keepReleases: 4,
      gsBucket: 'my-bucket',
    },
    default: {
      gsDeployTo: 'webapp',
    },
  });

  Rollback(shipit);

  beforeEach(() => {
    shipit.local = jest.fn(() => {
      return Promise.resolve({stdout: response.join('\n')});
    });
  });

  afterEach(() => {
    shipit.local.mockRestore();
  });

  test('registers tasks', () => {
    expect(shipit.tasks['gs-rollback:gcloud']).toBeDefined();
    expect(shipit.tasks['gs-rollback:init']).toBeDefined();
    expect(shipit.tasks['gs-rollback:update']).toBeDefined();
    expect(shipit.tasks['gs-rollback:finished']).toBeDefined();
  });

  test('exectutes the expected commands to perform rollback', (done) => {
    response = [
      'gs://my-bucket/webapp/releases/1/',
      'gs://my-bucket/webapp/releases/2/',
    ];

    shipit.start('gs-rollback', (err) => {
      expect(shipit.local.mock.calls.slice(-3)).toEqual([
        ['gsutil ls -d gs://my-bucket/webapp/releases/*'],
        ['gsutil -m cp -r gs://my-bucket/webapp/releases/1/* gs://my-bucket/webapp/current'],
        ['gsutil -m rm -r gs://my-bucket/webapp/releases/2/'],
      ]);
      done(err);
    });
  });

  test('errors when there are fewer than two releases', (done) => {
    response = [
      'gs://my-bucket/webapp/releases/1/',
    ];

    shipit.start('gs-rollback', (err) => {
      expect(err.message).toEqual('There must be at least two releases to rollback.\nfound:\ngs://my-bucket/webapp/releases/1/');
      expect(shipit.local).calledWith('gsutil ls -d gs://my-bucket/webapp/releases/*');
      done(!err);
    });
  });
});


