document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".art-grid");
  const modal = document.querySelector(".art-modal");
  const modalImg = document.querySelector(".art-modal__image");
  const modalTitle = document.querySelector(".art-modal__title");
  const modalArtist = document.querySelector(".art-modal__artist");
  const modalText = document.querySelector(".art-modal__description");
  const modalClose = document.querySelector(".art-modal__close");
  const modalBg = document.querySelector(".art-modal__backdrop");

  // Fermeture modal
  const closeModal = () => modal.classList.remove("is-active");
  modalClose.addEventListener("click", closeModal);
  modalBg.addEventListener("click", closeModal);

  async function fetchArt() {
    try {
      const resIDs = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11");
      const dataIDs = await resIDs.json();

      if (!dataIDs.objectIDs || dataIDs.objectIDs.length === 0) {
        grid.innerHTML = "<p>Aucune œuvre trouvée.</p>";
        return;
      }

      const arts = [];
      let i = 0;
      while (arts.length < 4 && i < dataIDs.objectIDs.length) {
        const resArt = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${dataIDs.objectIDs[i]}`);
        if (resArt.ok) {
          const art = await resArt.json();
          if (art.primaryImageSmall) {
            arts.push(art);
          }
        }
        i++;
      }

      if (arts.length === 0) {
        grid.innerHTML = "<p>Aucune œuvre avec image trouvée.</p>";
        return;
      }

      grid.innerHTML = "";

      arts.forEach(art => {
        const card = document.createElement("div");
        card.classList.add("art-grid__item");
        card.innerHTML = `
          <img src="${art.primaryImageSmall}" alt="${art.title}" class="art-grid__img" />
          <div class="art-grid__details">
            <h2 class="art-grid__title">${art.title}</h2>
            <p class="art-grid__author">${art.artistDisplayName || "Artiste inconnu"}</p>
          </div>
        `;

        card.addEventListener("click", () => {
          modalImg.src = art.primaryImageSmall;
          modalTitle.textContent = art.title;
          modalArtist.textContent = art.artistDisplayName || "Artiste inconnu";
          modalText.textContent = art.creditLine || "Aucune description disponible.";
          modal.classList.add("is-active");
        });

        grid.appendChild(card);
      });

    } catch (err) {
      console.error("Erreur de chargement :", err);
      grid.innerHTML = "<p>Erreur lors du chargement des œuvres.</p>";
    }
  }

  fetchArt();
});
