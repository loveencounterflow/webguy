(async function() {
  'use strict';
  var FS, PATH, WG, cd, error, intertype_path, intertype_pkgjson, intertype_pkgjson_path, intertype_pkgjson_text, log, rpr, webguy_pkgjson, zx;

  //===========================================================================================================
  WG = require('./main');

  ({rpr} = WG.trm);

  ({log} = console);

  PATH = require('node:path');

  FS = require('node:fs');

  ({
    $: zx,
    cd
  } = (await import('zx')));

  log('===========================================================');

  log(__filename);

  log("Updating WebGuy version in InterType");

  log('===========================================================');

  webguy_pkgjson = require('../package.json');

  intertype_path = PATH.resolve(PATH.join(__dirname, '../../intertype-banzai'));

  intertype_pkgjson_path = PATH.resolve(PATH.join(intertype_path, 'package.json'));

  intertype_pkgjson = require(intertype_pkgjson_path);

  if (intertype_pkgjson.dependencies == null) {
    intertype_pkgjson.dependencies = {};
  }

  intertype_pkgjson.dependencies.webguy = `^${webguy_pkgjson.version}`;

  intertype_pkgjson_text = JSON.stringify(intertype_pkgjson, null, '  ');

  FS.writeFileSync(intertype_pkgjson_path, intertype_pkgjson_text);

  log("InterType dependencies:");

  log(intertype_pkgjson.dependencies);

  log('-----------------------------------------------------------');

  cd(intertype_path);

  await zx`git add package.json`;

  try {
    await zx`git commit -m'bumped webguy version'`;
  } catch (error1) {
    error = error1;
    rpr(error.message);
  }

  await zx`git push`;

  log('===========================================================');

  log(__filename);

  log("Done");

  log('===========================================================');

}).call(this);

//# sourceMappingURL=script-postpublish.js.map