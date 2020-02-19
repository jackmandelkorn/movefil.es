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
  }
}

MOVE.handleDelete = (input) => {
  if (input.filename && input.signature) {
    for (let key in MOVE.files) {
      if (MOVE.files[key].filename === input.filename && MOVE.files[key].signature === input.signature) {
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

MOVE.delete = (input) => {
  let filename = input.filename
  let signature = (input.signature || false)
  if (!signature) {
    for (let key in MOVE.files) {
      if (MOVE.files[key].filename === filename && MOVE.files[key].owned === true) {
        signature = MOVE.files[key].signature
      }
    }
  }
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

MOVE.drop = (e) => {
  e.preventDefault()
  let dataTransfer = e.dataTransfer
  let files = dataTransfer.files
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
          type: file.type
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
  return false
}

MOVE.dropCancel = (e) => {
  e.preventDefault()
  return false
}

MOVE.auth.connect()
