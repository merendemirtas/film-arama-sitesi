const API_KEY = "5d37b7b2";
const aramaKutusu = document.getElementById("aramaKutusu");
const sonuclarDiv = document.getElementById("sonuclar");
const filmDetayDiv = document.getElementById("filmDetay");
const favorilerDiv = document.getElementById("favoriler");
const yorumKutusu = document.getElementById("yorumKutusu");
const yorumInput = document.getElementById("yorumInput");
const yorumBaslik = document.getElementById("yorumFilmBaslik");

let secilenFilmId = null;

function filmAra() {
  const arama = aramaKutusu.value;
  if (arama.trim() === "") return;

  fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${arama}`)
    .then(res => res.json())
    .then(data => {
      sonuclarDiv.innerHTML = "";
      if (data.Response === "True") {
        data.Search.forEach(film => {
          const filmDiv = document.createElement("div");
          filmDiv.className = "film";
          filmDiv.innerHTML = `
            <img src="${film.Poster !== "N/A" ? film.Poster : "https://via.placeholder.com/200x300"}" alt="${film.Title}">
            <h3>${film.Title}</h3>
            <button class="favori-btn" onclick="favorilereEkle('${film.imdbID}', '${film.Title}', '${film.Poster}')">Favorilere Ekle</button>
          `;
          filmDiv.addEventListener("click", () => filmDetayiniGetir(film.imdbID));
          sonuclarDiv.appendChild(filmDiv);
        });
      } else {
        sonuclarDiv.innerHTML = "<p>Sonuç bulunamadı.</p>";
      }
    });
}

function filmDetayiniGetir(id) {
  fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`)
    .then(res => res.json())
    .then(data => {
      secilenFilmId = id;
      filmDetayDiv.innerHTML = `
        <img src="${data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/200x300"}" alt="${data.Title}">
        <h2>${data.Title}</h2>
        <p><strong>Yıl:</strong> ${data.Year}</p>
        <p><strong>Tür:</strong> ${data.Genre}</p>
        <p><strong>Oyuncular:</strong> ${data.Actors}</p>
        <p><strong>Konu:</strong> ${data.Plot}</p>
        <div class="puanlama">
          ${[1,2,3,4,5].map(i => `<span onclick="puanVer(${i})">&#9733;</span>`).join("")}
        </div>
        <button onclick="yorumYaz('${data.Title}')">Yorum Yaz</button>
        <div id="filmYorumlari">${yorumlariGetir(id)}</div>
      `;
      puaniGoster(id);
    });
}

function favorilereEkle(id, title, poster) {
  let favoriler = JSON.parse(localStorage.getItem("favoriler")) || [];
  if (!favoriler.some(f => f.id === id)) {
    favoriler.push({ id, title, poster });
    localStorage.setItem("favoriler", JSON.stringify(favoriler));
    favorileriGoster();
  }
}

function favorileriGoster() {
  favorilerDiv.innerHTML = "";
  const favoriler = JSON.parse(localStorage.getItem("favoriler")) || [];
  if (favoriler.length === 0) {
    favorilerDiv.innerHTML = "<p>Favori yok.</p>";
    return;
  }
  favoriler.forEach(film => {
    const div = document.createElement("div");
    div.className = "film";
    div.innerHTML = `
      <img src="${film.poster !== "N/A" ? film.poster : "https://via.placeholder.com/200x300"}" alt="${film.title}">
      <h3>${film.title}</h3>
      <button class="favori-btn" onclick="favoridenKaldir('${film.id}')">Kaldır</button>
    `;
    div.addEventListener("click", () => filmDetayiniGetir(film.id));
    favorilerDiv.appendChild(div);
  });
}

function favoridenKaldir(id) {
  let favoriler = JSON.parse(localStorage.getItem("favoriler")) || [];
  favoriler = favoriler.filter(f => f.id !== id);
  localStorage.setItem("favoriler", JSON.stringify(favoriler));
  favorileriGoster();
}

function temayiDegistir() {
  document.body.classList.toggle("light");
  const temaBtn = document.getElementById("temaButonu");
  if (document.body.classList.contains("light")) {
    temaBtn.textContent = "🌞";
  } else {
    temaBtn.textContent = "🌙";
  }
}

function puanVer(puan) {
  if (!secilenFilmId) return;
  localStorage.setItem(`puan_${secilenFilmId}`, puan);
  puaniGoster(secilenFilmId);
}

function puaniGoster(id) {
  const puan = localStorage.getItem(`puan_${id}`);
  const yildizlar = document.querySelectorAll(".puanlama span");
  yildizlar.forEach((yildiz, index) => {
    yildiz.classList.toggle("dolu", index < puan);
  });
}

function yorumYaz(filmAdi) {
  yorumKutusu.style.display = "block";
  yorumBaslik.textContent = `"${filmAdi}" için yorum yap`;
}

function yorumKaydet() {
  const yorum = yorumInput.value.trim();
  if (!yorum || !secilenFilmId) return;
  let yorumlar = JSON.parse(localStorage.getItem(`yorum_${secilenFilmId}`)) || [];
  yorumlar.push(yorum);
  localStorage.setItem(`yorum_${secilenFilmId}`, JSON.stringify(yorumlar));
  yorumKutusu.style.display = "none";
  yorumInput.value = "";
  filmDetayiniGetir(secilenFilmId);
}

function yorumKutusuKapat() {
  yorumKutusu.style.display = "none";
  yorumInput.value = "";
}

function yorumlariGetir(id) {
  const yorumlar = JSON.parse(localStorage.getItem(`yorum_${id}`)) || [];
  if (yorumlar.length === 0) return "<p>Yorum yok.</p>";
  return `
    <h4>Yorumlar:</h4>
    <ul>
      ${yorumlar.map(y => `<li>${y}</li>`).join("")}
    </ul>
  `;
}

// Sayfa yüklenince favoriler gösterilsin
favorileriGoster();
