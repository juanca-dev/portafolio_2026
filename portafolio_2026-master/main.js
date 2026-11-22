document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, r = document) => r.querySelector(s);

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Menú móvil
  const btn = $("#menu-btn"), menu = $("#menu");
  if (btn && menu) {
    const setMenu = (open) => {
      menu.classList.toggle("hidden", !open);
      menu.classList.toggle("flex", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  // Modal de imágenes
  const modal = $("#modal"), modalImg = $("#modal-img");
  let lastFocus = null;
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  if (modal && modalImg) {
    document.querySelectorAll("[data-modal]").forEach((el) =>
      el.addEventListener("click", () => {
        lastFocus = el;
        modalImg.src = el.dataset.modal;
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      })
    );
    modal.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  // Cursos: preselecciona el servicio en el formulario
  const servicio = $("#servicio");
  document.querySelectorAll("[data-service]").forEach((a) =>
    a.addEventListener("click", () => { if (servicio) servicio.value = a.dataset.service; })
  );

  // Formulario Netlify
  const form = $("#form");
  if (!form) return;
  const estado = $("#estado"), enviar = $("#enviar");
  const esLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
  const fields = [...form.querySelectorAll("input[required], select[required], textarea[required]")];

  const validate = () => {
    let ok = true;
    fields.forEach((f) => {
      const err = f.parentElement.querySelector(".err");
      const valid = f.value.trim() !== "" && f.checkValidity();
      f.setAttribute("aria-invalid", String(!valid));
      if (err) err.textContent = valid ? "" : (f.validationMessage || "Completa este campo.");
      if (!valid) ok = false;
    });
    return ok;
  };
  fields.forEach((f) => f.addEventListener("input", () => f.getAttribute("aria-invalid") === "true" && validate()));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviar.disabled) return; // evita envíos duplicados
    estado.className = "text-sm";
    if (!validate()) {
      estado.textContent = "Revisa los campos marcados.";
      estado.classList.add("text-red-400");
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    enviar.disabled = true;
    enviar.textContent = "Enviando…";

    if (esLocal) { // Modo simulación: no se envía nada real
      estado.textContent = "SIMULACIÓN local: no se envió ningún mensaje. Pruébalo desde la URL de Netlify.";
      estado.classList.add("text-yellow-300");
      enviar.disabled = false;
      enviar.textContent = "Enviar mensaje";
      return;
    }
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      window.location.href = "/gracias.html";
    } catch (err) {
      estado.textContent = "No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos.";
      estado.classList.add("text-red-400");
      enviar.disabled = false;
      enviar.textContent = "Enviar mensaje";
    }
  });
});
