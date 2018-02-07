import moment from 'moment';
import Shipit from 'shipit-cli';
import Deploy from './../deploy';

describe('deploy', () => {
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
      dirToCopy: 'dist',
      gsDeployTo: 'webapp',
    },
  });

  Deploy(shipit);

  beforeEach(() => {
    shipit.local = jest.fn((command) => {
      if (command.match(/ rm /)) {
        const parts = command.split(' ');
        const hyphenRIndex = parts.indexOf('-r');
        const files = parts.slice(hyphenRIndex + 1);
        files.forEach((file) => {
          const fileIndex = response.indexOf(file);
          response.splice(fileIndex, 1);
        });
      }

      return Promise.resolve({stdout: response.join('\n')});
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

  test('registers tasks', () => {
    expect(shipit.tasks['gs-deploy:init']).toBeDefined();
    expect(shipit.tasks['gs-deploy:update']).toBeDefined();
    expect(shipit.tasks['gs-deploy:finished']).toBeDefined();
  });

  test('it copies the dirToCopy to remote current', (done) => {
    shipit.start(['gs-deploy:init', 'gs-deploy:update'], (err) => {
      if (err) {
        done(err);
      }
      expect(shipit.local.mock.calls[0][0]).toEqual('gsutil -m -q cp -r dist/* gs://my-bucket/webapp/current');
      done();
    });
  });

  test('it copies current to a timestamp release', (done) => {
    shipit.start(['gs-deploy'], (err) => {
      if (err) {
        done(err);
      }
      expect(shipit.local.mock.calls[1][0]).toEqual('gsutil -m -q cp -r gs://my-bucket/webapp/current gs://my-bucket/webapp/releases/19700101000000');
      done();
    });
  });

  test('removes oldest versions', (done) => {

    response = [
      'gs://my-bucket/webapp/releases/1/',
      'gs://my-bucket/webapp/releases/2/',
      'gs://my-bucket/webapp/releases/3/',
      'gs://my-bucket/webapp/releases/4/',
      'gs://my-bucket/webapp/releases/5/',
      'gs://my-bucket/webapp/releases/6/',
    ];

    shipit.start('gs-deploy', (err) => {
      if (err) { done(err); }
      expect(shipit.local.mock.calls[2][0]).toEqual('gsutil ls -d gs://my-bucket/webapp/releases/*');

      expect(shipit.local.mock.calls[3][0]).toEqual('gsutil -m -q rm -r gs://my-bucket/webapp/releases/2/ gs://my-bucket/webapp/releases/1/');
      done();
    });
  });


  test('does not try to remove when we have not met keepReleases', (done) => {

    response = [
      'gs://my-bucket/webapp/releases/3/',
      'gs://my-bucket/webapp/releases/4/',
      'gs://my-bucket/webapp/releases/5/',
      'gs://my-bucket/webapp/releases/6/',
    ];

    shipit.start('gs-deploy', (err) => {
      if (err) { done(err); }
      expect(shipit.local.mock.calls[2][0]).toEqual('gsutil ls -d gs://my-bucket/webapp/releases/*');
      expect(shipit.local.mock.calls.length).toEqual(3);
      expect(response.length).toEqual(shipit.config.keepReleases);
      done();
    });
  });

});
