import utils from 'shipit-utils';
import url from 'url';
import path from 'path2/posix';
import instrument from './instrument';

/**
 * registers deploy:init task to configure currentPath and releasesPath.
 * @param {Object} shipit An instance of shipit
 */
export default function init(shipit, namespace) {
  utils.registerTask(shipit, `${namespace}:init`, instrument(shipit, task, `${namespace}:init`));

  function task() {
    const basePath = path.join(shipit.config.gsBucket, shipit.config.gsDeployTo);

    shipit.currentPath = url.resolve('gs://', path.join(basePath, 'current'));
    shipit.releasesPath = url.resolve('gs://', path.join(basePath, 'releases'));

    shipit.emit(namespace);
    return Promise.resolve(shipit);
  }
}

