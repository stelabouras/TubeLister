if(!window.TubeListerExtractor) {

    (function() {

      var TubeListerExtractor = {

        extractVideoIdFromURL : function(youtube_url) {

            var video_id = youtube_url.split('v=')[1];
            var ampersandPosition = video_id.indexOf('&');

            if(ampersandPosition != -1)
              video_id = video_id.substring(0, ampersandPosition);
        
            return video_id;
        },

        extract : function() {

            var playlistElement = document.querySelector('[data-list-title]');
            var newPlaylistElement = document.querySelector('ytd-playlist-panel-renderer');

            var videoIds = [];
            
            if(playlistElement) {

                // Make sure we are only extracting videos from
                // the 'Untitled list' or 'TubeLister' playlists                    
                var playlistTitle = playlistElement.dataset.listTitle.toLowerCase();

                if( playlistTitle.localeCompare('untitled list') == 0 || 
                    playlistTitle.localeCompare('tubelister') == 0 ) {

                    var currentlyPlaying = null;

                    document.querySelectorAll('#playlist-autoscroll-list li').forEach(function(element) { 

                        if(element.className.indexOf('currently-playing') > -1)
                            currentlyPlaying = element.dataset.videoId;
                        else
                            videoIds.push(element.dataset.videoId);
                    });

                    // Get the currently playing video first
                    // on the list
                    if(currentlyPlaying)
                        videoIds.unshift(currentlyPlaying);
                }
            }
            else if(!newPlaylistElement.hidden) {

                var playlistTitle = document.querySelector('ytd-playlist-panel-renderer h3.ytd-playlist-panel-renderer yt-formatted-string').innerText.toLowerCase();

                if( playlistTitle.localeCompare('untitled list') == 0 || 
                    playlistTitle.localeCompare('tubelister') == 0 ) {

                    var currentlyPlaying = null;

                    document.querySelectorAll('ytd-playlist-panel-renderer ytd-playlist-panel-video-renderer').forEach((element) => { 

                        if(element.selected)
                            currentlyPlaying = element.dataset.videoId;
                        else
                            videoIds.push(this.extractVideoIdFromURL(element.querySelector('a').href));
                    });

                    // Get the currently playing video first
                    // on the list
                    if(currentlyPlaying)
                        videoIds.unshift(currentlyPlaying);
                }
            }
            else if(document.querySelector('meta[itemprop="videoId"]'))
                videoIds.push(document.querySelector('meta[itemprop="videoId"]').content);
            else if(document.querySelector('a.ytp-title-link'))
                videoIds.push(this.extractVideoIdFromURL(document.querySelector('a.ytp-title-link').href));

            return videoIds;
        }
      };

      window.TubeListerExtractor = TubeListerExtractor;

    })(window);
}

TubeListerExtractor.extract();