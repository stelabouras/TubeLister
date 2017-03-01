chrome.browserAction.onClicked.addListener(() => { 

  chrome.windows.getCurrent((window) => {

    var currentWindowId = window.id;

    chrome.tabs.query(
      {}, 
      (tabs) => {

        if(!tabs)
          return;

        var videoIds = [];
        var tabIdsToClose = [];
        var fulfilledPlaylists = [];
        var activeTabVideoId = null;

        var compressTabs = () => {

          if(fulfilledPlaylists.length > 0)
            return;

          if(activeTabVideoId && videoIds.indexOf(activeTabVideoId) == -1)
            videoIds.unshift(activeTabVideoId);

          if(tabIdsToClose.length <= 1)
            return;

          tabIdsToClose.forEach((tabId) => { chrome.tabs.remove(tabId); });

          var url = 'http://www.youtube.com/watch_videos?video_ids=' + videoIds.join(',');

          chrome.tabs.create({ 'url' : url });     
        };
      
        tabs.forEach((tab) => {

          if(tab.url.startsWith('view-source:'))
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

          // Extract any videos from playlists
          if(tab.url.includes('list=')) {

            fulfilledPlaylists.push(tab.id);

            chrome.tabs.executeScript(tab.id, {
              file: "js/extractor.js",
              runAt: "document_end"
            }, (result) => {

              fulfilledPlaylists.splice(fulfilledPlaylists.indexOf(tab.id), 1);

              if(result.length == 1 && result[0].length > 0) {

                tabIdsToClose.push(tab.id);

                result[0].forEach((videoId) => {

                  // Last sanity check
                  if(!videoId.match(/^[A-Za-z0-9_-]{11}$/))
                    return;

                  if(videoIds.indexOf(videoId) == -1)
                    videoIds.push(videoId);
                });
              }
        
              compressTabs();
            });

            return;
          }

          var videoId = urlParts[2];

          // Last sanity check
          if(!videoId.match(/^[A-Za-z0-9_-]{11}$/))
            return;

          if(tab.active && tab.windowId == currentWindowId)
            activeTabVideoId = videoId;
          else if(videoIds.indexOf(videoId) == -1)
            videoIds.push(videoId);

          tabIdsToClose.push(tab.id);
        });

        compressTabs();           
    });
  });
});
