import utils from 'shipit-utils';
import util from 'util';
import moment from 'moment';

const COPY_TO_CURRENT = 'gsutil -m -q cp -r %s/* %s';
const COPY_TO_RELEASE = 'gsutil -m -q cp -r %s %s/%d';
const NAME = 'gs-deploy:update';

// I can use rsync if the directories exist -
// Lets do a bit of data testing / timing
// const RSYNC_TO_CURRENT = 'gsutil -m -q rsync -r -d %s %s';
// const RSYNC_TO_RELEASE = 'gsutil -m -q rsync -r -d %s %s/%d';
// const current = util.format(RSYNC_TO_CURRENT, shipit.config.dirToCopy, shipit.currentPath);
// const release = util.format(RSYNC_TO_RELEASE, shipit.config.currentPath, shipit.releasesPath, timestamp);

export default function update(shipit) {

  utils.registerTask(shipit, NAME, task);

  function task() {
    const timestamp = moment.utc().format('YYYYMMDDHHmmss');
    const current = util.format(COPY_TO_CURRENT, shipit.config.dirToCopy, shipit.currentPath);
    const release = util.format(COPY_TO_RELEASE, shipit.currentPath, shipit.releasesPath, timestamp);

    return shipit.local(current).then(() => {
      return shipit.local(release);
    });
  }
}
