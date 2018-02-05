jest.mock('../../shared/init');
jest.mock('../update');
jest.mock('../clean');
jest.mock('../../shared/finished');

import utils from 'shipit-utils';
import Deploy from './../index';
import init from '../../shared/init';
import update from '../update';
import clean from '../clean';
import finished from '../../shared/finished';

describe('deploy', () => {
  const shipit = {};

  beforeAll(() => {
    utils.registerTask = jest.fn();
    Deploy(shipit);
  });

  afterAll(() => {
    jest.unmock('../shared/init');
    jest.unmock('../update');
    jest.unmock('../clean');
    jest.unmock('../../shared/finished');
    utils.registerTask.mockRestore();

  });


  test('init with shipit and  namespace', () => {
    expect(init.mock.calls[0][0]).toEqual(shipit, 'deploy');
  });

  test('update with shipit', () => {
    expect(update.mock.calls[0][0]).toEqual(shipit);
  });

  test('clean with shipit', () => {
    expect(clean.mock.calls[0][0]).toEqual(shipit);
  });

  test('finished with shipit and namespace', () => {
    expect(finished.mock.calls[0][0]).toEqual(shipit, 'shipit');
  });


  test('registers tasks', () => {
    expect(utils.registerTask.mock.calls[0][0]).toEqual(shipit, 'deploy', [
      'gs-deploy:init',
      'gs-deploy:update',
      'gs-deploy:clean',
      'gs-deploy:finished',
    ]);
  });
});

