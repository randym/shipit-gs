import utils from 'shipit-utils';
import util from 'util';

const ERR_NO_RELEASES = 'There must be at least two releases to rollback.\nfound:\n%s';
const RELEASES = 'gsutil ls -d %s/*';
const COPY_TO_CURRENT = 'gsutil -m cp -r %s* %s';
const REMOVE = 'gsutil -m rm -r %s';
const NAME = 'gs-rollback:update';

/**
 * registers rollback:update task to remove the latest release and make the previous one active.
 * @param {Object} shipit An instance of shipit
 */
export default function clean(shipit) {

  utils.registerTask(shipit, NAME, task);

  function task() {
    return getReleases()
      .then(configureReleases)
      .then(doRollback);
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

  function doRollback(releases) {
    const rollback = util.format(COPY_TO_CURRENT, releases.rollback, shipit.currentPath);
    const remove = util.format(REMOVE, releases.remove);

    return shipit.local(rollback).then(() => {
      return shipit.local(remove);
    });
  }

  function getReleases() {
    const releases = util.format(RELEASES, shipit.releasesPath);

    return shipit.local(releases).then((result) => {
      return result.stdout.replace(/\n$/, '').split('\n');
    });
  }
}


