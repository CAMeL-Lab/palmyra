
window.addEventListener('keydown', function(event) {
    event.preventDefault();
    if ((event.metaKey || event.ctrlKey) && event.key == 'ArrowUp') {firstTree();}
    else if ((event.metaKey || event.ctrlKey) && event.key == 'ArrowDown') {lastTree();}
    else if ((event.metaKey || event.ctrlKey) && event.key == 'ArrowLeft') {prevTree();}
    else if ((event.metaKey || event.ctrlKey) && event.key == 'ArrowRight') {nextTree();}
  });

window.addEventListener('keydown', function(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'l') {search(treesArray);}
  });