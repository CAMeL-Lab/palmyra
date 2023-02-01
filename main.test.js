const puppeteer = require('puppeteer');
const {Point} = require('puppeteer');

describe('Upload tree content', () => {
  let browser;
  let page;
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();  
    await page.goto("https://camel-lab.github.io/palmyra/viewtree.html"); // do this to be able to call functions in main.js, might need to direct the browser at this url
  });
  afterEach(() => {
    browser.close();
  });

  // tests to be used
  // Run a specfic test: npm test -- -t  'test_name_matcher' --verbose

  test('Page title should be Palmyra v2.4', async () => {
    await expect(page.title()).resolves.toMatch('Palmyra v2.4');
  });

  test('Body should contain class viewtree', async () => {
    await page.$eval('body.viewtree', el => el.text);
  });
  
  test('Click on treebtn without adding a conll file', async () => {
    const expectedMessage = "Please select a ConllU/X file, or use use the Upload button in the sentence uploader section.";
    // attach mocked event handler
    const dialogHandler = jest.fn(dialog => dialog.dismiss());
    page.on('dialog', dialogHandler);
    // simulate button click
    await page.click('#treebtn');
    // get the dialog message and assert
    const [firstCall] = dialogHandler.mock.calls;
    const [dialog] = firstCall;
    expect(dialog.message()).toEqual(expectedMessage);
  });

  test('Click on treebtn without adding a conll file and with a config file', async () => {
    const expectedMessage = "Please select a ConllU/X file, or use use the Upload button in the sentence uploader section.";

    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');
    
    let expectedLabelsText = "Relation Labels";
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim();

    let expectedPosTagsText = "POS Tags";
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim();

    // attach mocked event handler
    const dialogHandler = jest.fn(dialog => dialog.dismiss());
    page.on('dialog', dialogHandler);

    // simulate button click
    await page.click('#treebtn');

    // get the dialog message and assert
    const [firstCall] = dialogHandler.mock.calls;
    const [dialog] = firstCall;
    expect(dialog.message()).toEqual(expectedMessage);

    // assert text
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
  });

  test('Click on treebtn with adding a conll file', async () => {
    // simulate file uploads
    let ConllFileUploader = await page.$('#inputFile');
    await ConllFileUploader.uploadFile('palmyraSampleFiles/dataFiles/UD-English-Example.conllu');

    // attach mocked event handler
    const dialogHandler = jest.fn(dialog => dialog.dismiss());
    page.on('dialog', dialogHandler);

    // simulate button click
    await page.click('#treebtn');

    let expectedSent = "From the AP comes this story :"
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    let expectedTreeCount = 3;
    let testingTreeCount = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[1]);

    // assert that no alert is generated
    expect(dialogHandler.mock.calls.length).toEqual(0);
    // assert text
    expect(testingSent).toEqual(expectedSent);
    expect(testingTreeCount).toEqual(expectedTreeCount);
  })

  test('Click on treebtn with adding a conll file and a config file', async () => {
    // simulate file uploads
    let ConllFileUploader = await page.$('#inputFile');
    await ConllFileUploader.uploadFile('palmyraSampleFiles/dataFiles/UD-English-Example.conllu');
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');

    // attach mocked event handler
    const dialogHandler = jest.fn(dialog => dialog.dismiss());
    page.on('dialog', dialogHandler);

    // simulate button click
    await page.click('#treebtn');

    let expectedSent = "From the AP comes this story :"
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    let expectedTreeCount = 3;
    let testingTreeCount = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[1]);

    let expectedLabelsText = "apposdislocatedexpliobjnsubjnmodnummodobjoblvocativeadvclaclcsubjccompxcompadvmodamoddiscourseauxcopclfcasedetmarkconjcccompoundfixedflatlistparataxisgoeswithorphanreparandumdeppunctroot";
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim().split(' ');
    testingLabelsText = testingLabelsText[testingLabelsText.length-1];

    let expectedPosTagsText = "ADJADVINTJNOUNPROPNVERBADPAUXCCONJDETNUMPARTPRONSCONJPUNCTSYMX"
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim().split(' ');
    testingPosTagsText = testingPosTagsText[testingPosTagsText.length-1];

    // assert that no alert is generated
    expect(dialogHandler.mock.calls.length).toEqual(0);
    // assert text
    expect(testingSent).toEqual(expectedSent);
    expect(testingTreeCount).toEqual(expectedTreeCount);
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
  })

  test('Click on treebtn2 with sentence data entered and config file uploaded', async () => {
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');
    // attach mocked event handler
    const dialogHandler = jest.fn(dialog => dialog.dismiss());
    page.on('dialog', dialogHandler);
    await page.$eval('#treedata2', el => el.value = "this is a sentence\nthis is another sentence");

    // simulate the click
    await page.$eval('#treebtn2', el => el.click());

    let expectedSent = "this is a sentence";
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    let expectedTreeCount = 2;
    let testingTreeCount = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[1]);

    let expectedLabelsText = "apposdislocatedexpliobjnsubjnmodnummodobjoblvocativeadvclaclcsubjccompxcompadvmodamoddiscourseauxcopclfcasedetmarkconjcccompoundfixedflatlistparataxisgoeswithorphanreparandumdeppunctroot"
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim().split(' ');
    testingLabelsText = testingLabelsText[testingLabelsText.length-1];

    let expectedPosTagsText = "ADJADVINTJNOUNPROPNVERBADPAUXCCONJDETNUMPARTPRONSCONJPUNCTSYMX"
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim().split(' ');
    testingPosTagsText = testingPosTagsText[testingPosTagsText.length-1];

    // assert that no alert is generated
    expect(dialogHandler.mock.calls.length).toEqual(0);
    // assert text
    expect(testingSent).toEqual(expectedSent);
    expect(testingTreeCount).toEqual(expectedTreeCount);
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
  })  

  test('Click on treebtn2 with sentence data entered and config file is not uploaded', async () => {
    await page.$eval('#treedata2', el => el.value = "this is a sentence\nthis is another sentence");

    // simulate the click
    await page.$eval('#treebtn2', el => el.click());

    let expectedSent = "this is a sentence";
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    let expectedTreeCount = 2;
    let testingTreeCount = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[1]);

    let expectedLabelsText = "Relation Labels";
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim();

    let expectedPosTagsText = "POS Tags";
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim();

    // assert text
    expect(testingSent).toEqual(expectedSent);   
    expect(testingTreeCount).toEqual(expectedTreeCount); 
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
  })

  test('Click on treebtn2 without entering sentence data and config file is uploaded', async () => {
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');

    // simulate the click
    await page.$eval('#treebtn2', el => el.click());

    let expectedSent = "";
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    let expectedLabelsText = "apposdislocatedexpliobjnsubjnmodnummodobjoblvocativeadvclaclcsubjccompxcompadvmodamoddiscourseauxcopclfcasedetmarkconjcccompoundfixedflatlistparataxisgoeswithorphanreparandumdeppunctroot"
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim().split(' ');
    testingLabelsText = testingLabelsText[testingLabelsText.length-1];

    let expectedPosTagsText = "ADJADVINTJNOUNPROPNVERBADPAUXCCONJDETNUMPARTPRONSCONJPUNCTSYMX"
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim().split(' ');
    testingPosTagsText = testingPosTagsText[testingPosTagsText.length-1];

    // assert text
    expect(testingSent).toEqual(expectedSent);
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
  })

  test('Click on treebtn2 without entering sentence data and config file is not uploaded', async () => {
    // simulate the click
    await page.$eval('#treebtn2', el => el.click());

    let expectedSent = "";
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    let expectedLabelsText = "Relation Labels";
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim();

    let expectedPosTagsText = "POS Tags";
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim();

    // assert text
    expect(testingSent).toEqual(expectedSent);
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
  })
});

