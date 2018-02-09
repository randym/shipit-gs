# shipit-gs

[![Build Status](https://travis-ci.org/randym/shipit-gs.svg?branch=master)](https://travis-ci.org/randym/shipit-gs)

[![Maintainability](https://api.codeclimate.com/v1/badges/a10d5365823b5d27f1e0/maintainability)](https://codeclimate.com/github/randym/shipit-gs/maintainability)

[![Test Coverage](https://api.codeclimate.com/v1/badges/a10d5365823b5d27f1e0/test_coverage)](https://codeclimate.com/github/randym/shipit-gs/test_coverage)

Shipit-gs is a set of shipit tasks for deployment to Google Cloud Storage.

**What it can do:**

- Deploy a local resource to a [Bucket](https://cloud.google.com/storage/docs/json_api/v1/buckets) on Google Cloud Storage
- Rollback a deployment
- Manage multiple releases

**What it does _not_ do:**

- Configure Google Cloud Platform
- Make any assumptions about build/release work flow.

## Install

```
npm install shipit-gs
```

## Usage

### Example `shipitfile.js`

```js
module.exports = function (shipit) {
  require('shipit-gs')(shipit);

  shipit.initConfig({
    default: {
      dirToCopy: 'dist',
      gsDeployTo: 'myapp',
      keepReleases: 2,
    },
    staging: {
      gsBucket: 'staging-bucket'
    }
  });
};
```

To deploy to your staging bucket, just run :

```
shipit staging gs-deploy
```

To rollback, run :

```
shipit staging gs-rollback
```

## Options

### gsDeployTo

Type: `String`

The path on your bucket where current and releases directories will live.

### keepReleases

Type: `Integer`

The number of releases to keep in the releases directory. Older releases are automatically removed when the number of releases exceeds this value.

### gsBucket

Type: `String`

The name of the bucket you want to deploy to. The gs:// prefix will be added for you to generate URLs like `gs://staging-bucket/myapp/current`

## Workflow tasks

- gs-deploy
  - gs-deploy:init
    - Emit event "gs-deploy".
  - gs-deploy:update
    - Copy dirToCopy to current
    - Copy current to releases
    - Remove old releases
  - gs-deploy:finished
    - Emit event "gs-deploy:finsihed".

- gs-rollback
  - gs-rollback:init
    - Emit event "gs-rollback".
  - gs-rollback:update
    - Remove latest release
    - Copy newest remaining release to current
  - gs-rollback:finished
    - Emit event "gs-rollback:finished".

## License

MIT
