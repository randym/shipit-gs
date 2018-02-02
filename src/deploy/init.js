import utils from 'shipit-utils';
import url from 'url';
import path from 'path2/posix';

/**
 * registers deploy:init task to configure current and release paths.
 * @param {Object} shipit An instance of shipit
 */

export default function init(shipit) {
  utils.registerTask(shipit, 'deploy:init', task);

  function task() {
    const basePath = path.join(shipit.config.gsBucket, shipit.config.deployTo);

    shipit.currentPath = url.resolve('gs://', path.join(basePath, 'current'));
    shipit.releasesPath = url.resolve('gs://', path.join(basePath, 'releases'));

    shipit.emit('deploy');
    return shipit;
  }
}
