chrome.browserAction.onClicked.addListener(() => { 

  chrome.windows.getCurrent((window) => {

    var maxPlaylistVideos = 50;
    var currentWindowId   = window.id;

    chrome.tabs.query(
      {}, 
      (tabs) => {

      if(!tabs)
        return;

      var videoIds = [];
      var tabIdsToClose = [];
      var fulfilledTabs = [];
      var activeTabVideoIds = [];

      var isYoutubeVideoId = (videoId) => { return videoId.match(/^[A-Za-z0-9_-]{11}$/); };

      var compressTabs = () => {

        if(fulfilledTabs.length > 0)
          return;

        var hasActiveYoutubeTab = false;

        if(activeTabVideoIds.length > 0) {

          hasActiveYoutubeTab = true;

          for(var i = activeTabVideoIds.length - 1; i >= 0; i--) {

            var videoId = activeTabVideoIds[i];

            if(videoIds.indexOf(videoId) == -1)
              videoIds.unshift(videoId);
          }
        }

        if(tabIdsToClose.length <= 1)
          return;

        tabIdsToClose.forEach((tabId) => {  chrome.tabs.remove(tabId); });

        var url = 'https://www.youtube.com/watch_videos?title=TubeLister&video_ids=' + videoIds.join(',');

        chrome.tabs.create({ 
          'url' : url,
          'active' : hasActiveYoutubeTab
        });     
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

        var isActiveTab = (tab.active && tab.windowId == currentWindowId);

        fulfilledTabs.push(tab.id);

        chrome.tabs.executeScript(tab.id, {
          file: "js/extractor.js",
          runAt: "document_end"
        }, (result) => {

          fulfilledTabs.splice(fulfilledTabs.indexOf(tab.id), 1);

          if(result.length == 0)
            return;

          if(result[0].length == 0)
            return;

          var playlistVideos = result[0];

          var videosToAdd = [];

          // Check for duplicates
          playlistVideos.forEach((videoId) => {

            if(!isYoutubeVideoId(videoId))
              return;

            if(videoIds.indexOf(videoId) == -1)
              videosToAdd.push(videoId);
          });

          if(videosToAdd.length == maxPlaylistVideos) {

            compressTabs();
            return;
          }

          if(videosToAdd.length + videoIds.length > maxPlaylistVideos) {

            compressTabs();
            return;
          }

          tabIdsToClose.push(tab.id);

          videosToAdd.forEach((videoId) => { 

            if(isActiveTab)
              activeTabVideoIds.push(videoId);
            else
              videoIds.push(videoId); 
          });
    
          compressTabs();

        });

      });
         
    });

  });

});
