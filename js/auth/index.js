/* Authorize and Set Up IoT Connection */

MOVE.auth.handlers = {}
MOVE.auth.handlers.connect = () => {
  MOVE.auth.client.subscribe(MOVE.auth.topic)
}
MOVE.auth.handlers.message = (topic, message) => {
  const data = JSON.parse(String.fromCharCode.apply(null, message).trim())
  MOVE.handle(data)
}

MOVE.auth.connect = (topic) => {
  if (!topic) {
    topic = MOVE.MAINLINE
  }
  MOVE.auth.topic = topic
  fetch(MOVE.API_PATH + "/index/auth").then(r => r.json()).then((keys) => {
    if (keys) {
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
