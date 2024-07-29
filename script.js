const formEl = document.querySelector("form");
const searchInputEl = document.querySelector(".text");
const searchResultsEl = document.querySelector(".search-results");
const showMoreButtonEl = document.querySelector(".show-more");
const prevButtonEl = document.querySelector(".prev-button");
const nextButtonEl = document.querySelector(".next-button");
const currentTrackEl = document.querySelector(".current-track");
const currentTrackDivEl = document.querySelector(".current-track-div");
const navigationButtonsEl = document.querySelector(".navigation-buttons");

const client_id = "3a753501f0d24502b67d467c94f71dfc";
const client_secret = "e1ff8e900596433694790a1ed66dcf2a";
let page = 1;
let access_token;
let currentAudio = null;
let currentTrackIndex = -1;
let allTracks = [];

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
  allTracks = await searchTracks(inputData);
  searchResultsEl.innerHTML = "";
  displayTracks(allTracks);
  currentTrackDivEl.style.display = "flex";
  navigationButtonsEl.style.display = "flex";
  currentTrackIndex = -1;
});

showMoreButtonEl.addEventListener("click", async () => {
  page++;
  const inputData = searchInputEl.value;
  const newTracks = await searchTracks(inputData);
  allTracks = [...allTracks, ...newTracks];
  displayTracks(newTracks);
});

prevButtonEl.addEventListener("click", () => {
  if (currentTrackIndex > 0) {
    playTrack(currentTrackIndex - 1);
  }
});

nextButtonEl.addEventListener("click", () => {
  if (currentTrackIndex < allTracks.length - 1) {
    playTrack(currentTrackIndex + 1);
  }
});

function displayTracks(tracks) {
  tracks.forEach((track, index) => {
    const audioWrapper = document.createElement("div");
    audioWrapper.classList.add("search-result");

    const img = document.createElement("img");
    img.src = track.album.images[0].url;
    img.alt = track.name;
    audioWrapper.appendChild(img);

    const text = document.createElement("p");
    text.textContent = track.name;
    audioWrapper.appendChild(text);

    const artist = document.createElement("p");
    artist.textContent = track.artists[0].name;
    audioWrapper.appendChild(artist);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const playButton = document.createElement("button");
    playButton.textContent = "Play";
    playButton.classList.add("play-button");
    playButton.addEventListener("click", () => {
      playTrack(index);
    });
    buttonContainer.appendChild(playButton);

    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";
    stopButton.classList.add("stop-button");
    stopButton.style.display = "none";
    stopButton.addEventListener("click", stopPlayback);
    buttonContainer.appendChild(stopButton);

    const downloadButton = document.createElement("a");
    downloadButton.href = track.preview_url;
    downloadButton.download = track.name;
    downloadButton.textContent = "Download";
    downloadButton.classList.add("download-button");
    buttonContainer.appendChild(downloadButton);

    audioWrapper.appendChild(buttonContainer);
    searchResultsEl.appendChild(audioWrapper);
  });

  showMoreButtonEl.style.display = tracks.length > 0 ? "block" : "none";
}

function playTrack(index) {
  const track = allTracks[index];
  if (!track.preview_url) {
    alert("This track does not have a preview URL.");
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(track.preview_url);
  currentAudio.play();
  currentTrackIndex = index;

  currentTrackEl.innerHTML = `<b>Now Playing<b>: ${track.name} by ${track.artists[0].name}`;

  const playButtons = document.querySelectorAll(".play-button");
  const stopButtons = document.querySelectorAll(".stop-button");

  playButtons.forEach((button, i) => {
    button.style.display = i === index ? "none" : "block";
  });

  stopButtons.forEach((button, i) => {
    button.style.display = i === index ? "block" : "none";
  });

  currentAudio.onended = () => {
    playButtons[index].style.display = "block";
    stopButtons[index].style.display = "none";
    if (currentTrackIndex < allTracks.length - 1) {
      playTrack(currentTrackIndex + 1);
    }
  };
}

function stopPlayback() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;

    const playButtons = document.querySelectorAll(".play-button");
    const stopButtons = document.querySelectorAll(".stop-button");

    playButtons.forEach((button) => {
      button.style.display = "block";
    });

    stopButtons.forEach((button) => {
      button.style.display = "none";
    });

    currentTrackEl.textContent = "";
  }
}
