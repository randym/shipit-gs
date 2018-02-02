import utils from 'shipit-utils';

/**
 * registers deploy:finsihed task to broadcast that the deploy is complete
 * @param {Object} shipit An instance of shipit
 */

export default function init(shipit) {
  utils.registerTask(shipit, 'deploy:finished', task);

  function task() {
    return shipit.emit('deployed');
  }
}

