# kubernetes-doc-epub
Script to create epub files from https://kubernetes.io/docs/

## Requirements
- Node.js
- Calibre

## How to run

### Install puppeteer using npm

npm i puppeteer --save

### Set PATH environment variable to include ebook-convert program (from Calibre)

export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH"

## Run script

./k8sdoc.sh

## (Optional) Use Calibre to convert epub to mobi format

## PDF fotmat
* PDF version of the documents can be found [here](https://github.com/dohsimpson/kubernetes-doc-pdf/)

