MOVE.auth.handlers = {}
MOVE.auth.handlers.connect = () => {
  MOVE.auth.client.subscribe(MOVE.auth.topic)
}
MOVE.auth.handlers.message = (topic, message) => {
  //FIXME: Testing
  console.log(message);
}
MOVE.auth.connect = (topic) => {
  MOVE.auth.topic = topic
  fetch(MOVE.API_PATH + "/index/auth").then(r => r.json()).then((keys) => {
    if (keys) {
      console.log(keys)
      MOVE.auth.client = MOVE.auth.AWS_IOT.device({
        region: keys.region,
        protocol: "wss",
        accessKeyId: keys.accessKey,
        secretKey: keys.secretKey,
        sessionToken: keys.sessionToken,
        port: 443,
        host: keys.iotEndpoint
      })
      MOVE.auth.client.on("connect", MOVE.auth.handlers.connect)
      MOVE.auth.client.on("message", MOVE.auth.handlers.message)
    }
  })
}
