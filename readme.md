# Ortus ColdBox Module Template

This template can be used to create Ortus based ColdBox Modules.  The root of the module is the root of the repository. Add all the necessary files your module will need.

* `build` - This is the CommandBox task that builds the project.  Only modify if needed.  Most modules will never modify it. (Modify if needed)
* `test-harness` - This is a ColdBox testing application
* `.cflintrc` - A CFLint configuration file according to Ortus Standards
* `.editorconfig` - Smooth consistency between editors
* `.gitattributes` - Git attributes
* `.gitignore` - Basic ignores. Modify as needed.
* `.travis.yml` - Travis Automation
* `box.json` - The box.json for YOUR module.  Modify as needed.
* `changelog.md` - A nice changelog tracking file
* `ModuleConfig.cfc` - Your module's configuration. Modify as needed.
* `readme.md` - Your module's readme. Modify as needed.

## Test Harness

The test harness is created to bootstrap your working module into the application `afterAspectsLoad`.  This is done in the `config/ColdBox.cfc`.  It includes some key features:

* `config` - Modify as needed
* `tests` - All your testing specs should go here.  Please notice the commented out ORM fixtures.  Enable them if your module requires ORM
* `.cfconfig.json` - A prepared cfconfig json file so your engine data is consistent.  Modify as needed.
* `.env.sample` - An environment property file sample.  Copy and create a `.env` if your app requires it.
* `server-xx@x.json` - A set of json files to configure the major engines your modules supports.

## API Docs

The build task will take care of building API Docs using DocBox for you but **ONLY** for the `models` folder in your module.  If you want to document more then make sure you modify the `build/Build.cfc` task.

## Travis Automation

The `.travis.yml` is included for automation of your module.  It will clone, test, package, deploy your module to ForgeBox and the Ortus S3 accounts for API Docs and Artifacts.  So please make sure the following environment variables are set in your Travis configuration:

- `FORGEBOX_API_TOKEN` - The Ortus ForgeBox API Token
- `AWS_ACCESS_KEY` - The travis user S3 account
- `AWS_ACCESS_SECRET` - The travis secret S3

> Please contact the admins in the `#infrastructure` channel for these credentials.