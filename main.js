/* * * * * * * * * *
PALMYRA
Copyright (c) 2019 New York University Abu Dhabi

License: MIT BSD-3

THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,
BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE U.S. GOVERNMENT OR ANY DEPARTMENTS OR EMPLOYEES THEREOF BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.)
* * * * * * * * * * */

// define a global root variable
// this allows the tree to persists

var root;
var currentTreeIndex = 0;
var treesArray = [];
var numberOfNodesArray = [];
var viewerHeight = 0;

var addNode;
var selectedNodeLink, selectedMorphology
var nodeDeleted = false;
var rootNodeName = '*';

// default settings that can be configured
var orientation = 'r-to-l';
var listingKey = 'text'
var newPOSTag = 'NOM';
var newLinkLabel = '---';
var newNodeName = '*'
var editLemma = false

// keeping tack of the pos tags, relation labels, and features, their values, and their defaults
var posTags = {}
var relLabels = {}
var featureValues = {}
var defaultFeatValues = {}
// lexical features that will be displayed as text fields
var lexicalFeatsList = []

// variables to keep track of the keystrokes related to the editing of POS tags and relation labels
var pointer = 0
var lastKeyStroke = ''
var editingControl = 'pos'
var lastClickedNodeId = 0

var settings = [['customwidth', 0.25], ['customdepth', 100], ['nodesize', 10], ['xsep', 5], ['ysep', 10], ['currentFont', 'standard']];

// if custom setting not saved, initialize with default
for (var k=0; k<settings.length; k++) {
    if (!localStorage[settings[k][0]]) {
        localStorage[settings[k][0]] = settings[k][1];
    };
};

// the main display function
var main = function() {
    // in case extra toolbar windows are showing, hide them
    // $('#jsontext').hide();
    $('#download').hide();
    $('#linktext').hide();
    $('#listing').hide();
    findStorage();
    $('.upload').show();
};

var findStorage = function() {
    var check = 'check';
    try {
        localStorage.setItem(check, check);
        localStorage.removeItem(check);
        return true;
    } catch (e) {
        alert('Your browser does not support Palmyra.');
    }
};

// wait to call 'main' until the page has finished loading
$(document).ready(main);

$( window ).resize(function() {
    sessionStorage.removeItem('treeData');
    saveTree();
    d3.select('body').select('svg').remove()
    getTree(treesArray[currentTreeIndex])
    update(root);
});

//Read the config file
var readConfigFile = function() {

    var x = document.getElementById('configFile');
    var input = '';

    if ('files' in x) {
        if (x.files.length == 0) {
            var morphoLabel = document.getElementById('labelspMorphoFeats')
            morphoLabel.style.visibility = 'hidden';
            txt = 'Select config file.';
        } else {

            var file = x.files[0];
            var reader=new FileReader();
            reader.onload = function(e) {
                parseConfig(reader.result);
            }
            reader.readAsText(file);                
        }
    }
  
    return;  
};

var parseConfig = function(content) {

    var configs = JSON.parse(content)
    orientation = configs.orientation
    listingKey = configs.display_text
    if (configs.lemma === 'true')
        editLemma = true
    else
        editLemma = false

    var posContainer = document.getElementById('postags')
    var divs = {}
    
    for (var i = 0; i < configs.pos.values.length; i++) {
        if(configs.pos.values[i].key in posTags) {
            posTags[configs.pos.values[i].key].push(configs.pos.values[i].label)
            var btn = document.createElement('BUTTON')
            var text = document.createTextNode(configs.pos.values[i].label.toUpperCase())
            btn.appendChild(text);
            btn.tabindex = -1
            btn.value = configs.pos.values[i].label.toUpperCase()
            btn.onclick = editPOSByButton


            group = configs.pos.values[i].group;
            if (group in divs) {
                divs[group].appendChild(btn)
            } else {
                divs[group] = document.createElement('div'); 
                divs[group].appendChild(btn)
            }
        } else {
            posTags[configs.pos.values[i].key] = []
            posTags[configs.pos.values[i].key].push(configs.pos.values[i].label)
            var btn = document.createElement('BUTTON')
            var text = document.createTextNode(configs.pos.values[i].label.toUpperCase())
            btn.appendChild(text);
            btn.tabindex = -1
            btn.value = configs.pos.values[i].label.toUpperCase()
            btn.onclick = editPOSByButton

            group = configs.pos.values[i].group;
            if (group in divs) {
                divs[group].appendChild(btn)
            } else {
                divs[group] = document.createElement('div'); 
                divs[group].appendChild(btn)
            }
        }
    }

    for (var div in divs) {
        var hzRule = document.createElement('hr')
        posContainer.appendChild(hzRule)
        posContainer.appendChild(divs[div])
    }
    

    var labelContainer = document.getElementById('labels')
    var divs = {}

    for (var i = 0; i < configs.relation.values.length; i++) {
        if(configs.relation.values[i].key in relLabels) {
            relLabels[configs.relation.values[i].key].push(configs.relation.values[i].label)
            var btn = document.createElement('BUTTON')
            var text = document.createTextNode(configs.relation.values[i].label.toUpperCase())
            btn.appendChild(text);
            btn.setAttribute('id', configs.relation.values[i].label.toUpperCase())
            btn.value = configs.relation.values[i].label.toUpperCase()
            btn.onclick = editLabelByButton

            group = configs.relation.values[i].group;
            if (group in divs) {
                divs[group].appendChild(btn)
            } else {
                divs[group] = document.createElement('div'); 
                divs[group].appendChild(btn)
            }

        } else {
            relLabels[configs.relation.values[i].key] = []
            relLabels[configs.relation.values[i].key].push(configs.relation.values[i].label)
            var btn = document.createElement('BUTTON')
            var text = document.createTextNode(configs.relation.values[i].label.toUpperCase())
            btn.appendChild(text);
            btn.setAttribute('id', configs.relation.values[i].label.toUpperCase())
            btn.value = configs.relation.values[i].label.toUpperCase()
            btn.onclick = editLabelByButton

            group = configs.relation.values[i].group;
            if (group in divs) {
                divs[group].appendChild(btn)
            } else {
                divs[group] = document.createElement('div'); 
                divs[group].appendChild(btn)
            }
        }
    }

    for (var div in divs) {
        var hzRule = document.createElement('hr')
        labelContainer.appendChild(hzRule)
        labelContainer.appendChild(divs[div])
    }

    if(configs.hasOwnProperty('features') == false) {
        var morphoLabel = document.getElementById('labelspMorphoFeats')
        morphoLabel.style.visibility = 'hidden';
    } else {

        var morphoLabel = document.getElementById('labelspMorphoFeats')
        morphoLabel.style.visibility = 'visible';

        var item = document.getElementById('morphoFeats');
        var lexicalFeats = document.getElementById('lexicalFeats');

        for (var i = 0; i < configs.features.length; i++) {

            var div = document.createElement('div')
            div.setAttribute('id', configs.features[i].name)
            div.setAttribute('class', 'morphoFeat')

            var fieldName = document.createElement('div')
            fieldName.style.width = '100px'
            fieldName.style.right = '0px'
            fieldName.style.display = 'inline-block'

            var displayName = document.createTextNode(configs.features[i].display);
            fieldName.appendChild(displayName)

            var menu = document.createElement('select')
            menu.setAttribute('id', configs.features[i].name + 'Array')
            menu.setAttribute('class', 'inputArray')
            menu.style.width = '100px'
            menu.style.left = '0px'
            menu.style.display = 'inline-block'

            if (configs.features[i].type === 'list') {
                featureValues[configs.features[i].name] = configs.features[i].values;

                for (var j = 0; j < configs.features[i].values.length; j++) {
                    var opt = document.createElement('option');
                    var name = document.createTextNode(configs.features[i].values[j].display);
                    opt.setAttribute('value', configs.features[i].values[j].display)
                    opt.setAttribute('id', configs.features[i].values[j].value)
                    opt.appendChild(name)
                    menu.appendChild(opt);
                }

                div.appendChild(fieldName)
                div.appendChild(menu)

                item.appendChild(div)
            } else {
                lexicalFeatsList.push(configs.features[i].name)

                var titleParagraph = document.createElement('P')
                titleParagraph.setAttribute('class', 'labelsp')
                titleParagraph.innerHTML = configs.features[i].display + ':'

                var field = document.createElement('INPUT');
                field.setAttribute('type','text')
                field.setAttribute('id',configs.features[i].name)

                var lexDiv = document.createElement('div')
                lexDiv.appendChild(field)

                lexicalFeats.append(titleParagraph)
                lexicalFeats.appendChild(lexDiv)
                console.log()
            }
        }

        for (var i = 0; i < configs.defaultFeatures.length; i++) {
            var posTag = configs.defaultFeatures[i].pos.toUpperCase();

            var defaultFeatValuePairs = {};
            for (var j = 0; j < configs.defaultFeatures[i].features.length; j++) {
                var featName = configs.defaultFeatures[i].features[j].name;
                var featValue = configs.defaultFeatures[i].features[j].value
                defaultFeatValuePairs[featName] = featValue
            }

            defaultFeatValues[posTag] = defaultFeatValuePairs
        }
    }

    if (editLemma === true){
        var lemmaField = document.getElementById('lemmaField');

        var titleParagraph = document.createElement('P')
        titleParagraph.setAttribute('class', 'labelsp')
        titleParagraph.innerHTML = 'Lemma:'

        var field = document.createElement('INPUT');
        field.setAttribute('type','text')
        field.setAttribute('id','lemma')

        var lexDiv = document.createElement('div')
        lexDiv.appendChild(field)

        lemmaField.append(titleParagraph)
        lemmaField.appendChild(lexDiv)
    }

    newPOSTag = configs.newNodeDefaults.pos.toUpperCase();
    newLinkLabel = configs.newNodeDefaults.relation;
    newNodeName = configs.newNodeDefaults.name;

    return;
};

