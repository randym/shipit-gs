import Shipit from 'shipit-cli';
import inquirer from 'inquirer';

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

      return Promise.resolve({stdout: response.join('\n')});
    });
  });

  afterEach(() => {
    inquirer.prompt.mockRestore();
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
      expect(shipit.local).calledWith('gsutil ls -d gs://my-bucket/webapp/releases/*');
      expect(shipit.local).calledWith('gsutil -m rm -r gs://my-bucket/webapp/releases/2/');
      expect(shipit.local).calledWith('gsutil -m cp -r gs://my-bucket/webapp/releases/1/* gs://my-bucket/webapp/current');
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

