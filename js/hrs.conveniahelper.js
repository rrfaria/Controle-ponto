chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    if (request.type == "UPDATE_FROM_CONVENIA"){
      localStorage.setItem(request.dia, $.toJSON(request.data));
      location.reload();
      sendResponse({import: "ok"});
    }
  });