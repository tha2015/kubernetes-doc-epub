#!/usr/bin/env bash

# Mac OS X
# export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH"
# npm i puppeteer --save
# k8sdoc.sh
 

function convertmenu {
  local file=$1
  local title=$2
  echo "converting to $title.epub"
  ebook-convert  "$file" "$title.epub" --title "$title" --breadth-first  \
  --level1-toc '//*[@id="docsToc"]/h:div/h:div/h:div/h:div[@class="title"]' \
  --level2-toc '//*[@id="docsToc"]/h:div/h:div/h:div/h:div/h:div/h:div/h:a | //*[@id="docsToc"]/h:div/h:div/h:div/h:div/h:div/h:div/h:div/h:div[@class="title"] ' \
  --level3-toc '//*[@id="docsToc"]/h:div/h:div/h:div/h:div/h:div/h:div/h:div/h:div/h:div/h:div/h:a ' \
  --epub-inline-toc  --output-profile=kindle_pw \
  --publisher Kubernetes --authors Kubernetes --language=en --cover=kubcloud.jpg

  echo "converting to $title.mobi"
  ebook-convert "$title.epub" "$title.mobi" --output-profile=kindle_pw 
}

function download_convert {
 
  convertmenu "kubernetes.io/docs/concepts/index.html.menu.html" "KubernetesConcepts"

  convertmenu "kubernetes.io/docs/tasks/index.html.menu.html" "KubernetesTasks"

  convertmenu "kubernetes.io/docs/tutorials/index.html.menu.html" "KubernetesTutorials"

  convertmenu "kubernetes.io/docs/reference/index.html.menu.html" "KubernetesReference"
  
  convertmenu "kubernetes.io/docs/setup/index.html.menu.html" "KubernetesSetup"

}

download_convert
 