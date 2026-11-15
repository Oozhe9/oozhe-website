const players = [];
let audioContext = null;
let currentPlayer = null;

document.querySelectorAll(".player").forEach((player) => {

  const audio = new Audio(player.dataset.audio);
  const canvas = player.querySelector(".waveform");
  const ctx = canvas.getContext("2d");

  const playerData = {
    player,
    audio,
    canvas,
    ctx,
    source: null,
    analyser: null,
    animationId: null
  };

  players.push(playerData);

  player.addEventListener("click", async () => {

    // Pause the current track if clicked again
    if (currentPlayer === playerData && !audio.paused) {
      audio.pause();
      player.classList.remove("playing");

      if (playerData.animationId) {
        cancelAnimationFrame(playerData.animationId);
      }

      currentPlayer = null;
      return;
    }

    // Stop every other track
    players.forEach((other) => {
      if (other !== playerData) {
        other.audio.pause();
        other.audio.currentTime = 0;
        other.player.classList.remove("playing");

        if (other.animationId) {
          cancelAnimationFrame(other.animationId);
        }
      }
    });

    // Create audio analyser
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    if (!playerData.source) {
      playerData.source =
        audioContext.createMediaElementSource(audio);

      playerData.analyser =
        audioContext.createAnalyser();

      playerData.analyser.fftSize = 512;

      playerData.source.connect(playerData.analyser);
      playerData.analyser.connect(audioContext.destination);
    }

    await audioContext.resume();

    try {
      await audio.play();

      player.classList.add("playing");
      currentPlayer = playerData;

      drawWaveform(playerData);

    } catch (error) {
      console.error("Audio error:", error);
      player.classList.remove("playing");
    }

  });

  audio.addEventListener("ended", () => {

    player.classList.remove("playing");

    if (playerData.animationId) {
      cancelAnimationFrame(playerData.animationId);
    }

    if (currentPlayer === playerData) {
      currentPlayer = null;
    }

  });

});


function drawWaveform(playerData) {

  const {
    player,
    audio,
    canvas,
    ctx,
    analyser
  } = playerData;

  const draw = () => {

    if (audio.paused || !player.classList.contains("playing")) {
      return;
    }

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Match canvas resolution to visible size
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const data = new Uint8Array(
      analyser.frequencyBinCount
    );

    analyser.getByteTimeDomainData(data);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();

    const sliceWidth =
      width / (data.length - 1);

    data.forEach((value, i) => {

      const x = i * sliceWidth;

      const y =
        (value / 255) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

    });

    ctx.stroke();

    playerData.animationId =
      requestAnimationFrame(draw);

  };

  draw();

}