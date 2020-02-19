/* Pre-load Scripts */

let INIT_ENV = {
  path: "crm1env8g0.execute-api.us-east-1.amazonaws.com",
  stage: "dev",
  mainline: "move-files-root",
  iconSize: 64,
  headerSize: 128
}

const MOVE = {
  API_PATH: ("https://" + INIT_ENV.path + "/" + INIT_ENV.stage),
  API_STAGE: INIT_ENV.stage.toUpperCase(),
  MAINLINE: INIT_ENV.mainline,
  ICON_SIZE: INIT_ENV.iconSize,
  HEADER_SIZE: INIT_ENV.headerSize,
  ui: {
    onCreate: (filename, type, x, y) => {},
    onDelete: (signature) => {}
  }
}

for (let key in INIT_ENV) {
  delete INIT_ENV[key];
}
