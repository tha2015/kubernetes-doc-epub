#!/bin/sh 
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules --harmony "$0" "$@"

import fs from 'fs'
import child_process from 'child_process'
import puppeteer from 'puppeteer'
import crypto from 'crypto'
import * as common from './common.mjs'


async function getTOC(page) {
  const values = await page.evaluate((sel, act) => Array.from(document.querySelectorAll('[id=docsToc] a[href]'), e=>e.href));
  const uniqueValues = common.uniq(values);
  
  return uniqueValues;
}


async function openTOC(page, url) {
  let path = common.toHtmlFilePath(url) + '.menu.html';

  if (fs.existsSync(path)) {
    return;
  }

  //var cssMap = await common.dlCss(page, url);

  let csslinks = ""
  //for (let p in cssMap) {
  //    let link = cssMap[p];
  //    csslinks = csslinks + "<link rel='stylesheet' href='" + link +"'>"    
  //}
 
  csslinks=
    '<style>' +
    '[id="docsToc"]>div>div>div>div[class="title"] { padding-left: 30px}\n' +
    '[id="docsToc"]>div>div>div>div>div>div {padding-left: 60px}\n' +
    '[id="docsToc"]>div>div>div>div>div>div>div>div>div>div {padding-left: 60px}\n' +
    '</style>';

  let header="<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Table of Content</title>" + csslinks + "</head>"
  
  
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
  Array.from(document.querySelectorAll('[id=docsToc] div[style]'), 
      e=> e.setAttribute('style', '')));

  let body1 = '<body>';

  let body2 = '</body>';
  
  //let path = common.toHtmlFilePath(url) + '.menu.html';
  if (!fs.existsSync(path)) {
      const pair =  ['[id=docsToc] ','e => e.outerHTML'] ;       
      const values = await page.evaluate((sel, act) => Array.from(document.querySelectorAll(sel), eval(act)), pair[0], pair[1]);
      let dir = path.substring(0, path.lastIndexOf('/'));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path, header + body1 + values[0] + body2 + "</html>");    
  }

}

async function openPage(page, url) {

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
  csslinks= csslinks +
    '<style>' +
    '#docsContent { width: auto !important; float: none !important; }\n' +
    '#docsContent h1, #docsContent h2, #docsContent h3, #docsContent h4, #docsContent h5, #docsContent h6 {font-weight: bold;}' +
    '</style>';  

  let header="<!DOCTYPE html><html><head><meta charset='UTF-8'><title>" + titleStr + "</title>" + csslinks + "</head>"
  
  
  let imgMap = await common.dlImages(page, url);

  await page.evaluate((m) => 
  Array.from(document.querySelectorAll('img[src]'), 
          e=> e.setAttribute('src', m[e.src])), imgMap);



  let body1 = '<body>';


  let body2 = '</body>';
  
  // update links
  let hrefMap = await common.getHrefMap(page, url, u=> { try { return new URL(u).pathname.indexOf('/docs/') === 0 ;} catch(e){  return false;} } );
  await page.evaluate((m) => 
      Array.from(document.querySelectorAll('a[href]'), 
          e=> (e.getAttribute('href').indexOf('#') != 0 && typeof(m[e.href]) === 'string') ? e.setAttribute('href', m[e.href]) : null), hrefMap);
  
  await page.evaluate(() => Array.from(document.querySelectorAll('#editPageButton,script,.tooltip-text,#pre-footer,#feedback,.feedback--prompt,.feedback--response,.feedback--yes,.feedback--no'), e=>e.remove()));

  //let path = common.toHtmlFilePath(url);
  if (!fs.existsSync(path)) {
      const pair =  ['[id=docsContent]','e => e.outerHTML'] ;       
      const values = await page.evaluate((sel, act) => Array.from(document.querySelectorAll(sel), eval(act)), pair[0], pair[1]);
      let dir = path.substring(0, path.lastIndexOf('/'));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path, header + body1 + values[0] + body2 + "</html>");    
  }

}

      
async function download(url) {

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto(url);

  let toc = await getTOC(page);

  await openTOC(page, url);


  for (let link of toc) {
      await openPage(page, link);
      
      // wait
      await page.waitFor(1000);

  }

  await browser.close();
}

download("https://kubernetes.io/docs/concepts/");
download("https://kubernetes.io/docs/tasks/");
download("https://kubernetes.io/docs/tutorials/");
download("https://kubernetes.io/docs/reference/");
download("https://kubernetes.io/docs/setup/");