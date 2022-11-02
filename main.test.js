global.__DEV__ = true
global.$ = require('jquery');
global.d3 = require('d3');

const puppeteer = require('puppeteer');
const fs = require('fs');

describe('Opening viewTree.html', () => {
  let contentHtml = fs.readFileSync('./viewtree.html', 'utf8');
  let browser;
  let page;
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();  
    // await page.setContent(contentHtml, { waitUntil: "networkidle0" });
    // await page.addScriptTag({path: "main.js"});
    await page.goto("http://127.0.0.1:5500/viewtree.html"); // do this to be able to call functions in main.js, might need to direct the browser at this url
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

  test('Click on treebtn without adding a conll file and a config file', async () => {
    const expectedMessage = "Please select a ConllU/X file, or use use the Upload button in the sentence uploader section.";

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

    // assert that no alert is generated
    expect(dialogHandler.mock.calls.length).toEqual(0);
    // assert text
    expect(testingSent).toEqual(expectedSent);
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
    expect(testingLabelsText).toEqual(expectedLabelsText);
    expect(testingPosTagsText).toEqual(expectedPosTagsText);
  })  

  test('Click on treebtn2 with sentence data entered and config file is not uploaded', async () => {
    await page.$eval('#treedata2', el => el.value = "this is a sentence\nthis is another sentence");

    // simulate the click
    await page.$eval('#treebtn2', el => el.click());

    let expectedSent = "this is a sentence";
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

/*
tests for editing tree functionality

test("click on Listing button to show the sentences box", async () => {
  const expectedNotDisplayValue = 'block';
  const listingBtn = await page.$("input[type='button'][value='listing']");
  await listingBtn.click();
  const sentencesBoxDisplayValue = await page.$eval('#listing', el =>  getComputedStyle(el).getPropertyValue('display'));
  expect(sentencesBoxDisplayValue).toEqual(expectedDisplayValue);
})

*/
