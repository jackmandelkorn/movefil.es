/* Save Files */

let FileSaver = require("file-saver")

MOVE.save = (blob, filename) => {
  FileSaver.saveAs(blob, filename)
}
