document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".art-grid");
  const wrapper = document.querySelector(".art-grid-wrapper");

  const modal = document.querySelector(".art-modal");
  const modalBackdrop = modal.querySelector(".art-modal__backdrop");
  const modalCloseBtn = modal.querySelector(".art-modal__close");
  const modalImage = modal.querySelector(".art-modal__image");
  const modalTitle = modal.querySelector(".art-modal__title");
  const modalArtist = modal.querySelector(".art-modal__artist");
  const modalDescription = modal.querySelector(".art-modal__description");

  function closeModal() {
    modal.classList.remove("is-active");
    modalImage.src = "";
    modalImage.alt = "";
    modalTitle.textContent = "";
    modalArtist.textContent = "";
    modalDescription.textContent = "";
  }

  modalBackdrop.addEventListener("click", closeModal);
  modalCloseBtn.addEventListener("click", closeModal);

  async function fetchArts() {
    const res = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11");
    const data = await res.json();
    const arts = [];

    let i = 0;
    while (arts.length < 6 && i < data.objectIDs.length) {
      const artRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${data.objectIDs[i]}`);
      if (artRes.ok) {
        const art = await artRes.json();
        if (art.primaryImageSmall) arts.push(art);
      }
      i++;
    }

    return arts;
  }

  function createCard(art) {
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
      modalImage.src = art.primaryImage || art.primaryImageSmall;
      modalImage.alt = art.title;
      modalTitle.textContent = art.title;
      modalArtist.textContent = `Artiste : ${art.artistDisplayName || "Inconnu"}`;
      modalDescription.textContent = `Date : ${art.objectDate || "N/A"}\nDetails : ${art.medium || "N/A"}`;

      modal.classList.add("is-active");
    });

    return card;
  }

  function cloneCards(cards) {
    return cards.map(card => {
      const clone = card.cloneNode(true);
      clone.classList.add("clone");
      return clone;
    });
  }

  async function init() {
    const arts = await fetchArts();

    if (arts.length === 0) {
      grid.innerHTML = "<p>Aucune œuvre trouvée.</p>";
      return;
    }


    const cards = arts.map(createCard);
    cards.forEach(card => grid.appendChild(card));

    const clones = cloneCards(cards);
    clones.forEach(clone => grid.appendChild(clone));

    const totalWidth = grid.scrollWidth;

    gsap.registerPlugin(ScrollTrigger);

    const speed = 100; 

    const loopAnim = gsap.to(grid, {
      x: -totalWidth / 2,
      ease: "none",
      duration: (totalWidth / 2) / speed,
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % (totalWidth / 2))
      }
    });

    let velocity = 0;

    wrapper.addEventListener("wheel", (e) => {
      e.preventDefault();
      velocity += e.deltaY * 0.5;
    });

    gsap.ticker.add(() => {
      if (Math.abs(velocity) > 0.1) {
        loopAnim.time(loopAnim.time() + velocity * 0.01);
        velocity *= 0.95;
      }
    });
  }

  init();
});
