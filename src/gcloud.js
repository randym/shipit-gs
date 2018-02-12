import inquirer from 'inquirer';
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
const ACCOUNTS = 'gcloud auth list --format="value(account)"';
const LOGIN = 'gcloud auth login %s --brief';
const CONFIG_ACCOUNT = 'gcloud config configurations list --filter="is_active:true" --format="value(ACCOUNT)"';

export default function gcloud(shipit, namespace) {
  utils.registerTask(shipit, `${namespace}:gcloud`, () => {
    return promiseChain([
      getGcloudInfo,
      findOrCreateConfig,
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

function getConfigurations(shipit) {
  return shipit.local(GET_CONFIGS)
    .then((response) => {
      return stdoutLines(response);
    });
}

function findOrCreateConfig(shipit) {
  const configName = shipit.config.gsBucket;
  return getConfigurations(shipit)
    .then((configurations) => {
      const configExists = (configurations.indexOf(configName) >= 0);
      const action = configExists ? activateConfig : createConfig;
      return action(shipit, configName);
    });
}

function activateConfig(shipit, configName) {
  return shipit.local(util.format(ACTIVATE_CONFIG, configName))
    .then(() => {
      return shipit.local(CONFIG_ACCOUNT);
    })
    .then(stdoutLines)
    .then((account) => {
      if (account) {
        return login(shipit, account);
      } else {
        return selectAccount(shipit);
      }
    });
}

function createConfig(shipit, configName) {
  return shipit.local(util.format(CREATE_CONFIG, configName))
    .then(() => {
      return shipit.local(util.format(SET_PROJECT, shipit.config.gsProject));
    })
    .then(() => {
      return selectAccount(shipit);
    });
}

function selectAccount(shipit) {
  return getAccounts(shipit)
    .then((accounts) => {
      return chooseAccount(shipit, accounts);
    })
    .then((account) => {
      return setAccount(shipit, account);
    })
    .then((account) => {
      return login(shipit, account);
    });
}

function getAccounts(shipit) {
  return shipit.local(ACCOUNTS)
    .then(stdoutLines);
}

function getNewAccountName() {
  return inquirer.prompt([{
    type: 'input',
    name: 'account',
    message: 'Please enter the email address for the account you want to use.',
  }])
    .then((input) => {
      return input.account;
    });
}

function chooseAccount(shipit, accounts) {
  if (accounts.length === 0) {
    return getNewAccountName();
  }

  accounts.push('other');

  return inquirer.prompt([{
    type: 'list',
    name: 'account',
    message: 'Which account do you want to use?',
    choices: accounts,
  }])
    .then((choice) => {
      return choice.account === 'other' ? getNewAccountName() : choice.account;
    });
}

function setAccount(shipit, account) {
  return shipit.local(util.format(SET_ACCOUNT, account))
    .then(() => {
      return account;
    });
}

function login(shipit, account) {
  return shipit.local(util.format(LOGIN, account))
    .then(() => {
      return shipit;
    });
}

