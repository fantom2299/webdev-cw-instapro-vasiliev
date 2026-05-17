import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

// Функция для очистки HTML-тегов
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";
  let isLoading = false;

  const render = () => {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h2 class="form-title">Новый пост</h2>
          <div class="form-inputs">
            <div id="upload-image-container"></div>
            <textarea
              id="post-description"
              class="input"
              placeholder="Введите описание поста..."
              rows="4"
              style="resize: vertical;"
            ></textarea>
            <p class="form-error" id="form-error" style="display:none;"></p>
          </div>
          <div class="form-footer">
            <button class="button" id="add-button" ${isLoading ? "disabled" : ""}>
              ${isLoading ? "Добавляю..." : "Опубликовать"}
            </button>
          </div>
        </div>
      </div>
    `;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    renderUploadImageComponent({
      element: document.getElementById("upload-image-container"),
      onImageUrlChange(url) {
        imageUrl = url;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      const descriptionInput = document.getElementById("post-description");
      const description = descriptionInput ? descriptionInput.value.trim() : "";
      const errorEl = document.getElementById("form-error");

      if (!imageUrl) {
        errorEl.textContent = "Пожалуйста, загрузите фото";
        errorEl.style.display = "block";
        return;
      }

      if (!description) {
        errorEl.textContent = "Пожалуйста, введите описание";
        errorEl.style.display = "block";
        return;
      }

      // Экранируем HTML-теги из описания перед отправкой
      const sanitizedDescription = escapeHtml(description);

      errorEl.style.display = "none";
      isLoading = true;
      render();

      onAddPostClick({ description: sanitizedDescription, imageUrl });
    });
  };

  render();
}