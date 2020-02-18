"use strict"

const HOME = "https://movefil.es"
const REGION = "us-east-1"
const ROLE_NAME = "move-files-client"
const AWS = require("aws-sdk")
const iot = new AWS.Iot()
const sts = new AWS.STS()

const getRandomInt = () => {
  return Math.random().toString(36).substring(2)
}

module.exports.auth = (event, context, callback) => {
  iot.describeEndpoint({}, (err, data) => {
    if (err) {
      return callback(err)
    }
    const iotEndpoint = data.endpointAddress
    sts.getCallerIdentity({}, (err, data) => {
      if (err) {
        return callback(err)
      }
      const params = {
        RoleArn: `arn:aws:iam::${data.Account}:role/${ROLE_NAME}`,
        RoleSessionName: getRandomInt().toString()
      }
      sts.assumeRole(params, (err, data) => {
        if (err) {
          return callback(err)
        }
        const res = {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": HOME
          },
          body: JSON.stringify({
            iotEndpoint: iotEndpoint,
            region: REGION,
            accessKey: data.Credentials.AccessKeyId,
            secretKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken
         })
        }
        callback(null, res)
      })
    })
  })
}

module.exports.post = (event, context, callback) => {
  const URL = event.pathParameters.url
  callback(null, {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": HOME,
    },
    body: JSON.stringify({
      /*...*/
    })
  })
}
