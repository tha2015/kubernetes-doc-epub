
//  install puppeteer first using command 
//     $ npm i puppeteer --save

//  run using 
//     $ node cssselect.js https://kubernetes.io/docs/concepts/ '[id=docsToc]' "e => e.outerHTML"

const puppeteer = require('puppeteer');
const myArgs = process.argv.slice(2);

const url = myArgs[0];

const cssSelector = myArgs[1];
const mapperFn = myArgs[2];
const removeCssSelector = myArgs[3];

function relative_url(url1, url2) {
  var u1;
  var u2;
  try {
    u1 = new URL(url1);
    u2= new URL(url2);  
  } catch (e) {
    return url2;
  }
  
  if(u1.host !== u2.host) return url2;

  var p1 = ((u1.pathname === '') ? '/' : u1.pathname).split('/');
  var p2tmp = (u2.pathname === '') ? '/' : u2.pathname;
  if (!p2tmp.endsWith('/') && p2tmp.substring(p2tmp.lastIndexOf('/')+1).indexOf('.') === -1) {
    //maybe a folder
    p2tmp += "/";
  }
  var p2 = (p2tmp).split('/');
  while ((p1.length) > 0 && (p2.length) > 0 && (p1[0] == p2[0])) {
    p1.shift();
    p2.shift();
  }
  p1.shift();
  while (p1.length > 0) {
    p1.shift();
    p2.unshift('..');
  }
  relpath = p2.join('/');
  if (relpath === '' && typeof(u2.hash) !== 'undefined') {
    relpath += u2.hash;
  } else if (relpath === '' || relpath.endsWith('/')) {
    relpath +='index.html';
    if (typeof(u2.hash) !== 'undefined') relpath += u2.hash;
  }

  return relpath;
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  for (var i = 1; i < myArgs.length; i = i + 2) {
    if (typeof(myArgs[i]) !== 'undefined' && typeof(myArgs[i+1]) !== 'undefined') {
      var sel = myArgs[i];
      var act = myArgs[i+1];
      if (act.indexOf('(relative_url)') != -1) {
        act = act.replace('(relative_url)', '(' + relative_url.toString() + ')');	
      }
      const values = await page.evaluate((sel, act) => Array.from(document.querySelectorAll(sel), eval(act)), sel, act);
      values.forEach(e => { if (typeof(e) === 'string') console.log(e);} );
        
    }
  }
  
  await browser.close();
})();
