#!/bin/sh 
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules --harmony "$0" "$@"

import fs from 'fs'
import child_process from 'child_process'
import puppeteer from 'puppeteer'
import crypto from 'crypto'
import * as common from './common.mjs'


async function getTOC(page) {
  // remove collapsed menues
  //await page.evaluate(() => Array.from(document.querySelectorAll('[class=collapse]'), e =>  e.remove()));
  const values = await page.evaluate((sel, act) => Array.from(document.querySelectorAll('nav .show .show a[href]'), e=>e.href));
  const uniqueValues = common.uniq(values);
  //process.stdout.write(`uniqueValues ${uniqueValues} \n`)

  return uniqueValues;
}


async function openTOC(page, url) {
  let path = common.toHtmlFilePath(url) + '.menu.html';

  if (fs.existsSync(path)) {
    return;
  }

  let header=`<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<title>Table of Content</title>
<style>
.td-sidebar-nav__section li {list-style: none;}
.td-sidebar-nav__section>ul {padding-left: 30px !important;}
.td-sidebar-nav .td-sidebar-link {display: block;}
.td-sidebar-nav__section ul {padding: 0; margin: 0;}
</style>
</head>
`
  
  
  let imgMap = await common.dlImages(page, url);


  await page.evaluate((m) => 
      Array.from(document.querySelectorAll('img[src]'), 
          e=> e.setAttribute('src', m[e.src])), imgMap);


  // update links
  let hrefMap = await common.getHrefMap(page, url);
  await page.evaluate((m) => 
      Array.from(document.querySelectorAll('a[href]'), 
          e=> e.setAttribute('href', m[e.href])), hrefMap);
  
  // remove inline CSS
  await page.evaluate(() => 
  Array.from(document.querySelectorAll('[id=td-sidebar-menu] nav  div[style]'), 
      e=> e.setAttribute('style', '')));

  let body1 = '<body class="td-sidebar-nav td-sidebar-nav__section">';

  let body2 = '</body>';
  
  //let path = common.toHtmlFilePath(url) + '.menu.html';
  if (!fs.existsSync(path)) {
      const pair =  ['nav .show .show ','e => e.innerHTML'] ;       
      const values = await page.evaluate((sel, act) => Array.from(document.querySelectorAll(sel), eval(act)), pair[0], pair[1]);
      let dir = path.substring(0, path.lastIndexOf('/'));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path, header + body1 + values[0] + body2 + "</html>");    
  }

}

async function openPage(page, url) {
  //process.stdout.write(`url ${url} \n`)

  let path = common.toHtmlFilePath(url);
  if (fs.existsSync(path)) {
    return;
  }

  let response = await page.goto(url);

  let titleStr = await page.title();    

  var cssMap = await common.dlCss(page, url);

  let csslinks = ""
  for (let p in cssMap) {
      let link = cssMap[p];
      csslinks = csslinks + "<link rel='stylesheet' href='" + link +"'>"    
  }
  csslinks =` ${csslinks}
    <style>
    code{color:inherit;padding:.2em .4em;margin:0;font-size:85%;word-break:normal;background-color:rgba(0,0,0,.05);border-radius:.25rem;}

    /*.lead { font-size: medium;}
    h1, .h1 { font-size: 30px; }
    h2, .h2 { font-size: 24px; }
    h3, .h3 { font-size: 20px; }
    h4, .h4 { font-size: 18px; }
    h5, .h5 { font-size: 16px; }
    h6, .h6 { font-size: 14px; }*/
    .lead:first-of-type{display:none;}
    /*strong { font-weight: bold; }*/
    .pl-md-5, .px-md-5 { padding-left: 0px !important; padding-right: 0px !important;}
    </style> 
  `;

  let header=`<!DOCTYPE html><html><head><meta charset='UTF-8'><title>${titleStr}</title>${csslinks}</head>`
  
  
  let imgMap = await common.dlImages(page, url);

  await page.evaluate((m) => 
  Array.from(document.querySelectorAll('img[src]'), 
          e=> e.setAttribute('src', m[e.src])), imgMap);



  let body1 = '<body id="docsContent">';


  let body2 = '</body>';
  
  // update links
  let hrefMap = await common.getHrefMap(page, url, u=> { try { return new URL(u).pathname.indexOf('/docs/') === 0 ;} catch(e){  return false;} } );
  await page.evaluate((m) => 
      Array.from(document.querySelectorAll('a[href]'), 
          e=> (e.getAttribute('href').indexOf('#') != 0 && typeof(m[e.href]) === 'string') ? e.setAttribute('href', m[e.href]) : null), hrefMap);
  
  //await page.evaluate(() => Array.from(document.querySelectorAll('#editPageButton,script,.tooltip-text,#pre-footer,#feedback,.feedback--prompt,.feedback--response,.feedback--yes,.feedback--no'), e=>e.remove()));
  await page.evaluate(() => Array.from(document.querySelectorAll('main > nav'), e =>  e.remove()));
  await page.evaluate(() => Array.from(document.querySelectorAll('#pre-footer + *'), e =>  e.remove()));
  await page.evaluate(() => Array.from(document.querySelectorAll('#pre-footer + *'), e =>  e.remove()));
  await page.evaluate(() => Array.from(document.querySelectorAll('#pre-footer'), e =>  e.remove()));

  //let path = common.toHtmlFilePath(url);
  if (!fs.existsSync(path)) {
      const pair =  ['main', 'e => e.outerHTML'] ;       
      const values = await page.evaluate((sel, act) => Array.from(document.querySelectorAll(sel), eval(act)), pair[0], pair[1]);
      var html = values[0]
      //process.stdout.write(`before replace ${html} \n`)

      //html = html.replace('</strong>', '</span>').replace('<strong>', '<span style="font-weight: 700;">')

      //process.stdout.write(`======================= after replace ${html} \n`)

      let dir = path.substring(0, path.lastIndexOf('/'));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path, header + body1 + html + body2 + "</html>");
  }

}

      
async function download(url) {

  const browser = await puppeteer.launch({headless: false, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page = await browser.newPage();
  await page.goto(url);

  let toc = await getTOC(page);

  await openTOC(page, url);

//var i =1
  for (let link of toc) {
//i++
//if (i > 15) break;

      await openPage(page, link);
      
      // wait
      //await page.waitFor(1000);

  }

  await browser.close();
}

download("https://kubernetes.io/docs/concepts/");
download("https://kubernetes.io/docs/tasks/");
download("https://kubernetes.io/docs/tutorials/");
download("https://kubernetes.io/docs/reference/");
download("https://kubernetes.io/docs/setup/");

