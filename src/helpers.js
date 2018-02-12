import utils from 'shipit-utils';

export function registerTaskChain(shipit, namespace) {

  utils.registerTask(shipit, namespace, [
    `${namespace}:gcloud`,
    `${namespace}:init`,
    `${namespace}:update`,
    `${namespace}:finished`,
  ]);

  return shipit;
}

export function promiseChain(members, ...args) {
  return members.reduce((promise, member) => {
    return promise.then(member);
  }, Promise.resolve(...args));
}

export function stdoutLines(response) {
  return response.stdout.replace(/\n$/, '').split('\n');
}