describe('Edit trees', () => {
  let browser;
  let page;
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();  
    await page.goto("https://camel-lab.github.io/palmyra/viewtree.html"); // do this to be able to call functions in main.js, might need to direct the browser at this url
  });
  afterEach(() => {
    browser.close();
  });

  test('Add a new empty tree', async () => {
    // simulate file uploads
    let ConllFileUploader = await page.$('#inputFile');
    await ConllFileUploader.uploadFile('palmyraSampleFiles/dataFiles/UD-English-Example.conllu');
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');
    // simulate upload button click
    await page.click('#treebtn');

    await page.$eval('[value="+ Tree"]', el => el.click());

    let expectedTreeCount = 4;
    let testingTreeCount = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[1]);

    let NodeElementArray = await page.$$('.node');

    expect(testingTreeCount).toEqual(expectedTreeCount);
    expect(NodeElementArray.length).toEqual(1);
  });

  test('Delete current tree when there is more than 1 tree', async () => {
    // simulate file uploads
    let ConllFileUploader = await page.$('#inputFile');
    await ConllFileUploader.uploadFile('palmyraSampleFiles/dataFiles/UD-English-Example.conllu');
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');
    // simulate upload button click
    await page.click('#treebtn');

    // simulate deleting current tree
    page.on("dialog", (dialog) => {
      dialog.accept();
    });
    await page.$eval('[value="- Tree"]', el => el.click());

    let expectedTreeCount = 2;
    let testingTreeCount = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[1]);

    let expectedSent = "President Bush on Tuesday nominated two individuals to replace retiring jurists on federal courts in the Washington area .";
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    expect(testingTreeCount).toEqual(expectedTreeCount);
    expect(testingSent).toEqual(expectedSent);
  });

  test('Delete the last tree', async () => {
    await page.$eval('#treedata2', el => el.value = "this is a sentence");
    // simulate the click
    await page.$eval('#treebtn2', el => el.click());

    let testingMessage;
    page.on("dialog", (dialog) => {
      testingMessage = dialog.message();
      dialog.accept();
    });

    // simulate deleting current tree
    await page.$eval('[value="- Tree"]', el => el.click());

    let expectedMessage = "Sorry! You cannot delete the last tree. Add a new tree first, then delete this tree.";

    let expectedTreeCount = 1;
    let testingTreeCount = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[1]);

    let expectedSent = "this is a sentence";
    let testingSent = (await page.$eval('#sents', el => el.innerText)).trim();

    expect(testingMessage).toEqual(expectedMessage);
    expect(testingTreeCount).toEqual(expectedTreeCount);
    expect(testingSent).toEqual(expectedSent);
  });

  test('Click Tags button first time if no config file uploaded', async () => {
    await page.$eval('#treedata2', el => el.value = "this is a sentence");
    // simulate the click
    await page.$eval('#treebtn2', el => el.click());
    await page.$eval('[value="tags"]', el => el.click());

    let expectedLabelsText = "Relation Labels";
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim();

    let expectedPosTagsText = "POS Tags";
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim();

    let expectedDisplayValue = 'block';
    let testingLabelsSectionDisplayValue = await page.$eval('#labels', el =>  getComputedStyle(el).getPropertyValue('display'));
    let testingPosTagsSectionDisplayValue = await page.$eval('#postags', el =>  getComputedStyle(el).getPropertyValue('display'));

    // assert text
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
    expect(testingLabelsSectionDisplayValue).toEqual(expectedDisplayValue);
    expect(testingPosTagsSectionDisplayValue).toEqual(expectedDisplayValue);
  });

  test('Click Tags button first time if config file uploaded', async () => {
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');
    await page.$eval('#treedata2', el => el.value = "this is a sentence");
    // simulate the click
    await page.$eval('#treebtn2', el => el.click());
    await page.$eval('[value="tags"]', el => el.click());

    let expectedRelationLabelButtonCount = 37;
    let testingRelationLabelButtonCount = (await page.$$('#labels > div > button')).length;

    let expectedLabelsText = "Relation Labels\napposdislocatedexpliobjnsubjnmodnummodobjoblvocative\nadvclaclcsubjccompxcomp\nadvmodamoddiscourse\nauxcopclfcasedetmark\nconjcc\ncompoundfixedflat\nlistparataxis\ngoeswithorphanreparandum\ndeppunctroot"
    let testingLabelsText = (await page.$eval("#labels", el => el.innerText)).trim();

    let expectedPosTagButtonCount = 17;
    let testingPosTagButtonCount = (await page.$$('#postags > div > button')).length;

    let expectedPosTagsText = "POS Tags\nADJADVINTJNOUNPROPNVERB\nADPAUXCCONJDETNUMPARTPRONSCONJ\nPUNCTSYMX"
    let testingPosTagsText = (await page.$eval("#postags", el => el.innerText)).trim();

    let expectedDisplayValue = 'block';
    let testingLabelsSectionDisplayValue = await page.$eval('#labels', el =>  getComputedStyle(el).getPropertyValue('display'));
    let testingPosTagsSectionDisplayValue = await page.$eval('#postags', el =>  getComputedStyle(el).getPropertyValue('display'));

     // assert text
     expect(testingRelationLabelButtonCount).toEqual(expectedRelationLabelButtonCount);
     expect(testingLabelsText).toEqual(expectedLabelsText);
     expect(testingPosTagsText).toEqual(expectedPosTagsText);
     expect(testingPosTagButtonCount).toEqual(expectedPosTagButtonCount);
     expect(testingLabelsSectionDisplayValue).toEqual(expectedDisplayValue);
     expect(testingPosTagsSectionDisplayValue).toEqual(expectedDisplayValue);
  });

  test('Click Tags button second time if config file uploaded', async () => {
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');
    await page.$eval('#treedata2', el => el.value = "this is a sentence");
    // simulate the click
    await page.$eval('#treebtn2', el => el.click());
    await page.$eval('[value="tags"]', el => el.click());
    await page.$eval('[value="tags"]', el => el.click());

    let expectedDisplayValue = 'none';
    let testingLabelsSectionDisplayValue = await page.$eval('#labels', el =>  getComputedStyle(el).getPropertyValue('display'));
    let testingPosTagsSectionDisplayValue = await page.$eval('#postags', el =>  getComputedStyle(el).getPropertyValue('display'));

    expect(testingLabelsSectionDisplayValue).toEqual(expectedDisplayValue);
    expect(testingPosTagsSectionDisplayValue).toEqual(expectedDisplayValue);
  });

  test('Click Listing button if conll file has no #text line', async () => {
    // simulate file uploads
    let ConllFileUploader = await page.$('#inputFile');
    await ConllFileUploader.uploadFile('palmyraSampleFiles/dataFiles/UD-English-Example.conllu');
    // simulate upload button click
    await page.click('#treebtn');
    await page.click('[value="listing"]');

    let expectedTextInListingDiv = "From the AP comes this story :\nPresident Bush on Tuesday nominated two individuals to replace retiring jurists on federal courts in the Washington area .\nBush nominated Jennifer M. Anderson for a 15 - year term as associate judge of the Superior Court of the District of Columbia , replacing Steffen W. Graae .";
    let testingTextInListingDiv = (await page.$eval('#listing', el => el.innerText)).trim();

    expect(testingTextInListingDiv).toEqual(expectedTextInListingDiv);
  });

  test('Click Listing button if conll file has #text line', async () => {
    let ConllFileUploader = await page.$('#inputFile');
    await ConllFileUploader.uploadFile('palmyraSampleFiles/dataFiles/UD-Arabic-Example.conllu');
    // simulate upload button click
    await page.click('#treebtn');
    await page.click('[value="listing"]');

    let expectedFirstSentInListingDiv = "لونغ بيتش (الولايات المتحدة) 15-7 (إف ب) - كل شيء تغير في حياة المتشرد ستيفن كنت عندما عثرت عليه شقيقته بعد عناء طويل لتبلغه بأنه ورث 300 ألف دولار وبأنه بات قادرا على وضع حد لعشرين سنة من حياة التشرد في شوارع مدينة لونغ بيتش في ولاية كاليفورنيا.";
    let testingFirstSentInListingDiv = (await page.$eval('#listing', el => el.innerText)).trim();

    // click on the first sentence
    await page.$eval('[id="0"]', el => el.click());
    let expectedCurrentTreeNumber = 1;
    let testingCurrentTreeNumber = parseInt((await page.$eval('#currentTreeNumber', el => el.innerText)).trim().split('/')[0]);

    expect(testingFirstSentInListingDiv).toEqual(expectedFirstSentInListingDiv);
    expect(testingCurrentTreeNumber).toEqual(expectedCurrentTreeNumber);
  })
})

