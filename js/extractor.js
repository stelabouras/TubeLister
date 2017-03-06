if(!window.TubeListerExtractor) {

    (function() {

      var TubeListerExtractor = {

        extract : function(recipient) {

            var playlistElement = document.querySelector('[data-list-title]');

            var videoIds = [];
            
            if(playlistElement) {

                if(
                    // Make sure we are only extracting videos from
                    // the 'Untitled list' playlists
                    playlistElement.dataset.listTitle.localeCompare('Untitled list') == 0 &&
                    // Make sure the playlist is not shared
                    playlistElement.dataset.shareable.localeCompare('False') == 0 ) {

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
            else
                videoIds.push(document.querySelector('[data-video-id]').dataset.videoId);

            return videoIds;
        }
      };

      window.TubeListerExtractor = TubeListerExtractor;

    })(window);
}

TubeListerExtractor.extract();