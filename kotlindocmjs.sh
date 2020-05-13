#!/usr/bin/env bash

# Mac OS X
# export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH"
# npm i puppeteer --save
# ./kotlindocmjs.sh
 

function convertmenu {
  local file=$1
  local title=$2
  echo "converting to $title.epub"
  ebook-convert  "$file" "$title.epub" --title "$title" --breadth-first  \
  --level1-toc '//h:nav/h:div/h:div/h:div[@class="text"]' \
  --level2-toc '//h:nav/h:div/h:div/h:a' \
  --epub-inline-toc  --output-profile=kindle_pw \
  --publisher Kotlin --authors Kotlin --language=en --cover=KotlinLogo.png

  echo "converting to $title.mobi"
  ebook-convert "$title.epub" "$title.mobi" --output-profile=kindle_pw 
}

function download_convert {
 
  convertmenu "kotlinlang.org/docs/reference/index.html.menu.html" "KotlinReference"

}

download_convert