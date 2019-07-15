+-----------------------------------------------+
|   Palmyra		
|	A GUI for Dependency Annotation         
+-----------------------------------------------+

Author: Talha Javed
Last update: August 6, 2017

CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Features
 * Implementation
 * Contents
 * Requirements
 * Installation / Configuration
 * General Use (Instructions)
 * Troubleshooting
 * FAQ
 * About the Author
 * Disclaimers

INTRODUCTION
------------



FEATURES
--------

- View and edit dependency trees using drag-and-drop graphics.
- Collapse branches of tree to control tree size.
- Mouseover text to view translations.
- Label dependency relationships by clicking on links.
- Get results as JSON - options for copyable text and file download.
- Script-agnostic and language-agnostic. (Compatible with all UTF-8 characters; right-to-left language support).
- Control tree display settings with graphical menus.
Added by Arfath
- Node distances are adjusted based on word length.
- Tree shrinks as nodes are collapsd.
- POS tag moved below word to minimize intersection with edge lines.

IMPLEMENTATION
--------------

The following design principles governed Easy Tree's development:

 * INTERACTIVE

	Users should be able to view and edit trees in real time and in ways that improve the annotation experience.

 * INTUITIVE

	The program should be approachable to non-experts. It should require minimal data transformation and reading of documentation. It should make the annotation process faster and simpler. 

 * MACHINE-COMPATIBLE

	While the interface is optimized for humans, its output must be readable by machines and easily converted to different richtext formats.

 * FLEXIBLE

	The program must be adaptable to as many applications as possible. It should run well on multiple OS and browser options. The code should be well-documented and editable.

An overview of the program:

Easy Tree captures parent-child relationships using JSON, which is rich-text accessible to both humans and machines. Each time the user edits the graphical tree, the JSON structure is updated accordingly. After editing is complete, the user can access the JSON via copyable text or a file download.

The tree graphic is created using SVG and the d3 library. d3 binds data elements to graphical elements, creating a graphics visualization of the data. d3 also provides "drag" event listeners that allow drag-and-drop behavior.

Within the tree, each child is stored as a node, and the relationships between nodes are stored as source-target paths. These elements are designed using CSS and controlled using Javascript / jQuery / d3. 

d3 uses Enter, Update, and Exit events to keep the graphical representation in line with the actual data. When a new data element is entered, d3 Enters the corresponding graphic. When a data element is changed in any way, d3 Updates the corresponding graphic. When data elements are removed, d3 Exits the corresponding graphic. These three principles form the underlying functionality of d3, and allow for the drag-and-drop and collapsible tree behavior in Easy Tree.

Like many web-based applications, the surrounding menus, links, and toolbars are designed using HTML5/CSS, controlled using Javascript, and animated using jQuery.

For a more detailed understanding of the code behind Easy Tree, see the in-line code comments.

CONTENTS
--------

 * HTML Files
	- index.html
	- viewtree.html
	- about.html
	- help.html
	- credits.html

 * CSS File
	- main.css

 * main.js

 * scripts Folder
	- Blob.js
	- FileSaver.min.js
        - d3.v3.min.js
        - jquery-1.11.3.min.js

 * fonts Folder
	- HennyPenny-Regular.otf
	- Copse-Regular.ttf
	- BEBAS___.ttf

 * bkgds Folder
	- footer_lodyas.png
	- black-paper.png
	- readme.txt

 * python Folder
	- prepper.py
	  [Documentation available at beginning of code]

 * licenses Folder
	- Blob License
	- EasyTree BSD-3
	- FileSaver License
	- Flat-it License v1.00.txt
	- SIL Open Font License - Copse.txt
	- SIL Open Font License - hennypenny.txt
	- d3 BSD License

REQUIREMENTS
------------

EasyTree requires internet access.

Recommended browsers:
 * Firefox
 * Chrome

Easy Tree has been tested on Linux and Windows machines.
 
The HTML is HTML5.

The interactive tree functions are built using jQuery and the d3.js package.
These are included in the project files, so no import/download/installation should be needed.


