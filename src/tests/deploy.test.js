import moment from 'moment';
import Shipit from 'shipit-cli';
import inquirer from 'inquirer';

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
      cacheControl: 'no-cache',
    },
    default: {
      dirToCopy: 'dist',
      gsDeployTo: 'webapp',
    },
  });

  Deploy(shipit);

  beforeEach(() => {
    inquirer.prompt = jest.fn(() => {
      return Promise.resolve({account: 'me@shipit-gs'});
    });

    shipit.local = jest.fn((command) => {
      if (command.match('gcloud info')) {
        return Promise.resolve({stdout: 'gcloud info - output'});
      }

      if (command.match(/value\(name\)/)) {
        return Promise.resolve({stdout: 'my-bucket\n'});
      }

      if (command.match(/value\(ACCOUNT\)/)) {
        return Promise.resolve({stdout: 'me@shipit-gs'});
      }

      if (command.match('configurations activate')) {
        return Promise.resolve({stdout: 'activated\n'});
      }

      if (command.match('auth list')) {
        return Promise.resolve({stdout: 'me@shipit-gs\n'});
      }
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
    expect(shipit.tasks['gs-deploy:gcloud']).toBeDefined();
    expect(shipit.tasks['gs-deploy:init']).toBeDefined();
    expect(shipit.tasks['gs-deploy:update']).toBeDefined();
    expect(shipit.tasks['gs-deploy:finished']).toBeDefined();
  });

  test('it copies the dirToCopy to remote current', (done) => {
    shipit.start(['gs-deploy'], (err) => {
      expect(shipit.local).calledWith('gsutil -m -q cp -r dist/** gs://my-bucket/webapp/current/');
      done(err);
    });
  });

  test('it applies cache control', (done) => {
    shipit.start(['gs-deploy'], (err) => {
      expect(shipit.local).calledWith('gsutil -m -q setmeta -r -h "Cache-Control:no-cache" gs://my-bucket/webapp/current');
      done(err);
    });
  });

  test('it copies current to a timestamp release', (done) => {
    shipit.start(['gs-deploy'], (err) => {
      expect(shipit.local).calledWith('gsutil -m -q cp -r gs://my-bucket/webapp/current gs://my-bucket/webapp/releases/19700101000000');
      done(err);
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

      expect(shipit.local).calledWith('gsutil -m -q rm -r gs://my-bucket/webapp/releases/2/ gs://my-bucket/webapp/releases/1/');
      done(err);
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
      expect(shipit.local).calledWith('gsutil ls -d gs://my-bucket/webapp/releases/*');
      expect(response.length).toEqual(shipit.config.keepReleases);
      done(err);
    });
  });
});

