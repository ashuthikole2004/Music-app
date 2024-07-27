const formEl = document.querySelector("form");
const searchInputEl = document.querySelector(".text");
const searchResultsEl = document.querySelector(".search-results");
const showMoreButtonEl = document.querySelector(".show-more");

const client_id = "3a753501f0d24502b67d467c94f71dfc";
const client_secret = "e1ff8e900596433694790a1ed66dcf2a";
let page = 1;
let access_token;
let currentAudio = null;
let currentPlayButton = null;
let currentWrapper = null;

// Authenticate with Spotify API
async function authenticate() {
  const url = "https://accounts.spotify.com/api/token";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(client_id + ":" + client_secret),
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  access_token = data.access_token;
}

// Search for tracks
async function searchTracks(inputData) {
  const url = `https://api.spotify.com/v1/search?q=${inputData}&type=track&limit=10&offset=${
    (page - 1) * 10
  }`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const data = await response.json();
  return data.tracks.items;
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  page = 1;
  await authenticate();
  const inputData = searchInputEl.value;
  const tracks = await searchTracks(inputData);
  searchResultsEl.innerHTML = "";
  displayTracks(tracks);
});

showMoreButtonEl.addEventListener("click", async () => {
  page++;
  const inputData = searchInputEl.value;
  const tracks = await searchTracks(inputData);
  displayTracks(tracks);
});

function displayTracks(tracks) {
  tracks.forEach((track) => {
    const audioWrapper = document.createElement("div");
    audioWrapper.classList.add("search-result");

    const img = document.createElement("img");
    img.src = track.album.images[0].url;
    img.alt = track.name;
    audioWrapper.appendChild(img);

    const text = document.createElement("p");
    text.textContent = track.name;
    audioWrapper.appendChild(text);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const playButton = document.createElement("button");
    playButton.textContent = "Play";
    playButton.classList.add("play-button");
    playButton.addEventListener("click", () => {
      togglePlay(track.preview_url, playButton);
    });
    buttonContainer.appendChild(playButton);

    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";
    stopButton.classList.add("stop-button");
    stopButton.style.display = "none"; // Initially hidden
    stopButton.addEventListener("click", () => {
      stopPlayback(playButton, stopButton);
    });
    buttonContainer.appendChild(stopButton);

    const downloadButton = document.createElement("a");
    downloadButton.href = track.preview_url;
    downloadButton.download = `${track.name}.mp3`;
    downloadButton.textContent = "Download";
    downloadButton.classList.add("download-button");
    buttonContainer.appendChild(downloadButton);

    audioWrapper.appendChild(buttonContainer);
    searchResultsEl.appendChild(audioWrapper);
  });

  if (tracks.length > 0) {
    showMoreButtonEl.style.display = "block";
  } else {
    showMoreButtonEl.style.display = "none";
  }
}

function togglePlay(url, playButton) {
  if (currentAudio && currentAudio.src === url) {
    if (currentAudio.paused) {
      currentAudio.play();
      playButton.textContent = "Stop";
      currentPlayButton = playButton;
    } else {
      currentAudio.pause();
      playButton.textContent = "Play";
    }
  } else {
    if (currentAudio) {
      currentAudio.pause();
      if (currentPlayButton) {
        currentPlayButton.textContent = "Play";
      }
    }
    currentAudio = new Audio(url);
    currentAudio.play();
    playButton.textContent = "Stop";
    currentPlayButton = playButton;
  }

  currentAudio.addEventListener("ended", () => {
    playButton.textContent = "Play";
  });
}

function stopPlayback(playButton, stopButton) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    playButton.textContent = "Play";
    stopButton.style.display = "none";
  }
}
