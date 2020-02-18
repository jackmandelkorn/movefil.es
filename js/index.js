/* Onload  Script */

MOVE.dropElement = document.getElementsByClassName("drop-element")[0]

MOVE.dropElement.addEventListener("dragenter", MOVE.dropCancel)
MOVE.dropElement.addEventListener("dragover", MOVE.dropCancel)
MOVE.dropElement.addEventListener("drop", MOVE.drop)
