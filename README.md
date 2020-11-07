# kubernetes-doc-epub

## Ebooks:
- AZW3 (Kindle format): https://github.com/tha2015/kubernetes-doc-epub/tree/master/azw3
- Mobi (old format, not supported): https://github.com/tha2015/kubernetes-doc-epub/tree/master/mobi
- Epub: https://github.com/tha2015/kubernetes-doc-epub/tree/master/epub

## PDF format?
* PDF version of the documents can be found [here](https://github.com/dohsimpson/kubernetes-doc-pdf/)

## How to to build ebooks using provided script

- Note: Script will download HTML pages from https://kubernetes.io/docs/ to generate ebooks

### Requirements
- Chrome
- Node.js
- Calibre

### How to run

#### Install puppeteer using npm

`npm i puppeteer --save`


#### Run script to download web pages to disk


`./k8sdoc.mjs`

* Note: if you are not on MacOS, please update Chrome path in k8sdoc.mjs (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) to a correct Chrome location

#### Generate epub/azw3 files

* Make sure PATH environment variable to include ebook-convert program (from Calibre). For example, on MACOSX use below command:

`export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH"`

`./k8sdocmjs.sh`



