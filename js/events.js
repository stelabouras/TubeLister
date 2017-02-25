chrome.browserAction.onClicked.addListener(() => { 

  if (!window.chrome)
    return;

  chrome.tabs.query(
    {}, 
    (tabs) => {

      if(!tabs)
        return;

      var videoIds = [];
      var tabIdsToClose = [];

      tabs.forEach((tab) => {

        var videoid = tab.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);

        if(videoid == null)
          return;

        if(videoid.length > 1 && !tab.url.includes('list=')) {

          videoIds.push(videoid[1]);
          tabIdsToClose.push(tab.id);
        }
      });

      if(videoIds.length <= 1)
        return;

      tabIdsToClose.forEach((tabId) => { chrome.tabs.remove(tabId); });

      var url = 'http://www.youtube.com/watch_videos?video_ids=' + videoIds.join(',');

      chrome.tabs.create({ 'url' : url });                
  });
});
