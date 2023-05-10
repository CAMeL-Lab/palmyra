var alreadyReadConfigFiles = [];
var defaultConfigFiles = [];

// helper function to populate the config file selector with file names, given an array of file objects
function populateConfigFileSelectorHelper(files) {
  let option;
  let selectList = document.getElementById("config_file_selector");
  let lastOption = selectList.lastElementChild;
  // pop last child element of selectList
  selectList.removeChild(lastOption);
  for (let file of files) {
    option = document.createElement("option");
    option.text = file.name;
    selectList.appendChild(option);
  }
  selectList.appendChild(lastOption);
  // set the default value to the first option
  selectList.selectedIndex = 0;
}

// retrieve the config files from github using the github api
function retrieveConfigFiles() {
  return new Promise((resolve, reject) => {
    let fileObjects = [];
    let rsp;
    axios
      .get(
        "https://api.github.com/repos/CAMeL-Lab/palmyra/contents/palmyraSampleFiles/config"
      )
      .then(async (rsp) => {
        let files = rsp.data;
        for (let file of files) {
          rsp = await axios.get(file.download_url);
          let fileObject = new File([rsp], file.name, { type: "text/plain" });
          fileObjects.push(fileObject);
        }
        resolve(fileObjects);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// populate the selector with the default config files retrieved from github
function populateConfigFileSelector() {
  let selectList = document.getElementById("config_file_selector");
  selectList.onchange = () => {
    if (selectList.selectedIndex == selectList.options.length - 1)
      document.getElementById("configFile").style.display = "block";
    else document.getElementById("configFile").style.display = "none";
  };
  retrieveConfigFiles()
    .then((files) => {
      defaultConfigFiles = files;
      populateConfigFileSelectorHelper(files);
    })
    .catch((err) => {
      console.log(err);
    });
}

var parseConfig = function (content) {
  var configs = JSON.parse(content);
  orientation = configs.orientation;
  listingKey = configs.display_text;
  if (configs.lemma === "true") editLemma = true;
  else editLemma = false;

  var posContainer = document.getElementById("postags");
  var divs = {};

  for (var i = 0; i < configs.pos.values.length; i++) {
    if (configs.pos.values[i].key in posTags) {
      posTags[configs.pos.values[i].key].push(configs.pos.values[i].label);
      var btn = document.createElement("BUTTON");
      var text = document.createTextNode(configs.pos.values[i].label);
      btn.appendChild(text);
      btn.tabindex = -1;
      btn.value = configs.pos.values[i].label;
      btn.onclick = editPOSByButton;

      group = configs.pos.values[i].group;
      if (group in divs) {
        divs[group].appendChild(btn);
      } else {
        divs[group] = document.createElement("div");
        divs[group].appendChild(btn);
      }
    } else {
      posTags[configs.pos.values[i].key] = [];
      posTags[configs.pos.values[i].key].push(configs.pos.values[i].label);
      var btn = document.createElement("BUTTON");
      var text = document.createTextNode(configs.pos.values[i].label);
      btn.appendChild(text);
      btn.tabindex = -1;
      btn.value = configs.pos.values[i].label;
      btn.onclick = editPOSByButton;

      group = configs.pos.values[i].group;
      if (group in divs) {
        divs[group].appendChild(btn);
      } else {
        divs[group] = document.createElement("div");
        divs[group].appendChild(btn);
      }
    }
  }

  for (var div in divs) {
    var hzRule = document.createElement("hr");
    posContainer.appendChild(hzRule);
    posContainer.appendChild(divs[div]);
  }

  var labelContainer = document.getElementById("labels");
  var divs = {};

  for (var i = 0; i < configs.relation.values.length; i++) {
    if (configs.relation.values[i].key in relLabels) {
      relLabels[configs.relation.values[i].key].push(
        configs.relation.values[i].label
      );
      var btn = document.createElement("BUTTON");
      var text = document.createTextNode(configs.relation.values[i].label);
      btn.appendChild(text);
      btn.setAttribute("id", configs.relation.values[i].label);
      btn.value = configs.relation.values[i].label;
      btn.onclick = editLabelByButton;

      group = configs.relation.values[i].group;
      if (group in divs) {
        divs[group].appendChild(btn);
      } else {
        divs[group] = document.createElement("div");
        divs[group].appendChild(btn);
      }
    } else {
      relLabels[configs.relation.values[i].key] = [];
      relLabels[configs.relation.values[i].key].push(
        configs.relation.values[i].label
      );
      var btn = document.createElement("BUTTON");
      var text = document.createTextNode(configs.relation.values[i].label);
      btn.appendChild(text);
      btn.setAttribute("id", configs.relation.values[i].label);
      btn.value = configs.relation.values[i].label;
      btn.onclick = editLabelByButton;

      group = configs.relation.values[i].group;
      if (group in divs) {
        divs[group].appendChild(btn);
      } else {
        divs[group] = document.createElement("div");
        divs[group].appendChild(btn);
      }
    }
  }

  for (var div in divs) {
    var hzRule = document.createElement("hr");
    labelContainer.appendChild(hzRule);
    labelContainer.appendChild(divs[div]);
  }

  if (configs.hasOwnProperty("features") == false) {
    var morphoLabel = document.getElementById("labelspMorphoFeats");
    morphoLabel.style.visibility = "hidden";
  } else {
    var morphoLabel = document.getElementById("labelspMorphoFeats");
    morphoLabel.style.visibility = "visible";

    var item = document.getElementById("morphoFeats");
    var lexicalFeats = document.getElementById("lexicalFeats");

    for (var i = 0; i < configs.features.length; i++) {
      var div = document.createElement("div");
      div.setAttribute("id", configs.features[i].name);
      div.setAttribute("class", "morphoFeat");

      var fieldName = document.createElement("div");
      fieldName.style.width = "100px";
      fieldName.style.right = "0px";
      fieldName.style.display = "inline-block";

      var displayName = document.createTextNode(configs.features[i].display);
      fieldName.appendChild(displayName);

      var menu = document.createElement("select");
      menu.setAttribute("id", configs.features[i].name + "Array");
      menu.setAttribute("class", "inputArray");
      menu.style.width = "100px";
      menu.style.left = "0px";
      menu.style.display = "inline-block";

      if (configs.features[i].type === "list") {
        featureValues[configs.features[i].name] = configs.features[i].values;

        for (var j = 0; j < configs.features[i].values.length; j++) {
          var opt = document.createElement("option");
          var name = document.createTextNode(
            configs.features[i].values[j].display
          );
          opt.setAttribute("value", configs.features[i].values[j].display);
          opt.setAttribute("id", configs.features[i].values[j].value);
          opt.appendChild(name);
          menu.appendChild(opt);
        }

        div.appendChild(fieldName);
        div.appendChild(menu);

        item.appendChild(div);
      } else {
        lexicalFeatsList.push(configs.features[i].name);

        var titleParagraph = document.createElement("P");
        titleParagraph.setAttribute("class", "labelsp");
        titleParagraph.innerHTML = configs.features[i].display + ":";

        var field = document.createElement("INPUT");
        field.setAttribute("type", "text");
        field.setAttribute("id", configs.features[i].name);

        var lexDiv = document.createElement("div");
        lexDiv.appendChild(field);

        lexicalFeats.append(titleParagraph);
        lexicalFeats.appendChild(lexDiv);
      }
    }

    for (var i = 0; i < configs.defaultFeatures.length; i++) {
      var posTag = configs.defaultFeatures[i].pos;

      var defaultFeatValuePairs = {};
      for (var j = 0; j < configs.defaultFeatures[i].features.length; j++) {
        var featName = configs.defaultFeatures[i].features[j].name;
        var featValue = configs.defaultFeatures[i].features[j].value;
        defaultFeatValuePairs[featName] = featValue;
      }

      defaultFeatValues[posTag] = defaultFeatValuePairs;
    }
  }

  if (editLemma === true) {
    var lemmaField = document.getElementById("lemmaField");

    var titleParagraph = document.createElement("P");
    titleParagraph.setAttribute("class", "labelsp");
    titleParagraph.innerHTML = "Lemma:";

    var field = document.createElement("INPUT");
    field.setAttribute("type", "text");
    field.setAttribute("id", "lemma");

    var lexDiv = document.createElement("div");
    lexDiv.appendChild(field);

    lemmaField.append(titleParagraph);
    lemmaField.appendChild(lexDiv);
  }

  newPOSTag = configs.newNodeDefaults.pos;
  newLinkLabel = configs.newNodeDefaults.relation;
  newNodeName = configs.newNodeDefaults.name;

  return;
};

function loadFile(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function () {
      parseConfig(reader.result);
      configRead = true;
      resolve();
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsText(file);
  });
}

//Read the config file
var readConfigFile = async function () {
  var selectList = document.getElementById("config_file_selector");
  var file;
  // default config file
  if (
    selectList.selectedIndex > 0 &&
    selectList.selectedIndex < selectList.options.length - 1
  ) {
    file = defaultConfigFiles[selectList.selectedIndex - 1];
  } else if (selectList.selectedIndex == selectList.options.length - 1) {
    // user uploaded config file
    var x = document.getElementById("configFile");
    var input = "";
    if ("files" in x) {
      if (x.files.length == 0) {
        var morphoLabel = document.getElementById("labelspMorphoFeats");
        morphoLabel.style.visibility = "hidden";
        txt = "Select config file.";
        return;
      } else {
        file = x.files[0];
      }
    }
  } else return; // no config file selected

  if (!alreadyReadConfigFiles.includes(file)) {
    alreadyReadConfigFiles.push(file);
    await loadFile(file);
  }
  return;
};

window.populateConfigFileSelector = populateConfigFileSelector;
window.readConfigFile = readConfigFile;
