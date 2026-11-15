const players = [];
let audioContext = null;
let currentPlayer = null;

document.querySelectorAll(".player").forEach((player) => {
  const flatline = player.querySelector(".flatline");
  const canvas = player.querySelector(".waveform");
  const audio = new Audio(player.dataset.audio);

  const ctx = canvas.getContext("2d");

  const playerData = {
    player,
    flatline,
    canvas,
    ctx,
    audio,
    source: null,
    analyser: null,
    animationId: null
  };

  players.push(playerData);

  player.addEventListener("click", async () => {

    if (currentPlayer === playerData && !audio.paused) {
      audio.pause();
      player.classList.remove("playing");
      cancelAnimationFrame(playerData.animationId);
      currentPlayer = null;
      return;
    }

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

    if (!audioContext) {
      audioContext = new AudioContext();
    }

    if (!playerData.source) {
      playerData.source = audioContext.createMediaElementSource(audio);

      playerData.analyser = audioContext.createAnalyser();
      playerData.analyser.fftSize = 512;

      playerData.source.connect(playerData.analyser);
      playerData.analyser.connect(audioContext.destination);
    }

    await audioContext.resume();

    player.classList.add("playing");
    currentPlayer = playerData;

    try {
      await audio.play();
    } catch (error) {
      console.error("Audio error:", error);
      player.classList.remove("playing");
      return;
    }

    const draw = () => {
      if (audio.paused || !player.classList.contains("playing")) {
        return;
      }

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const data = new Uint8Array(
        playerData.analyser.frequencyBinCount
      );

      playerData.analyser.getByteTimeDomainData(data);

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "#111";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctx.beginPath();

      const sliceWidth = width / (data.length - 1);

      data.forEach((value, i) => {
        const x = i * sliceWidth;
        const y = (value / 255) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      playerData.animationId = requestAnimationFrame(draw);
    };

    draw();
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