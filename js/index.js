/* Onload  Script */

const ROOT = document.getElementById("root")

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
    container.onclick = () => {
      MOVE.get({ filename })
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
  return "file-red"
}

MOVE.dropElement = document.getElementsByClassName("drop-element")[0]

MOVE.dropElement.addEventListener("dragenter", MOVE.dropCancel)
MOVE.dropElement.addEventListener("dragover", MOVE.dropCancel)
MOVE.dropElement.addEventListener("drop", MOVE.drop)
