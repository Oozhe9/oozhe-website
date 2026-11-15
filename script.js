const players = document.querySelectorAll(".player");

let currentAudio = null;
let currentPlayer = null;

players.forEach((player) => {

  const audio = new Audio(player.dataset.audio);

  player.addEventListener("click", () => {

    // If this track is already playing, pause it
    if (currentPlayer === player && !audio.paused) {
      audio.pause();
      player.classList.remove("playing");

      currentAudio = null;
      currentPlayer = null;

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
        alert("Couldn't play this track: " + player.dataset.audio);
      });

  });

  audio.addEventListener("ended", () => {

    player.classList.remove("playing");

    if (currentPlayer === player) {
      currentAudio = null;
      currentPlayer = null;
    }

  });

});