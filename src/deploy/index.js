import utils from 'shipit-utils';

import init from './init';
import update from './update';
import clean from './clean';
import finished from './finished';

/**
 * Deploy task
 * - deploy:init
 * - deploy:update
 * - deploy:clean
 * - deploy:finished
 */

export default function shipitgs(shipit) {
  init(shipit);
  update(shipit);
  clean(shipit);
  finished(shipit);

  utils.registerTask(shipit, 'deploy', [
    'deploy:init',
    'deploy:update',
    'deploy:clean',
    'deploy:finished',
  ]);
}
