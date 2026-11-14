document.addEventListener("DOMContentLoaded", () => {

    const players = document.querySelectorAll(".player");
  
    players.forEach((player) => {
  
      const audioFile = player.dataset.audio;
      const canvas = player.querySelector(".waveform");
  
      if (!canvas) return;
  
      const waveSurfer = WaveSurfer.create({
        container: canvas,
        waveColor: "#555",
        progressColor: "#111",
        cursorColor: "#000",
        height: 60,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        normalize: true
      });
  
      // Load the audio
      waveSurfer.load(audioFile);
  
      // Click waveform to play/pause
      player.addEventListener("click", () => {
  
        // Stop every other track
        players.forEach((otherPlayer) => {
          if (otherPlayer.waveSurfer && otherPlayer !== player) {
            otherPlayer.waveSurfer.pause();
          }
        });
  
        waveSurfer.playPause();
      });
  
      // Save WaveSurfer on the player
      player.waveSurfer = waveSurfer;
  
    });
  
  });