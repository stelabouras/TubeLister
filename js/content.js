var scripts = document.querySelectorAll('script');

for(var i = 0; i < scripts.length; i++) {

	var scriptText = scripts[i].innerText.trim();

	var ytInitialDataText = 'window["ytInitialData"] = ';

	var index = scriptText.indexOf(ytInitialDataText);

	if(index != 0)
		continue;

	var ytInitialData = JSON.parse(scriptText.substring(ytInitialDataText.length).split(/\n/)[0].trim().slice(0, -1));

	if( typeof ytInitialData != 'undefined' && 
		typeof ytInitialData.contents.twoColumnWatchNextResults.playlist != 'undefined' &&
		typeof ytInitialData.contents.twoColumnWatchNextResults.playlist.playlist.contents != 'undefined') {

		var videoIds = [];

		for(var i = 0; i < ytInitialData.contents.twoColumnWatchNextResults.playlist.playlist.contents.length; i++) {

			var videoId = ytInitialData.contents.twoColumnWatchNextResults.playlist.playlist.contents[i].playlistPanelVideoRenderer.videoId;

			videoIds.push(videoId);
		}

		document.body.dataset.videos = JSON.stringify(videoIds);
	}

	break;
}
