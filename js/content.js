let scripts = document.querySelectorAll('script');
var foundPlaylist = false;

for (var i = 0; i < scripts.length; i++) {
	let scriptText = scripts[i].innerText.trim();
	let ytInitialDataText = 'var ytInitialData = ';
	let index = scriptText.indexOf(ytInitialDataText);

	if (index == -1 )
		continue;

	let ytInitialData = JSON.parse(scriptText.substring(ytInitialDataText.length).split(/\n/)[0].trim().slice(0, -1));

	if (typeof ytInitialData != 'undefined' && 
		typeof ytInitialData.contents != 'undefined' &&
		typeof ytInitialData.contents.twoColumnWatchNextResults != 'undefined' &&
		typeof ytInitialData.contents.twoColumnWatchNextResults.playlist != 'undefined' &&
		typeof ytInitialData.contents.twoColumnWatchNextResults.playlist.playlist.contents != 'undefined') {
		var videos = [];
		let contents = ytInitialData.contents.twoColumnWatchNextResults.playlist.playlist.contents;

		for (var i = 0; i < contents.length; i++) {
			if (typeof contents[i].playlistPanelVideoRenderer == 'undefined') {
				continue;
			}

			var videoId = contents[i].playlistPanelVideoRenderer.videoId;
			var channelName = contents[i].playlistPanelVideoRenderer.shortBylineText.runs[0].text ?? '';

			videos.push({
				'videoId': videoId,
				'channelName': channelName,
				'type': 0
			});
		}

		document.body.dataset.videos = JSON.stringify(videos);
		foundPlaylist = true;
	}

	break;
}

if (!foundPlaylist
	&& document.querySelector('meta[itemprop="videoId"]') != null) {
	document.body.dataset.videos = JSON.stringify([{
		'videoId': document.querySelector('meta[itemprop="videoId"]').content,
		'channelName': document.querySelector('span[itemprop=author] link[itemprop=name]') ? document.querySelector('span[itemprop=author] link[itemprop=name]').getAttribute('content') : '',
		'type': 1,
	}]);
}