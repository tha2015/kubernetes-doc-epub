#!/usr/bin/env bash

# Mac OS X
# export PATH="/Applications/calibre.app/Contents/MacOS/:$PATH"
# npm i puppeteer --save
# k8sdoc.sh

function tofilepath {
  local url=$1
  local filepath=$(node -e "console.log([new URL('$url')].map(u=>u.hostname + u.pathname + (u.pathname.endsWith('/') ? 'index.html' : ''))[0]);")
  echo $filepath
}

function dlsection {
  local rooturl=$1

  i=1
  node cssselect.js "$rooturl" '[id=docsToc] a[href]' "e => e.href" | while read line
  do

    pageTitle=$(dlpage $line)


    i=$((i + 1))

    #if [ "$i" -eq "5" ]; then
    #  break
    #fi
  done  

}

function dlpage {
  local url=$1
  local file=$(tofilepath $1)

  title=$(node cssselect.js "$url" 'title' "e => e.textContent.replace(' - Kubernetes','')")
  header="<!DOCTYPE html><html><head><meta charset='UTF-8'><title>$title</title></head><body>"
  body=$(node cssselect.js \
        "$url" \
        '[id=docsContent] img' "e => e.setAttribute('src',e.src.substring(e.src.lastIndexOf('/') + 1))" \
        '[id=docsContent] a[href]' 'e=>e.setAttribute("href", (relative_url)(location.href, e.href))' \
        '#editPageButton,script,.tooltip-text,#pre-footer,#feedback,.feedback--prompt,.feedback--response,.feedback--yes,.feedback--no' 'e=>e.remove()' \
        '[id=docsContent]' "e => e.outerHTML" \
        )
  footer="</body></html>"


  # download html
  dir=$(dirname "$file")
  mkdir -p "$dir"
  touch "$file"
  echo "$header$body$footer" > "$file"

  # download images
  node cssselect.js "$url" '[id=docsContent] img' "e => e.src" | while read line
  do
    wget -nc --quiet  -P "$dir" "$line"
  done

  # return page title
  echo $title
}

function dlmenu {
  local url=$1
  local file="$(tofilepath $1).menu.html"

  title=$(node cssselect.js "$url" 'title' "e => e.textContent.replace(' - Kubernetes','')")
  header="<!DOCTYPE html><html><head><meta charset='UTF-8'><title>$title</title></head><body>"
  body=$(node cssselect.js \
        "$url" \
        '[id=docsToc] a[href]' 'e=>e.setAttribute("href", (relative_url)(location.href, e.href))' \
        '[id=docsToc] div[style' 'e=>e.setAttribute("style", "")' \
        '[id=docsToc]' "e => e.outerHTML" \
        )
  footer="</body></html>"

    # download html
  dir=$(dirname "$file")
  mkdir -p "$dir"
  touch "$file"
  echo "$header$body$footer" > "$file"

  echo "$file"
}

function convertmenu {
  local file=$1
  local title=$2

  ebook-convert  "$file" "$title.epub" --title "$title" --breadth-first  \
  --level1-toc '//*[@id="docsToc"]/h:div/h:div/h:a' \
  --level2-toc '//*[@id="docsToc"]/h:div/h:div/h:div/h:div[@class="title"]' \
  --level3-toc '//*[@id="docsToc"]/h:div/h:div/h:div/h:div[@class="wrapper"]/h:div/h:div/h:a' \
  --epub-inline-toc \
  --no-default-epub-cover --publisher Kubernetes --authors Kubernetes --language=en 
  
}

dlsection "https://kubernetes.io/docs/concepts/" 
dlsection "https://kubernetes.io/docs/tasks/" 
dlsection "https://kubernetes.io/docs/tutorials/" 
dlsection "https://kubernetes.io/docs/reference/" 

#dlpage  "https://kubernetes.io/docs/concepts/overview/what-is-kubernetes/" "overview/what-is-kubernetes/index.html"

menufile=$(dlmenu "https://kubernetes.io/docs/concepts/")
convertmenu "$menufile" "KubernetesConcepts"

menufile=$(dlmenu "https://kubernetes.io/docs/tasks/")
convertmenu "$menufile" "KubernetesTasks"

menufile=$(dlmenu "https://kubernetes.io/docs/tutorials/")
convertmenu "$menufile" "KubernetesTutorials"

menufile=$(dlmenu "https://kubernetes.io/docs/reference/")
convertmenu "$menufile" "KubernetesReference"