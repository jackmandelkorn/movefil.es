/* Onload  Script */

const ROOT = document.getElementById("root")

MOVE.ui = {
  onCreate: (filename, type, x, y) => {
    let icon = document.createElement("img")
    icon.className = "file-icon"
    icon.src = ("assets/icons/mime/" + getFileIcon(type) + ".png")
    let text = document.createElement("p")
    text.className = "file-name"
    text.innerHTML = filename
    let container = document.createElement("div")
    container.className = "file-container preload"
    container.id = ("file-" + MOVE.getSignature(filename))
    container.appendChild(icon)
    container.appendChild(text)
    container.style.left = (x.toString() + "vw")
    container.style.top = ("calc(" + MOVE.HEADER_SIZE + "px + " + y.toString() + "vh)")
    container.onclick = () => {
      MOVE.get({ filename })
    }
    ROOT.appendChild(container)
    setTimeout(() => {
      container.className = "file-container"
    })
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

MOVE.dropElement = document.getElementsByClassName("drop-element")[0]

MOVE.dropElement.addEventListener("dragenter", MOVE.dropCancel)
MOVE.dropElement.addEventListener("dragover", MOVE.dropCancel)
MOVE.dropElement.addEventListener("drop", MOVE.drop)
