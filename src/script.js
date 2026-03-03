// CÓDIGO EFECTO SCROLL
const topnav = document.querySelector(".topnav");

function updateScrolledState() {
  if (window.scrollY > 20) {
    topnav.classList.add("scrolled");
  } else {
    topnav.classList.remove("scrolled");
  }
}

updateScrolledState();

window.addEventListener("scroll", () => {
  requestAnimationFrame(updateScrolledState);
});

// CÓDIGO PARA EL MENÚ DE NAVEGACIÓN
let menu = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navigation-bar");

menu.addEventListener("click", (m) => {
  m.stopPropagation();
  languageDropdown.classList.remove("show");
  navbar.classList.toggle("open");
});

document.addEventListener("click", (m) => {
  if (!menu.contains(m.target) && !navbar.contains(m.target)) {
    navbar.classList.remove("open");
  }
});

// CÓDIGO DEL DEGRADADO DE LOS CONTENIDOS DEL SCROLLBAR
const fadeTop = document.getElementById("fade-top");
const fadeBottom = document.getElementById("fade-bottom");

function updateFades() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  fadeTop.classList.toggle("visible", scrollTop > 5);
  fadeBottom.classList.toggle("visible", scrollTop < maxScroll - 5);
}

updateFades();

window.addEventListener("scroll", () => {
  requestAnimationFrame(updateFades);
});

// CÓDIGO PARA EL SISTEMA DE IDIOMAS
const languageBtn = document.getElementById("languageBtn");
const languageDropdown = document.getElementById("languageDropdown");
const languageOptions = document.querySelectorAll(".language-option");
const currentLangSpan = document.getElementById("currentLang");

let currentLanguage = "en";

languageBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  navbar.classList.remove("open");
  languageDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
    languageDropdown.classList.remove("show");
  }
});

languageOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const selectedLang = option.getAttribute("data-lang");
    changeLanguage(selectedLang);
    languageDropdown.classList.remove("show");
  });
});

function changeLanguage(lang) {
  currentLanguage = lang;
  currentLangSpan.textContent = lang.toUpperCase();

  document.documentElement.lang = lang;

  languageOptions.forEach((option) => {
    if (option.getAttribute("data-lang") === lang) {
      option.classList.add("selected");
      option.querySelector("i").style.display = "inline";
    } else {
      option.classList.remove("selected");
      option.querySelector("i").style.display = "none";
    }
  });

  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[lang] && translations[lang][key]) {
      element.innerHTML = translations[lang][key];
    }
  });

  if (currentItem && typeof currentItemIndex !== "undefined") {
    showItem(currentItemIndex);
  }

  if (currentItem && translations[lang].items[currentItemIndex]) {
    const translatedItem = translations[lang].items[currentItemIndex];
    document.getElementById("shortDesc").textContent = translatedItem.shortDesc;
  }

  if (document.getElementById("grid")) {
    populateGrid();
  }
}

function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split("-")[0].toLowerCase();

  if (translations[langCode]) {
    return langCode;
  }

  return "en";
}

const initialLanguage = detectBrowserLanguage();

// CÓDIGO PARA LA SECCIÓN DE INDEX
let currentItem = null;

function populateGrid() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  grid.innerHTML = "";
  items.forEach((item, index) => {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";
    if (index === 0) gridItem.classList.add("active");

    const img = document.createElement("img");
    const translatedItem = translations[currentLanguage]?.items?.[index];

    img.src = translatedItem?.image || item.image;
    img.alt = translatedItem?.title || item.title;

    gridItem.appendChild(img);
    gridItem.onclick = () => showItem(index);
    grid.appendChild(gridItem);
  });
}

