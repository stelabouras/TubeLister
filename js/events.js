chrome.action.onClicked.addListener((tab) => { 
	chrome.windows.getCurrent((window) => {
		var maxPlaylistVideos = 50;
		var currentWindowId   = window.id;

		chrome.tabs.query(
			{}, 
			(tabs) => {
			if (!tabs)
				return;

			var videos = [];
			var tabIdsToClose = [];
			var activeTabVideos = [];

			var isYoutubeVideoId = (videoId) => { 
				return videoId.match(/^[A-Za-z0-9_-]{11}$/);
			};

			var extract = (youtube_url) => {
				var videoIdFromURL = (url) => {
					var video_id = url.split('v=')[1];
					var ampersandPosition = video_id.indexOf('&');

					if (ampersandPosition != -1)
						video_id = video_id.substring(0, ampersandPosition);

					return video_id;
				};

				let channelName = document.querySelector('span[itemprop=author] link[itemprop=name]') ? document.querySelector('span[itemprop=author] link[itemprop=name]').getAttribute('content') : '';
				var playlistElement = document.querySelector('#content ytd-playlist-panel-renderer#playlist');
				var videos = [];

				if (typeof document.body.dataset.videos != 'undefined') {
					videos = JSON.parse(document.body.dataset.videos);
				}
				else if (playlistElement 
						&& playlistElement.querySelector('#header-description h3 .title').innerText != null
						&& (playlistElement.querySelector('#header-description h3 .title').innerText.toLowerCase().localeCompare('untitled list') == 0
							|| playlistElement.querySelector('#header-description h3 .title').innerText.toLowerCase().localeCompare('tubelister') == 0)) {
					var currentlyPlaying = null;

					playlistElement.querySelectorAll('#items ytd-playlist-panel-video-renderer').forEach(function(element) { 
						let videoId = videoIdFromURL(element.querySelector('a#wc-endpoint').href);
						let channelName = element.querySelector('span#byline').innerText;

						let video = {
							'videoId': videoId,
							'channelName': channelName,
							'type': 2
						};

						if (element.selected)
							currentlyPlaying = video;
						else
							videos.push(video);
					});

					// Get the currently playing video first
					// on the list
					if (currentlyPlaying)
						videos.unshift(currentlyPlaying);
				}
				else if (document.querySelector('meta[itemprop="videoId"]')) {
					videos.push({
						'videoId': document.querySelector('meta[itemprop="videoId"]').content,
						'channelName': channelName,
						'type': 3
					});
				}
				else {
					videos.push({
						'videoId': videoIdFromURL(youtube_url),
						'channelName': channelName,
						'type': 4
					});
				}

				return videos;
			};

			var compressTabs = () => {
				var hasActiveYoutubeTab = false;

				if (activeTabVideos.length > 0) {
					hasActiveYoutubeTab = true;

					for (var i = activeTabVideos.length - 1; i >= 0; i--) {
						var video = activeTabVideos[i];

						if (videos.indexOf(video) == -1)
							videos.unshift(video);
					}
				}

				if (tabIdsToClose.length <= 1)
					return;

				if (videos.length < 2)
					return;

				var playlistName = videos[0].channelName;

				for (var i = 1; i < videos.length; i++) {
					let video = videos[i];

					if (video.channelName.localeCompare(playlistName) == 0)
						continue;
					else {
						playlistName = 'TubeLister';
						break;
					}
				}

				console.log('Compressing ' + videos.length + ' videos into the ' + playlistName + ' playlist...');

				let url = 'https://www.youtube.com/watch_videos?title=' + playlistName + '&video_ids=' + videos.map(video => video.videoId).join(',');

				tabIdsToClose.forEach((tabId) => {  chrome.tabs.remove(tabId); });

				chrome.tabs.create({
					'url' : url,
					'active' : hasActiveYoutubeTab
				});
			};

			var extractVideosFromInjectionResults = (results) => {
				var videos = [];

				for (var i = 0; i < results.length; i++) {
					let result = results[i];

					if (result.result == null || result.result.length == 0)
						continue;

					videos = result.result;
					break;
				}

				return videos;
			};

			var advanceProcessTabsAndCompress = () => {
				processedTabCount += 1;

				if (processedTabCount < totalTabCount)
					return;

				compressTabs();
			};

			var totalTabCount = tabs.length;
			var processedTabCount = 0;

			tabs.forEach((tab) => {
				if (tab.url.startsWith('view-source:')){
					advanceProcessTabsAndCompress();
					return;
				}

				var urlParts = tab.url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/|\&|\#)/);

				if (urlParts == null) {
					advanceProcessTabsAndCompress();
					return;
				}

				if (urlParts.length < 3) {
					advanceProcessTabsAndCompress();
					return;
				}

				// Check if we are on the YouTube domain
				var isYoutubeDomain = false;

				if (urlParts[0].includes('youtube.com') || urlParts[0].includes('youtu.be'))
					isYoutubeDomain = true;
				else if (urlParts[1].includes('youtube.com') || urlParts[1].includes('youtu.be'))
					isYoutubeDomain = true;

				if (!isYoutubeDomain) {
					advanceProcessTabsAndCompress();
					return;
				}

				var isActiveTab = (tab.active && tab.windowId == currentWindowId);

				chrome.scripting.executeScript({
					target: {tabId: tab.id, allFrames: true},
					func: extract,
					args: [tab.url],
				}, (injectionResults) => {
					let extractedVideos = extractVideosFromInjectionResults(injectionResults);

					if (extractedVideos.length == 0) {
						advanceProcessTabsAndCompress();
						return;
					}

					var videosToAdd = [];

					// Check for duplicates
					extractedVideos.forEach((video) => {
						if (!isYoutubeVideoId(video.videoId))
							return;

						if (videos.indexOf(video) == -1)
							videosToAdd.push(video);
					});

					if (videosToAdd.length == maxPlaylistVideos) {
						advanceProcessTabsAndCompress();
						return;
					}

					if (videosToAdd.length + videos.length > maxPlaylistVideos) {
						advanceProcessTabsAndCompress();
						return;
					}

					tabIdsToClose.push(tab.id);

					videosToAdd.forEach((video) => { 
						if (isActiveTab)
							activeTabVideos.push(video);
						else
							videos.push(video); 
					});

					advanceProcessTabsAndCompress();
				});
			});
		});
	});
});
