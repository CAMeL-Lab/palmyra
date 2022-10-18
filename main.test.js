
// add to global scope
global.__DEV__ = true
global.$ = require('jquery');
global.d3 = require('d3');

let main;

beforeAll(() => {
  // DOM doesn't load before code runs,
  // initialize html elements used in main.js
  // (ids found in viewtree.html)
  
  // create element, add id, then append to document body
  document.body.appendChild(
    Object.assign(document.createElement('input'),{id:"filename"})
  );
  document.body.appendChild(
    Object.assign(document.createElement('input'),{id:"configFile"})
  );
  document.body.appendChild(
    Object.assign(document.createElement('input'),{id:"listingBtn"})
  );

  window.alert = jest.fn();

  // include main.js
  jest.isolateModules(() => {
    main = require('./main');
  });
});

expectedVal = [{"children": [{"children": [{"collapsed": false, "duplicate": true, "id": 2, "link": "", "name": "this", "pid": 1, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 1, "lemma": "_", "link": "---", "misc": "_", "name": "this", "pid": 0, "pos": "NOM", "xpos": "_"}, {"children": [{"collapsed": false, "duplicate": true, "id": 4, "link": "", "name": "is", "pid": 3, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 3, "lemma": "_", "link": "---", "misc": "_", "name": "is", "pid": 0, "pos": "NOM", "xpos": "_"}, {"children": [{"collapsed": false, "duplicate": true, "id": 6, "link": "", "name": "a", "pid": 5, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 5, "lemma": "_", "link": "---", "misc": "_", "name": "a", "pid": 0, "pos": "NOM", "xpos": "_"}, {"children": [{"collapsed": false, "duplicate": true, "id": 8, "link": "", "name": "sentence", "pid": 7, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 7, "lemma": "_", "link": "---", "misc": "_", "name": "sentence", "pid": 0, "pos": "NOM", "xpos": "_"}], "collapsed": false, "id": 0, "meta": {"sentenceText": "this is a sentence"}, "name": "*"}, {"children": [{"children": [{"collapsed": false, "duplicate": true, "id": 2, "link": "", "name": "this", "pid": 1, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 1, "lemma": "_", "link": "---", "misc": "_", "name": "this", "pid": 0, "pos": "NOM", "xpos": "_"}, {"children": [{"collapsed": false, "duplicate": true, "id": 4, "link": "", "name": "is", "pid": 3, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 3, "lemma": "_", "link": "---", "misc": "_", "name": "is", "pid": 0, "pos": "NOM", "xpos": "_"}, {"children": [{"collapsed": false, "duplicate": true, "id": 6, "link": "", "name": "another", "pid": 5, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 5, "lemma": "_", "link": "---", "misc": "_", "name": "another", "pid": 0, "pos": "NOM", "xpos": "_"}, {"children": [{"collapsed": false, "duplicate": true, "id": 8, "link": "", "name": "sentence", "pid": 7, "pos": "NOM"}], "collapsed": false, "deps": "_", "duplicate": false, "feats": {"_": "_"}, "id": 7, "lemma": "_", "link": "---", "misc": "_", "name": "sentence", "pid": 0, "pos": "NOM", "xpos": "_"}], "collapsed": false, "id": 0, "meta": {"sentenceText": "this is another sentence"}, "name": "*"}]

test("set #treedata2 to text then call setSentenceTreeData", () => {
  // sampleText = "this is a sentence";
  document.body.innerHTML = `
    <textarea id="treedata2">this is a sentence\nthis is another sentence</textarea>
  `;
  ret = main.readSentenceTreeData();
  expect(ret).toStrictEqual(expectedVal);
});

test("click on Listing button to show the sentences box", () => {
  document.body.innerHTML = `
  <div id="listing" style="display: none">
    <section id="search"/>
  </div>
  `
  let listingBtn = main.listingBtn; 
  listingBtn.onclick = main.search;
  listingBtn.click();
  expect($("#listing").css('display')).not.toBe("none");
})

// assert that getTree() is called with the right index
// and possibly other complement functions too
test("Click on a sentence in search box to move to the corresponding tree", () => {

})

