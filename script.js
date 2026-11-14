const players = document.querySelectorAll(".player");

let currentAudio = null;
let currentPlayer = null;

players.forEach((player) => {
  const audioPath = player.dataset.audio;
  const audio = new Audio(audioPath);

  player.addEventListener("click", () => {

    // If clicking the currently playing track, pause it
    if (currentPlayer === player && !audio.paused) {
      audio.pause();
      player.classList.remove("playing");
      return;
    }

    // Stop previous track
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (currentPlayer) {
      currentPlayer.classList.remove("playing");
    }

    // Play selected track
    audio.play()
      .then(() => {
        player.classList.add("playing");
        currentAudio = audio;
        currentPlayer = player;
      })
      .catch((error) => {
        console.error("Audio error:", error);
        alert("Couldn't play this track. Check the filename.");
      });

  });

  // When track finishes
  audio.addEventListener("ended", () => {
    player.classList.remove("playing");
    currentAudio = null;
    currentPlayer = null;
  });

});