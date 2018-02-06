import utils from 'shipit-utils';
import Rollback from './../index';
import init from '../../shared/init';
import update from '../update';
import finished from '../../shared/finished';

jest.mock('../../shared/init');
jest.mock('../update');
jest.mock('../../shared/finished');

describe('deploy', () => {
  const shipit = {};

  beforeAll(() => {
    utils.registerTask = jest.fn();
    Rollback(shipit);
  });

  afterAll(() => {
    jest.unmock('../shared/init');
    jest.unmock('../update');
    jest.unmock('../../shared/finished');
    utils.registerTask.mockRestore();

  });

  test('init with shipit and  namespace', () => {
    expect(init.mock.calls[0][0]).toEqual(shipit, 'rollback');
  });

  test('update with shipit', () => {
    expect(update.mock.calls[0][0]).toEqual(shipit);
  });

  test('finished with shipit and namespace', () => {
    expect(finished.mock.calls[0][0]).toEqual(shipit, 'rollback');
  });

  test('registers tasks', () => {
    expect(utils.registerTask.mock.calls[0][0]).toEqual(shipit, 'rollback', [
      'rollback:init',
      'rollback:update',
      'rollback:clean',
      'rollback:finished',
    ]);
  });
});


