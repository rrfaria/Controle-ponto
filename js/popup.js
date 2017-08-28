

$('#options--settings').click(function(){
    chrome.tabs.create({'url': 'main.html'});
})

$('#options--dashboard').click(function() {
    chrome.tabs.create({'url': 'dashboard.html'});
});

