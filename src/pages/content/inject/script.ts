window.addEventListener('message', function (event) {
  if (event.data.type === 'change-video-playback-time') {
    const isVideoEnded = window.player.getDuration() === window.player.getCurrentTime();

    if (isVideoEnded) {
      window.player.play();
    }

    window.player.seek(parseInt(event.data.data));
  }
});
