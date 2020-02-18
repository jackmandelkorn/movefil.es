"use strict"

const HOME = "https://movefil.es"
const REGION = "us-east-1"
const ROLE_NAME = "move-files-client"
const TOPIC = "move-files-root"
const BUCKET_NAME = "move-files-bucket"
const AWS = require("aws-sdk")
const iot = new AWS.Iot()
const sts = new AWS.STS()
const s3 = new AWS.S3()

const getRandomID = () => {
  return Math.random().toString(36).substring(2)
}

const atsEndpoint = (endpoint) => {
  let a = endpoint.split(".")
  a[0] = (a[0] + "-ats")
  return a.join(".")
}

module.exports.auth = (event, context, callback) => {
  iot.describeEndpoint({}, (err, data) => {
    if (err) {
      return callback(err)
    }
    const iotEndpoint = atsEndpoint(data.endpointAddress)
    sts.getCallerIdentity({}, (err, data) => {
      if (err) {
        return callback(err)
      }
      const params = {
        RoleArn: `arn:aws:iam::${data.Account}:role/${ROLE_NAME}`,
        RoleSessionName: getRandomID().toString()
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
  iot.describeEndpoint({}, (err, data) => {
    if (err) {
      return callback(err)
    }
    const iotEndpoint = atsEndpoint(data.endpointAddress)
    const iotdata = new AWS.IotData({
      endpoint: iotEndpoint
    })
    const params = JSON.parse(event.body)
    let url = false
    let ignore = false
    if (params) {
      const putParams = {
        Bucket: BUCKET_NAME,
        Key:  params.name,
        ContentType: params.type,
        ACL: "public-read"
      }
      if (params.name && params.type) {
        ignore = getRandomID().toString()
        let iotPayload = {
          filename: params.name,
          type: params.type,
          signature: ignore
        }
        let iotParams = {
          topic: TOPIC,
          payload: JSON.stringify(iotPayload),
          qos: 0
        }
        iotdata.publish(iotParams, (err, data) => {
          if (err) {
            return callback(err)
          }
          else {
            url = s3.getSignedUrl("putObject", putParams)
            callback(null, {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": HOME,
              },
              body: JSON.stringify({url,ignore})
            })
          }
        })
      }
    }
    else {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": HOME,
        },
        body: JSON.stringify({url,ignore})
      })
    }
  })
}
