#!/usr/bin/env bash

# Mac OS X
# export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH"
# npm i puppeteer --save
# k8sdocmjs.sh
 
function convertmenu {
  local file=$1
  local title=$2
  echo "converting to $title.epub"
  ebook-convert  "$file" "$title.epub" --title "$title" --breadth-first  \
  --level1-toc '//h:body/h:ul/h:li/h:a' \
  --level2-toc '//h:body/h:ul/h:ul/h:li/h:a | //h:body/h:ul/h:ul/h:li/h:ul/h:li/h:a' \
  --level3-toc '//h:body/h:ul/h:ul/h:ul/h:li/h:a | //h:body/h:ul/h:ul/h:li/h:ul/h:ul/h:li/h:a' \
  --no-chapters-in-toc \
  --use-auto-toc \
  --epub-inline-toc  --output-profile=kindle_pw \
  --publisher Kubernetes --authors Kubernetes --language=en --cover=kubcloud.jpg

  echo "converting to $title.mobi"
  ebook-convert "$title.epub" "$title.azw3" --output-profile=kindle_pw
}

function download_convert {
 
  convertmenu "kubernetes.io/docs/concepts/index.html.menu.html" "KubernetesConcepts"

  convertmenu "kubernetes.io/docs/tasks/index.html.menu.html" "KubernetesTasks"

  convertmenu "kubernetes.io/docs/tutorials/index.html.menu.html" "KubernetesTutorials"

  convertmenu "kubernetes.io/docs/reference/index.html.menu.html" "KubernetesReference"
  
  convertmenu "kubernetes.io/docs/setup/index.html.menu.html" "KubernetesGettingStarted"

}

download_convert
 