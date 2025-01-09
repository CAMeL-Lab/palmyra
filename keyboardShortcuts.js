function arrowNavKeyboardShortcuts(event) {
  // event.preventDefault();
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowUp') {firstTree();}
  else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowDown') {lastTree();}
  else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowLeft') {prevTree();}
  else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowRight') {nextTree();}
}
  
function listingKeyboardShortcut(event) {
  if (event.ctrlKey && event.shiftKey && event.code == 'KeyL') {search(treesArray);}
}

function fileMenuKeyboardShortcuts(event) {
  // file menu shortcuts
  if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {saveTreeRemote();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyR') {renameToggle();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {downloadToggle();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyM') {editToggle();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyT') {tagsToggle()}
}


// undo redo shortcuts
function undoRedoKeyboardShortcuts(event) {
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && (event.key === 'z' || event.key === 'Z')) undo();
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && ( event.key === 'z' || event.key === 'Z')) redo();
}

function enableKeyboardShortcuts() {
  window.addEventListener('keydown', arrowNavKeyboardShortcuts);
  window.addEventListener('keydown', listingKeyboardShortcut);
  window.addEventListener('keydown', fileMenuKeyboardShortcuts);
  window.addEventListener('keydown', undoRedoKeyboardShortcuts);
}
function disableKeyboardShortcuts() {
  window.removeEventListener('keydown', arrowNavKeyboardShortcuts);
  window.removeEventListener('keydown', listingKeyboardShortcut);
  window.removeEventListener('keydown', fileMenuKeyboardShortcuts);
  window.removeEventListener('keydown', undoRedoKeyboardShortcuts);

}