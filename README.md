# kubernetes-doc-epub
Script to create epub files from https://kubernetes.io/docs/

## Requirements
- Node.js
- Calibre

## How to run

### Install puppeteer using npm

npm i puppeteer --save


### Run script to download web pages to disk

./k8sdoc.mjs

### Generate epub files
(Make sure PATH environment variable to include ebook-convert program (from Calibre)
For example, on MACOSX use below command
export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH")

./k8sdocmjs.sh


## PDF format
* PDF version of the documents can be found [here](https://github.com/dohsimpson/kubernetes-doc-pdf/)

