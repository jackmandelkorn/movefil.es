/* Internal API Connection Scripts */

MOVE.files = []
MOVE.signatures = []

MOVE.handle = (input) => {
  if (input.delete) {
    MOVE.handleDelete(input)
  }
  else if (input.filename && input.type && input.signature) {
    input.owned = false
    MOVE.files.push(input)
    MOVE.crosscheck()
    MOVE.ui.onCreate(input.filename, input.type, input.x, input.y)
  }
}

MOVE.handleDelete = (input) => {
  if (input.filename && input.signature) {
    for (let key in MOVE.files) {
      if (MOVE.files[key].filename === input.filename && MOVE.files[key].signature === input.signature) {
        MOVE.ui.onDelete(MOVE.files[key].signature)
        MOVE.files.splice(key, 1)
      }
    }
    MOVE.crosscheck()
  }
}

MOVE.crosscheck = () => {
  for (let key in MOVE.files) {
    MOVE.files[key].owned = false
    if (MOVE.signatures.includes(MOVE.files[key].signature)) {
      MOVE.files[key].owned = true
    }
  }
}

MOVE.getSignature = (filename) => {
  let signature = false
  for (let key in MOVE.files) {
    if (MOVE.files[key].filename === filename) {
      signature = MOVE.files[key].signature
      break;
    }
  }
  return signature
}

MOVE.getType = (filename) => {
  let type = "text/plain"
  for (let key in MOVE.files) {
    if (MOVE.files[key].filename === filename) {
      type = MOVE.files[key].type
      break;
    }
  }
  return type
}

MOVE.delete = (input) => {
  let filename = input.filename
  let signature = (input.signature || MOVE.getSignature(filename))
  fetch(MOVE.API_PATH + "/index/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ filename, signature })
  }).then((res) => {
    MOVE.crosscheck()
  })
}

MOVE.get = (input) => {
  let filename = input.filename
  let signature = (input.signature || MOVE.getSignature(filename))
  fetch(MOVE.API_PATH + "/index/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ filename, signature })
  }).then(r => r.json()).then((json) => {
    const body = json.data
    const source = ("data:" + MOVE.getType(filename) + ";base64," + body)
    fetch(source).then(r => r.blob()).then((blob) => {
      MOVE.save(blob, filename)
    })
  })
}

MOVE.drop = (e) => {
  e.preventDefault()
  let dataTransfer = e.dataTransfer
  let files = MOVE.dropPositions(dataTransfer.files, e)
  MOVE.upload(files)
  return false
}

MOVE.dropCancel = (e) => {
  e.preventDefault()
  return false
}

MOVE.dropPositions = (files, e) => {
  const BUFFER = 0.5
  const DECIMALS = 3
  const SPACING_X = (((MOVE.ICON_SIZE * (1 + BUFFER)) / window.innerWidth) * 100).toFixed(DECIMALS)
  const SPACING_Y = (((MOVE.ICON_SIZE * (1 + BUFFER)) / window.innerHeight) * 100).toFixed(DECIMALS)
  const MAX_X = 100 - SPACING_X
  const MAX_Y = ((100 - SPACING_Y) - ((MOVE.HEADER_SIZE / window.innerHeight) * 100)).toFixed(DECIMALS)
  const x = Math.min(((Math.max(e.x - (MOVE.ICON_SIZE / 2), 0) / window.innerWidth) * 100).toFixed(DECIMALS), MAX_X)
  const y = Math.min((((Math.max(Math.max(e.y - (MOVE.ICON_SIZE / 2), 0), MOVE.HEADER_SIZE) - MOVE.HEADER_SIZE) / window.innerHeight) * 100).toFixed(DECIMALS), MAX_Y)
  for (let i = 0; i < files.length; i++) {
    files[i].x = x + (SPACING_X * i)
    files[i].y = y + (SPACING_Y * i)
  }
  return files
}

MOVE.upload = (files) => {
  for (let file of files) {
    let reader = new FileReader()
    reader.addEventListener("loadend", (e) => {
      fetch(MOVE.API_PATH + "/index/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: file.name,
          type: file.type,
          x: file.x,
          y: file.y
        })
      }).then(r => r.json()).then((json) => {
        let url = json.url
        if (url) {
          MOVE.signatures.push(json.signature)
          return fetch(json.url, {
            method: "PUT",
            body: new Blob([reader.result], {
              type: file.type
            })
          })
        }
        return false
      }).then((res) => {
        MOVE.crosscheck()
      })
    })
    reader.readAsArrayBuffer(file)
  }
}

MOVE.auth.connect()
