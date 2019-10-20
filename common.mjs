#!/bin/sh 
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules --harmony "$0" "$@"

import fs from 'fs'
import child_process from 'child_process'
import puppeteer from 'puppeteer'
import crypto from 'crypto'

export function uniq(values) {
    return values.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
}

export function toFilePath(url, type=null) {
    let path;
    try {
        let u = new URL(url);
        if (u.pathname.endsWith('/')) {
            path = u.hostname + u.pathname + 'index.html';
        } else {
            let lastName = u.pathname.substring(u.pathname.lastIndexOf('/') + 1);
            if (lastName.indexOf('?') == -1 && lastName.indexOf('.') != -1) {
                // looks like a normal file name
                path = u.hostname + u.pathname;
            } else {
                //TODO: try to check if it is redirected to somewhere else
                if (lastName.indexOf('.') == -1 && type == 'html') { // maybe missing '/'
                    path = u.hostname + u.pathname + '/index.html';
                } else {
                    path = u.hostname + u.pathname;
                }
            }
        }
    } catch (e) {
        path = url;
    }
    return path;
}

export function toImageFilePath(url) {
    let path = toFilePath(url);
    if (path.endsWith('.svg') || path.endsWith('.jpg') || path.endsWith('.png')|| path.endsWith('.gif')) return path;

    let hash = crypto.createHash('md5').update(url).digest("hex");
    path = path.substring(0, path.lastIndexOf('/') + 1) + hash + ".jpg";
    return path;
}

export function toCssFilePath(url) {
    let path = toFilePath(url);
    if (path.endsWith('.css')) return path;

    let hash = crypto.createHash('md5').update(url).digest("hex");
    path = path.substring(0, path.lastIndexOf('/') + 1) + hash + ".css";
    return path;
}
export function toHtmlFilePath(url) {
    let path = toFilePath(url, 'html');
    if (path.endsWith('.html')) return path;

    return path + ".html";
}
export async function dlImages(page, url) {
    let map = {};

    const imgSrcs = await page.evaluate(() => 
        Array.from(document.querySelectorAll('img[src]'), e=> e.src));
    const uniqueValues = uniq(imgSrcs);
    const browser = page.browser();
    const page1 = await browser.newPage();
    for (let src of uniqueValues) {
        let path = toImageFilePath(src);
        if (!fs.existsSync(path)) {
            let dir = path.substring(0, path.lastIndexOf('/'));
            fs.mkdirSync(dir, { recursive: true });
            try {
                let viewSource = await page1.goto(src);
                fs.writeFileSync(path, await viewSource.buffer());    
            } catch (e) {}
        }
        
        let relurl = relative_url(url, "http://" + path, true);
        map[src] = relurl;

    }
    await page1.close();


    return map;
}

export async function dlCss(page, url) {
    let map = {};

    const srcs = await page.evaluate(() => 
        Array.from(document.querySelectorAll('link[rel=stylesheet][href]'), e=> e.href));
    const uniqueValues = uniq(srcs);

    
    const browser = page.browser();
    const page1 = await browser.newPage();
    for (let src of uniqueValues) {
        let path = toCssFilePath(src);

        if (!fs.existsSync(path)) {
            let dir = path.substring(0, path.lastIndexOf('/'));
            fs.mkdirSync(dir, { recursive: true });
            let viewSource = await page1.goto(src);
            fs.writeFileSync(path, await viewSource.buffer());    
        }

        let relurl = relative_url(url, "http://" + path);
        map[src] = relurl;        
    }
    await page1.close();
    return map;
}

export async function getHrefMap(page, url, filter= null) {
    let map = {};

    const hrefs = await page.evaluate(() => 
        Array.from(document.querySelectorAll('a[href]'), e=> e.href));
    let uniqueValues = uniq(hrefs);
    if (filter) {
        uniqueValues = uniqueValues.filter(filter);
    }

    for (let href of uniqueValues) {
        
        let path = toHtmlFilePath(href);

        if (href.indexOf('#') != -1) {
            path += new URL(href).hash;
        }
        let relurl = relative_url(url, "http://" + path);


        map[href] = relurl;
    }

    return map;
}

export function relative_url(url1, url2, force_domain = false) {
    let u1;
    let u2;
    try {
      u1 = new URL(url1);
      u2= new URL(url2);  
    } catch (e) {
      return url2;
    }
    let pathname1 = u1.pathname;
    let pathname2 = u2.pathname;
    if(u1.host !== u2.host) {
        if (!force_domain) {
            return url2;
        } else {
            pathname1 = u1.host + pathname1;
            pathname2 = u2.host + pathname2;
        }
    }
    let p1 = ((pathname1 === '') ? '/' : pathname1).split('/');
    let p2tmp = (pathname2 === '') ? '/' : pathname2;
    if (!p2tmp.endsWith('/') && p2tmp.substring(p2tmp.lastIndexOf('/')+1).indexOf('.') === -1) {
      //maybe a folder
      p2tmp += "/";
    }
    let p2 = (p2tmp).split('/');
    while ((p1.length) > 0 && (p2.length) > 0 && (p1[0] == p2[0])) {
      p1.shift();
      p2.shift();
    }
    p1.shift();
    while (p1.length > 0) {
      p1.shift();
      p2.unshift('..');
    }
    let relpath = p2.join('/');
    if (relpath === '' && typeof(u2.hash) !== 'undefined') {
      relpath += u2.hash;
    } else if (relpath === '' || relpath.endsWith('/')) {
      relpath +='index.html';
      if (typeof(u2.hash) !== 'undefined') relpath += u2.hash;
    }
  
    return relpath;
}

