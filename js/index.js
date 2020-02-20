/* Onload  Script */

const ROOT = document.getElementById("root")
const UPLOADER = document.getElementById("uploader")
const DROP_SCREEN = document.getElementById("drop-screen")

MOVE.ui = {
  onCreate: (filename, type, x, y) => {
    let extension = ((filename.split(".").slice(-1)[0] || "").trim().toLowerCase())
    let icon = document.createElement("div")
    icon.className = "file-icon"
    icon.style.backgroundImage = ("url(\"assets/icons/mime/" + getFileIcon(type) + ".svg\")")
    icon.style.fontSize = ((23 - (2.4 * extension.length)).toString() + "px")
    icon.innerHTML = extension
    let text = document.createElement("p")
    text.className = "file-name"
    text.innerHTML = filename
    let container = document.createElement("div")
    container.className = "file-container"
    container.id = ("file-" + MOVE.getSignature(filename))
    container.appendChild(icon)
    container.appendChild(text)
    container.style.left = (x.toString() + "vw")
    container.style.top = ("calc(" + MOVE.HEADER_SIZE + "px + " + y.toString() + "vh)")
    let owned = false
    for (let key in MOVE.files) {
      if (MOVE.files[key].filename === filename) {
        owned = MOVE.files[key].owned
        break;
      }
    }
    container.onclick = () => {
      if (owned) {
        MOVE.delete({ filename })
      }
      else {
        MOVE.get({ filename })
      }
    }
    ROOT.appendChild(container)
  },
  onDelete: (signature) => {
    try {
      document.getElementById("file-" + signature).remove()
    }
    catch (e) {}
  }
}

const getFileIcon = (type) => {
  return "default"
}

MOVE.dropElement = DROP_SCREEN
MOVE.dropElement.addEventListener("dragenter", MOVE.dropCancel)
MOVE.dropElement.addEventListener("dragover", MOVE.dropCancel)
MOVE.dropElement.addEventListener("drop", MOVE.drop)

let uploadEvent = null
const uploadHandler = (e) => {
  let files = UPLOADER.files
  if (files.length) {
    files = MOVE.filePositions(files, uploadEvent)
    MOVE.upload(files)
  }
  uploadEvent = null
  UPLOADER.removeEventListener("change", uploadHandler)
}

MOVE.dropElement.addEventListener("click", (e) => {
  UPLOADER.click()
  uploadEvent = e
  UPLOADER.addEventListener("change", uploadHandler)
})
