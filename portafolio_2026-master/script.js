document.addEventListener("DOMContentLoaded", () => {
    const filterContainer = document.querySelector(".filter-container");
    const gallery = document.querySelector(".gallery");
    const previewBox = document.getElementById("preview-box");
    const previewImg = document.getElementById("preview-img");
    const categoryTitle = document.getElementById("category-title");
    const btnFlip = document.getElementById("btn-flip");
    const closeModal = document.getElementById("close-modal");

    // Si la página no es la galería, no hay nada que registrar (evita errores de JS)
    if (!gallery || !previewBox || !previewImg) return;

    const galleryItems = gallery.querySelectorAll(".image");
    let frontImgSrc = "";
    let backImgSrc = "";
    let isFlipped = false;
    let lastFocus = null;

    const flipLabel = () => btnFlip && btnFlip.querySelector("span");
    const setFlipText = (text) => { const s = flipLabel(); if (s) s.textContent = text; };

    // Accesibilidad de la galería: tarjetas operables con teclado
    galleryItems.forEach((item) => {
        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "button");
        const img = item.querySelector("img");
        item.setAttribute("aria-label", "Ver certificado: " + (img ? img.alt : item.dataset.name));
        item.querySelectorAll("img").forEach((i) => i.setAttribute("loading", "lazy"));
    });
    previewBox.setAttribute("role", "dialog");
    previewBox.setAttribute("aria-modal", "true");
    if (closeModal) closeModal.setAttribute("aria-label", "Cerrar vista previa");

    // 1. FILTRADO
    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".filter-item");
            if (!btn) return;

            const current = filterContainer.querySelector(".active");
            if (current) current.classList.remove("active");
            btn.classList.add("active");
            filterContainer.querySelectorAll(".filter-item").forEach((b) =>
                b.setAttribute("aria-pressed", String(b === btn))
            );

            const filterName = btn.dataset.name;
            galleryItems.forEach((item) => {
                if (filterName === "all" || filterName === item.dataset.name) {
                    item.classList.remove("hidden");
                    item.classList.add("animate__animated", "animate__fadeIn");
                } else {
                    item.classList.add("hidden");
                }
            });
        });
    }

    // 2. ABRIR PREVIEW (delegación de eventos)
    const openPreview = (card) => {
        const img = card.querySelector("img");
        if (!img) return;
        lastFocus = card;
        frontImgSrc = img.src;
        backImgSrc = card.dataset.reverso || "";
        isFlipped = false;

        previewImg.style.opacity = "1";
        previewImg.style.transform = "scale(1)";
        previewImg.src = frontImgSrc;
        previewImg.alt = img.alt;
        if (categoryTitle) categoryTitle.textContent = (card.dataset.name || "").toUpperCase();
        setFlipText("Ver Reverso");
        if (btnFlip) btnFlip.classList.toggle("hidden", !backImgSrc);

        previewBox.classList.add("show");
        document.body.style.overflow = "hidden";
        if (closeModal) closeModal.focus();
    };

    gallery.addEventListener("click", (e) => {
        const card = e.target.closest(".image");
        if (card) openPreview(card);
    });
    gallery.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const card = e.target.closest(".image");
        if (!card) return;
        e.preventDefault();
        openPreview(card);
    });

    // 3. LÓGICA DE GIRO (FLIP)
    if (btnFlip) {
        btnFlip.addEventListener("click", () => {
            if (!backImgSrc) return;
            isFlipped = !isFlipped;
            previewImg.style.opacity = "0";
            previewImg.style.transform = "scale(0.95)";

            setTimeout(() => {
                previewImg.src = isFlipped ? backImgSrc : frontImgSrc;
                setFlipText(isFlipped ? "Ver Frontal" : "Ver Reverso");
                previewImg.style.opacity = "1";
                previewImg.style.transform = "scale(1)";
            }, 300);
        });
    }

    // Si el reverso no existe, vuelve a la cara frontal en vez de mostrar una imagen rota
    previewImg.addEventListener("error", () => {
        if (isFlipped) {
            isFlipped = false;
            backImgSrc = "";
            previewImg.src = frontImgSrc;
            if (btnFlip) btnFlip.classList.add("hidden");
        }
    });

    // 4. CERRAR MODAL
    const closeAll = () => {
        if (!previewBox.classList.contains("show")) return;
        previewBox.classList.remove("show");
        document.body.style.overflow = "auto";
        if (lastFocus) lastFocus.focus();
    };

    if (closeModal) closeModal.addEventListener("click", closeAll);
    previewBox.addEventListener("click", (e) => {
        if (e.target === previewBox) closeAll();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
    });
});