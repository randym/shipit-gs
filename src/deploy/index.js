import utils from 'shipit-utils';

import init from '../shared/init';
import update from './update';
import clean from './clean';
import finished from '../shared/finished';

/**
 * Deploy task
 * - deploy:init
 * - deploy:update
 * - deploy:clean
 * - deploy:finished
 */
const NAMESPACE = 'gs-deploy';

export default function deploy(shipit) {
  init(shipit, NAMESPACE);
  update(shipit);
  clean(shipit);
  finished(shipit, NAMESPACE);

  utils.registerTask(shipit, NAMESPACE, [
    `${NAMESPACE}:init`,
    `${NAMESPACE}:update`,
    `${NAMESPACE}:clean`,
    `${NAMESPACE}:finished`,
  ]);
}

