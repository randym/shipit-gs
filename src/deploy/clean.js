import utils from 'shipit-utils';
import util from 'util';

const MESSAGE = 'Keeping "%d" last releases, cleaning others';
const RELEASES_CMD = 'gsutil ls -d %s/*';
const REMOVE = 'gsutil -m rm -r %s';

/**
 * registers deploy:clean task to remove any releases that exceed the configured keepReleases.
 * @param {Object} shipit An instance of shipit
 */
export default function clean(shipit) {

  utils.registerTask(shipit, 'gs-deploy:clean', task);

  function task() {

    shipit.log(MESSAGE, shipit.config.keepReleases);

    return getOldReleases()
      .then((remove) => {
        if (remove) {
          return shipit.local(util.format(REMOVE, remove));
        } else {
          return false;
        }
      })
      .then((removed) => {
        return shipit.emit(util.format('Cleaned %s', removed));
      });
  }

  function getOldReleases() {
    const command = util.format(RELEASES_CMD, shipit.releasesPath);

    return shipit.local(command).then((result) => {
      return result.stdout.replace(/\n$/, '')
        .split('\n')
        .reverse()
        .slice(shipit.config.keepReleases)
        .join(' ');
    });
  }
}

