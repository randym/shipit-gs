import moment from 'moment';
import Shipit from 'shipit-cli';
import Update from './../update';
import Init from './../init';

describe('deploy:update tast', () => {
  const shipit = new Shipit({
    environment: 'test',
  });

  shipit.initConfig({
    test: {
      gsBucket: 'gs://some-bucket',
    },
    default: {
      dirToCopy: 'dist',
      deployTo: 'webapp',
      keepReleases: 5,
    },
  });

  Update(shipit);
  Init(shipit);

  beforeEach(() => {
    shipit.local = jest.fn(() => {
      return Promise.resolve();
    });

    moment.utc = jest.fn(() => {
      return {
        format() {
          return '19700101000000';
        },
      };
    });
  });

  afterEach(() => {
    shipit.local.mockRestore();
    moment.utc.mockRestore();
  });

  test('it copies the dirToCopy to remote current', (done) => {
    shipit.start(['deploy:init', 'deploy:update'], (err) => {
      if (err) {
        done(err);
      }
      expect(shipit.local.mock.calls[0][0]).toEqual('gsutil -m cp -r dist/* gs:///some-bucket/webapp/current');
      done();
    });
  });

  test('it copies current to a timestamp release', (done) => {
    shipit.start(['deploy:init', 'deploy:update'], (err) => {
      if (err) {
        done(err);
      }
      expect(shipit.local.mock.calls[1][0]).toEqual('gsutil -m cp -r gs:///some-bucket/webapp/current gs:///some-bucket/webapp/releases/19700101000000');
      done();
    });
  });

});