// converts JSON format tree to CONLL format
var convertJSONToCONLL = function(node) {
    if(typeof node.children === 'undefined' && typeof node._children === 'undefined') {
        return [];
    }

    if (node.collapsed === false) {

        node.features = ''
        
        for (var featKey in node.feats) {
            if (node.features === '') {
                if (featKey !== '_' && node.feats[featKey] !== '' && node.feats[featKey] !== 'undefined') {
                    node.features = featKey + '=' + node.feats[featKey]
                }
            } else {
                if (featKey !== '_' && node.feats[featKey] !== '' && node.feats[featKey] !== 'undefined') {
                    node.features += '|' + featKey + '=' + node.feats[featKey]
                }
            }
        }

        if (node.features === '') {
            node.features = '_'
        }


        var fullArray = [];
        if (typeof node.parent !== 'undefined' && node.parent.id ) {
            var pid = (node.parent.id+1)/2
        } else pid = (node.pid+1)/2;
        if (pid == 0.5) pid = 0;
        for (var k=0; k<node.children.length; k++) {
            var tempArray = convertJSONToCONLL(node.children[k])
            fullArray = fullArray.concat(tempArray)
        }
        if (node.id !== 0) {
            if (node.lemma === '') {
                node.lemma = '_'
            }

            if (node.pos === '') {
                node.pos = '_'
            }

            if (node.xpos === '') {
                node.xpos = '_'
            }

            if (node.features === '') {
                node.features = '_'
            }

            if (node.deps === '') {
                node.deps = '_'
            }

            if (node.misc === '') {
                node.misc = '_'
            }

            fullArray.push([(node.id+1)/2,node.name,node.lemma,node.pos,node.xpos,node.features,pid,node.link,node.deps,node.misc])
        } else {
            fullArray.sort(function(a, b){return a[0]-b[0]})
            for (var i=0; i<fullArray.length; i++) {
              fullArray[i] = fullArray[i].join('\t')
            }
            fullArray = fullArray.join('\n')
        }
        return fullArray
    }
    // include hidden nodes
    else {
        var fullArray = [];
        if (typeof node.parent !== 'undefined' && node.parent.id ) {
            var pid = (node.parent.id+1)/2
        } else pid = (node.pid+1)/2;
        if (pid == 0.5) pid = 0;
        node.name = node.name.slice(2,-2)
        for (var k=0; k<node._children.length; k++) {
            var tempArray = convertJSONToCONLL(node._children[k])
            fullArray = fullArray.concat(tempArray)
        }
        if (node.id !== 0) {

            if (node.lemma === '') {
                node.lemma = '_'
            }

            if (node.pos === '') {
                node.pos = '_'
            }

            if (node.xpos === '') {
                node.xpos = '_'
            }

            if (node.features === '') {
                node.features = '_'
            }

            if (node.deps === '') {
                node.deps = '_'
            }

            if (node.misc === '') {
                node.misc = '_'
            }
            
            fullArray.push([(node.id+1)/2,node.name,node.lemma,node.pos,node.xpos,node.feats,pid,node.link,node.deps,node.misc])
        } else {
            fullArray.sort(function(a, b){return a[0]-b[0]})
            for (var i=0; i<fullArray.length; i++) {
              fullArray[i] = fullArray[i].join('\t')
            }
            fullArray = fullArray.join('\n')
        }
        return fullArray
    }
};

var outputToCONLLFormat = function(inputJSON) {
    var inputArray = [];
    var rootNodeIndex = 0;

    var rootNode = new Object();
    rootNode.name = 'root';
    rootNode.id = 0;
    rootNode.children = [];
    rootNode.collapsed = false

    for (var i=0; i< (inputArray.length); i++) {
        var pid = inputArray[i].pid - 1;
        if (pid == -2) {
            inputArray[i].pid = 0;
            rootNode.children.push(inputArray[i])
        }
        else {
            if (typeof inputArray[pid].children == 'undefined') {
                inputArray[pid].children = [];
            }
            inputArray[pid].children.push(inputArray[i]);
        }
    };
    return rootNode;
};

//read the conllu file and generate the json tree objects
var convertToJSON = function(inputData) {
    var inputArray = [];
    numberOfNodesArray = []
    var newTree = [];
    newTree.meta = {};
    var sentenceText = ''
    if (inputData !== '') {
        var lines = inputData.split('\n');
        for (var i=0; i< (lines.length); i++) {
            if (lines[i].trim().length == 0 ) {
                if (newTree.length>0) {
                    newTree.meta['sentenceText'] = sentenceText .trim()
                    inputArray.push(newTree);
                    numberOfNodesArray.push(newTree.length/2)
                    newTree = []
                    newTree.meta = {}
                    sentenceText = ''
                }
                continue;
            }
            //the read meta data of the tree
            //store the original sentence to be displayed in the listings
            if (lines[i].trim().startsWith('#')) {
                lineToks = lines[i].trim().split(' ')
                //index 0 = '#'
                key = lineToks[1]
                //index 2 = '='
                value = lineToks.slice(3,lineToks.length).join(' ')
                newTree.meta[key] = value
                continue;
            }
            if (lines[i].trim().match(/^\d+-\d+\s/)) {
                continue;
            }
            
            var singleLine = lines[i].split('\t');
            var treeNode = new Object();
            var projectedNode = new Object();

            treeNode.id = parseInt(singleLine[0]) * 2 - 1;
            treeNode.name = singleLine[1];
            treeNode.lemma = singleLine[2]
            treeNode.pos = singleLine[3];
            treeNode.xpos = singleLine[4]

            treeNode.feats = {}

            if (singleLine[5] == '_') { 
                treeNode.feats['_'] = '_'
            } else {
                var featToks = singleLine[5].split('|')
                for (var j = 0; j < featToks.length; j++) {
                    var featKey = featToks[j].split('=')[0]
                    var featValue = featToks[j].split('=')[1]
                    treeNode.feats[featKey] = featValue;
                }
            }

            treeNode.pid = parseInt(singleLine[6]) * 2 - 1;
            treeNode.link = singleLine[7];
            treeNode.deps = singleLine[8];
            treeNode.misc = singleLine[9]
            treeNode.duplicate = false
            treeNode.collapsed = false
            
            sentenceText += treeNode.name + ' '
            newTree.push(treeNode);

            projectedNode.id = parseInt(singleLine[0]) * 2;
            projectedNode.name = treeNode.name;
            projectedNode.pos = singleLine[3];
            //the parent of the projected node is the original node itself
            projectedNode.pid = parseInt(singleLine[0]) * 2 - 1;
            projectedNode.link = '';
            projectedNode.duplicate = true
            projectedNode.collapsed = false
            newTree.push(projectedNode);
        };
    };

    if (newTree.length > 0) {
        inputArray.push(newTree);
        numberOfNodesArray.push(newTree.length/2)
        newTree = []
        newTree.meta = {}
        sentenceText = ''
    }

    //connect the nodes to their proper parents (i.e. create the tree)
    for (var i=0; i< (inputArray.length); i++) {
        newTree = inputArray[i];
        var rootNode = new Object();
        rootNode.name = rootNodeName;
        rootNode.id = 0;
        rootNode.collapsed = false;
        rootNode.children = [];
        rootNode.meta = inputArray[i].meta;

        for (var j=0; j< (newTree.length); j++) {
            var pid = newTree[j].pid - 1;
            if (pid == -2) {
                newTree[j].pid = 0;
                rootNode.children.push(newTree[j])
            }
            else {
                if (typeof newTree[pid].children == 'undefined') {
                    newTree[pid].children = [];
                }
                newTree[pid].children.push(newTree[j]);
            }
        };
        inputArray[i] = rootNode;
    };

    return inputArray
};

var setJSONtreeData = function() {
    readConfigFile()
    var x = document.getElementById('inputFile');

    if ('files' in x) {
        if (x.files.length == 0) {
            txt = 'Select one or more files.';
        } else {
            for (var i = 0; i < x.files.length; i++) {
                var file = x.files[i];
                var reader=new FileReader();
                reader.onload = function(e) {
                    treesArray = convertToJSON(reader.result);
                    currentTreeIndex = 0;

                    // hide upload window
                    $('.upload').hide();
                    try {
                        getTree(treesArray[0]);
                    } catch(e) {
                        console.log(e)
                        // alert user if error occurs
                        alert('Sorry, something went wrong!');
                    };
                }
                reader.readAsText(file);    
            }
        }
    } 
};

var setSentenceTreeData = function() {
    readConfigFile()
    var original = $('#treedata2').val();

    if (original !== '') {
        var treeDataArray = [];
        var inputTextArray = original.split('\n').filter(function(entry) { return entry.trim() != ''; });
        for (var i=0; i< (inputTextArray.length); i++) {
            var singleLine = inputTextArray[i].split(' ').filter(function(entry) { return entry.trim() != ''; });
            for (var j=0; j< (singleLine.length); j++) {
                treeDataArray.push([j+1,singleLine[j],'_',newPOSTag,'_','_',0,newLinkLabel,'_','_'].join('\t'))
            };
            treeDataArray.push('\n')
        };
        try {
            // try to store tree data and display tree
            treesArray = convertToJSON(treeDataArray.join('\n'));
            getTree(treesArray[0]);
            $('.upload').hide();
        } catch(e) {
            // alert user if error occurs
            alert('Sorry, something went wrong!');
        };
    } else {
        //alert('You forgot to enter a phrase!');
        $('.upload').hide();
        addNewTree()
    };
};

