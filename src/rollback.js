import utils from 'shipit-utils';
import util from 'util';
import init from './init';
import finished from './finished';

const NAMESPACE = 'gs-rollback';
const ERR_NO_RELEASES = 'There must be at least two releases to rollback.\nfound:\n%s';
const RELEASES = 'gsutil ls -d %s/*';
const COPY_TO_CURRENT = 'gsutil -m cp -r %s* %s';
const REMOVE = 'gsutil -m rm -r %s';

/**
 * registers gs-rollback task, initializing and orchestrating gs-rollback namepaced tasks for init, update and finished.
 * @param {Object} shipit An instance of shipit
 */
export default function rollback(shipit) {
  init(shipit, NAMESPACE);
  finished(shipit, NAMESPACE);

  utils.registerTask(shipit, NAMESPACE, [
    `${NAMESPACE}:init`,
    `${NAMESPACE}:update`,
    `${NAMESPACE}:finished`,
  ]);

  utils.registerTask(shipit, `${NAMESPACE}:update`, task);

  function task() {
    return getReleases()
      .then(configureReleases)
      .then(doRollback);
  }

  function doRollback(releases) {
    const gsutilRollback = util.format(COPY_TO_CURRENT, releases.rollback, shipit.currentPath);
    const gsutilRemove = util.format(REMOVE, releases.remove);

    return shipit.local(gsutilRollback).then(() => {
      return shipit.local(gsutilRemove);
    });
  }

  function getReleases() {
    const releases = util.format(RELEASES, shipit.releasesPath);

    return shipit.local(releases).then((result) => {
      return result.stdout.replace(/\n$/, '').split('\n');
    });
  }
}

function configureReleases(releases) {
  if (releases.length < 2) {
    throw new Error(util.format(ERR_NO_RELEASES, releases.join('\n')));
  }
  return {
    remove: releases.pop(),
    rollback: releases.pop(),
  };
}

