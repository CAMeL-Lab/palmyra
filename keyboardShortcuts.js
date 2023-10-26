
window.addEventListener('keydown', function(event) {
    // event.preventDefault();
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowUp') {firstTree();}
    else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowDown') {lastTree();}
    else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowLeft') {prevTree();}
    else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key == 'ArrowRight') {nextTree();}
  });

window.addEventListener('keydown', function(event) {
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'l') {search(treesArray);}
  });