function showItem(index) {
  currentItem = items[index];
  currentItemIndex = index;

  const translatedItem = translations[currentLanguage].items[index];

  const imageToShow =
    translatedItem?.displayImage ||
    translatedItem?.image ||
    currentItem.displayImage ||
    currentItem.image;

  document.getElementById("mainImage").src = imageToShow;

  if (translatedItem) {
    document.getElementById("shortDesc").textContent = translatedItem.shortDesc;
  } else {
    document.getElementById("shortDesc").textContent = currentItem.shortDesc;
  }

  const readMoreBtn = document.getElementById("readMoreBtn");
  if (currentItem.fullDesc) {
    readMoreBtn.classList.remove("hidden");
  } else {
    readMoreBtn.classList.add("hidden");
  }

  const externalLinkBtn = document.getElementById("externalLinkBtn");
  const externalLinkText = document.getElementById("externalLinkText");

  if (currentItem.externalLink) {
    const translatedExternalText =
      translatedItem?.externalLink?.text || currentItem.externalLink.text;

    const translatedExternalURL =
      translatedItem?.externalLink?.url || currentItem.externalLink.url;

    externalLinkText.textContent = translatedExternalText;

    const iconElement = externalLinkBtn.querySelector("i");
    iconElement.className =
      currentItem.externalLink.icon || "ri-external-link-line";

    if (currentItem.externalLink.albumData) {
      externalLinkBtn.removeAttribute('href');
      externalLinkBtn.onclick = (e) => {
        e.preventDefault();
        const albumData = {
          ...currentItem.externalLink.albumData,
          title: translatedItem?.externalLink?.albumData?.title || currentItem.externalLink.albumData.title
        };
        openAlbumPopup(albumData);
      };
    } else {
      externalLinkBtn.href = translatedExternalURL;
      externalLinkBtn.onclick = null;
    }

    externalLinkBtn.classList.remove("hidden");
  } else {
    externalLinkBtn.classList.add("hidden");
  }

  const tagsContainer = document.getElementById("tagsContainer");
  const tagsSection = document.getElementById("tagsSection");
  tagsContainer.innerHTML = "";

  if (currentItem.tags && currentItem.tags.length > 0) {
    tagsSection.style.display = "block";
    currentItem.tags.forEach((tag, tagIndex) => {
      const tagElement = document.createElement("div");
      tagElement.className = "tag";

      const translatedTag = translatedItem?.tags?.[tagIndex];
      const tagText = translatedTag ? translatedTag.text : tag.text;

      if (tag.info) {
        tagElement.classList.add("clickable");
        tagElement.onclick = () => openTagPopup(tag, tagIndex);
      }

      tagElement.innerHTML = `<iconify-icon icon="${tag.icon}"></iconify-icon><span>${tagText}</span>`;
      tagsContainer.appendChild(tagElement);
    });
  } else {
    tagsSection.style.display = "none";
  }

  const whereButtons = document.getElementById("whereButtons");
  whereButtons.innerHTML = "";

  currentItem.whereButtons.forEach((button) => {
    const link = document.createElement("a");
    link.href = button.url;
    link.className = "where-btn";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    if (button.icon) {
      link.innerHTML = `<iconify-icon icon="${button.icon}" style="font-size: 20px;"></iconify-icon><span>${button.text}</span>`;
    } else {
      link.textContent = button.text;
    }

    whereButtons.appendChild(link);
  });

  document.querySelectorAll(".grid-item").forEach((item, i) => {
    if (i === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function openPopup() {
  if (currentItem && currentItem.fullDesc) {
    const popupTitle = document.querySelector(".popup-title");
    popupTitle.textContent =
      translations[currentLanguage]["popup.title"] || "Full Description";

    const translatedItem =
      translations[currentLanguage].items[currentItemIndex];
    const translatedFullDesc = translatedItem
      ? translatedItem.fullDesc
      : currentItem.fullDesc;
    document.getElementById("popupContent").innerHTML = translatedFullDesc;

    const overlay = document.getElementById("popup");
    overlay.classList.add("show");
  }
}

function closePopup() {
  const overlay = document.getElementById("popup");
  overlay.classList.add("closing");

  setTimeout(() => {
    overlay.classList.remove("show");
    overlay.classList.remove("closing");
  }, 300);
}

function openTagPopup(tag) {
  const translated =
    translations[currentLanguage].items[currentItemIndex]?.tags;
  const tagIndex = currentItem.tags.indexOf(tag);
  const translatedInfo = translated?.[tagIndex]?.info || tag.info;

  document.getElementById("tagPopupContent").innerHTML = translatedInfo;
  document.getElementById("tagPopup").classList.add("show");
}

function closeTagPopup() {
  const overlay = document.getElementById("tagPopup");
  overlay.classList.add("closing");

  setTimeout(() => {
    overlay.classList.remove("show");
    overlay.classList.remove("closing");
  }, 300);
}

const isIndexPage = document.getElementById("grid") !== null;

changeLanguage(initialLanguage);

if (isIndexPage) {
  document.getElementById("readMoreBtn").onclick = openPopup;
  document.getElementById("popup").onclick = function (e) {
    if (e.target === this) {
      closePopup();
    }
  };

  document.getElementById("tagPopup").onclick = function (e) {
    if (e.target === this) {
      closeTagPopup();
    }
  };

  populateGrid();
  showItem(0);
}

// CÓDIGO PARA EL BOTÓN DE ÁLBUM
let currentAlbumData = null;

function openAlbumPopup(albumData) {
  currentAlbumData = albumData;

  const titleElement = document.getElementById("albumPopupTitle");
  titleElement.textContent = albumData.title;

  document.getElementById("albumCoverImage").src = albumData.coverImage;

  const linksContainer = document.getElementById("albumLinksContainer");
  linksContainer.innerHTML = "";

  albumData.links.forEach((link) => {
    const linkElement = document.createElement("a");
    linkElement.href = link.url;
    linkElement.className = "album-link-btn";
    linkElement.target = "_blank";
    linkElement.rel = "noopener noreferrer";
    linkElement.innerHTML = `
      <iconify-icon icon="${link.icon}"></iconify-icon>
      <span>${link.text}</span>
    `;
    linksContainer.appendChild(linkElement);
  });

  const overlay = document.getElementById("albumPopup");
  overlay.classList.add("show");
}

function closeAlbumPopup() {
  const overlay = document.getElementById("albumPopup");
  overlay.classList.add("closing");

  setTimeout(() => {
    overlay.classList.remove("show");
    overlay.classList.remove("closing");
  }, 300);
}

document.getElementById("albumPopup").onclick = function (e) {
  if (e.target === this) {
    closeAlbumPopup();
  }
};

// CÓDIGO PARA LA SECCIÓN DE "ABOUT"
function toggleSection(header) {
  const section = header.parentElement;
  const allSections = document.querySelectorAll(".timeline-section");
  const wasActive = section.classList.contains("active");

  allSections.forEach((s) => {
    if (s !== section && s.classList.contains("active")) {
      s.classList.remove("active");
    }
  });

  section.classList.toggle("active");

  if (!wasActive) {
    setTimeout(() => {
      const headerPosition =
        header.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = headerPosition - 150;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }, 100);
  }
}

function openImagePopup(img) {
  const popup = document.getElementById("imagePopup");
  const title = document.getElementById("imagePopupTitle");
  const content = document.getElementById("imagePopupContent");

  const imageTitle = img.getAttribute("title") || "Img";
  title.textContent = imageTitle;

  content.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;

  popup.classList.add("show");
}

function closeImagePopup(event) {
  if (event && event.target.closest(".popup-body")) {
    return;
  }

  const popup = document.getElementById("imagePopup");
  popup.classList.add("closing");

  setTimeout(() => {
    popup.classList.remove("show");
    popup.classList.remove("closing");
  }, 300);
}
