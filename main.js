/* * * * * * * * * *
Palmyra
(c) 2017, Talha Javed

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
var orientation = 'r-to-l';
var newPOSTag = "NOM";
var newLinkLabel = '---';
var rootNodeName = "جذر";

// settings variables are saved as session variables
// this way, they persist even if user navigates away from tree viewer

var standardPOS = function() {
    localStorage['posarray'] = [
        "---",
        "ERR",
        "NOM",
        "PNX",
        "PROP",
        "PRT",
        "VRB",
        "VRB-pass"
    ];
};

var standardLabels = function() {
    localStorage['labels'] = [
        "---",
        "IDF",
        "MOD",
        "OBJ",
        "PRD",
        "SBJ",
        "TMZ",
        "TPC",
    ];
};

// if no POS customization saved, initialize with defaults
if (!localStorage['posarray']) {
    standardPOS();
};

// if no POS customization saved, initialize with defaults
if (!localStorage['labels']) {
    standardLabels();
};

if (!localStorage['counts']) {
    localStorage['counts'] = JSON.stringify({});
};

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
    $('#jsontext').hide();
    $('#download').hide();
    $('#linktext').hide();
    findStorage();
    $('.upload').show();
};

var findStorage = function() {
    var check = "check";
    try {
        localStorage.setItem(check, check);
        localStorage.removeItem(check);
        return true;
    } catch (e) {
        alert('Your browser will not support Palmyra (See FAQ or README for details.)');
    }
};

// wait to call "main" until the page has finished loading
$(document).ready(main);

$( window ).resize(function() {
    sessionStorage.removeItem("treeData");
    saveTree();
    d3.select("body").select("svg").remove()
    getTree(treesArray[currentTreeIndex])
    update(root);
});

//STEP 2: Read the config file - currently is useless
var readConfigFile = function() {

    var x = document.getElementById("configFile");
    var input = "";

    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select config file.";
            console.log(txt)
        } else {

            var file = x.files[0];
            var reader=new FileReader();
            reader.onload = function(e) {
                console.log("config success")
            }
            console.log(file)
            reader.readAsText(file);    
            
        }
    }

    // var file = document.getElementById("configFile");
    // console.log(file)
    // var input = "";

    // var reader=new FileReader();
    // reader.onload = function(e) {

    // var labelArray = [];
    // var posArray = []
    // if (inputData !== "") {
    //     var lines = inputData.split("\n");
    //     for (var i=0; i< (lines.length); i++) {
    //         var singleLine = lines[i].split("\t");
    //         var treeNode = new Object();
    //         var duplicateNode = new Object();
    //         posArray.push(lines[i]);
    //         console.log(posArray)
    //     };
    // };


    // }
    
    // reader.readAsText(file);  
    return;  
};

// converts JSON format tree to CONLL format
var convertJSONToCONLL = function(node) {
    if(typeof node.children === 'undefined' && typeof node._children === 'undefined') {
        return [];
    }

    if (node.collapsed === false) {
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
//            var nodeFeatures = node.features.join(" ")
//            console.log(nodeFeatures)
            fullArray.push([(node.id+1)/2,node.name,node.pos,pid,node.link])
        } else {
            fullArray.sort(function(a, b){return a[0]-b[0]})
            for (var i=0; i<fullArray.length; i++) {
              fullArray[i] = fullArray[i].join("\t")
            }
            fullArray = fullArray.join("\n")
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
//            var nodeFeatures = node.features.join(" ")
//            console.log(nodeFeatures)
            fullArray.push([(node.id+1)/2,node.name,node.pos,pid,node.link])
        } else {
            fullArray.sort(function(a, b){return a[0]-b[0]})
            for (var i=0; i<fullArray.length; i++) {
              fullArray[i] = fullArray[i].join("\t")
            }
            fullArray = fullArray.join("\n")
        }
        return fullArray
    }
};

//UNUSED FUNCTION?
var outputToCONLLFormat = function(inputJSON) {
    var inputArray = [];
    var rootNodeIndex = 0;

    var rootNode = new Object();
    rootNode.name = "root";
    rootNode.nameArb = "جذر";
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
            if (typeof inputArray[pid].children == "undefined") {
                inputArray[pid].children = [];
            }
            inputArray[pid].children.push(inputArray[i]);
        }
    };
    return rootNode;
    // return inputArray[rootNodeIndex];
};

var convertToJSON = function(inputData) {
    var inputArray = [];
    numberOfNodesArray = []
    var newTree = [];
    if (inputData !== "") {
        var lines = inputData.split("\n");
        for (var i=0; i< (lines.length); i++) {
            if (lines[i].trim().length == 0 ) {
                if (newTree.length>0) {
                    inputArray.push(newTree);
                    numberOfNodesArray.push(newTree.length/2)
                    newTree = []
                }
                continue;
            }
            var singleLine = lines[i].split("\t");
            var treeNode = new Object();
            var duplicateNode = new Object();

            treeNode.id = parseInt(singleLine[0]) * 2 - 1;
//            treeNode.features = singleLine[5].split(" ");
            treeNode.name = singleLine[1];
            treeNode.pos = singleLine[2];
            treeNode.pid = parseInt(singleLine[3]) * 2 - 1;
            treeNode.link = singleLine[4];
            treeNode.duplicate = false
            treeNode.collapsed = false
            
            // console.log(treeNode.features)
            newTree.push(treeNode);

            duplicateNode.id = parseInt(singleLine[0]) * 2;
            duplicateNode.name = treeNode.name;
            duplicateNode.pos = singleLine[2];
            duplicateNode.pid = parseInt(singleLine[0]) * 2 - 1;
            duplicateNode.link = "";
            duplicateNode.duplicate = true
            duplicateNode.collapsed = false
//            duplicateNode.features = treeNode.features[3];
            newTree.push(duplicateNode);
        };
    };

    if (newTree.length > 0) {
        inputArray.push(newTree);
        numberOfNodesArray.push(newTree.length/2)
        newTree = []
    }

    //STEP 5.b: connect the nodes to their proper parents (i.e. create the tree)
    for (var i=0; i< (inputArray.length); i++) {
        newTree = inputArray[i];
        var rootNode = new Object();
//        rootNode.name = "root";
        rootNode.name = rootNodeName;
        rootNode.id = 0;
        rootNode.collapsed = false
        rootNode.children = [];

        for (var j=0; j< (newTree.length); j++) {
            var pid = newTree[j].pid - 1;
            if (pid == -2) {
                newTree[j].pid = 0;
                rootNode.children.push(newTree[j])
            }
            else {
                if (typeof newTree[pid].children == "undefined") {
                    newTree[pid].children = [];
                }
                newTree[pid].children.push(newTree[j]);
            }
        };
        inputArray[i] = rootNode;
    };

    return inputArray
};

//STEP 1: CODE STARTS RUNNING FROM HERE
var setJSONtreeData = function() {
    readConfigFile()
    var x = document.getElementById("inputFile");
    updateLabels();
    updatePOS();

    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select one or more files.";
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
                        // try to store tree data and display tree
                        // sessionStorage.setItem("treeData", treeData);
                        // var treeData = JSON.parse(input);
                        // console.log(treeData);
                        getTree(treesArray[0]);
                    } catch(e) {
                        console.log(e)
                        // alert user if error occurs
                        alert("Sorry, something went wrong!");
                    };
                }
                reader.readAsText(file);    
            }
        }
    } 
};

var setphrasetreeData = function() {
    var original = $("#treedata2").val();
    updateLabels();
    updatePOS();
    if (original !== "") {
        var treeDataArray = [];
        var inputTextArray = original.split("\n").filter(function(entry) { return entry.trim() != ''; });
        for (var i=0; i< (inputTextArray.length); i++) {
            var singleLine = inputTextArray[i].split(" ").filter(function(entry) { return entry.trim() != ''; });
            for (var j=0; j< (singleLine.length); j++) {
                treeDataArray.push([j+1,singleLine[j],newPOSTag,0,newLinkLabel].join("\t"))
            };
            treeDataArray.push("\n")
        };
        try {
            // try to store tree data and display tree
            treesArray = convertToJSON(treeDataArray.join("\n"));
            getTree(treesArray[0]);
            $('.upload').hide();
        } catch(e) {
            // alert user if error occurs
            alert("Sorry, something went wrong!");
        };
    } else {
        //alert("You forgot to enter a phrase!");
        $('.upload').hide();
        addNewTree()
    };
};

// helper function
// reset the tree data (to an empty string) and reload the window
var clearTree = function() {
    if (window.confirm("Do you really want to clear?")) {
        sessionStorage.removeItem("treeData");
        window.location.reload();
    }
};

// add a new tree at the end
var addNewTree = function() {
    sessionStorage.removeItem("treeData");
    saveTree();

    var rootNode = new Object();
    rootNode.name = rootNodeName;
    rootNode.id = 0;
    rootNode.collapsed = false
    rootNode.children = [];

    currentTreeIndex = treesArray.length
    d3.select("body").select("svg").remove()
    treesArray.push(rootNode)
    numberOfNodesArray.push(0)
    getTree(treesArray[currentTreeIndex])
    update(root);
    $('.morphologyMerge').show()
};

// delete the current tree
var deleteCurrentTree = function() {
    if (window.confirm("Do you want to delete this tree?")) {
        if (numberOfNodesArray.length > 1) {
            d3.select("body").select("svg").remove()
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
            sessionStorage.removeItem("treeData");
            saveTree();
            currentTreeIndex = 0;
            d3.select("body").select("svg").remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// move to the last tree
var lastTree = function() {
    if (currentTreeIndex != treesArray.length - 1) 
        { 
            sessionStorage.removeItem("treeData");
            saveTree();
            currentTreeIndex = treesArray.length - 1;
            d3.select("body").select("svg").remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// move to the next tree
var nextTree = function() {
    if (currentTreeIndex < treesArray.length - 1) 
        { 
            sessionStorage.removeItem("treeData");
            saveTree();
            currentTreeIndex++;
            d3.select("body").select("svg").remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// move to the prev tree
var prevTree = function() {
    if (currentTreeIndex > 0) 
        { 
            sessionStorage.removeItem("treeData");
            saveTree();
            currentTreeIndex--;
            d3.select("body").select("svg").remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// go to the input tree number
var goToTree = function() {
    if (currentTreeIndex !== (document.getElementById("treeNumberInput").value - 1)) 
        { 
            sessionStorage.removeItem("treeData");
            saveTree();
            currentTreeIndex = document.getElementById("treeNumberInput").value - 1;
            d3.select("body").select("svg").remove()
            getTree(treesArray[currentTreeIndex])
            update(root);
        }
};

// toggle between English and Arabic
var directionToggle = function() {
    if (orientation == 'r-to-l') {
        orientation = 'l-to-r'
        $('.morphologyMerge').hide()
        // $('#editbtn').attr('disabled','disabled');
    } else {
        orientation = 'r-to-l';
        $('.morphologyMerge').hide()
        // $('#editbtn').removeAttr('disabled');
    }
    sessionStorage.removeItem("treeData");
    saveTree();
    d3.select("body").select("svg").remove()
    getTree(treesArray[currentTreeIndex])
    update(root);
};

//STEP 3: Creating the list of labels and connecting the labels to the buttons on the Link Label box
/// Label Handling
// update the buttons for high-frequency labels
var updateLabels = function() {
    console.log("Update Labels")
    var stop;
    if (localStorage['labels']) {
        var labels = sortLabels();
        // limit total labels to 10
        stop = labels.length;
        // display up to 10 labels on buttons
        for (var i=0; i<stop; i++) {
            var id = "labelbutton" + i.toString();
            document.getElementById(id).value = labels[i];
            document.getElementById(id).style.display = "inline-block";
        };
    } else {
        stop = 0;
    };
    // if extra buttons, hide them
    for (var j=9; j>=stop; j--) {
        var id = "labelbutton" + j.toString();
        document.getElementById(id).style.display = "none";
    };

    //TEST ADD BUTTON
    // var btn = document.createElement("Button");
    // btn.innerHTML = "CLICK ME";
    // document.body.getElementsById('labels').appendChild(btn);
};

// find the most frequent labels
var sortLabels = function() {
    var labels = localStorage['labels'].split(',');
    var counts = JSON.parse(localStorage['counts']);
    labels = labels.sort(function(a, b) {
        return counts[b] - counts[a];
    });
    if (labels.length > 10) {
        labels = labels.slice(0,9);
    };
    return labels;
};

// close the label menu and update the tree
var finishLabel = function() {
    // $('#labels').hide();
    // $('#postags').hide();
    // d3.select("text#nodePOS" + selectedNodeLink.id).style("stroke", "");
    // d3.select("text#nodeLabel" + selectedNodeLink.id).style("stroke", "");
    update(root);
};

// handle a user-customized label
var newLabel = function() {
    // get the user's label
    var labelText = $('#textLabel').val();
    // update the tree data
    selectedNodeLink.link = labelText;
    // get list of top labels from storage; initialize if not stored
    var labels;
    if (!localStorage['labels']) {
        labels = [];
    } else {
        labels = localStorage['labels'].split(',');
    };
    // get the label counts
    var counts = JSON.parse(localStorage['counts']);
    // if this is a new label, add it to the list
    if (!counts[labelText]) {
        counts[labelText] = 1;
        labels.push(labelText);
    } else {
        // otherwise just up its count
        counts[labelText] += 1;
    };
    localStorage['counts'] = JSON.stringify(counts);
    localStorage['labels'] = labels.toString();
    finishLabel();
};

// handle a button press for high-frequency labels
var freqLabel = function(labelText) {
    selectedNodeLink.link = labelText;
    var counts = JSON.parse(localStorage['counts']);
    counts[labelText] += 1;
    localStorage['counts'] = JSON.stringify(counts);
    finishLabel();
};

// reset the label frequencies
var resetLabels = function() {
    localStorage.removeItem('labels');
    localStorage['counts'] = JSON.stringify({});
    finishLabel();
    updateLabels();
};

/// POS Handling
// update the buttons for high-frequency labels
var updatePOS = function() {
    var stop;
    if (localStorage['posarray']) {
        var posarray = localStorage['posarray'].split(',');
        // limit total labels to 10
        stop = posarray.length
        // display up to 10 labels on buttons
        for (var i=0; i<stop; i++) {
            var id = "posbutton" + i.toString();
            document.getElementById(id).value = posarray[i];
            document.getElementById(id).style.display = "inline-block";
        };
    } else {
        stop = 0;
    };
    // if extra buttons, hide them
    for (var j=9; j>=stop; j--) {
        var id = "posbutton" + j.toString();
        document.getElementById(id).style.display = "none";
    };
};

// close the label menu and update the tree
var finishPOS = function() {
    // $('#postags').hide();
    // $('#labels').hide();
    // d3.select("text#nodePOS" + selectedNodeLink.id).style("stroke", "");
    // d3.select("text#nodeLabel" + selectedNodeLink.id).style("stroke", "");
    update(root);
};

// handle a user-customized label
var newPOS = function() {
    // get the user's label
    var posText = $('#textPOS').val();
    // update the tree data
    d3.select("text#nodePOS" + selectedNodeLink.id).text(posText);
    // get list of top labels from storage; initialize if not stored
    var posarray;
    if (!localStorage['labels']) {
        posarray = [];
    } else {
        posarray = localStorage['posarray'].split(',');
    };
    posarray.push(posText)
    localStorage['labels'] = posarray.toString();
    finishPOS();
};

// handle a button press for high-frequency labels
var freqPOS = function(posText) {
    d3.select("text#nodePOS" + selectedNodeLink.id).text(posText)
    selectedNodeLink.pos = posText;
    finishPOS();
};

// reset the label frequencies
var resetPOSTags = function() {
    localStorage.removeItem('posarray');
    finishPOS();
    updatePOS();
};

// Morhology Handling
// reset the morphology changes
var cancelMorphology = function() {
    d3.selectAll(".morphology").style("stroke", "");
    $('#morphology').hide();
};

// reset the morphology changes
var saveMorphology = function() {
    var morphologyArray = document.getElementById('morphologyName').value.split(" ");
    var morphologyText = morphologyArray.shift()
    console.log(morphologyArray)

    d3.select("text#nodeLabel" + selectedMorphology.parent.id).text(morphologyText);
    d3.select("text#morphology" + selectedMorphology.id).text(morphologyText);
    // d3.select("#node" + parseInt(selectedMorphology.id-1)).data()[0].name = morphologyText;
    selectedMorphology.name = morphologyText;
    selectedMorphology.parent.name = morphologyText;

    while (morphologyArray.length > 0) {
        morphologyText = morphologyArray.shift()
        if (morphologyText.length > 0) addNode(selectedMorphology,"right", morphologyText)
    }

    $('#morphology').hide();
    d3.select("text#morphology" + selectedMorphology.id).style("stroke", "");
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
        alert("Sorry, something went wrong!");
    }
};

// regex to remove d3 'junk' variables from tree data
var cleanjson = function() {
    var json = sessionStorage.treeData;
    json = json.replace(/\"parent\":\"PARENT\",/g, "");
    json = json.replace(/\"depth\":[0-9]*,/g, "");
    json = json.replace(/\"(x|x0|y|y0)\":([0-9]+\.[0-9]+|[0-9]+),/g, "");
    json = json.replace(/,\"(x|x0|y|y0)":[0-9]+/g, "");
    sessionStorage.treeData = json;
};

// output tree as copyable text
var textTree = function() {
    saveTree();
    var output;
    if (sessionStorage.treeData !== "undefined") {
        cleanjson();
        if (sessionStorage.original && sessionStorage.translation) {
            output = sessionStorage.original + "\n" 
                + sessionStorage.translation + "\n" 
                + sessionStorage.treeData;
        } else if (sessionStorage.original) {
            output = sessionStorage.original + "\n" + sessionStorage.treeData;
        } else {
            output = sessionStorage.treeData;
        }
    }
    else {
        output = "Tree not found.";
    }
    document.getElementById("jsonfield").innerHTML = output;
};

///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

// output CONLL files for the tree
var downloadTree = function() {
    saveTree();
    var filename = $("#filename").val();
    if (document.getElementById("downloadChoiceImage").checked == true) {
        saveSvgAsPng(document.getElementsByTagName("svg")[0], filename+".png");
    } else {
        var output = '';
        if (sessionStorage.treeData !== "undefined") {
            for (var i=0; i<treesArray.length; i++) {
                // clone treeArray and remove cycles through nested parents.
                let clone = JSON.parse(JSON.stringify(JSON.decycle(treesArray[i])));
                output = output + convertJSONToCONLL(clone) + '\n\n';
            };
            // uses Blob and FileSaver libraries
            var blob = new Blob([output], {type: "text/plain;charset=utf-8"});
            // var blob = new Blob([convertJSONToCONLL(root)], {type: "text/plain;charset=utf-8"});
            // var blob = new Blob([sessionStorage.treeData], {type: "text/plain;charset=utf-8"});
            saveAs(blob, filename+".dep");
        }
        else {
            alert("Tree not found.");
        }

    }
    $("#download").hide();
};


// SETTINGS
// helper functions called by buttons in "SETTINGS" menu

// increases node radius by 5
var biggerNode = function() {
    localStorage['nodesize'] = parseFloat(localStorage['nodesize']) + 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases node radius by 5
var smallerNode = function() {
    if(parseFloat(localStorage['nodesize'])>5) {
        localStorage['nodesize'] = parseFloat(localStorage['nodesize']) - 5;
        if (sessionStorage.treeData) {
            update(root);
        };
    }
};

// increases branch separation by 0.5
var widerTree = function() {
    localStorage['customwidth'] = parseFloat(localStorage['customwidth']) + 0.5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases branch separation by 0.5
var narrowTree = function() {
    localStorage['customwidth'] = parseFloat(localStorage['customwidth']) - 0.5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// increases height of each layer by 25
var tallerTree = function() {
    localStorage['customdepth'] = parseFloat(localStorage['customdepth']) + 25;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases height of each layer by 25
var shorterTree = function() {
    localStorage['customdepth'] = parseFloat(localStorage['customdepth']) - 25;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// increases text distance from node
// (horiziontally, +5 each time)
var biggerX = function() {
    localStorage['xsep'] = parseFloat(localStorage['xsep']) + 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases text distance from node
// (vertically, -5 each time)
var smallerX = function() {
    localStorage['xsep'] = parseFloat(localStorage['xsep']) - 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// increases text distance from node
// (vertically, +5 each time)
var biggerY = function() {
    localStorage['ysep'] = parseFloat(localStorage['ysep']) + 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases text distance from node
// (vertically, -5 each time)
var smallerY = function() {
    localStorage['ysep'] = parseFloat(localStorage['ysep']) - 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

var customFont = function() {
    localStorage['currentFont'] = $("#fonts").val();
    document.getElementById("sents").className = localStorage['currentFont'];
    if (sessionStorage.treeData) {
        update(root);
    };
};

// return all settings to defaults
var reset = function() {
    for (var k=0; k<settings.length; k++) {
        localStorage[settings[k][0]] = settings[k][1];
    };
    document.getElementById('sents').className = localStorage['currentFont'];
    // if tree data, update the tree!
    if (sessionStorage.treeData) {
        update(root);
    };
};

// return all settings to defaults
var tagsToggle = function() {
    $('#labels').toggle();
    $('#postags').toggle();
    // nodeSingleClick(selectedNodeLink);
};

// END SETTINGS

var massReset = function() {
    var c = confirm("Are you sure? This will reset ALL settings!");
    if (c === true) {
        saveTree();
        localStorage.clear();
        window.location.reload();
        reset();
        haveTree();
    } else {
        return;
    };
};

// ************** Generate the tree diagram  *****************
var getTree = function(treeData) {
    // set height and width equal to HTML doc properties
    numberOfNodes = numberOfNodesArray[currentTreeIndex]
    var requiredWidth = parseFloat(localStorage['customwidth']) * 500 * numberOfNodes * 1.37;
    console.log(numberOfNodes, requiredWidth)
    if (requiredWidth > $(document).width()) var viewerWidth = requiredWidth
        else var viewerWidth = $(document).width();
    viewerHeight = $(document).height();
    d3.select("svg").attr("dir", "rtl")
    d3.select("#sents").attr("dir", "rtl")
    document.getElementById("currentTreeNumber").textContent = (currentTreeIndex + 1) + "/" + numberOfNodesArray.length;
    document.getElementById("treeNumberInput").max = numberOfNodesArray.length;
    document.getElementById("treeNumberInput").value = currentTreeIndex + 1;


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
        if (orientation == "r-to-l") 
            {return viewerWidth - xcoord; }
        else {return xcoord};
    }

    // names the tree layout "tree" and gives it a size value
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
        fullTree.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.5, 2]).on("zoom", zoom);

    // appends svg to html area tagged "body"
    var baseSvg = d3.select("body").append("svg")
     .attr("width", viewerWidth)
     .attr("height", viewerHeight)
     .attr("class", "overlay")
     .call(zoomListener).on("dblclick.zoom", null)


    //translate and scale to whatever value you wish
    
    if (orientation == 'r-to-l') {
        window.scrollTo(viewerWidth, 0);
        zoomListener.translate([viewerWidth*.318,30]).scale(.67);
    } else {
        zoomListener.translate([20,30]).scale(.67);
        d3.select("svg").attr("dir", "ltr")
        d3.select("#sents").attr("dir","ltr")
    }
    zoomListener.event(baseSvg.transition().duration(50));//does a zoom
     
    // creates a group for holding the whole tree, which allows "zoom" to function
    var fullTree = baseSvg.append("g").attr("class", "fulltree");
    // create a group for holding the links -- this group will be drawn first
    var lgroup = fullTree.append("g").attr("class", "links");
    // create a group for holding the nods -- this group will be drawn second
    var ngroup = fullTree.append("g").attr("class", "nodes");
    // create a group for holding the temporary link(s) -- this group will be drawn last
    fullTree.append("g").attr("class", "templinks");

    // define the root and its initial location
    root = treeData;
    root.x0 = viewerWidth / 2;
    root.y0 = parseFloat(localStorage['nodesize'])+40;
    // helper functions to collapse and expand nodes
    
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    //function modified by Dima
    //instead of relying on the state of children and _children, add a variable to indicate if a node is collapsed
    //keep the duplicate node that will appear at the bottom in the tree
    function toggleChildren(d) {
        if(d.collapsed == true) {
            d.children.forEach(function (child_node) {
                child_node.name = child_node.name.slice(2, -2)
            });

            d.children = d._children;
            d._children = null;
            d.name = d.name.slice(2,-2)
            d.collapsed = false
        } else {
            d._children = d.children;
            d.children = null;
            d.name = "<<" + d.name + ">>"
            d._children.forEach(function (child_node) {
                if(child_node.duplicate == true){
                    d.children = []
                    child_node.name = "<<" + child_node.name + ">>"
                    d.children.push(child_node)
                }
            });
            d.collapsed = true
        }

        // if (d.children) {
        //     d._children = d.children;
        //     d.children = null;
        //     d.name = "<<" + d.name + ">>"
        //     d._children.forEach(function (child_node) {
        //         if(child_node.duplicate == true){
        //             d.children.push(child_node)
        //         }
        //     });
        //     console.log("???")
        // } else if (d._children) {
        //     d.children = d._children;
        //     d._children = null;
        //     d.name = d.name.slice(2,-2)
        // }
        return d;
    }

    // focus link on click
    function nodeSingleClick(d) {

        if (d3.event.defaultPrevented) return

        if (d.hasOwnProperty('source')) {
            selectedNodeLink = d.target
        } else {
            selectedNodeLink = d
        }

        d3.select(".links").selectAll("path").style("stroke", "#545454");
        d3.select(".links").selectAll("text").style("stroke", "#fff");
        d3.select(".nodes").selectAll("text").style("stroke", "");
        d3.selectAll(".nodeCircle").style("fill", "#fff");
 
        d3.select("#link" + selectedNodeLink.id).select("path").style("stroke", "red");
        d3.select("text#linkLabel" + selectedNodeLink.id).style("stroke", "red");            

        // d3.select(this).select("path").style("stroke", "red");
        d3.select("text#nodePOS" + selectedNodeLink.id).style("stroke", "red");
        d3.select("text#nodeLabel" + selectedNodeLink.id).style("stroke", "red");
        d3.select("circle#nodeCircle" + selectedNodeLink.id).style("fill", "red");

        // $('#postags').show(); 
        // $('#labels').show();  
        return;
    };
 
    // collapse and expand node's children  on click
    function nodeDoubleClick(d) {
        if (d3.event.defaultPrevented) return;
        d = toggleChildren(d);
        update(d);
    };

    // keypress handler for nodes
    function nodeKeypress(d) {
        if (d3.event.defaultPrevented) return;
        if (d3.event.altKey) {
            switch (d3.event.keyCode) {
                case 71: 
                    $('#gototree').show()
                    break;
            }
        } else if (d3.event.shiftKey) {
            switch (d3.event.key) {
                case "_": 
                    freqPOS("---");
                    break;
                case "E": 
                    freqPOS("ERR"); 
                    break;
                case "N": 
                    freqPOS("NOM") 
                    break;
                case "X": 
                    freqPOS("PNX") 
                    break;
                case "O": 
                    freqPOS("PROP") 
                    break;
                case "P": 
                    freqPOS("PRT") 
                    break;
                case "V": 
                    freqPOS("VRB") 
                    break;
                case "A": 
                    freqPOS("VRB-pass")
                    break;
                case "ArrowLeft":
                    if (orientation == "l-to-r") {
                        var neighborNode = fullTree.select("#node" + parseInt(selectedNodeLink.id-2)).data()[0];
                        if (typeof neighborNode !== "undefined") nodeSingleClick(neighborNode);
                    } else {
                        var neighborNode = fullTree.select("#node" + parseInt(selectedNodeLink.id+2)).data()[0]
                        if (typeof neighborNode !== "undefined") nodeSingleClick(neighborNode);
                    }
                    break;
                case "ArrowRight":
                    if (orientation == "r-to-l") {
                        var neighborNode = fullTree.select("#node" + parseInt(selectedNodeLink.id-2)).data()[0];
                        if (typeof neighborNode !== "undefined") nodeSingleClick(neighborNode);
                    } else {
                        var neighborNode = fullTree.select("#node" + parseInt(selectedNodeLink.id+2)).data()[0]
                        if (typeof neighborNode !== "undefined") nodeSingleClick(neighborNode);
                    }
                    break;
            }
        } else if (d3.event.ctrlKey) {
            switch (d3.event.key) {
            case "-": 
                freqLabel("---");
                break;
            case "i":
            case "I":   
                freqLabel("IDF");
                break;
            case "m": 
            case "M": 
                freqLabel("MOD"); 
                break;
            case "o":
            case "O": 
                freqLabel("OBJ") 
                break;
            case "p":
            case "P": 
                freqLabel("PRD") 
                break;
            case "s":
            case "S": 
                freqLabel("SBJ") 
                break;
            case "z": 
            case "Z": 
                freqLabel("TMZ") 
                    break;
            case "t": 
            case "T": 
                freqLabel("TPC") 
                    break;
            }
        } else {
            switch (d3.event.key) {
              case "ArrowDown":
                if (selectedNodeLink.children.length > 1) {
                    var childNode = selectedNodeLink.children[0]
                    if (childNode.id == selectedNodeLink.id + 1) {
                        nodeSingleClick(selectedNodeLink.children[1])
                    } else {
                        nodeSingleClick(selectedNodeLink.children[0])
                    }
                }
                break;
              case "ArrowUp":
                if (selectedNodeLink.pid !== 0) {
                    nodeSingleClick(selectedNodeLink.parent)
                }
                break;
              case "ArrowRight":
                var neighborCheck = 2
                if (selectedNodeLink.pid !== 0) neighborCheck = 1;
                if (orientation == "r-to-l") {
                    if (selectedNodeLink.parent.children.length > neighborCheck) {
                        var neighborArray = selectedNodeLink.parent.children;
                        var neighborID = -1;
                        for (var k=0; k<neighborArray.length; k++) {
                            if (neighborArray[k].id == selectedNodeLink.id) {
                                if (neighborID !== -1) nodeSingleClick(neighborArray[neighborID]);
                                break;
                            } else if (neighborArray[k].id !== selectedNodeLink.pid + 1) neighborID = k;
                        }
                    }
                } else {
                    if (selectedNodeLink.parent.children.length > neighborCheck) {
                        var neighborArray = selectedNodeLink.parent.children;
                        var neighborID = -1;
                        for (var k=neighborArray.length-1; k>-1; k--) {
                            if (neighborArray[k].id == selectedNodeLink.id) {
                                if (neighborID !== -1) nodeSingleClick(neighborArray[neighborID]);
                                break;
                            } else if (neighborArray[k].id !== selectedNodeLink.pid + 1) neighborID = k;
                        }
                    }
                }
                break;
              case "ArrowLeft":
                var neighborCheck = 2
                if (selectedNodeLink.pid !== 0) neighborCheck = 1;
                if (orientation == "l-to-r") {
                    if (selectedNodeLink.parent.children.length > neighborCheck) {
                        var neighborArray = selectedNodeLink.parent.children;
                        var neighborID = -1;
                        for (var k=0; k<neighborArray.length; k++) {
                            if (neighborArray[k].id == selectedNodeLink.id) {
                                if (neighborID !== -1) nodeSingleClick(neighborArray[neighborID]);
                                break;
                            } else if (neighborArray[k].id !== selectedNodeLink.pid + 1) neighborID = k;
                        }
                    }
                } else {
                    if (selectedNodeLink.parent.children.length > neighborCheck) {
                        var neighborArray = selectedNodeLink.parent.children;
                        var neighborID = -1;
                        for (var k=neighborArray.length-1; k>-1; k--) {
                            if (neighborArray[k].id == selectedNodeLink.id) {
                                if (neighborID !== -1) nodeSingleClick(neighborArray[neighborID]);
                                break;
                            } else if (neighborArray[k].id !== selectedNodeLink.pid + 1) neighborID = k;
                        }
                    }
                }
                break;

              case "Enter":
                // Do something for "enter" or "return" key press.
                console.log("Arrow ")
                break;
              case "Home":
                // Do something for "enter" or "return" key press.
                firstTree()
                break;
              case "End":
                // Do something for "enter" or "return" key press.
                lastTree()
                break;
              case "PageUp":
                // Do something for "enter" or "return" key press.
                nextTree();
                break;
              case "PageDown":
                // Do something for "enter" or "return" key press.
                prevTree();
                break;
              case "Escape":
                console.log("Escape")
                $('#labels').hide();
                $('#postags').hide();
                // document.getElementById('textLabel').value = "";
                d3.select("text#nodePOS" + selectedNodeLink.id).style("stroke", "#545454");
                d3.select("text#nodeLabel" + selectedNodeLink.id).style("stroke", "#ffffff");
                // document.getElementsByClassName("fulltree")[0].blur();
                update(root);
                // Do something for "esc" key press.

                break;
              default:
                return; // Quit when this doesn't handle the key event.
            }
        }
        d3.event.preventDefault();
        return;
    };

    // toggle morphology info window
    function morphologyClick(d) {
        selectedMorphology = d;
        d3.selectAll(".morphology").style("stroke", "");
        d3.select("text#morphology" + selectedMorphology.id).style("stroke", "blue");
//        if (orientation == 'l-to-r') document.getElementById('morphologyName').value = d.name;
//        else document.getElementById('morphologyName').value = d.nameArb;
        document.getElementById('morphologyName').value = d.name;
        $('#morphology').show();
    };

    // merge node into right neighbor
    function morphologyRightMerge(d) {
        var mergedName = d.name + fullTree.select("#node" + parseInt(d.id+1)).data()[0].name
//        var mergedNameArb = d.nameArb + fullTree.select("#node" + parseInt(d.id+1)).data()[0].nameArb
        fullTree.select("#node" + parseInt(d.id+1)).data()[0].name = mergedName
        fullTree.select("#node" + parseInt(d.id+2)).data()[0].name = mergedName
//      fullTree.select("#node" + parseInt(d.id+1)).data()[0].nameArb = mergedNameArb
//        fullTree.select("#node" + parseInt(d.id+2)).data()[0].nameArb = mergedNameArb
        deleteNode(d)
    };

    // merge node into left neighbor
    function morphologyLeftMerge(d) {
        var mergedName = fullTree.select("#node" + parseInt(d.id-3)).data()[0].name + d.name
//        var mergedNameArb = fullTree.select("#node" + parseInt(d.id-3)).data()[0].nameArb + d.nameArb
        fullTree.select("#node" + parseInt(d.id-3)).data()[0].name = mergedName
        fullTree.select("#node" + parseInt(d.id-2)).data()[0].name = mergedName
//        fullTree.select("#node" + parseInt(d.id-3)).data()[0].nameArb = mergedNameArb
//        fullTree.select("#node" + parseInt(d.id-2)).data()[0].nameArb = mergedNameArb
        deleteNode(d)
    };

    // Updates the ids of the nodes to correspond to sentence order
    var updateTreeOrderDelete = function(node, delId) {
        if (typeof node.children !== 'undefined') {
            if (node.id > delId) {
                node.id = node.id - 2;
                if (node.pid > delId) {
                    node.pid = node.pid - 2
                }
            }
            for (var k=0; k<node.children.length; k++) {
                node.children[k] = updateTreeOrderDelete(node.children[k], delId)
            }
            return node;
        } else {
            if (node.id > delId) {
                node.id = node.id - 2
                node.pid = node.pid - 2
            }
            return node;
        }
    };

    // Updates the ids of the nodes to correspond to sentence order
    var updateTreeOrderAdd = function(node, addId) {
        if (typeof node.children !== 'undefined') {
            if (node.id >= addId) {
                node.id = node.id + 2;
                if (node.pid >= addId) {
                    node.pid = node.pid + 2
                }
            }
            for (var k=0; k<node.children.length; k++) {
                node.children[k] = updateTreeOrderAdd(node.children[k], addId)
            }
            return node;
        } else {
            if (node.id >= addId) {
                node.id = node.id + 2
                node.pid = node.pid + 2
            }
            return node;
        }
    };

    // Delete a node
    function deleteNode(d) {

        var delNodeId = d.id - 1;
        var nodeToDelete;

        if (d.parent.children.length > 1) {
            nodeToDelete = _.where(d.parent.children, {id: d.id});
            d.parent.children = _.without(d.parent.children, nodeToDelete[0]);
            d.parent.parent.children = d.parent.parent.children.concat(d.parent.children)
        }

        nodeToDelete = _.where(d.parent.parent.children, {id: delNodeId});
        d.parent.parent.children = _.without(d.parent.parent.children, nodeToDelete[0]);
        numberOfNodesArray[currentTreeIndex] = numberOfNodesArray[currentTreeIndex] - 1;

        // fullTree.select("#node" + parseInt(d.id-1)).remove()
        updateTreeOrderDelete(root, delNodeId)
        nodeDeleted = true;
        d3.select("body").select("svg").remove()
        getTree(root)
        update(root)
        $('.morphologyMerge').toggle()
    };

    // Add a new node to left of an existing node
    addNode = function(d, position, name ="جديد") {

        var newNodeId;
        var parent = root;

        if (position == "left") {
            newNodeId = d.id - 1;
            updateTreeOrderAdd(root, newNodeId)
        } else if (position == "right") {
            newNodeId = d.id + 1;
            parent = d.parent.parent;
            updateTreeOrderAdd(root, newNodeId)
        } else if (position == "end") {
            newNodeId = d.id + 1;
        } else if (position == "root") {
            newNodeId = d.id + 1;
            root.children = [];
        } 

        var treeNode = new Object();
        var duplicateNode = new Object();

        duplicateNode.id = newNodeId + 1;
        duplicateNode.name = name;
//        duplicateNode.nameArb = nameArb; 
        duplicateNode.pos = newPOSTag;
        duplicateNode.pid = newNodeId;
        duplicateNode.link = '';
        duplicateNode.duplicate = true
        duplicateNode.collapsed = false
//        duplicateNode.features = "New";

        treeNode.id = newNodeId;
        treeNode.name = name;
//        treeNode.nameArb = nameArb;
        treeNode.pos = newPOSTag;
        treeNode.pid = parent.id;
        treeNode.link = newLinkLabel;
        treeNode.collapsed = false
        treeNode.duplicate = false
//        treeNode.features = "New";
        treeNode.children = [];
        treeNode.children.push(duplicateNode);
        numberOfNodesArray[currentTreeIndex] = numberOfNodesArray[currentTreeIndex] + 1;

        parent.children.push(treeNode)
        nodeDeleted = true;
        d3.select("body").select("svg").remove()
        getTree(root)
        update(root)
        $('.morphologyMerge').toggle()
    };

    // display "drop zone" on mouseover
    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };

    // remove "drop zone" on mouseout
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
        var link = fullTree.select(".templinks").selectAll(".templink").data(data);

        link.enter().append("path")
                .attr("class", "templink")
                .attr("d", d3.svg.line())
                .attr("pointer-events", "none");

        link.attr("d", d3.svg.line());

        link.exit().remove();
    };

    // prepare node for dragging by removing children and paths
    function initiateDrag(d, domNode) {
        $('.morphologyMerge').hide();
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        fullTree.select(".nodes").selectAll(".node").sort(function(a, b) { // select the parent and sort the path's
            if (a.id !== draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            linktexts = fullTree.select(".links").selectAll(".pathGroup")
                .data(links, function (d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = fullTree.select(".nodes").selectAll(".node")
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
        fullTree.select(".links").selectAll(".pathGroup").filter(function(d, i) {
            if (d.target.id === draggingNode.id) {
                return true;
            }
            return false;
        }).remove();
        dragStarted = null;
    };

    // Define the drag listeners for drag/drop behaviour of nodes.
    var dragListener = d3.behavior.drag()
        .on("dragstart", function(d) {
            // root and morphology cannot be dragged
            if (d.id % 2 ==0) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on("drag", function(d) {
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
            node.attr("transform", "translate(" + d.x0 + "," + d.y0 + ")");
            updateTempConnector();
        }).on("dragend", function(d) {
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
        if (orientation == "l-to-r") {
            var nodeTextDirStyle = "ltr"
            var nodeTextAnchorStyle = 'start'
        } else {
            var nodeTextDirStyle = "rtl";
            var nodeTextAnchorStyle = 'end'
        }

        // build sentence
        var sentenceArray = [];
        nodes.forEach(function(d) {
            if (d.id % 2 == 1)  {
                sentenceArray.push([d.id,d.name]);
            }
        });
        sentenceArray.sort(function(a, b){return a[0]-b[0]})

        var counter = 0;

        // Sets the x and y coordinates of the nodes
        nodes.reverse().forEach(function(d) {

            // for nodes with ids less than d.id (that come to the right of d.id) that have been collapsed,
            // count the left subtree nodes recursively and deduct the count
            // to shrink tree size. Note that right subtree nodes don't affect the positioning of the subject
            // node d. Only the left subtree nodes of the collapsed node do.
            deduct = countCollapsedNodes(nodes, d);
            
            for (var i = 0; i < indexNodes.length; i++) {
                console.log()
                if(indexNodes[i] === d) {
                    counter = i;
                    break;
                }
            }

            // console.log("node id = ", d.id, " - node name = ", d.name, " - counter = ", counter);

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
//                     d.x =  orient((d.id-1-deduct) * parseFloat(localStorage['customwidth']) * 250 + wordOffset(nodes, d.id-1, sentenceArray)) ;
                    d.x =  orient(counter * parseFloat(localStorage['customwidth']) * 300 + wordOffset(nodes, d.id-1, sentenceArray)) ;
                }
            }
            else {
                // if leaf node
                if ( isLeafNode(d) ) {
                  d.x = d.parent.x;
                }
                else {
//                     d.x = orient((d.id-deduct) * parseFloat(localStorage['customwidth']) * 250 + wordOffset(nodes, d.id, sentenceArray));
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
//        sentenceArray.push([0,"\t"]);  //>>>>>>>>>>
        nodes.forEach(function(d) {
            if (d.id % 2 == 1)  {
//                if (orientation == "l-to-r") sentenceArray.push([d.id,d.name]);
//                else sentenceArray.push([d.id,d.name]);
                sentenceArray.push([d.id,d.name]);
            }
        });
//        sentenceArray.push([sentenceArray.length+1,"\t"]);  //>>>>>>>>>>
        sentenceArray.sort(function(a, b){return a[0]-b[0]})
        for (var i=0; i<sentenceArray.length; i++) {
          sentenceArray[i] = sentenceArray[i][1]
        }
        sentenceArray = sentenceArray.join(" ")
        document.getElementById("fullSentence").textContent = sentenceArray;
        $('#sents').show()
        $('.toolbar input').show()

        // // Revise node coordinates to prevent shifting of the root node
//         nodes.forEach(function(d) {d.y = d.y+(root.y0-root.y);
//                                 d.x = d.x+(root.x0-root.x);});

        // force full tree redraw to update dynamic changes like doubleclick etc.
        fullTree.selectAll('.node').remove();
        fullTree.selectAll('.node')
            .data(nodes)
            .enter()
            .append("g")

        // Declare the nodes
        var node = fullTree.select(".nodes").selectAll(".node")
            .data(nodes, function(d) { 
                if (d.id == 0) return d.id;
                else return d.id || (d.id = ++i); });

        // Declare the paths
        var link = fullTree.select(".links").selectAll(".pathGroup")
            .data(links, function(d) {
                return d.target.id;
        });

        // create a group to hold path graphics and path labels
        var linkEnter = link.enter().append("g").attr("class", "pathGroup");

        linkEnter.filter(function(d, i)
                  {
                  if (d.target.id % 2 != 0) 
                    return true; else return false;
                  }).attr("id", function(d) { return "link" + d.target.id; })
                    .on("click", nodeSingleClick);
        
        // add path graphics
        linkEnter.append("path")
            .attr("d", function(d) {
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
        linkEnter.append("text")
                // "fill" is for inside the class
                // .attr("fill", "#00000")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
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
          }).select("path")
                .attr("d", lineData)
                .style("stroke-width", "3px")
                .style("stroke", "#545454")
                .style("fill", "none")
                .style("cursor", "pointer");

        // format morphology paths
        linkUpdate.filter(function(d, i)
          {
          if (d.target.id % 2 == 0) 
            return true; else return false;
          }).select("path")
                .attr("d", lineData)
                .style("stroke-width", "3px")
                .style("stroke", "#545454")
                .style("fill", "none")
                .style("stroke-dasharray", ("15, 15"));

        // format text
        linkUpdate.select("text")
            .attr("class", "linktext " + localStorage.currentFont)
            .attr("id", function(d) { return "linkLabel" + d.target.id; })
            .style("cursor", "pointer")
            .style("stroke", "#ffffff")
            .text(function(d) {
                return d.target.link;
            })

        // animate text entrance
        linkUpdate.select("text")
                .attr("transform", function(d) {
                    return "translate(" + ((d.target.x + d.source.x) / 2) + "," + ((d.target.y + d.source.y) / 2) + ")";});

        // remove unnecessary paths
        var linkExit = link.exit().remove();

        // set exiting labels to transparent
        linkExit.select("text")
            .style("fill-opacity", 0);

        // Enter the nodes.
        // Use "d.x +...+ d.y" for horizontal trees
        // Use "d.y +...+ d.x" for vertical trees
       var nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
            .attr("id", function(d) { return "node" + d.id; })
            // source.{x0,y0} is where the nodes originate from
            .attr("transform", function(d) {return "translate(" + animSource.x0 + "," + animSource.y0 + ")"; })

        nodeEnter.filter(function(d, i)
          {
          if (d.id % 2 == 1) 
            return true; else return false;
          }).on("dblclick", nodeDoubleClick)
            .on("click", nodeSingleClick)
            .on("focus", nodeSingleClick)
            .on("keydown", nodeKeypress)

        // add labels to nodes
        nodeEnter.filter(function(d, i)
          {
          if (d.id == 0 || d.id % 2 == 1)
            return true; else return false;
          }).append("text")
            .attr("id", function(d) { return "nodeLabel" + d.id; })
            .attr("class", localStorage.currentFont)
            .style("direction", nodeTextDirStyle)
            .classed("nodelabel", true)
            // these (x,y) coordinates seem to be overidden below
            .attr("y", function(d) {
                return d.children || d._children ? 0 : parseFloat(localStorage['ysep']); })
            .attr("x", function(d) {
                return d.children || d._children ? parseFloat(localStorage['xsep'])+parseFloat(localStorage['nodesize']) : -parseFloat(localStorage['nodesize']); })
            .attr("dy", ".85em")
            .attr("dx", ".2em")
            // node label text alignment (left, right, middle)
            //.attr("text-anchor", "middle")
            .attr("text-anchor", nodeTextAnchorStyle)
            // Doing this only here is problematic because it won't get updated when children are added/removed
            //.attr("text-anchor", function(d) { return d.children || d._children ? "left" : "middle"; })
            .text(function(d) {
//                if (orientation == "l-to-r") return d.name;
//                else return d.nameArb;
                return d.name;
            })
            // .attr('pointer-events', 'mouseover')

        // add POS labels to nodes
        nodeEnter.filter(function(d, i)
          {
          if (d.id % 2 == 1)
            return true; else return false;
          }).append("text")
            .attr("id", function(d) { return "nodePOS" + d.id; })
            .attr("class", localStorage.currentFont)
            .classed("nodepos", true)
            // these (x,y) coordinates seem to be overidden below
            .attr("dx", "1.5em")
            .attr("dy", "2.35em")
            // node label text alignment (left, right, middle)
            //.attr("text-anchor", "middle")
            .attr("text-anchor", "start")
            // Doing this only here is problematic because it won't get updated when children are added/removed
            //.attr("text-anchor", function(d) { return d.children || d._children ? "left" : "middle"; })
            .text(function(d) {
                return d.pos; })
            // .attr('pointer-events', 'mouseover')


        if (nodeCount > 0) {
            // add bottom morphology text
            nodeEnter.filter(function(d, i)
              {
              if (d.id != 0 && d.id % 2 == 0) 
                return true; else return false;
              }).append("text")
                .attr("id", function(d) { return "morphology" + d.id; })
                .attr("class", localStorage['currentFont'])
                .style("direction", nodeTextDirStyle)
                .classed("morphology", true)
                // these (x,y) coordinates seem to be overidden below
                .attr("dx", 0)
                .attr("dy", "1em")
                // node label text alignment (left, right, middle)
                //.attr("text-anchor", "end")
                .attr("text-anchor", "end")
                // Doing this only here is problematic because it won't get updated when children are added/removed
                //.attr("text-anchor", function(d) { return d.children || d._children ? "left" : "middle"; })
                .text(function(d) { 
//                    if (orientation == "l-to-r") return d.name;
//                    else return d.nameArb;
                    return d.name;
                })
                .on("click", morphologyClick); 

            // add Left Merge icon to morphology
            if (orientation == 'r-to-l') {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id > 2 && d.id % 2 == 0) 
                    return true; else return false;
                  }).append("text")
                    .attr("id", function(d) { return "morphologyLeftMerge" + d.id; })
                    .attr("class", localStorage['currentFont'])
                    .classed("morphology", true)
                    .classed("morphologyMerge", true)
                    // these (x,y) coordinates seem to be overidden below
                    .attr("dx", "1.3em")
                    .attr("dy", "2.6em")
                    .attr("text-anchor", "end")
                    .text("\u25B6")
                    .on("click", morphologyLeftMerge)
            } else {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id > 2 && d.id % 2 == 0) 
                    return true; else return false;
                  }).append("text")
                    .attr("id", function(d) { return "morphologyLeftMerge" + d.id; })
                    .attr("class", localStorage['currentFont'])
                    .classed("morphology", true)
                    .classed("morphologyMerge", true)
                    // these (x,y) coordinates seem to be overidden below
                    .attr("dx", "-1.3em")
                    .attr("dy", "2.6em")
                    .attr("text-anchor", "start")
                    .text("\u25C0")
                    .on("click",morphologyLeftMerge)
            }

            // add Right Merge icon to morphology
            if (orientation == 'r-to-l') {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id != 0 && d.id != nodeCount && d.id % 2 == 0) 
                    return true; else return false;
                  }).append("text")
                    .attr("id", function(d) { return "morphologyRightMerge" + d.id; })
                    .attr("class", localStorage['currentFont'])
                    .classed("morphology", true)
                    .classed("morphologyMerge", true)
                    // these (x,y) coordinates seem to be overidden below
                    .attr("dx", "-1.3em")
                    .attr("dy", "2.6em")
                    .attr("text-anchor", "start")
                    .text("\u25C0")
                    .on("click",morphologyRightMerge)
            } else {
                nodeEnter.filter(function(d, i)
                  {
                  if (d.id != 0 && d.id != nodeCount && d.id % 2 == 0) 
                    return true; else return false;
                  }).append("text")
                    .attr("id", function(d) { return "morphologyRightMerge" + d.id; })
                    .attr("class", localStorage['currentFont'])
                    .classed("morphology", true)
                    .classed("morphologyMerge", true)
                    // these (x,y) coordinates seem to be overidden below
                    .attr("dx", "1.3em")
                    .attr("dy", "2.6em")
                    .attr("text-anchor", "end")
                    .text("\u25B6")
                    .on("click", morphologyRightMerge)
            }

            // add Delete icon to morphology
            nodeEnter.filter(function(d, i)
              {
              if (d.id != 0 && d.id % 2 == 0) 
                return true; else return false;
              }).append("text")
                .attr("id", function(d) { return "morphologyDelete" + d.id; })
                .attr("class", localStorage['currentFont'])
                .classed("morphology", true)
                .classed("morphologyMerge", true)
                // these (x,y) coordinates seem to be overidden below
                .attr("dx", "0")
                .attr("dy", "2.6em")
                .attr("text-anchor", "middle")
                .style("fill",'red')
                .text("\u2716")
                .on("click",deleteNode)

            // add new node icon to morphology
            nodeEnter.filter(function(d, i)
              {
              if (d.id != 0 && d.id % 2 == 0) 
                return true; else return false;
              }).append("text")
                .attr("id", function(d) { return "morphologyAdd" + d.id; })
                .attr("class", localStorage['currentFont'])
                .classed("morphology", true)
                .classed("morphologyMerge", true)
                // these (x,y) coordinates seem to be overidden below
                .attr("dx", function(d) { 
                    if (orientation == 'r-to-l') return "1.7em"
                    else return "-1.7em"})
                .attr("dy", "2.6em")
                .attr("text-anchor", "middle")
                .style("fill","green")
                .text("\uFF0B")
                .on("click", function(d) {
                    addNode(d, "left")
                });

            // add new node icon to morphology
            nodeEnter.filter(function(d, i)
              {
              if (d.id == nodeCount) 
                return true; else return false;
              }).append("text")
                .attr("id", function(d) { return "morphologyAdd" + d.id; })
                .attr("class", localStorage['currentFont'])
                .classed("morphology", true)
                .classed("morphologyMerge", true)
                // these (x,y) coordinates seem to be overidden below
                .attr("dx", function(d) { 
                    if (orientation == 'r-to-l') return "-1.7em"
                    else return "1.7em"})
                .attr("dy", "2.6em")
                .attr("text-anchor", "middle")
                .style("fill","green")
                .text("\uFF0B")
                .on("click", function(d) {
                    addNode(d, "end")
                });
            console.log(localStorage['currentFont']);
        } else {
            // add new node icon to morphology
            nodeEnter.filter(function(d, i)
              {
              if (d.id == nodeCount) 
                return true; else return false;
              }).append("text")
                .attr("id", function(d) { return "morphologyAdd" + d.id; })
                .attr("class", localStorage['currentFont'])
                .classed("morphology", true)
                .classed("morphologyMerge", true)
                // these (x,y) coordinates seem to be overidden below
                .attr("dx", "1.7em")
                .attr("dy", "2.6em")
                .attr("text-anchor", "middle")
                .style("fill","green")
                .text("\uFF0B")
                .on("click", function(d) {
                    addNode(d, "root")
                });
        }


        // add circles to nodes
        nodeEnter.filter(function(d, i)
          {
          if (d.id == 0 || d.id % 2 == 1) {
            return true;
            } else return false;
          }).append("circle")
            .attr("class", "nodeCircle")
            .attr("id", function(d) { return "nodeCircle" + d.id; })
            .attr("r", 0)
            .style("fill", function(d) {
                return d._children ? "#000" : "#fff";
            });

        // add "drop zone" circle to node; set as transparent
        nodeEnter.filter(function(d, i)
          {
          if (d.id == 0 || d.id % 2 == 1) 
            return true; else return false;
          }).append("circle")
            .attr("class", "ghostCircle")
            .attr("r", 30)
            .attr("opacity", 0.2)
            .style("fill", "red")
            .style("stroke-width", 0)
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // node entrance animation
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        // fade in labels
        nodeUpdate.selectAll("text")
            // .attr("class", localStorage['currentFont'])
            .style("fill-opacity", 1);

        // node circles "grow" in (animation)
        nodeUpdate.select("circle.nodeCircle")
            .attr("r", parseFloat(localStorage['nodesize']))
            .style("fill", function(d) {
            return d._children ? "#000" : "#fff";
            })
            .style("stroke", "black")

        // exiting nodes animation
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + animSource.x + "," + animSource.y + ")";
            }).remove();

        // node circles "shrink" out (animation)
        nodeExit.select("circle")
            .attr("r", 0);

        // labels fade out
        nodeExit.selectAll("text")
            .style("fill-opacity", 0);

        // store node positions
        nodes.forEach(function(d) {
           d.x0 = d.x,
           d.y0 = d.y;
        });

        // // Morphology Nodes
        // morphNodes = fullTree.select(".nodes").selectAll(".node")
        //     .filter(function(d, i)
        //   {
        //   if (d.id % 2 == 0) 
        //     return true; else return false;
        //   })

    };

    // lay out the initial tree
    update(root);
};