// for tests in the suite to pass, we need to stay at the upload window (if open with VSCode Live Server)
describe('Redo-Undo feature', () => {
  let browser;
  let page;
  let filterFullTreeSVGString = function (FullTreeSVGString) {
    let AttributeFilterList = ["transform", "style", "opacity", "d", "dy", "dx", "x", "y", "r", "id", "class"];
    for (const attribute of AttributeFilterList) {
      let regEx = new RegExp(" "+attribute+"=\"(.*?)\"", "g");
      FullTreeSVGString = FullTreeSVGString.replace(regEx, '');
    };
    // remove redundant <g></g> tags
    FullTreeSVGString = FullTreeSVGString.replace(/<g><\/g>/g, '')
    return FullTreeSVGString;
  }
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();  
    await page.goto(/*"https://camel-lab.github.io/palmyra/viewtree.html"*/"http://127.0.0.1:5500/viewtree.html"); // do this to be able to call functions in main.js, might need to direct the browser at this url
    let ConfigFileUploader = await page.$('#configFile');
    await ConfigFileUploader.uploadFile('palmyraSampleFiles/config/ud.config');
    await page.$eval('#treedata2', el => el.value = "this is a sentence");
    // simulate the click
    await page.$eval('#treebtn2', el => el.click());
  });
  afterEach(() => {
    browser.close();
  });

  test('Undo morphology add', async() => {
    let initialFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    await page.click('#morphologyAddLeft8'); 
    // note that the styling is changed when we undo (dimension, opacity, stroke, ...)
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(initialFullTreeSVGString)); 
  });

  test('Undo morphology delete', async() => {
    let initialFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    await page.click('#morphologyDelete8'); 
    // note that the styling is changed when we undo (dimension, opacity, stroke, ...)
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(initialFullTreeSVGString)); 
  });

  test('Undo POS Tags edit', async() => {
    let initialFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    await page.click('[value="tags"]');
    await page.click('text[id="linkLabel1"]');
    await page.click('button[value="PROPN"]'); 
    // note that the styling is changed when we undo (dimension, opacity, stroke, ...)
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(initialFullTreeSVGString)); 
  });

  test('Undo Labels edit', async() => {
    let initialFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    await page.click('[value="tags"]');
    await page.click('text[id="linkLabel1"]');
    await page.click('button[id="root"][value="root"]'); 
    // note that the styling is changed when we undo (dimension, opacity, stroke, ...)
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(initialFullTreeSVGString)); 
  });

  test('Undo save morphology', async() => {
    let initialFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // simulate user action
    await page.click('text[id="morphology8"]');
    await page.click('text[id="linkLabel1"]');
    await page.$eval('input[id="morphologyName"]', el => el.value = "test");
    await ((await page.$$('section[id="morphology"] > p > button'))[0].click());
    // note that the styling is changed when we undo (dimension, opacity, stroke, ...)
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(initialFullTreeSVGString)); 
  });

  test('Undo node drag', async() => {
    let initialFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // simulate user action
    await page.mouse.move(450,302.5);
    await page.mouse.down();
    await page.mouse.move(295,302.5);
    await page.mouse.up();
    // note that the styling is changed when we undo (dimension, opacity, stroke, ...)
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(initialFullTreeSVGString));
  });

  test('Redo morphology add', async() => {
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    await page.click('#morphologyAddLeft8'); 

    let expectedFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // undo
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');
    await page.keyboard.up('Meta');
    await page.keyboard.up('z');

    // redo
    await page.keyboard.down('Meta');
    await page.keyboard.down('Shift');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(expectedFullTreeSVGString)); 
  });

  test('Redo morphology delete', async() => {
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    await page.click('#morphologyDelete8'); 

    let expectedFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // undo
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');
    await page.keyboard.up('Meta');
    await page.keyboard.up('z');

    // redo
    await page.keyboard.down('Meta');
    await page.keyboard.down('Shift');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(expectedFullTreeSVGString)); 
  });

  test('Redo POS Tags edit', async() => {
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    await page.click('[value="tags"]');
    await page.click('text[id="linkLabel1"]');
    await page.click('button[value="PROPN"]'); 

    let expectedFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // undo
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');
    await page.keyboard.up('Meta');
    await page.keyboard.up('z');

    // redo
    await page.keyboard.down('Meta');
    await page.keyboard.down('Shift');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(expectedFullTreeSVGString)); 
  });

  test('Redo save morphology', async() => {
    // simulate user action
    await page.click('text[id="morphology8"]');
    await page.click('text[id="linkLabel1"]');
    await page.$eval('input[id="morphologyName"]', el => el.value = "test");
    await ((await page.$$('section[id="morphology"] > p > button'))[0].click());

    let expectedFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // undo
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');
    await page.keyboard.up('Meta');
    await page.keyboard.up('z');

    // redo
    await page.keyboard.down('Meta');
    await page.keyboard.down('Shift');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(expectedFullTreeSVGString)); 
  });

  test('Redo node drag', async() => {    
    // simulate user action
    await page.mouse.move(450,302.5);
    await page.mouse.down();
    await page.mouse.move(295,302.5);
    await page.mouse.up();

    let expectedFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
    
    // undo
    await page.keyboard.down('Meta');
    await page.keyboard.down('z');
    await page.keyboard.up('Meta');
    await page.keyboard.up('z');

    // redo
    await page.keyboard.down('Meta');
    await page.keyboard.down('Shift');
    await page.keyboard.down('z');

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(expectedFullTreeSVGString));
  });

  test('User cannot undo more than ten steps', async () => {
    let expectedFullTreeSVGString;
    
    // simulate user action
    await page.$eval('#editbtn', el => el.click());
    // add 11 new nodes to the end
    for (let i = 0; i < 11; i++) {
      if (i == 1) expectedFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0];
      await page.click(`#morphologyAddEnd${(8+i*2).toString()}`); 
    };
    // undo 10 times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.down('Meta');
      await page.keyboard.down('z');
      await page.keyboard.up('Meta');
      await page.keyboard.up('z');
    }

    let testingFullTreeSVGString = (await page.content()).match(/<g class="fulltree"(.*?)>(.*)<\/g>/g)[0]; 
    // apply the filter function on SVG strings then assert
    // the tree must now be the same as it was after adding the first node
    expect(filterFullTreeSVGString(testingFullTreeSVGString)).toEqual(filterFullTreeSVGString(expectedFullTreeSVGString)); 
  })
})

