import utils from 'shipit-utils';
import init from '../shared/init';
import update from './update';
import finished from '../shared/finished';

/**
 * Rollback task
 * - rollback:init
 * - rollback:update
 * - rollback:finished
 */
const NAMESPACE = 'gs-rollback';

export default function deploy(shipit) {
  init(shipit, NAMESPACE);
  update(shipit);
  finished(shipit, NAMESPACE);

  utils.registerTask(shipit, NAMESPACE, [
    `${NAMESPACE}:init`,
    `${NAMESPACE}:update`,
    `${NAMESPACE}:finished`,
  ]);
}

