/* Pre-load Scripts */
let INIT_ENV = {
  path: "crm1env8g0.execute-api.us-east-1.amazonaws.com",
  stage: "dev"
}

const MOVE = {
  API_PATH: ("https://" + INIT_ENV.path + "/" + INIT_ENV.stage),
  API_STAGE: INIT_ENV.stage.toUpperCase()
}

for (let key in INIT_ENV) {
  delete INIT_ENV[key];
}
