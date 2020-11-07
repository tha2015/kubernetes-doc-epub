#!/usr/bin/env bash

# Mac OS X
# export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH"
# npm i puppeteer --save
# sicp.sh
 
function convertmenu {
  local file=$1
  local title=$2
  echo "converting to $title.epub"
  ebook-convert  "$file" "$title.epub" --title "$title" --breadth-first  \
  --level1-toc '//h:body/h:p/h:b/h:a' \
  --level2-toc '//h:body/h:p/h:a' \
  --level3-toc '' \
  --no-chapters-in-toc \
  --use-auto-toc \
  --epub-inline-toc  --output-profile=kindle_pw \
  --publisher MIT --authors "Harold Abelson and Gerald Jay Sussman with Julie Sussman" --language=en --cover=mitpress.mit.edu/sites/default/files/sicp/full-text/book/cover.jpg

  echo "converting to $title.mobi"
  ebook-convert "$title.epub" "$title.azw3" --output-profile=kindle_pw
}

function download_convert {
  rm -f "mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-38.html"
  convertmenu "mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-4.html" "SICP"

}

download_convert
 