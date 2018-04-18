template_text = `
**Category is... {topic}**
 
This month, your challenge is to build something that generates descriptions of new {TOPIC}!

Some examples to inspire you:

* [{Example1}](https://en.wikipedia.org/wiki/{Example1_encode})
* [{Example2}](https://en.wikipedia.org/wiki/{Example2_encode})
* [{Example3}](https://en.wikipedia.org/wiki/{Example3_encode})

Good Luck!
`;


function fillText() {
    var elem = document.getElementById("text");
    elem.textContent = '\n...';
    pickTopic();
}

const RANDOM_CATEGORY_URL = "https://en.wikipedia.org/w/api.php?action=query&list=random&rnlimit=1&rnnamespace=14&format=json&formatversion=2&callback=?"
const CATEGORY_MEMBERS_URL = "https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmsort=timestamp&cmtitle=Category:{topic}&format=json&formatversion=2&callback=?";
var topic = '';
var examples = [];

function pickTopic() {
    /*const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           console.log(xhttp.responseText);
        }
    };
    xhttp.open("GET", RANDOM_CATEGORY_URL, true);
    xhttp.setRequestHeader('Api-User-Agent', 'Category Grabber (peairs@mit.edu)');
    xhttp.send();*/
    
    $.getJSON(RANDOM_CATEGORY_URL, function(data){
        console.log(data.query.random[0].title);
        topic = data.query.random[0].title.replace(/^Category:/, '');
        validateTopic();
    });
}

function validateTopic() {
    if (isValidTopic(topic)) {
        getExamples();
    } else {
        pickTopic();
    }
}

const BANNED_WORDS = [
    'articles',
    'disestablishments',
    'establishments',
    'redirects',
    'stubs',
    'wikipedia',
    'wikipedians',
];

const PLURALS = [
    'men',
    'people',
    'women',
]

function isValidTopic(topic) {
    const words = topic.split(' ').map(x => x.toLowerCase());
    console.log(words);

    for (const bannedWord of BANNED_WORDS) {
        if (words.includes(bannedWord)) {
            return false;
        }
    }
    
    var pluralFound = false;
    for (const word of words) {
        if (word.slice(-1) == 's' || PLURALS.includes(word)) {
                pluralFound = true;
        }
    }
                
    return pluralFound;
}

function getExamples() {
    const url = CATEGORY_MEMBERS_URL.replace(/{topic}/, topic);
    
    $.getJSON(url, function(data){
        console.log(data);
        
        const members = data.query.categorymembers.filter(x => x.ns == 0);
        examples = members.map(x => x.title);

        if (examples.length >= 3) {
            updateDisplay();
        } else {
            pickTopic();
        }
    });
}

function formatForUrl(str) {
    return encodeURIComponent(str).replace(/[\\)(]/g, '\\$&');
}

function updateDisplay() {
    var elem = document.getElementById("text");
    var challenge_text = template_text;
    challenge_text = challenge_text.replace(/{topic}/g, topic);
    challenge_text = challenge_text.replace(/{TOPIC}/g, topic.toUpperCase());
    challenge_text = challenge_text.replace(/{Example1}/g, examples[0]);
    challenge_text = challenge_text.replace(/{Example2}/g, examples[1]);
    challenge_text = challenge_text.replace(/{Example3}/g, examples[2]);
    challenge_text = challenge_text.replace(/{Example1_encode}/g, formatForUrl(examples[0]));
    challenge_text = challenge_text.replace(/{Example2_encode}/g, formatForUrl(examples[1]));
    challenge_text = challenge_text.replace(/{Example3_encode}/g, formatForUrl(examples[2]));
    elem.textContent = challenge_text;
}