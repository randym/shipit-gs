import utils from 'shipit-utils';

/**
 * registers namespace:finsihed task to broadcast that the process is complete
 * @param {Object} shipit An instance of shipit
 * @param {String} namespace The prefix used when registering individual tasks
 */
export default function init(shipit, namespace) {
  utils.registerTask(shipit, `${namespace}:finished`, task);

  function task() {
    return shipit.emit(`${namespace}:finished`);
  }
}


