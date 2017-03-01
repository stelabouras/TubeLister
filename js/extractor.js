if(!window.TubeListerExtractor) {

    (function() {

      var TubeListerExtractor = {

        extract : function(recipient) {

            var playlistElement = document.querySelector('[data-list-title]');

            // Make sure we are only extracting videos from
            // the 'Untitled list' playlists
            if(playlistElement.dataset.listTitle.localeCompare('Untitled list') != 0)
                return [];

            // Make sure the playlist is not shared
            if(playlistElement.dataset.shareable.localeCompare('False') != 0)
                return [];

            var videoIds = [];

            document.querySelectorAll('#playlist-autoscroll-list li').forEach(function(element) { 
                videoIds.push(element.dataset.videoId);
            });

            return videoIds;
        },
      };

      window.TubeListerExtractor = TubeListerExtractor;

    })(window);
}

TubeListerExtractor.extract();