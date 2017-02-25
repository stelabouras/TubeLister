chrome.browserAction.onClicked.addListener(function() { 

  if (!window.chrome)
    return;

  chrome.tabs.query(
    {}, 
    (tabs) => {

      if(!tabs)
        return;

      var videoIds = [];

      tabs.forEach(function(tab) {

        var videoid = tab.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);

        if(videoid == null)
          return;

        if(videoid.length > 1 && !tab.url.includes('list=')) {

          videoIds.push(videoid[1]);
          chrome.tabs.remove(tab.id);
        }
      });

      if(videoIds.length == 0)
        return;

      var url = 'http://www.youtube.com/watch_videos?video_ids=' + videoIds.join(',');

      chrome.tabs.create({ 'url' : url });                
  });
});
