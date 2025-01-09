
window.addEventListener('keydown', function(event) {
    // event.preventDefault();
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowUp') {firstTree();}
    else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowDown') {lastTree();}
    else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowLeft') {prevTree();}
    else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowRight') {nextTree();}
  });

window.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.code == 'KeyL') {search(treesArray);}
  });

// file menu shortcuts
window.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {saveTreeRemote();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyR') {renameToggle();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {downloadToggle();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyM') {editToggle();}
  else if (event.ctrlKey && event.shiftKey && event.code === 'KeyT') {tagsToggle()}
});

// undo redo shortcuts
function undoRedoKeyboardShortcuts(event) {
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && (event.key === 'z' || event.key === 'Z')) undo();
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && ( event.key === 'z' || event.key === 'Z')) redo();
}


function disableUndoRedoShortcuts() {
  window.removeEventListener('keydown', undoRedoKeyboardShortcuts);
}

function enableUndoRedoShortcuts() {
  window.addEventListener('keydown', undoRedoKeyboardShortcuts);
}