INSTALLATION / CONFIGURATION
----------------------------

 (1) Download the "EasyTree" folder. You can obtain a ZIP file at the following GitHub repository:

	[https://github.com/alexalittle/easytree]

 (2) Extract the files and save the "EasyTree" folder to your desired location.

 (3) Enter the "EasyTree" folder. Enter the "public_html" folder.

 (4) Click on "index.html" and run in your desired browser.

GENERAL USE (INSTRUCTIONS)
--------------------------

 (1) Run Easy Tree by running "index.html" in your preferred browser (Firefox/Chrome recommended).

 (2) Select "NEW TREE" from the start menu.

 (3) From the Tree Viewer, you can perform any of the following commands:

		* UPLOAD: enter a new tree
		* CLEAR: clear current tree (including all changes)
		* SAVE AS TEXT: get JSON for tree as copyable text
		* DOWNLOAD: get JSON for tree as file download

	Note that the UPLOAD and DOWNLOAD buttons toggle, so you can click them to both open and close the corresponding pop-ups.

 (4) UPLOAD

	Enter the tree in JSON format. See the "examples" folder for examples, described below:

		* EXAMPLE 1

			A starter tree with all features enabled. 
			[Japanese, left-to-right, kana and kanji scripts]

		* EXAMPLE 2

			A starter tree with no features enabled. 
			[English, left-to-right, Latin script]

		* EXAMPLE 3

			A starter tree with only the original sentence displayed.
			[Hindi, left-to-right, Devanagari script]

		* EXAMPLE 4

			A starter tree with all features enabled.
			[Urdu, right-to-left, Nastaliq script]

		* EXAMPLE 5

			The sentence from example 1, as a completed tree.
			[Japanese, left-to-right, kana and kanji scripts]

		* EXAMPLE 6

			The sentence from example 4, as a completed tree.
			[Urdu, right-to-left, Nastaliq script]

	Essentially, each JSON tree must have a static root node which is the highest parent of the tree. The actual root of the tree can attach to this node (if the tree is already structured), or each word in a sentence can attach to this node (if the tree is unstructured).

	Node property definitions:

	- "name" : the text to display
	- "def" : the translation to display on mouseover
	- "pos" : the part of speech
	- "link" : the dependency relation of this node (target) to its head (source)
	- "id" : the index of the word in the original sentence

Note that Easy Tree will add the "id" properties automatically; for right-to-left scripts, the ids indicate last-to-first word order.

 (5) Changing display settings:

	Click the "SETTINGS" button on the tree editor toolbar. There are various display options and a reset button. Changes to settings are shown in real time.

	Settings definitions:

	- "Tree Width" : change horizontal distance between branches
	- "Tree Height" : change vertical distance between parent and child node
	- "Node Size" : change radius size of node circles
	- "Text X-Values" : change horizontal distance between nodes and their labels
	- "Text Y-Values" : change vertical distance between nodes and their labels
        - "Font Family" : change fonts on the tree

 (6) Customizing part-of-speech key:

	Click on the "KEY" button on the tree editor toolbar.  This displays the current POS settings. Click "Customize" to change the labels, and "Done" to apply the changes.

 (6) Making changes:

	- To change the location of a node, drag and drop the node in its new position. 
	- To label a path (indicating the dependency relation of a node to its head), click on the path and enter the desired label in the pop-up window.
	- To see translations, hover over the text (the actual text, not the node circle).

 (7) Saving:

	- To get copyable JSON text, click "SAVE AS TEXT" on the toolbar.
	- To get a JSON file download, click "DOWNLOAD".

 (8) CLEAR / adding a new tree:

	- The "CLEAR" button clears the current tree (including all changes) from memory and prepare the viewer for a new tree. You MUST press this button before entering a new tree.

	- Make sure you save your work before pressing this button, because cleared trees are not recoverable!

TROUBLESHOOTING
---------------

  * Pop-up alert: "Your browser will not support EasyTree!"
        You are using an outdated browser, and EasyTree will not have the support functions to operate properly. Try updating your browser or using a different one.

  * Graphics aren't showing
        Check that main.css, the fonts folder, and the bkgds folder are all present in the package. If you have made changes to the CSS file, double-check that they are valid CSS. If you are entering the tree as JSON, check that the JSON is valid.

  * Sentence is "backwards"
        If you created your JSON files using prepper.py, try toggling your "reverse" argument settings (i.e., add or remove "reverse" at the end of your command line arguments). Otherwise, recall that JSON input files must be ordered in the desired sentence order. If your language is right-to-left, this means that {"name": "." ...} should be the first child of "root". See examples.
        If you are entering a phrase, make sure you are entering the phrase as it would normally be read (i.e. don't alter or reverse it). If you still experience problems, report the issue via the <a href='https://github.com/alexalittle/easytree.git'>GitHub repository.</a></p>

  * Download files lack an extension
        You need to specify the filename with its extension in the filename field. If you want the output to be a JSON file, add ".json" to your desired filename.

  * Can't label paths to the 'root' node
        Within the program, the 'root' node acts as a placeholder and has special properties. Labeling paths to 'root' is blocked because those labels interfere with the program's function. Besides, 'root' is a meaningless node so you really shouldn't have labels for its child paths!

                    <h5>Why can't I change the colors in the part-of-speech key?</h5>
                    <p id='faq'>This functionality is in the works for future editions of Easy Tree. For now, the palette is designed to be distinctive and colorblind-safe.</p>
                </li>
                <li>
                    <h5>Why doesn't "CLEAR" reset the part-of-speech labels?</h5>
                    <p id='faq'>"CLEAR" just removes the tree data. To reset all settings, use the "RESET" button. To reset only POS settings or tree display settings, open the relevant menu and click "Reset All".</p>
                </li>
  * 
                    <h5>How do I close toolbar windows once I'm finished?</h5>
                    <p id="faq">If a window does not automatically close, click the toolbar button once more to close. Most windows also include a "close" button.</p>
                </li>
                <li>
  * The standard font doesn't display my language well
        You can change the font under "SETTINGS". Currently, choices are limited to basic web-safe fonts and the standard font, "Copse".

  * Pop-up alert: 'Sorry, something went wrong!'?
        Double-check your JSON file -- are there any typos? Do you have a single "root" node? Does every node have a "name" value? Are there extra brackets or commas?
        If you previously saved your tree and are trying to reload it, double-check the brackets and commas in the JSON file.
        If you still can't find a problem, or you think it's a regular expression error, please report the issue via the GitHub repository.

FAQ
---

 * Can I make changes to the Easy Tree program?
	
	Absolutely! Feel free to change the HTML, CSS, and Javascript files as much as you want.

 * What is the license for this program?

	Easy Tree is provided with a BSD-3 license (as required by some of its Javascript source packages). You can find this license in the "licenses" folder of Easy Tree.

 * Who created the design elements for this project?

	The backgrounds are courtesy of subtlepatterns.com. They are made available under a CC BY-SA 3.0 license, copyright Atle Mo. [License available in the "bkgds" folder.]

	The font "Henny Penny" was created by Brownfox and made available under an SIL Open Font License. I found it at http://www.fontsquirrel.com/fonts/henny-penny.

	The font "Copse" was created by Dan Rhatigan and made available under an SIL Open Font License. I found it at http://www.fontsquirrel.com/fonts/copse.

	The font "Bebas" was created by Ryoichi Tsunekawa for Flat-it and made available under Flat-it License v1.00. (This license allows free use in commercial and non-commercial projects.) I found it at http://www.fontsquirrel.com/fonts/bebas.

	The color scheme was suggested by Data Graphics Research at the University of Oregon, on their site here: [http://geog.uoregon.edu/datagraphics/color_scales.htm].

	The FileSaver.js and Blob.js libraries are copyright Eli Grey and can be found in their respective GitHub repositories: [https://github.com/eligrey/FileSaver.js] , [https://github.com/eligrey/Blob.js].

	The d3.js library is copyright Mike Bostock. It is released under a BSD license and can be found at d3js.org.

	Some of the interactive tree elements are based on code by Rob Schmuecker. That project was released under the same BSD license as d3.js, and the source code and other information can be found here: http://http://www.robschmuecker.com/d3-js-drag-and-drop-zoomable-tree. Copyright Rob Schmuecker.

	Unless otherwise stated, copies of the above licenses are available under the "licenses" folder of Easy Tree. PLEASE NOTE that attribution does not imply that the licensors endorse Easy Tree or its creator.
		
 * Where can I go for help?

	If you find a bug in the program, please submit an issue report via the GitHub repository: [https://github.com/alexalittle/easytree].

	If you are having trouble running this program, you can contact the author at alexa (dot) little (at) yale.edu.

ABOUT THE AUTHOR
----------------

Alexa Little is a fourth-year linguistics undergraduate at Yale University. Her interests include computational linguistics, second language acquisition, and low-resource Asian languages.

Language proficiencies: English [native], Japanese [working], Hindi [limited working]
Programming: Python, HTML5/CSS, Javascript

alexa (dot) little (at) yale.edu

DISCLAIMERS
-----------

License: CC BY-SA 4.0 ; MIT/BSD-3
Copyright (c) 2015, Alexa Little
All rights reserved.

THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE U.S. GOVERNMENT OR ANY DEPARTMENTS OR EMPLOYEES THEREOF BE LIABLE FOR ANY DIRECT,
 INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.)

PLEASE NOTE that any credits or attributions do not imply that the licensors endorse Easy Tree or its creator.
