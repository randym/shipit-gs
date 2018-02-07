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
 * registers gs-rollback task which will remove the latest release and make the previous release current.
 * Note that an error is thrown if there are fewer than two releases.
 * @param {Object} shipit An instance of shipit
 */
export default function rollback(shipit) {
  init(shipit, NAMESPACE);
  finished(shipit, NAMESPACE);
  utils.registerTask(shipit, `${NAMESPACE}:update`, () => {
    return getReleases(shipit)
      .then((releases) => {
        return doRollback(shipit, releases);
      });
  });

  utils.registerTask(shipit, NAMESPACE, [
    `${NAMESPACE}:init`,
    `${NAMESPACE}:update`,
    `${NAMESPACE}:finished`,
  ]);
}

function getReleases(shipit) {
  const releases = util.format(RELEASES, shipit.releasesPath);

  return shipit.local(releases).then((result) => {
    return result.stdout.replace(/\n$/, '').split('\n');
  });
}

function doRollback(shipit, releases) {
  if (releases.length < 2) {
    throw new Error(util.format(ERR_NO_RELEASES, releases.join('\n')));
  }
  const removeRelease = releases.pop();
  const rollbackRelease = releases.pop();

  const gsutilRemove = util.format(REMOVE, removeRelease);
  const gsutilRollback = util.format(COPY_TO_CURRENT, rollbackRelease, shipit.currentPath);

  return shipit.local(gsutilRollback).then(() => {
    return shipit.local(gsutilRemove);
  });
}

