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

const atsPublish = (body, callback) => {
  iot.describeEndpoint({}, (err, data) => {
    if (err) {
      return callback(err)
    }
    const iotEndpoint = atsEndpoint(data.endpointAddress)
    const iotdata = new AWS.IotData({
      endpoint: iotEndpoint
    })
    let iotParams = {
      topic: TOPIC,
      payload: JSON.stringify(body),
      qos: 0
    }
    iotdata.publish(iotParams, (err, data) => {
      if (err) {
        return callback(err)
      }
      else {
        callback(null)
      }
    })
  })
}

const s3Delete = (filename, signature, callback) => {
  let params = {
    Bucket: BUCKET_NAME,
    Key: (signature + "/" + filename)
  }
  s3.deleteObject(params, (err, data) => {
    if (err) {
      return callback(err)
    }
    else {
      callback(null)
    }
  })
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
  const params = JSON.parse(event.body)
  let url = false
  let signature = false
  if (params) {
    signature = getRandomID().toString()
    const putParams = {
      Bucket: BUCKET_NAME,
      Key: (signature + "/" + params.filename),
      ContentType: params.type,
      ACL: "public-read"
    }
    let iotPayload = {
      filename: params.filename,
      type: params.type,
      signature: signature
    }
    atsPublish(iotPayload, (err) => {
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
          body: JSON.stringify({ url, signature })
        })
      }
    })
  }
  else {
    let err = true
    return callback(err)
  }
}

module.exports.delete = (event, context, callback) => {
  const params = JSON.parse(event.body)
  if (params) {
    let signature = params.signature
    let filename = params.filename
    s3Delete(filename, signature, (err) => {
      if (err) {
        return callback(err)
      }
      else {
        let iotPayload = { filename, signature }
        iotPayload.delete = true
        atsPublish(iotPayload, (err) => {
          if (err) {
            return callback(err)
          }
          else {
            callback(null, {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": HOME,
              },
              body: JSON.stringify({ filename, signature })
            })
          }
        })
      }
    })
  }
  else {
    let err = true
    return callback(err)
  }
}
