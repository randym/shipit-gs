import inquirer from 'inquirer';
import Shipit from 'shipit-cli';
import Gcloud from './../gcloud';

describe('gcloud', () => {

  describe('when gcloud is not installed', () => {
    const shipit = new Shipit({
      environment: 'test',
    });

    shipit.initConfig({
      test: {
        gsProject: 'my-project',
        gsBucket: 'my-bucket',

      },
      default: {
        dirToCopy: 'dist',
        gsDeployTo: 'webapp',
      },
    });

    Gcloud(shipit, 'test');
    beforeAll(() => {
      shipit.local = jest.fn((command) => {
        if (command.match('gcloud info')) {
          return Promise.reject(new Error('zsh: command not found: gcloud\n'));
        }
        return Promise.resolve({stdout: '\n'});
      });
    });

    afterAll(() => {
      shipit.local.mockRestore();
    });

    test('it tries to run gclout info', (done) => {
      shipit.start('test:gcloud', (err) => {
        expect(shipit.local).calledWith('gcloud info');
        expect(err.message).toEqual('zsh: command not found: gcloud\n');
        done(!err);
      });
    });
  });

  describe('configuration exists', () => {
    const shipit = new Shipit({
      environment: 'test',
    });


    shipit.initConfig({
      test: {
        gsProject: 'my-project',
        gsBucket: 'my-bucket',
      },
      default: {
        dirToCopy: 'dist',
        gsDeployTo: 'webapp',
      },
    });

    Gcloud(shipit, 'test');

    beforeAll(() => {
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
        return Promise.resolve({stdout: '\n'});
      });
    });

    afterAll(() => {
      shipit.local.mockRestore();
      inquirer.prompt.mockRestore();
    });

    test('runs the expected commands', (done) => {
      shipit.start('test:gcloud', (err) => {
        expect(shipit.local.mock.calls).toEqual([
          ['gcloud info'],
          ['gcloud config configurations list --format="value(name)"'],
          ['gcloud config configurations activate my-bucket'],
          ['gcloud config configurations list --filter="is_active:true" --format="value(ACCOUNT)"'],
          ['gcloud auth login me@shipit-gs --brief'],
        ]);
        done(err);
      });
    });
  });

  describe('configuration does not exist', () => {
    const shipit = new Shipit({
      environment: 'test',
    });

    shipit.initConfig({
      test: {
        gsProject: 'my-project',
        gsBucket: 'my-bucket',
      },
      default: {
        dirToCopy: 'dist',
        gsDeployTo: 'webapp',
      },
    });

    Gcloud(shipit, 'test');

    beforeAll(() => {
      shipit.local = jest.fn((command) => {
        if (command.match('auth list')) {
          return Promise.resolve({stdout: ''});
        }
        return Promise.resolve({stdout: ''});
      });
      inquirer.prompt = jest.fn(() => {
        return Promise.resolve({account: 'me@shipit-gs'});
      });
    });

    afterAll(() => {
      shipit.local.mockRestore();
      inquirer.prompt.mockRestore();
    });

    test('runs the expected commands', (done) => {
      shipit.start('test:gcloud', (err) => {
        expect(shipit.local.mock.calls).toEqual([
          ['gcloud info'],
          ['gcloud config configurations list --format="value(name)"'],
          ['gcloud config configurations create my-bucket --activate'],
          ['gcloud config set project my-project'],
          ['gcloud auth list --format="value(account)"'],
          ['gcloud config set account me@shipit-gs'],
          ['gcloud auth login me@shipit-gs --brief'],
        ]);
        done(err);
      });
    });
  });
});

