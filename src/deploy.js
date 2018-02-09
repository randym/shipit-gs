import util from 'util';
import moment from 'moment';
import utils from 'shipit-utils';

import gcloud from './gcloud';
import init from './init';
import finished from './finished';

const NAMESPACE = 'gs-deploy';

const COPY_TO_CURRENT = 'gsutil -m -q cp -r %s/* %s';
const COPY_TO_RELEASE = 'gsutil -m -q cp -r %s %s/%d';
const RELEASES_CMD = 'gsutil ls -d %s/*';
const REMOVE = 'gsutil -m -q rm -r %s';

/**
 * registers gs-deploy task which will publish the dirToCopy configuration to current and
 * generate a timestamped release. Finally, old releases will be culled so that we only keep
 * the configured keepReleases.
 * @param {Object} shipit An instance of shipit
 */
export default function deploy(shipit) {
  init(shipit, NAMESPACE);
  finished(shipit, NAMESPACE);
  gcloud(shipit, NAMESPACE);
  utils.registerTask(shipit, `${NAMESPACE}:update`, () => {
    return copyToCurrent(shipit)
      .then(copyToRelease)
      .then(removeOldReleases);
  });

  utils.registerTask(shipit, NAMESPACE, [
    `${NAMESPACE}:gcloud`,
    `${NAMESPACE}:init`,
    `${NAMESPACE}:update`,
    `${NAMESPACE}:finished`,
  ]);
}

function copyToCurrent(shipit) {
  const command = util.format(COPY_TO_CURRENT, shipit.config.dirToCopy, shipit.currentPath);
  return shipit.local(command).then(() => {
    return shipit;
  });
}

function copyToRelease(shipit) {
  const timestamp = moment.utc().format('YYYYMMDDHHmmss');
  const command = util.format(COPY_TO_RELEASE, shipit.currentPath, shipit.releasesPath, timestamp);
  return shipit.local(command).then(() => {
    return shipit;
  });
}

function removeOldReleases(shipit) {
  const command = util.format(RELEASES_CMD, shipit.releasesPath);
  return shipit.local(command)
    .then((response) => {
      return response.stdout.replace(/\n$/, '')
        .split('\n')
        .reverse()
        .slice(shipit.config.keepReleases)
        .join(' ');
    })
    .then((remove) => {
      return remove ? shipit.local(util.format(REMOVE, remove)) : false;
    });
}

