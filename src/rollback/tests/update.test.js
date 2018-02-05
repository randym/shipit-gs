import Shipit from 'shipit-cli';
import Update from './../update';
import Init from './../../shared/Init';

describe('rollback:update task', () => {
  const shipit = new Shipit({
    environment: 'test',
  });

  shipit.releasesPath = 'gs://re-qa-turtle-rels-web/webapp/releases';

  Update(shipit);
  Init(shipit, 'gs-rollback');

  shipit.initConfig({
    test: {
      keepReleases: 4,
      gsBucket: 'gs://re-qa-turtle-rels-web',
    },
    default: {
      deployTo: 'webapp',
    },
  });

  let response = [];

  beforeEach(() => {
    shipit.local = jest.fn(() => {
      return Promise.resolve({stdout: response.join('\n')});
    });
  });

  afterEach(() => {
    shipit.local.mockRestore();
  });

  test('exectutes the expected commands to perform rollback', (done) => {
    response = [
      'gs://re-qa-turtle-rels-web/webapp/releases/1/',
      'gs://re-qa-turtle-rels-web/webapp/releases/2/',
    ];

    shipit.start(['gs-rollback:init', 'gs-rollback:update'], (err) => {
      if (err) {
        done(err);
      }
      expect(shipit.local.mock.calls).toEqual([
        ['gsutil ls -d gs:///re-qa-turtle-rels-web/webapp/releases/*'],
        ['gsutil -m cp -r gs://re-qa-turtle-rels-web/webapp/releases/1/* gs:///re-qa-turtle-rels-web/webapp/current'],
        ['gsutil -m rm -r gs://re-qa-turtle-rels-web/webapp/releases/2/'],
      ]);
      done();
    });
  });

  test('errors when there are fewer than two releases', (done) => {
    response = [
      'gs://re-qa-turtle-rels-web/webapp/releases/1/',
    ];

    shipit.start(['gs-rollback:init', 'gs-rollback:update'], (err) => {
      expect(err.message).toEqual('There must be at least two releases to rollback.\nfound:\ngs://re-qa-turtle-rels-web/webapp/releases/1/');
      expect(shipit.local.mock.calls).toEqual([
        ['gsutil ls -d gs:///re-qa-turtle-rels-web/webapp/releases/*'],
      ]);
      done();
    });
  });

});

