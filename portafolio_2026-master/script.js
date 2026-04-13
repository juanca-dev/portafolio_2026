document.addEventListener("DOMContentLoaded", () => {
    const filterContainer = document.querySelector(".filter-container");
    const gallery = document.querySelector(".gallery");
    const galleryItems = document.querySelectorAll(".gallery .image");
    
    const previewBox = document.getElementById("preview-box");
    const previewImg = document.getElementById("preview-img");
    const categoryTitle = document.getElementById("category-title");
    const btnFlip = document.getElementById("btn-flip");
    const closeModal = document.getElementById("close-modal");

    let frontImgSrc = "";
    let backImgSrc = "";
    let isFlipped = false;

    // 1. FILTRADO
    filterContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-item")) {
            // Update Active Class
            filterContainer.querySelector(".active").classList.remove("active");
            e.target.classList.add("active");

            const filterName = e.target.dataset.name;

            galleryItems.forEach(item => {
                const itemName = item.dataset.name;
                if (filterName === "all" || filterName === itemName) {
                    item.classList.remove("hidden");
                    item.classList.add("animate__animated", "animate__fadeIn");
                } else {
                    item.classList.add("hidden");
                }
            });
        }
    });

    // 2. ABRIR PREVIEW (Delegación de eventos)
    gallery.addEventListener("click", (e) => {
        const card = e.target.closest(".image");
        if (!card) return;

        frontImgSrc = card.querySelector("img").src;
        backImgSrc = card.dataset.reverso; // Captura la cara 2 si existe
        isFlipped = false;

        // Reset Modal
        previewImg.src = frontImgSrc;
        categoryTitle.innerText = card.dataset.name.toUpperCase();
        btnFlip.querySelector("span").innerText = "Ver Reverso";
        
        // ¿Mostrar botón de flip?
        if (backImgSrc) {
            btnFlip.classList.remove("hidden");
        } else {
            btnFlip.classList.add("hidden");
        }

        previewBox.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    // 3. LOGICA DE GIRO (FLIP)
    btnFlip.addEventListener("click", () => {
        isFlipped = !isFlipped;
        
        // Animación de transición de imagen
        previewImg.style.opacity = "0";
        previewImg.style.transform = "scale(0.95)";

        setTimeout(() => {
            previewImg.src = isFlipped ? backImgSrc : frontImgSrc;
            btnFlip.querySelector("span").innerText = isFlipped ? "Ver Frontal" : "Ver Reverso";
            previewImg.style.opacity = "1";
            previewImg.style.transform = "scale(1)";
        }, 300);
    });

    // 4. CERRAR MODAL
    const closeAll = () => {
        previewBox.classList.remove("show");
        document.body.style.overflow = "auto";
    };

    closeModal.addEventListener("click", closeAll);
    previewBox.addEventListener("click", (e) => {
        if (e.target === previewBox) closeAll();
    });
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
    });
});