// helper function
// reset the tree data (to an empty string) and reload the window
var clearTree = function() {
    if (window.confirm('Do you really want to clear?')) {
        sessionStorage.removeItem('treeData');
        window.location.reload();
    }
};

// add a new tree at the end
var addNewTree = function() {
    sessionStorage.removeItem('treeData');
    saveTree();

    var rootNode = new Object();
    rootNode.name = rootNodeName;
    rootNode.id = 0;
    rootNode.collapsed = false
    rootNode.children = [];


    rootNode.meta = {}
    rootNode.meta['sentenceText'] = ''

    rootNode.lemma = ''
    rootNode.pos = ''
    rootNode.xpos = ''

    rootNode.feats = {}

    rootNode.deps = ''
    rootNode.misc = ''

    currentTreeIndex = treesArray.length
    d3.select('body').select('svg').remove()
    treesArray.push(rootNode)
    numberOfNodesArray.push(0)
    getTree(treesArray[currentTreeIndex])
    update(root);
    $('.morphologyMerge').show()
};

// delete the current tree
var deleteCurrentTree = function() {
    if (window.confirm('Do you want to delete this tree?')) {
        if (numberOfNodesArray.length > 1) {
            d3.select('body').select('svg').remove()
            treesArray.splice(currentTreeIndex,1)
            numberOfNodesArray.splice(currentTreeIndex,1)
            if (currentTreeIndex > 0) currentTreeIndex = currentTreeIndex - 1
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
    }
};

// move to the first tree
var firstTree = function() {
    if (currentTreeIndex != 0) 
        { 
            sessionStorage.removeItem('treeData');
            saveTree();
            currentTreeIndex = 0;
            d3.select('body').select('svg').remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// move to the last tree
var lastTree = function() {
    if (currentTreeIndex != treesArray.length - 1) 
        { 
            sessionStorage.removeItem('treeData');
            saveTree();
            currentTreeIndex = treesArray.length - 1;
            d3.select('body').select('svg').remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// move to the next tree
var nextTree = function() {
    if (currentTreeIndex < treesArray.length - 1) 
        { 
            sessionStorage.removeItem('treeData');
            saveTree();
            currentTreeIndex++;
            d3.select('body').select('svg').remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// move to the prev tree
var prevTree = function() {
    if (currentTreeIndex > 0) 
        { 
            sessionStorage.removeItem('treeData');
            saveTree();
            currentTreeIndex--;
            d3.select('body').select('svg').remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// go to the input tree number
var goToTree = function() {

    if (currentTreeIndex !== (document.getElementById('treeNumberInput').value - 1)) 
    { 
    	//check that the entered value is not less than 1 or more than the number of trees
        if (document.getElementById('treeNumberInput').value > 0 && document.getElementById('treeNumberInput').value <= treesArray.length) {
            sessionStorage.removeItem('treeData');
            saveTree();
            currentTreeIndex = document.getElementById('treeNumberInput').value - 1;
            d3.select('body').select('svg').remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
    }
};

// toggle between English and Arabic
var directionToggle = function() {
    if (orientation == 'r-to-l') {
        orientation = 'l-to-r'
        $('.morphologyMerge').hide()
    } else {
        orientation = 'r-to-l';
        $('.morphologyMerge').hide()
    }
    sessionStorage.removeItem('treeData');
    saveTree();
    d3.select('body').select('svg').remove()
    getTree(treesArray[currentTreeIndex])
    update(root);
};

// edit the relation labels through keystrokes
var editLabel = function(labelText) {
    console.log();
    d3.select('text#linkLabel' + selectedNodeLink.id).text(labelText);
    selectedNodeLink.link = labelText;
	nodeSingleClick(selectedNodeLink);
    update(root);
    
};

// edit the relation labels through button clicks
var editLabelByButton = function(inputSource) {
     if(selectedNodeLink) {
        labelText = inputSource.currentTarget.value;
        console.log();
        d3.select('text#linkLabel' + selectedNodeLink.id).text(labelText);
        selectedNodeLink.link = labelText;

        d3.select('.links').selectAll('path').style('stroke', '#b3b3b3');
        d3.select('.links').selectAll('text').style('stroke', 'white');
        d3.select('.nodes').selectAll('text').style('stroke', '');

        d3.select('#link' + selectedNodeLink.id).select('path').style('stroke', 'cornflowerblue'); // Link line 
        d3.select('text#nodePOS' + selectedNodeLink.id).style('stroke', 'lightgreen');       // POS Label
        d3.select('text#linkLabel' + selectedNodeLink.id).style('stroke', 'lightgreen');        // Rel Label    
        d3.select('text#nodeLabel' + selectedNodeLink.id).style('stroke', 'black');  //Node name??
        d3.select('circle#nodeCircle' + selectedNodeLink.id).style('fill', 'orange');

   	    nodeSingleClick(selectedNodeLink);
        update(root);
    }
};



// edit the POS tags through keystrokes
var editPOS = function(posText) {
    console.log()
    d3.select('text#nodePOS' + selectedNodeLink.id).text(posText)
    selectedNodeLink.pos = posText;
	nodeSingleClick(selectedNodeLink);
    update(root);   
};

// edit the POS tags through button clicks
var editPOSByButton = function(inputSource) {
    if(selectedNodeLink) {
        posText = inputSource.currentTarget.value;
        console.log();
        d3.select('text#nodePOS' + selectedNodeLink.id).text(posText);
        selectedNodeLink.pos = posText;

        d3.select('.links').selectAll('path').style('stroke', '#b3b3b3');
        d3.select('.links').selectAll('text').style('stroke', 'white');
        d3.select('.nodes').selectAll('text').style('stroke', '');
        
        d3.select('#link' + selectedNodeLink.id).select('path').style('stroke', 'cornflowerblue'); // Link line 
        d3.select('text#nodePOS' + selectedNodeLink.id).style('stroke', 'lightgreen');       // POS Label
        d3.select('text#linkLabel' + selectedNodeLink.id).style('stroke', 'lightgreen');        // Rel Label    
        d3.select('text#nodeLabel' + selectedNodeLink.id).style('stroke', 'black');  //Node name??
        d3.select('circle#nodeCircle' + selectedNodeLink.id).style('fill', 'orange');

   	    nodeSingleClick(selectedNodeLink);
        update(root);       
    }
};

// Morhology Handling
// reset the morphology changes
var cancelMorphology = function() {
    d3.selectAll('.morphology').style('stroke', '');
    $('#morphology').hide();
};

// reset the morphology changes
var saveMorphology = function() {
    var morphologyArray = document.getElementById('morphologyName').value.split(' ');
    var morphologyText = morphologyArray.shift()

    
    while ((morphologyText.length < 1)&&(morphologyArray.length > 0)) { 
        morphologyText = morphologyArray.shift() 
        }
    if (morphologyText.length < 1) {morphologyText=newNodeName}

    
    d3.select('text#nodeLabel' + selectedMorphology.parent.id).text(morphologyText);
    d3.select('text#morphology' + selectedMorphology.id).text(morphologyText);
    selectedMorphology.name = morphologyText;
    selectedMorphology.parent.name = morphologyText;

    if (editLemma === true) {
        selectedMorphology.parent.lemma = document.getElementById('lemma').value
    }

    for (var i = 0; i < lexicalFeatsList.length; i++) {
            selectedMorphology.parent.feats[lexicalFeatsList] = document.getElementById(lexicalFeatsList[i]).value
    }

    while (morphologyArray.length > 0) {
        morphologyText = morphologyArray.shift()
        if (morphologyText.length > 0) addNode(selectedMorphology,'right', morphologyText)
    }

    var morphologyFeatures = document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')

    for (var i = 0; i < morphologyFeatures.length; i++) {
        feature = document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].id
        selectedIndex = document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].selectedIndex

        if(selectedIndex != -1) {
        	featureDisplay = document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].options[selectedIndex].value
        	featureValue = ''

        	for(var j = 0; j < featureValues[feature].length; j++) { 
				if(featureValues[feature][j]['display'] === featureDisplay) {
            		featureValue = featureValues[feature][j]['value']
            	}
        	}

        	if(feature in selectedMorphology.parent.feats) {
            	selectedMorphology.parent.feats[feature] = featureValue
            	console.log(feature + '\t' + featureValue)
        	}
    	}   
    }

    $('#morphology').hide();
    d3.select('text#morphology' + selectedMorphology.id).style('stroke', '');
    update(root);
};

// helper function
// walks through the tree data and recreates the JSON structure
var saveTree = function() {
    try {
        var json = JSON.stringify(root, function(k, v) {
            if (k === 'parent') {
                return 'PARENT';
            }
            return v;
        });
    sessionStorage.treeData = json;
    treesArray[currentTreeIndex] = root;
    }
    catch(err) {
        alert('Sorry, something went wrong!');
    }
};

// regex to remove d3 'junk' variables from tree data
var cleanjson = function() {
    var json = sessionStorage.treeData;
    json = json.replace(/\'parent\':\'PARENT\',/g, '');
    json = json.replace(/\'depth\':[0-9]*,/g, '');
    json = json.replace(/\'(x|x0|y|y0)\':([0-9]+\.[0-9]+|[0-9]+),/g, '');
    json = json.replace(/,\'(x|x0|y|y0)':[0-9]+/g, '');
    sessionStorage.treeData = json;
};

// output tree as copyable text
var textTree = function() {
    saveTree();
    var output;
    if (sessionStorage.treeData !== 'undefined') {
        cleanjson();
        if (sessionStorage.original && sessionStorage.translation) {
            output = sessionStorage.original + '\n' 
                + sessionStorage.translation + '\n' 
                + sessionStorage.treeData;
        } else if (sessionStorage.original) {
            output = sessionStorage.original + '\n' + sessionStorage.treeData;
        } else {
            output = sessionStorage.treeData;
        }
    }
    else {
        output = 'Tree not found.';
    }
    document.getElementById('jsonfield').innerHTML = output;
};

// output CONLL files for the tree
var downloadTree = function() {
    saveTree();
    var filename = $('#filename').val();
    if (document.getElementById('downloadChoiceImage').checked == true) {
        saveSvgAsPng(document.getElementsByTagName('svg')[0], filename+'.png');
    } else {
        var output = '';
        if (sessionStorage.treeData !== 'undefined') {
            for (var i=0; i<treesArray.length; i++) {
                // clone treeArray and remove cycles through nested parents.
                meta_keys = Object.keys(treesArray[i].meta)
                for (var key_index = 0; key_index<meta_keys.length; key_index++){
                    output = output + '# ' + meta_keys[key_index] + ' = ' + treesArray[i].meta[meta_keys[key_index]] + '\n';
                }
                let clone = JSON.parse(JSON.stringify(JSON.decycle(treesArray[i])));
                output = output + convertJSONToCONLL(clone) + '\n\n';
            };
            // uses Blob and FileSaver libraries
            var blob = new Blob([output], {type: 'text/plain;charset=utf-8'});
            saveAs(blob, filename+'.conllu');
        }
        else {
            alert('Tree not found.');
        }
    }
    $('#download').hide();
};

// the function that gets called from the listing button
var search = function() {

    if(window.getComputedStyle(document.getElementById('listing')).display === 'none') {
        var list = document.createElement('OL')
        list.setAttribute('id', 'searchList')
        if (orientation === 'r-to-l') {
            list.setAttribute('dir', 'rtl')
        } else {
            list.setAttribute('dir', 'ltr')
        }

        for (var i=0; i<treesArray.length; i++) {
            var x = document.createElement('LI')
            x.setAttribute('id', i)
            if (orientation === 'r-to-l') {
                x.style.direction = 'rtl'
                x.style.textAlign = 'right'
            } else {
                x.style.direction = 'ltr'
                x.style.textAlign = 'left'
            }

            
            if (listingKey in treesArray[i].meta) {
                var t = document.createTextNode(treesArray[i].meta[listingKey]);
            } else {
                var t = document.createTextNode(treesArray[i].meta['sentenceText']);
            }
            x.appendChild(t);
            x.onclick = function() {
                if (currentTreeIndex !== event.target.id) 
                { 
                    sessionStorage.removeItem('treeData');
                    saveTree();
                    currentTreeIndex = event.target.id;
                    d3.select('body').select('svg').remove()
                    getTree(treesArray[currentTreeIndex])
                    update(root);
                 }
            }
            list.appendChild(x);
        }

        document.getElementById('search').appendChild(list)
        $('#listing').show()
    } else {
        document.getElementById('search').removeChild(document.getElementById('searchList'))
        $('#listing').hide()
    }
    update(root);
}

// SETTINGS
// helper functions called by buttons in 'SETTINGS' menu

// return all settings to defaults
var tagsToggle = function() {

    $('#labels').toggle();
    $('#postags').toggle();
    
    if (editingControl=='tags'){
        editingControl='pos';
    }else{

        editingControl='tags'
    }

    update(root);
};

var downloadToggle = function() {
    $('#download').toggle()
    update(root)
} 

var editToggle = function() {
    $('.morphologyMerge').toggle()
    //we don't call update root here because redrawing the tree will cancel toggling the morphologyMerge.
}

// END SETTINGS

// ************** Generate the tree diagram  *****************
var getTree = function(treeData) {
 if (numberOfNodesArray.length==0){return;}

    // set height and width equal to HTML doc properties
    numberOfNodes = numberOfNodesArray[currentTreeIndex]
    var requiredWidth = parseFloat(localStorage['customwidth']) * 500 * numberOfNodes * 1.37;
    // console.log(numberOfNodes, requiredWidth)
    if (requiredWidth > $(document).width()) var viewerWidth = requiredWidth
        else var viewerWidth = $(document).width();
    viewerHeight = $(document).height();
    d3.select('svg').attr('dir', 'rtl')
    d3.select('#sents').attr('dir', 'rtl')
    document.getElementById('currentTreeNumber').textContent = (parseInt(currentTreeIndex) + 1) + '/' + numberOfNodesArray.length;
    document.getElementById('treeNumberInput').max = numberOfNodesArray.length;
    document.getElementById('treeNumberInput').value = currentTreeIndex + 1;

    // initialize misc. variables
    var lowestNodeY = 0;
    var i = 0;
    if (nodeDeleted == true) {
        var duration = 0;
        nodeDeleted = false
    } else var duration = 0;   // increase to 750 to add animation
    var selectedNode = null;
    var draggingNode = null;
    var orient = function(xcoord) { 
        if (orientation == 'r-to-l') 
            {return viewerWidth - xcoord; }
        else {return xcoord};
    }

    // names the tree layout 'tree' and gives it a size value
    var tree = d3.layout.tree()
     .size([viewerWidth, viewerHeight]);

    // declares the function for drawing the links
     var line = d3.svg.line()
                      .x( function(point) { return point.lx; })
                      .y( function(point) { return point.ly; });

     function lineData(d){
         var points = [
             {lx: d.source.x, ly: d.source.y},
             {lx: d.target.x, ly: d.target.y}
         ];
         return line(points);
     }

    // Define the zoom function for the zoomable tree
    function zoom() {
        fullTree.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }

    // define the zoomListener which calls the zoom function on the 'zoom' event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.5, 2]).on('zoom', zoom);

    // appends svg to html area tagged 'body'
    var baseSvg = d3.select('body').append('svg')
     .attr('width', viewerWidth)
     .attr('height', viewerHeight)
     .attr('class', 'overlay')
     .call(zoomListener).on('dblclick.zoom', null)


    //translate and scale to whatever value you wish
    
    if (orientation == 'r-to-l') {
        window.scrollTo(viewerWidth, 0);
        zoomListener.translate([viewerWidth*.318,30]).scale(.67);
    } else {
        zoomListener.translate([20,30]).scale(.67);
        d3.select('svg').attr('dir', 'ltr')
        d3.select('#sents').attr('dir','ltr')
    }
    zoomListener.event(baseSvg.transition().duration(50));//does a zoom
     
    // creates a group for holding the whole tree, which allows 'zoom' to function
    var fullTree = baseSvg.append('g').attr('class', 'fulltree');
    // create a group for holding the links -- this group will be drawn first
    var lgroup = fullTree.append('g').attr('class', 'links');
    // create a group for holding the nods -- this group will be drawn second
    var ngroup = fullTree.append('g').attr('class', 'nodes')




    ;
    // create a group for holding the temporary link(s) -- this group will be drawn last
    fullTree.append('g').attr('class', 'templinks');

    // define the root and its initial location
    root = treeData;
    root.x0 = viewerWidth / 2;
    root.y0 = parseFloat(localStorage['nodesize'])+40;
    
    // helper functions to expand nodes
    function expand(d) {
        if(d.collapsed == true) {
            d.children.forEach(function (childNode) {
                childNode.name = childNode.name.slice(2, -2)
            });

            d.children = d._children;
            d._children = null;
            d.name = d.name.slice(2,-2)
            d.collapsed = false
        }
    }

    //instead of relying on the state of children and _children, add a variable to indicate if a node is collapsed
    //keep the duplicate node that will appear at the bottom in the tree
    function toggleChildren(d) {
            if(d.collapsed == true) {
                d.children.forEach(function (childNode) {
                    childNode.name = childNode.name.slice(2, -2)
                });
    
                d.children = d._children;
                d._children = null;
                d.name = d.name.slice(2,-2)
                d.collapsed = false
            } else {
                d._children = d.children;
                d.children = null;
                d.name = '<<' + d.name + '>>'
                d._children.forEach(function (childNode) {
                    if(childNode.duplicate == true){
                        d.children = []
                        childNode.name = '<<' + childNode.name + '>>'
                        d.children.push(childNode)
                    }
                });
                d.collapsed = true
            }
        return d;
    }



    function nodeNoFocus(d) {
        //update(root);
       // if (editingControl!='tags'){
        d3.select('.links').selectAll('path').style('stroke', 'lightsteelblue');
       // d3.select('#link' + selectedNodeLink.id).select('path').style('stroke', 'lightsteelblue'); // Link line 
        d3.select('text#nodePOS' + selectedNodeLink.id).style('stroke', 'white');       // POS Label
        d3.select('text#linkLabel' + selectedNodeLink.id).style('stroke', 'white');        // Rel Label    
        d3.select('text#nodeLabel' + selectedNodeLink.id).style('stroke', '');  //Node name??
        if (selectedNodeLink.collapsed){
            d3.select('circle#nodeCircle' + selectedNodeLink.id).style('fill', 'black');
        }else{
            d3.select('circle#nodeCircle' + selectedNodeLink.id).style('fill', 'white');
        }
       
        return;
      
       // }
    };

    // focus link on click
    function nodeSingleClick(d) {

        if (d3.event.defaultPrevented) return

        if (d.hasOwnProperty('source')) {
            selectedNodeLink = d.target
        } else {
            selectedNodeLink = d
        }

        if(lastClickedNodeId !== selectedNodeLink.id) {
            lastKeyStroke = ''
            pointer = 0
            lastClickedNodeId = selectedNodeLink.id

        }

        // d3.select('.links').selectAll('path').style('stroke', '#545454');
        // this greys out the links for the nodes that are not selected
        d3.select('.links').selectAll('path').style('stroke', '#b3b3b3');
        d3.select('.links').selectAll('text').style('stroke', 'white');
        d3.select('.nodes').selectAll('text').style('stroke', '');
        
        //d3.selectAll('.nodeCircle').style('fill', 'white');

        if (selectedNodeLink.collapsed){
            d3.select('circle#nodeCircle' + selectedNodeLink.id).style('fill', 'black');
        }else{
            d3.select('circle#nodeCircle' + selectedNodeLink.id).style('fill', 'white');
        }

        
        d3.select('#link' + selectedNodeLink.id).select('path').style('stroke', 'cornflowerblue'); // Link line 
        
       if ( editingControl === 'rel') {
              d3.select('text#nodePOS' + selectedNodeLink.id).style('stroke', 'lightcoral');       // POS Label
               d3.select('text#linkLabel' + selectedNodeLink.id).style('stroke', 'lightgreen');        // Rel Label    
       }else if (editingControl === 'pos'){
             d3.select('text#nodePOS' + selectedNodeLink.id).style('stroke', 'lightgreen');       // POS Label
             d3.select('text#linkLabel' + selectedNodeLink.id).style('stroke', 'lightcoral');        // Rel Label    

       }else{ // tags 
             d3.select('text#nodePOS' + selectedNodeLink.id).style('stroke', 'lightgreen');       // POS Label
             d3.select('text#linkLabel' + selectedNodeLink.id).style('stroke', 'lightgreen');        // Rel Label    
       }

        d3.select('text#nodeLabel' + selectedNodeLink.id).style('stroke', 'black');  //Node name??
        
        d3.select('circle#nodeCircle' + selectedNodeLink.id).style('fill', 'cornflowerblue');

        return;
    };
 
    // collapse and expand node's children  on click
    function nodeDoubleClick(d) {
        if (d3.event.defaultPrevented) return;
        if(!hasNoChildren(d)) {
            d = toggleChildren(d);
        }
        update(d);
    };

    // keypress handler for nodes
    function nodeKeypress(d) {

        if (d3.event.defaultPrevented) return;
        if(d3.event.keyCode === 9 && editingControl !== 'tags') { // click on tab!
            if(editingControl === 'pos') {
                editingControl = 'rel';
                lastKeyStroke = ''
            } else {
                editingControl = 'pos'
                lastKeyStroke = ''
            }
            nodeSingleClick(selectedNodeLink);
            
        } else {
            if(d3.event.keyCode >= 65 && d3.event.keyCode <= 90) { //ONLY A-Z are allowed.
                if(editingControl === 'pos') {
                    for (var posKey in posTags) {
                        if (d3.event.key.toUpperCase() === posKey.toUpperCase()) {
                            if(lastKeyStroke.toUpperCase() !== d3.event.key.toUpperCase()) {
                                pointer = 0;
                                lastKeyStroke = d3.event.key.toUpperCase();
                                editPOS(posTags[posKey][pointer].toUpperCase())
                            } else {
                                if(pointer === posTags[posKey].length - 1) {
                                    pointer = 0;
                                } else {
                                    pointer++;
                                }
                                editPOS(posTags[posKey][pointer].toUpperCase())
                            }
                        } 
                    }
                } else {
                    for (var relKey in relLabels) {
                        if (d3.event.key.toUpperCase() === relKey.toUpperCase()) {
                            if(lastKeyStroke.toUpperCase() !== d3.event.key.toUpperCase()) {
                                pointer = 0;
                                lastKeyStroke = d3.event.key.toUpperCase();
                                editLabel(relLabels[relKey][pointer])
                            } else {
                                if(pointer === relLabels[relKey].length - 1) {
                                    pointer = 0;
                                } else {
                                    pointer++;
                                }
                                editLabel(relLabels[relKey][pointer])
                            }
                        } 
                    }
                }
            } else {
                if (editingControl !== 'tags') {
                    switch (d3.event.key) {
                        case 'ArrowDown':
                           
                            if (selectedNodeLink.children.length > 1) { //This is a tree node with one or more tree node children
                                nodeNoFocus(d);
                                var childNode = selectedNodeLink.children[0]
                                if (childNode.id == selectedNodeLink.id + 1) { // the first child is a projectedNode; so jump to next child.
                                    nodeSingleClick(selectedNodeLink.children[1])
                                } else {
                                    nodeSingleClick(selectedNodeLink.children[0]) //the first child is not a projected node; the treenode child precedes the parent.
                                }

                            }
                            break;
                        case 'ArrowUp':
                            if (selectedNodeLink.pid !== 0) {
                                nodeNoFocus(d);
                                nodeSingleClick(selectedNodeLink.parent)
                            }
                            break;
                        case 'ArrowRight':
                            var neighborCheck = 1;
                            if (selectedNodeLink.pid !== 0) neighborCheck = 2;
                            if (orientation == 'r-to-l') {
                                if (selectedNodeLink.parent.children.length > neighborCheck) {
                                    
                                    var neighborArray = selectedNodeLink.parent.children;
                                    var neighborID = -1;
                                    for (var k=0; k<neighborArray.length; k++) {
                                        if (neighborArray[k].id == selectedNodeLink.id) {
                                            if (neighborID !== -1) {nodeNoFocus(d); nodeSingleClick(neighborArray[neighborID]);}
                                            break;
                                        } else if (!neighborArray[k].duplicate) {neighborID = k;}
                                    }
                                }
                            } else {
                                if (selectedNodeLink.parent.children.length > neighborCheck) {
                                    
                                    var neighborArray = selectedNodeLink.parent.children;
                                    var neighborID = -1;
                                    for (var k=neighborArray.length-1; k>-1; k--) {
                                        if (neighborArray[k].id == selectedNodeLink.id) {
                                            if (neighborID !== -1) {nodeNoFocus(d); nodeSingleClick(neighborArray[neighborID]);}
                                            break;
                                        } else if (!neighborArray[k].duplicate) {neighborID = k;}
                                    }
                                }
                            }
                            break;
                        case 'ArrowLeft':
                            var neighborCheck = 1
                            if (selectedNodeLink.pid !== 0) neighborCheck = 2;
                            if (orientation == 'l-to-r') {
                                
                                if (selectedNodeLink.parent.children.length > neighborCheck) {
                                    var neighborArray = selectedNodeLink.parent.children;
                                    var neighborID = -1;
                                    for (var k=0; k<neighborArray.length; k++) {
                                        if (neighborArray[k].id == selectedNodeLink.id) {
                                            if (neighborID !== -1) {nodeNoFocus(d); nodeSingleClick(neighborArray[neighborID]);}
                                            break;
                                        } else if (!neighborArray[k].duplicate) {neighborID = k;}
                                    }
                                }
                            } else {
                                if (selectedNodeLink.parent.children.length > neighborCheck) {
                                     
                                    var neighborArray = selectedNodeLink.parent.children;
                                    var neighborID = -1;
                                    for (var k=neighborArray.length-1; k>-1; k--) {
                                        if (neighborArray[k].id == selectedNodeLink.id) {
                                            if (neighborID !== -1) {nodeNoFocus(d); nodeSingleClick(neighborArray[neighborID]);}
                                            break;
                                        } else if (!neighborArray[k].duplicate) {neighborID = k;}
                                    }
                                }
                            }
                            break;

                        case 'Home':
                            firstTree()
                            break;
                        case 'End':
                            lastTree()
                            break;
                        case 'PageUp':
                            nextTree();
                            break;
                        case 'PageDown':
                            prevTree();
                            break;
                        case 'Escape':
                            console.log('Escape')
                            $('#labels').hide();
                            $('#postags').hide();
                            d3.select('text#nodePOS' + selectedNodeLink.id).style('stroke', '#545454');
                            d3.select('text#nodeLabel' + selectedNodeLink.id).style('stroke', '#ffffff');
                            update(root);
                            break;
                        default:
                            return; // Quit when this doesn't handle the key event.
                    }
                }
            }
        }

        d3.event.preventDefault();
        return;
    };

    // toggle morphology info window
    function morphologyClick(d) {
        selectedMorphology = d;
        d3.selectAll('.morphology').style('stroke', '');
        d3.select('text#morphology' + selectedMorphology.id).style('stroke', 'blue');
        document.getElementById('morphologyName').value = d.name;

        if (editLemma === true) {
            document.getElementById('lemma').value = d.parent.lemma
        }

        for (var i = 0; i < lexicalFeatsList.length; i++) {
            document.getElementById(lexicalFeatsList[i]).value = d.parent.feats[lexicalFeatsList[i]]   
        }

        
        for (var i = 0; i < document.getElementById('morphoFeats').getElementsByClassName('morphoFeat').length; i++) {
            document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].disabled = false
        }

        for (var i = 0; i < document.getElementById('morphoFeats').getElementsByClassName('morphoFeat').length; i++) {
            featName = document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].id

            
            if(d.parent.pos.toUpperCase() in defaultFeatValues && featName in defaultFeatValues[d.parent.pos.toUpperCase()]) {
                if(defaultFeatValues[d.parent.pos.toUpperCase()][featName] === 'N/A') {
                    document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].value = 'N/A'
                    document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].disabled = true
                } else {
                    if(featName in selectedMorphology.parent.feats) {
                    	for(var j = 0; j < featureValues[featName].length; j++) { 
                    		if(featureValues[featName][j]['value'] === selectedMorphology.parent.feats[featName]) {
                     	   		document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].value = featureValues[featName][j]['display']
                     		}
                    	}
                    } else {
                        document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].value = defaultFeatValues[d.parent.pos][featName]
                    }
                }
            } else {
                document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0].value = document.getElementById('morphoFeats').getElementsByClassName('morphoFeat')[i].getElementsByClassName('inputArray')[0][0].value
            }
        }

        $('#morphology').show();
    };

    // merge node into right neighbor
    //d is the projected node
    function morphologyRightMerge(d) {
        var mergedName = d.name + fullTree.select('#node' + parseInt(d.id+1)).data()[0].name;
        //change the name of the next node in the tree
        fullTree.select('#node' + parseInt(d.id+1)).data()[0].name = mergedName;
        //change the name of the projected node of the next node in the tree
        fullTree.select('#node' + parseInt(d.id+2)).data()[0].name = mergedName;
        deleteNode(d);
        update(root);
    };

    // merge node into left neighbor
    //d is the projected node
    function morphologyLeftMerge(d) {
        var mergedName = fullTree.select('#node' + parseInt(d.id-3)).data()[0].name + d.name;
        //change the name of the previous node in the tree
        fullTree.select('#node' + parseInt(d.id-3)).data()[0].name = mergedName;
        //change the name of the projected node of the previous node in the tree
        fullTree.select('#node' + parseInt(d.id-2)).data()[0].name = mergedName;
        deleteNode(d);
        update(root);
    };

 // Updates the ids of the nodes to correspond to sentence order
 var updateTreeOrderDelete = function(node, delId) {

         if (node.id > delId) {
             node.id = node.id - 2;
         }
        
         if (node.id > 0){ // only non-root:
             node.pid = node.parent.id;  // parent already handled in a previous iteration
         }

         if (typeof node.children !== 'undefined') {
             for (var k=0; k<node.children.length; k++) {
                  node.children[k] = updateTreeOrderDelete(node.children[k], delId)
              }
         }
     return node;    
 };

    // Updates the ids of the nodes to correspond to sentence order
    var updateTreeOrderAdd = function(node, addId) {

        if (node.id >= addId) {
            node.id = node.id + 2; 
        }

        if (node.pid > 0) { // only non-root:
            node.pid = node.parent.id;  // parent already handled in a previous iteration
        }

        if (typeof node.children !== 'undefined') {
            
            for (var k=0; k<node.children.length; k++) {
                node.children[k] = updateTreeOrderAdd(node.children[k], addId)
            }
        }
        
        return node;
        
    };

    // Delete a node
    function deleteNode(d) {

        var delNodeId = d.id - 1;
        var nodeToDelete;

        if (d.parent.children.length > 1) {
            nodeToDelete = _.where(d.parent.children, {id: d.id});
            d.parent.children = _.without(d.parent.children, nodeToDelete[0]);

	    for (var k=0; k<d.parent.children.length; k++) {
                d.parent.children[k].parent= d.parent.parent;
            }
	    
            d.parent.parent.children = d.parent.parent.children.concat(d.parent.children)
        }

        nodeToDelete = _.where(d.parent.parent.children, {id: delNodeId});
        d.parent.parent.children = _.without(d.parent.parent.children, nodeToDelete[0]);
        numberOfNodesArray[currentTreeIndex] = numberOfNodesArray[currentTreeIndex] - 1;

        updateTreeOrderDelete(root, delNodeId)
        nodeDeleted = true;
        d3.select('body').select('svg').remove()
        getTree(root)
        update(root)
        $('.morphologyMerge').toggle()
    };

    // Add a new node to left of an existing node
    addNode = function(d, position, name = newNodeName) {
        var newNodeId;
        var parent = root;

        if (position == 'left') {
            newNodeId = d.id - 1;
            updateTreeOrderAdd(root, newNodeId)
        } else if (position == 'right') {
            newNodeId = d.id + 1;
            parent = d.parent.parent;
            updateTreeOrderAdd(root, newNodeId)
        } else if (position == 'end') {
            newNodeId = d.id + 1;
        } else if (position == 'root') {
            newNodeId = d.id + 1;
            root.children = [];
        } 

        var treeNode = new Object();
        var projectedNode = new Object();

        projectedNode.id = newNodeId + 1;
        projectedNode.name = name;
        projectedNode.pos = newPOSTag;
        projectedNode.pid = newNodeId;
        projectedNode.link = '';
        projectedNode.duplicate = true
        projectedNode.collapsed = false

        treeNode.id = newNodeId;
        treeNode.name = name;
        treeNode.pos = newPOSTag;
        treeNode.pid = parent.id;
        treeNode.link = newLinkLabel;
        treeNode.collapsed = false
        treeNode.duplicate = false
        treeNode.children = [];
        treeNode.children.push(projectedNode);
        numberOfNodesArray[currentTreeIndex] = numberOfNodesArray[currentTreeIndex] + 1;


        treeNode.lemma = ''
        treeNode.xpos = ''

        treeNode.feats = {}

        treeNode.deps = ''
        treeNode.misc = ''

        parent.children.push(treeNode)
        nodeDeleted = true;
        d3.select('body').select('svg').remove()
        getTree(root)
        update(root)
        $('.morphologyMerge').toggle()
    };

    // display 'drop zone' on mouseover
    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };

    // remove 'drop zone' on mouseout
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // show temporary paths between gged node and drop zone
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            data = [{
                    source: {
                        x: selectedNode.x0,
                        y: selectedNode.y0
                    },
                    target: {
                        x: draggingNode.x0,
                        y: draggingNode.y0
                    }
            }];
        }
        var link = fullTree.select('.templinks').selectAll('.templink').data(data);

        link.enter().append('path')
                .attr('class', 'templink')
                .attr('d', d3.svg.line())
                .attr('pointer-events', 'none');

        link.attr('d', d3.svg.line());

        link.exit().remove();
    };

    // prepare node for dragging by removing children and paths
    function initiateDrag(d, domNode) {
        $('.morphologyMerge').hide();
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        fullTree.select('.nodes').selectAll('.node').sort(function(a, b) { // select the parent and sort the path's
            if (a.id !== draggingNode.id) return 1; // a is not the hovered element, send 'a' to the back
            else return -1; // a is the hovered element, bring 'a' to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            linktexts = fullTree.select('.links').selectAll('.pathGroup')
                .data(links, function (d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = fullTree.select('.nodes').selectAll('.node')
                .data(nodes, function(d) {
                    return d.id;
                }).filter(function(d, i) {
                    if (d.id === draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        };
                // remove parent link
        parentLink = tree.links(tree.nodes(draggingNode.parent));
        fullTree.select('.links').selectAll('.pathGroup').filter(function(d, i) {
            if (d.target.id === draggingNode.id) {
                return true;
            }
            return false;
        }).remove();
        dragStarted = null;
    };

    // Define the drag listeners for drag/drop behaviour of nodes.
    var dragListener = d3.behavior.drag()
        .on('dragstart', function(d) {
            // root and morphology cannot be dragged
            if (d.id % 2 ==0) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on('drag', function(d) {
            if (d === root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            d.y0 += d3.event.dy;
            d.x0 += d3.event.dx;
            var node = d3.select(this);
            node.attr('transform', 'translate(' + d.x0 + ',' + d.y0 + ')');
            updateTempConnector();
        }).on('dragend', function(d) {
            if (d === root) {
                return;
            }
            domNode = this;
            if (selectedNode) {
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                expand(selectedNode);
                // now remove the element from the parent, and insert it into the new elements children
                var index = draggingNode.parent.children.indexOf(draggingNode);
                if (index > -1) {
                    draggingNode.parent.children.splice(index, 1);
                }
                // Make sure it works whether children are expanded or not!
                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                    if (typeof selectedNode.children !== 'undefined') {
                        selectedNode.children.push(draggingNode);
                        // sort nodes to maintain original word order!
                        selectedNode.children = selectedNode.children.sort(function(a, b) {
                            return b.id - a.id;
                        });
                    } else {
                        // sort nodes to maintain original word order!
                        selectedNode._children.push(draggingNode);
                        selectedNode._children = selectedNode.children.sort(function(a, b) {
                            return a.id - b.id;
                        });
                    }
                } else {
                    selectedNode.children = [];
                    selectedNode.children.push(draggingNode);
                }
                endDrag();
            } else {
                endDrag();
            }
        });

    // when node is dropped, update tree
    function endDrag() {
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        if(selectedNode != null) {
            // animations could go to/from the drop target
            update(selectedNode);
        }
        else if (draggingNode !== null) {
            // the dragged node is moving back to where it started, let the animations come from the dragged node
            update(draggingNode);
        }
        if (selectedNode !== null) draggingNode.pid = selectedNode.id;
        draggingNode = null;
        selectedNode = null;
    };

    // compute word offset based on word length. The offset of
    // the n'th word (word with specified id) in the sentence is
    // the cumulative sum of the offset of all words 1..n in the
    // specified sentenceArray.
    // this function is used to adjust node distance in the rendered tree based on word length
    wordOffset = function(nodes, id, sentenceArray) {
        var wordOffset = 0;

        for (ii = 0; ii < sentenceArray.length; ii++) {
            wordOffset = wordOffset + sentenceArray[ii][1].length*10;
            if( sentenceArray[ii][0] == id ) {
               return wordOffset;
            }
        }

        return 0;
    }

    // return true if node is a leaf node, else false.
    isLeafNode = function(node) {
        return (node.children === void 0 && node._children === void 0);
    }

    //return true if the node does not have any children, else false
    hasNoChildren = function(node) {
        return (node.children.length === 1 && node._children === void 0);
    }

    // return the number of nodes in the subtree of the specified root node
    // that are to the right of the specified subjectNode and to the left of the specified
    // root node with respect to their ids.
    numNodesInSubtree = function(subtreeRootNode, nodeInSubtree, subjectNode) {
        var num = 0;
        var length = 0;

        // if leaf node
        if(isLeafNode(nodeInSubtree)) {
            return num;
        }

        // get length and visibility
        else if(!nodeInSubtree.collapsed) {
           length = nodeInSubtree.children.length;
        }
        else {
           length = nodeInSubtree._children.length;
        }

        for (var ii = 0; ii < length; ii++) {

            // if not a leaf node
            if (!isLeafNode(nodeInSubtree)) {

                if (nodeInSubtree.collapsed && nodeInSubtree._children[ii].id > subjectNode.id) {
                   continue;
                }
                // nodeInSubtree is to the right of collapsed subtreeRootNode and therefore
                // should not be counted
                if (nodeInSubtree.collapsed && nodeInSubtree._children[ii].id < subtreeRootNode.id) {
                   continue;
                }
                if (!nodeInSubtree.collapsed && nodeInSubtree.children[ii].id < subtreeRootNode.id) {
                   continue;
                }

               num += 1;
            }

            if (nodeInSubtree.collapsed) {
                    num += numNodesInSubtree(subtreeRootNode, nodeInSubtree._children[ii], subjectNode);
            }
            else {
                    num += numNodesInSubtree(subtreeRootNode, nodeInSubtree.children[ii], subjectNode);
            }
        }

        return num;
    }

    //check if the childNode is a descendant of the parentNode
    isDescendant = function(childNode, parentNode) {
        if(childNode.parent === parentNode) {
            return true;
        } else {
            parentNode = parentNode.parent
            while(parentNode.id !== 0) {
                if (childNode.parent === parentNode) {
                    return true;
                } else {
                    parentNode = parentNode.parent
                }
            }
        }
        return false;
    }

    hasCollapasedParent = function(node) {
        if(node.duplicate) {
            return false;
        }
        if(node.id === 0) {
            return false;
        } else {
            parent = node.parent
            while(parent.id !== 0) {
                if(parent.collapsed) {
                    return true;
                } else {
                    parent = parent.parent
                }
            }
            return false;
        }
    }

    countCollapsedNodes = function(nodes, subjectNode) {
        var deduct = 0;
        for (var ii = 0; ii < nodes.length && ii < subjectNode.id; ii++) {
            if(hasCollapasedParent(nodes[ii])) {
                deduct += 1;
            }
        }
        return deduct;
    }


    // main update function
    update = function(animSource) {
        // Compute the new tree layout.
        var tempNodes = tree.nodes(root);
        tempNodes.sort(function(a,b) { return parseFloat(a.id) - parseFloat(b.id) } );

        var indexNodes = []

        for (var i=0; i<tempNodes.length; i++) {
            if(!tempNodes[i].duplicate) {
                indexNodes.push(tempNodes[i]);
            }
        }


        var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

        var nodeCount = nodes.length - 1;
        if (orientation == 'l-to-r') {
            var nodeTextDirStyle = 'ltr'
            var nodeTextAnchorStyle = 'start'
        } else {
            var nodeTextDirStyle = 'rtl';
            var nodeTextAnchorStyle = 'end'
        }

        // build sentenceArray and sentenceText
        var sentenceArray = [];
        var sentenceText = ''
        nodes.forEach(function(d) {
            if (d.id % 2 == 1)  {
                sentenceArray.push([d.id,d.name]);
            }
        });

        sentenceArray.sort(function(a, b){return a[0]-b[0]})
        for (var i = 0; i < sentenceArray.length; i++) {
            sentenceText += sentenceArray[i][1] + ' '    
        }
        root.meta['sentenceText'] = sentenceText.trim()

        var counter = 0;

        // Sets the x and y coordinates of the nodes
        nodes.reverse().forEach(function(d) {

            // for nodes with ids less than d.id (that come to the right of d.id) that have been collapsed,
            // count the left subtree nodes recursively and deduct the count
            // to shrink tree size. Note that right subtree nodes don't affect the positioning of the subject
            // node d. Only the left subtree nodes of the collapsed node do.
            deduct = countCollapsedNodes(nodes, d);
            
            for (var i = 0; i < indexNodes.length; i++) {
                if(indexNodes[i] === d) {
                    counter = i;
                    break;
                }
            }

            if (d.y > lowestNodeY) {
                lowestNodeY = d.y
            }
            if (d.id == 0) {
                d.x = orient(parseFloat(localStorage['customwidth']) * 300) ;
            }
            else if (d.id % 2 == 0) {
                // if leaf node
                if ( isLeafNode(d) ) {
                  d.x = d.parent.x;
                }
                else {
                    d.x =  orient(counter * parseFloat(localStorage['customwidth']) * 300 + wordOffset(nodes, d.id-1, sentenceArray)) ;
                }
            }
            else {
                // if leaf node
                if ( isLeafNode(d) ) {
                  d.x = d.parent.x;
                }
                else {
                    d.x = orient(counter * parseFloat(localStorage['customwidth']) * 300 + wordOffset(nodes, d.id, sentenceArray));
                }
            }
        });

        nodes.forEach(function(d) {
            if (d.id != 0 && d.id % 2 == 0)  {
                d.y = lowestNodeY
            }
        });

        // Compute original sentences in both English and Arabic
        var sentenceArray = [];
        nodes.forEach(function(d) {
            if (d.id % 2 == 1)  {
                sentenceArray.push([d.id,d.name]);
            }
        });
        sentenceArray.sort(function(a, b){return a[0]-b[0]})
        for (var i=0; i<sentenceArray.length; i++) {
          sentenceArray[i] = sentenceArray[i][1]
        }
        sentenceArray = sentenceArray.join(' ')
        document.getElementById('fullSentence').textContent = sentenceArray;
        $('#sents').show()
        $('.toolbar input').show()

        // force full tree redraw to update dynamic changes like doubleclick etc.
        fullTree.selectAll('.node').remove();
        fullTree.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')

        // Declare the nodes
        var node = fullTree.select('.nodes').selectAll('.node')
            .data(nodes, function(d) { 
                if (d.id == 0) return d.id;
                else return d.id || (d.id = ++i); });

        // Declare the paths
        var link = fullTree.select('.links').selectAll('.pathGroup')
            .data(links, function(d) {
                return d.target.id;
        });

        // create a group to hold path graphics and path labels
        var linkEnter = link.enter().append('g').attr('class', 'pathGroup');

        linkEnter.filter(function(d, i)
                  {
                  if (d.target.id % 2 != 0) 
                    return true; else return false;
                  }).attr('id', function(d) { return 'link' + d.target.id; })
                    .on('click', nodeSingleClick);
        
        // add path graphics
        linkEnter.append('path')
            .attr('d', function(d) {
                var o = {
                    x: animSource.x0,
                    y: animSource.y0
                };
                return lineData({
                    source: o,
                    target: o
                });
        });
        
        // add labels
        linkEnter.append('text')
                .attr('dy', '.35em')
                .attr('text-anchor', 'middle')
                .text(function (d) {
                    return d.target.link;
        })

        // animation -- placeholder
        var linkUpdate = link.transition()
                .duration(duration);
        
        // format paths
        linkUpdate.filter(function(d, i)
          {
          if (d.target.id % 2 != 0) 
            return true; else return false;
          }).select('path')
                .attr('d', lineData)
                .style('stroke-width', '3px')
                .style('stroke', 'lightsteelblue')
                .style('fill', 'none')
                .style('cursor', 'pointer');

        // format morphology paths
        linkUpdate.filter(function(d, i)
          {
          if (d.target.id % 2 == 0) 
            return true; else return false;
          }).select('path')
                .attr('d', lineData)
                .style('stroke-width', '3px')
                .style('stroke', 'lightsteelblue')
                .style('fill', 'none')
                .style('stroke-dasharray', ('15, 15'));

        // format text
        linkUpdate.select('text')
            .attr('class', 'linktext ' + localStorage.currentFont)
            .attr('id', function(d) { return 'linkLabel' + d.target.id; })
            .style('cursor', 'pointer')
            .style('stroke', '#ffffff')
            .text(function(d) {
                return d.target.link;
            })

        // animate text entrance
        linkUpdate.select('text')
                .attr('transform', function(d) {
                    return 'translate(' + ((d.target.x + d.source.x) / 2) + ',' + ((d.target.y + d.source.y) / 2) + ')';});

        // remove unnecessary paths
        var linkExit = link.exit().remove();

        // set exiting labels to transparent
        linkExit.select('text')
            .style('fill-opacity', 0);

        // Enter the nodes.
        // Use 'd.x +...+ d.y' for horizontal trees
        // Use 'd.y +...+ d.x' for vertical trees
       var nodeEnter = node.enter().append('g')
            .call(dragListener)
            .attr('class', 'node')
            .attr('id', function(d) { return 'node' + d.id; })
            // source.{x0,y0} is where the nodes originate from
            .attr('transform', function(d) {return 'translate(' + animSource.x0 + ',' + animSource.y0 + ')'; })

        nodeEnter.filter(function(d, i)
          {
          if (d.id % 2 == 1) 
            return true; else return false;
          }).on('dblclick', nodeDoubleClick)
            .on('click', nodeSingleClick)
            .on('focus', nodeSingleClick)
            .on('blur', nodeNoFocus)
            .on('keydown', nodeKeypress)

        nodeEnter.filter(function(d, i)
          {
          if (d.id == 0 || d.id % 2 == 1)
            return true; else return false;
          }).append('text')
            .attr('id', function(d) { return 'nodeLabel' + d.id; })
            .attr('class', localStorage.currentFont)
            .style('direction', nodeTextDirStyle)
            .classed('nodelabel', true)
            .attr('y', function(d) {
                return d.children || d._children ? 0 : parseFloat(localStorage['ysep']); })
            .attr('x', function(d) {
                return d.children || d._children ? parseFloat(localStorage['xsep'])+parseFloat(localStorage['nodesize']) : -parseFloat(localStorage['nodesize']); })
            // .attr('dy', '.85em')
            // .attr('dx', '.2em')
            .attr('dy', '0em')
            .attr('dx', '.2em')
            .attr('text-anchor', nodeTextAnchorStyle)
            .text(function(d) {
                return d.name;
            })

        // add POS labels to nodes
        nodeEnter.filter(function(d, i)
          {
          if (d.id % 2 == 1)
            return true; else return false;
          }).append('text')
            .attr('id', function(d) { return 'nodePOS' + d.id; })
            .attr('class', localStorage.currentFont)
            .classed('nodepos', true)
            // .attr('dx', '1.5em')
            // .attr('dy', '2.35em')
            .attr('dy', '2em')
            .attr('dx', '-1em')
            .attr('text-anchor', 'start')
            .text(function(d) {
                return d.pos; })

        if (nodeCount > 0) {
            // add bottom morphology text
            nodeEnter.filter(function(d, i)
              {
              if (d.id != 0 && d.id % 2 == 0) 
                return true; else return false;
              }).append('text')
                .attr('id', function(d) { return 'morphology' + d.id; })
                .attr('class', localStorage['currentFont'])
                .style('direction', nodeTextDirStyle)
                .classed('morphology', true)
                .attr('dx', 0)
                .attr('dy', '1em')
                .attr('text-anchor', 'end')
                .text(function(d) { 
                    return d.name;
                })
                .on('click', morphologyClick); 

            // add Left Merge icon to morphology
            if (orientation == 'r-to-l') {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id > 2 && d.id % 2 == 0) 
                    return true; else return false;
                  }).append('text')
                    .attr('id', function(d) { return 'morphologyLeftMerge' + d.id; })
                    .attr('class', localStorage['currentFont'])
                    .classed('morphology', true)
                    .classed('morphologyMerge', true)
                    .attr('dx', '1.3em')
                    .attr('dy', '2.6em')
                    .attr('text-anchor', 'end')
                    .text('\u25B6')
                    .on('click', morphologyLeftMerge)
            } else {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id > 2 && d.id % 2 == 0) 
                    return true; else return false;
                  }).append('text')
                    .attr('id', function(d) { return 'morphologyLeftMerge' + d.id; })
                    .attr('class', localStorage['currentFont'])
                    .classed('morphology', true)
                    .classed('morphologyMerge', true)
                    .attr('dx', '-1.3em')
                    .attr('dy', '2.6em')
                    .attr('text-anchor', 'start')
                    .text('\u25C0')
                    .on('click',morphologyLeftMerge)
            }

            // add Right Merge icon to morphology
            if (orientation == 'r-to-l') {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id != 0 && d.id != nodeCount && d.id % 2 == 0) 
                    return true; else return false;
                  }).append('text')
                    .attr('id', function(d) { return 'morphologyRightMerge' + d.id; })
                    .attr('class', localStorage['currentFont'])
                    .classed('morphology', true)
                    .classed('morphologyMerge', true)
                    .attr('dx', '-1.3em')
                    .attr('dy', '2.6em')
                    .attr('text-anchor', 'start')
                    .text('\u25C0')
                    .on('click',morphologyRightMerge)
            } else {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id != 0 && d.id != nodeCount && d.id % 2 == 0) 
                    return true; else return false;
                  }).append('text')
                    .attr('id', function(d) { return 'morphologyRightMerge' + d.id; })
                    .attr('class', localStorage['currentFont'])
                    .classed('morphology', true)
                    .classed('morphologyMerge', true)
                    .attr('dx', '1.3em')
                    .attr('dy', '2.6em')
                    .attr('text-anchor', 'end')
                    .text('\u25B6')
                    .on('click', morphologyRightMerge)
            }

            // add Delete icon to morphology
            nodeEnter.filter(function(d, i)
              {
              if (d.id != 0 && d.id % 2 == 0) 
                return true; else return false;
              }).append('text')
                .attr('id', function(d) { return 'morphologyDelete' + d.id; })
                .attr('class', localStorage['currentFont'])
                .classed('morphology', true)
                .classed('morphologyMerge', true)
                .attr('dx', '0')
                .attr('dy', '2.6em')
                .attr('text-anchor', 'middle')
                .style('fill','red')
                .text('\u2716')
                .on('click',deleteNode)

            // add new node icon to morphology
            nodeEnter.filter(function(d, i)
              {
              if (d.id != 0 && d.id % 2 == 0) 
                return true; else return false;
              }).append('text')
                .attr('id', function(d) { return 'morphologyAddLeft' + d.id; })
                .attr('class', localStorage['currentFont'])
                .classed('morphology', true)
                .classed('morphologyMerge', true)
                .attr('x', function(d) { 
                    xLocation = (1 * localStorage['customwidth'] * 300 + d.name.length * 10)/2;
                    if (orientation == 'r-to-l') {
                        return xLocation + 'px';
                    }
                    else{ 
                        return '-' + xLocation + 'px';
                    }
                })
                .attr('dy', '2.6em')
                .attr('text-anchor', 'middle')
                .style('fill','light-blue')
                .text('\uFF0B')
                .on('click', function(d) {
                    addNode(d, 'left')
                });

            // add new node icon to morphology to the end of the tree (after the last node)
            nodeEnter.filter(function(d, i)
              {
              if (d.id == nodeCount) 
                return true; else return false;
              }).append('text')
                .attr('id', function(d) { return 'morphologyAddEnd' + d.id; })
                .attr('class', localStorage['currentFont'])
                .classed('morphology', true)
                .classed('morphologyMerge', true)
                .attr('dx', function(d) { 
                    if (orientation == 'r-to-l') return '-1.7em'
                    else return '1.7em'})
                .attr('dy', '2.6em')
                .attr('text-anchor', 'middle')
                .style('fill','light-blue')
                .text('\uFF0B')
                .on('click', function(d) {
                    addNode(d, 'end')
                });
        } else {
            // add new node icon to morphology for a new tree (that only has a root)
            nodeEnter.filter(function(d, i)
              {
              if (d.id == nodeCount) 
                return true; else return false;
              }).append('text')
                .attr('id', function(d) { return 'morphologyAddRoot' + d.id; })
                .attr('class', localStorage['currentFont'])
                .classed('morphology', true)
                .classed('morphologyMerge', true)
                .attr('dx', '0em')
                .attr('dy', '2.6em')
                .attr('text-anchor', 'middle')
                .style('fill','light-blue')
                .text('\uFF0B')
                .on('click', function(d) {
                    addNode(d, 'root')
                });
        }

        // add circles to nodes
        nodeEnter.filter(function(d, i)
          {
          if (d.id == 0 || d.id % 2 == 1) {
            return true;
            } else return false;
          }).append('circle')
            .attr('class', 'nodeCircle')
            .attr('id', function(d) { return 'nodeCircle' + d.id; })
            .attr('r', 0)
            .style('fill', function(d) {
                return d._children ? '#000' : '#fff';
            });

        // add 'drop zone' circle to node; set as transparent
        nodeEnter.filter(function(d, i)
          {
          if (d.id == 0 || d.id % 2 == 1) 
            return true; else return false;
          }).append('circle')
            .attr('class', 'ghostCircle')
            .attr('r', 30)
            .attr('opacity', 0.2)
            .style('fill', 'red')
            .style('stroke-width', 0)
            .attr('pointer-events', 'mouseover')
            .on('mouseover', function(node) {
                overCircle(node);
            })
            .on('mouseout', function(node) {
                outCircle(node);
            });

        // node entrance animation
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });

        // fade in labels
        nodeUpdate.selectAll('text')
            .style('fill-opacity', 1);

        // node circles 'grow' in (animation)
        nodeUpdate.select('circle.nodeCircle')
            .attr('r', parseFloat(localStorage['nodesize']))
            .style('fill', function(d) {
            return d._children ? '#000' : '#fff';
            })
            .style('stroke', 'black')

        // exiting nodes animation
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', function(d) {
                return 'translate(' + animSource.x + ',' + animSource.y + ')';
            }).remove();

        // node circles 'shrink' out (animation)
        nodeExit.select('circle')
            .attr('r', 0);

        // labels fade out
        nodeExit.selectAll('text')
            .style('fill-opacity', 0);

        // store node positions
        nodes.forEach(function(d) {
           d.x0 = d.x,
           d.y0 = d.y;
        });

        // go over the tree and sort each node's children array in ascending order
        var tempTree = tree.nodes(root);
        tempTree.sort(function(a,b) { return parseFloat(a.id) - parseFloat(b.id) } );

        for (var i=0; i<tempTree.length; i++) {
            if(!tempTree[i].duplicate && tempTree[i].children.length > 1) {
                tempTree[i].children.sort(function(a,b) { return parseFloat(a.id) - parseFloat(b.id) } );
            }
        }


    };

    // lay out the initial tree
    update(root);
};

