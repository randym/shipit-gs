import util from 'util';
import utils from 'shipit-utils';
import {
  promiseChain,
  stdoutLines,
} from './helpers';

const GCLOUD = 'gcloud info';
const GET_CONFIGS = 'gcloud config configurations list --format="value(name)"';
const ACTIVATE_CONFIG = 'gcloud config configurations activate %s';
const CREATE_CONFIG = 'gcloud config configurations create %s --activate';
const SET_PROJECT = 'gcloud config set project %s';
const SET_ACCOUNT = 'gcloud config set account %s';
const ACTIVE_ACCOUNT = 'gcloud auth list --filter="status:ACTIVE" --format="value(account)"';
const LOGIN = 'gcloud auth login %s --brief';

export default function gcloud(shipit, namespace) {
  utils.registerTask(shipit, `${namespace}:gcloud`, () => {
    return promiseChain([
      getGcloudInfo,
      findOrCreateConfig,
      activateAccount,
    ],
    shipit);
  });
}

function getGcloudInfo(shipit) {
  return shipit.local(GCLOUD)
    .then(() => {
      return shipit;
    });
}

function findOrCreateConfig(shipit) {
  const configName = `shipit-${shipit.environment}`;
  return getConfigurations(shipit)
    .then((configurations) => {
      const configExists = (configurations.indexOf(configName) >= 0);
      const action = configExists ? activateConfig : createConfig;
      return action(shipit, configName);
    });
}

function activateAccount(shipit) {
  const account = shipit.config.gsAccount;
  return shipit.local(ACTIVE_ACCOUNT)
    .then((response) => {
      if (response.stdout.match(account)) {
        return shipit;
      } else {
        return shipit.local(util.format(LOGIN, account));
      }
    });
}

function getConfigurations(shipit) {
  return shipit.local(GET_CONFIGS).then((response) => {
    return stdoutLines(response);
  });
}

function activateConfig(shipit, configName) {
  return shipit.local(util.format(ACTIVATE_CONFIG, configName)).then(() => {
    return shipit;
  });
}

function createConfig(shipit, configName) {
  const commands = [
    util.format(CREATE_CONFIG, configName),
    util.format(SET_PROJECT, shipit.config.gsProject),
    util.format(SET_ACCOUNT, shipit.config.gsAccount),
  ];
  return shipit.local(commands.join(' && ')).then(() => {
    return shipit;
  });
}

