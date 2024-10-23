/**
 * Marketing tracking - Conquer
 * 
 * Function to add tracking params to links
 * Developed by: João André Simiquelli
 * V2.1
 */
function getQueryString() {
  var query = window.location.search.substring(1);
  return query;
}

function hasUtmsParams(){
  const query = getQueryString();
  return query.includes("utm_");
}

function getParamsFromUrl() {
  var params = {};
  var query = getQueryString();

  var vars = query.split("&");

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if(pair.length == 2)
      params[pair[0]] = pair[1];
  }

  return params;
}

function getTrackingParams() {
  let params = getParamsFromUrl();

  if(!hasUtmsParams()) {
    recoveredParams = getTrackingLocal();
    if(recoveredParams) {
      if(params) {
        params = {
          ...recoveredParams,
          ...params
        }
      } else {
        params = recoveredParams
      }
    }
  }

  return params;
}

function saveTrackingLocal(params) {
  const sParams = {}
  for (const [key, value] of Object.entries(params)) {
    if(key.startsWith('utm'))
      sParams[key] = value
  }
  localStorage.setItem("tracking_params", JSON.stringify(sParams));
}

function getTrackingLocal() {
  return JSON.parse(localStorage.getItem("tracking_params"));
}

function addParamsToUrl(url, params) {
  url = url.replace("source=QUERY_PARAM(source,direto)","");
  const urlParts = url.split("?");  
  var urlParams = new URLSearchParams(urlParts.length > 1 ? urlParts[1] : "");
  var hasSource = false;

  for (const [key, value] of Object.entries(params)) {
      if(key === 'source') {
        hasSource = true;
        if(value === '')
          urlParams.set('source', 'direto');
      }

      urlParams.set(key, value);
  }

  if(!hasSource) {
    urlParams.set('source', 'direto');
  }

  return urlParts[0] + "?" + urlParams.toString();
}

if(hasUtmsParams()) {
  params = getParamsFromUrl();
  saveTrackingLocal(params);
}

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("a");

  links.forEach((link) => {
    if(link.href.length > 0) {
      if(!link.href.startsWith("tap:") && !link.href.startsWith('java') && !link.href.includes("#")) {

          link.addEventListener("click", function (event) {
            event.preventDefault();
            let url = new URL(link.href);
      
            params = getTrackingParams();
            url = addParamsToUrl(url.toString(), params);
      
            window.location.href = url.toString();   
          });
        }        
      }
  });
});