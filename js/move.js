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
    const link = document.createElement("a")
    link.href = source
    link.download = filename
    link.click()
    MOVE.crosscheck()
  })
}

MOVE.drop = (e) => {
  const ICON_SIZE = 64
  e.preventDefault()
  let dataTransfer = e.dataTransfer
  const x = e.x
  const y = e.y
  const BUFFER = 0.5
  const SPACING_X = (((ICON_SIZE * (1 + BUFFER)) / window.innerWidth) * 100).toFixed(DECIMALS)
  const SPACING_Y = (((ICON_SIZE * (1 + BUFFER)) / window.innerHeight) * 100).toFixed(DECIMALS)
  const DECIMALS = 3
  const MAX_X = 100 - SPACING_X
  const MAX_Y = 100 - SPACING_Y
  let files = dataTransfer.files
  let flip = false
  if ((y + (Math.floor(((files.length - 1) * SPACING_X) / (MAX_X - x)) * SPACING_Y).toFixed(DECIMALS)) >= MAX_Y) {
    flip = true
  }
  for (let i = 0; i < files.length; i++) {
    files[i].x = (x + ((i * SPACING_X) % (MAX_X - x)).toFixed(DECIMALS))
    let addY = (Math.floor((i * SPACING_X) / (MAX_X - x)) * SPACING_Y).toFixed(DECIMALS)
    if (flip) {
      addY *= (-1)
    }
    files[i].y = (y + addY)
  }
  MOVE.upload(files)
  return false
}

MOVE.dropCancel = (e) => {
  e.preventDefault()
  return false
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
