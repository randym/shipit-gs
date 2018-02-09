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
        gsAccount: 'me@shipit-gs',
      },
    });

    Gcloud(shipit);

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
      shipit.start('gs-gcloud', (err) => {
        expect(shipit.local.mock.calls[0][0]).toEqual('gcloud info');
        expect(err.message).toEqual('zsh: command not found: gcloud\n');
        done();
      });
    });
  });

  describe('configuration exists', () => {
    const shipit = new Shipit({
      environment: 'test',
    });


    shipit.initConfig({
      test: {
        gsAccount: 'me@shipit-gs',
        gsProject: 'my-project',
        gsBucket: 'my-bucket',
      },
      default: {
        dirToCopy: 'dist',
        gsDeployTo: 'webapp',
      },
    });

    Gcloud(shipit);

    beforeAll(() => {
      shipit.local = jest.fn((command) => {
        if (command.match('gcloud info')) {
          return Promise.resolve({stdout: 'gcloud info - output'});
        }
        if (command.match('configurations list')) {
          return Promise.resolve({stdout: 'shipit-test\n'});
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
    });

    test('runs the expected commands', (done) => {
      shipit.start('gs-gcloud', (err) => {
        expect(shipit.local.mock.calls).toEqual([
          ['gcloud info'],
          ['gcloud config configurations list --format="value(name)"'],
          ['gclound config configurations activate shipit-test'],
          ['gcloud auth list --filter="status:ACTIVE" --format="value(account)"'],
        ]);
        done(err);
      });
    });
  });


  describe('configuration exists', () => {
    const shipit = new Shipit({
      environment: 'test',
    });


    shipit.initConfig({
      test: {
        gsAccount: 'me@shipit-gs',
        gsProject: 'my-project',
        gsBucket: 'my-bucket',
      },
      default: {
        dirToCopy: 'dist',
        gsDeployTo: 'webapp',
      },
    });

    Gcloud(shipit);

    beforeAll(() => {
      shipit.local = jest.fn(() => {
        return Promise.resolve({stdout: '\n'});
      });
    });

    afterAll(() => {
      shipit.local.mockRestore();
    });

    test('runs the expected commands', (done) => {
      shipit.start('gs-gcloud', (err) => {
        expect(shipit.local.mock.calls).toEqual([
          ['gcloud info'],
          ['gcloud config configurations list --format="value(name)"'],
          ['gcloud config configurations create shipit-test --activate && gcloud config set project my-project && gcloud config set account me@shipit-gs'],
          ['gcloud auth list --filter="status:ACTIVE" --format="value(account)"'],
          ['gcloud auth login me@shipit-gs --brief'],
        ]);
        done(err);
      });
    });
  });
});

