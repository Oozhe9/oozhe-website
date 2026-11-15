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

    /* PAUSE CURRENT TRACK */
    if (currentPlayer === playerData && !audio.paused) {
      audio.pause();

      player.classList.remove("playing");

      if (playerData.animationId) {
        cancelAnimationFrame(playerData.animationId);
        playerData.animationId = null;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      currentPlayer = null;
      return;
    }


    /* STOP ALL OTHER TRACKS */
    players.forEach((other) => {
      if (other !== playerData) {
        other.audio.pause();
        other.audio.currentTime = 0;

        other.player.classList.remove("playing");

        if (other.animationId) {
          cancelAnimationFrame(other.animationId);
          other.animationId = null;
        }

        other.ctx.clearRect(
          0,
          0,
          other.canvas.width,
          other.canvas.height
        );
      }
    });


    /* CREATE AUDIO CONTEXT */
    if (!audioContext) {
      audioContext = new AudioContext();
    }


    /* CONNECT TRACK ONCE */
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

    player.classList.add("playing");
    currentPlayer = playerData;


    try {
      await audio.play();
    } catch (error) {
      console.error("Audio error:", error);

      player.classList.remove("playing");
      currentPlayer = null;

      return;
    }


    const draw = () => {

      if (
        audio.paused ||
        !player.classList.contains("playing")
      ) {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        return;
      }


      /* EXACT SIZE OF PLAYER */
      const width = player.offsetWidth;
      const height = player.offsetHeight;


      /* KEEP CANVAS INTERNAL SIZE MATCHED */
      canvas.width = width;
      canvas.height = height;


      const data = new Uint8Array(
        playerData.analyser.frequencyBinCount
      );

      playerData.analyser.getByteTimeDomainData(data);

      ctx.clearRect(0, 0, width, height);


      /* WHITE WAVEFORM */
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctx.beginPath();


      /* PADDING FOR ROUNDED ENDS */
      const padding = ctx.lineWidth / 2;


      data.forEach((value, i) => {

        const x =
          padding +
          i *
            ((width - padding * 2) /
              (data.length - 1));

        const y = (value / 255) * height;

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

  });


  /* TRACK FINISHED */
  audio.addEventListener("ended", () => {

    player.classList.remove("playing");

    if (playerData.animationId) {
      cancelAnimationFrame(playerData.animationId);
      playerData.animationId = null;
    }

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (currentPlayer === playerData) {
      currentPlayer = null;
    }

  });

});