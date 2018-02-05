import utils from 'shipit-utils';
import util from 'util';
import moment from 'moment';

const COPY_TO_CURRENT = 'gsutil -m cp -r %s/* %s';
const COPY_TO_RELEASE = 'gsutil -m cp -r %s %s/%d';

export default function update(shipit) {

  utils.registerTask(shipit, 'gs-deploy:update', task);

  function task() {
    const timestamp = moment.utc().format('YYYYMMDDHHmmss');
    const current = util.format(COPY_TO_CURRENT, shipit.config.dirToCopy, shipit.currentPath);
    const release = util.format(COPY_TO_RELEASE, shipit.currentPath, shipit.releasesPath, timestamp);

    return shipit.local(current).then(() => {
      return shipit.local(release);
    });
  }
}
