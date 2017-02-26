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

        // Exclude any YouTube videos that 
        // are already part of a playlist
        if(tab.url.includes('list='))
          return;

        var urlParts = tab.url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/|\&|\#)/);

        if(urlParts == null)
          return;

        if(urlParts.length < 3)
          return;

        // Check if we are on the YouTube domain
        var isYoutubeDomain = false;

        if(urlParts[0].includes('youtube.com') || urlParts[0].includes('youtu.be'))
          isYoutubeDomain = true;
        else if(urlParts[1].includes('youtube.com') || urlParts[1].includes('youtu.be'))
          isYoutubeDomain = true;

        if(!isYoutubeDomain)
          return;

        var videoId = urlParts[2];

        // Last sanity check
        if(!videoId.match(/^[A-Za-z0-9_-]{11}$/))
          return;

        videoIds.push(videoId);
        tabIdsToClose.push(tab.id);
      });

      if(videoIds.length <= 1)
        return;

      tabIdsToClose.forEach((tabId) => { chrome.tabs.remove(tabId); });

      var url = 'http://www.youtube.com/watch_videos?video_ids=' + videoIds.join(',');

      chrome.tabs.create({ 'url' : url });                
  });
});
