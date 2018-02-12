import utils from 'shipit-utils';
import util from 'util';
import gcloud from './gcloud';
import init from './init';
import finished from './finished';
import {
  registerTaskChain,
  stdoutLines,
  promiseChain,
} from './helpers';

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
  gcloud(shipit, NAMESPACE);

  utils.registerTask(shipit, `${NAMESPACE}:update`, () => {
    return getReleases(shipit)
      .then((releases) => {
        if (releases.length < 2) {
          throw new Error(util.format(ERR_NO_RELEASES, releases.join('\n')));
        }
        return removeRelease(shipit, releases);
      })
      .then((releases) => {
        return copyToCurrent(shipit, releases.pop());
      });
  });

  registerTaskChain(shipit, NAMESPACE);
}

function getReleases(shipit) {
  const releases = util.format(RELEASES, shipit.releasesPath);
  return shipit.local(releases).then((response) => {
    return stdoutLines(response);
  });
}

function removeRelease(shipit, releases) {
  const gsutilRemove = util.format(REMOVE, releases.pop());
  return shipit.local(gsutilRemove).then(() => {
    return releases;
  });
}

function copyToCurrent(shipit, release) {
  const gsutilRollback = util.format(COPY_TO_CURRENT, release, shipit.currentPath);
  return shipit.local(gsutilRollback);
}

