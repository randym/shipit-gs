import util from 'util';
import moment from 'moment';

import utils from 'shipit-utils';
import init from './init';
import finished from './finished';

const NAMESPACE = 'gs-deploy';

const COPY_TO_CURRENT = 'gsutil -m -q cp -r %s/* %s';
const COPY_TO_RELEASE = 'gsutil -m -q cp -r %s %s/%d';
const RELEASES_CMD = 'gsutil ls -d %s/*';
const REMOVE = 'gsutil -m -q rm -r %s';

/**
 * registers gs-deploy task, initializing and orchestrating deploy namepaced tasks for init, update clean and finished.
 * @param {Object} shipit An instance of shipit
 */
export default function deploy(shipit) {
  init(shipit, NAMESPACE);
  finished(shipit, NAMESPACE);

  utils.registerTask(shipit, NAMESPACE, [
    `${NAMESPACE}:init`,
    `${NAMESPACE}:update`,
    `${NAMESPACE}:finished`,
  ]);

  utils.registerTask(shipit, `${NAMESPACE}:update`, task);

  function task() {
    const timestamp = moment.utc().format('YYYYMMDDHHmmss');
    const current = util.format(COPY_TO_CURRENT, shipit.config.dirToCopy, shipit.currentPath);
    const release = util.format(COPY_TO_RELEASE, shipit.currentPath, shipit.releasesPath, timestamp);
    const allReleases = util.format(RELEASES_CMD, shipit.releasesPath);

    return shipit.local(current)
      .then(() => {
        return shipit.local(release);
      })
      .then(() => {
        return shipit.local(allReleases);
      })
      .then((response) => {
        return getOldReleases(response, shipit.config.keepReleases);
      })
      .then((remove) => {
        return remove ? shipit.local(util.format(REMOVE, remove)) : false;
      });
  }
}

function getOldReleases(response, keep) {
  return response.stdout.replace(/\n$/, '')
    .split('\n')
    .reverse()
    .slice(keep)
    .join(' ');
}


