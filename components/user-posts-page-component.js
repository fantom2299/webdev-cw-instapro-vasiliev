import { formatDistanceToNow } from "https://cdn.jsdelivr.net/npm/date-fns@2.29.3/esm/index.js";
import { ru } from "https://cdn.jsdelivr.net/npm/date-fns@2.29.3/esm/locale/index.js";
import { renderHeaderComponent } from "./header-component.js";
import { likePost, dislikePost } from "../api.js";
import { user, goToPage } from "../index.js";
import { POSTS_PAGE } from "../routes.js";

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPostId(post) {
  return post.id || post._id;
}

function getUserId(userObj) {
  if (!userObj) return undefined;
  return userObj.id || userObj._id;
}

function isPostLikedByUser(post, userId) {
  if (!userId || !post.likes?.length) return false;
  return post.likes.some((like) => {
    if (typeof like === "string") return like === userId;
    if (like.userId) return like.userId === userId;
    if (like.user?.id) return like.user.id === userId;
    if (like.user?._id) return like.user._id === userId;
    if (like.id) return like.id === userId;
    if (like._id) return like._id === userId;
    return false;
  });
}

export function renderUserPostsPageComponent({ appEl, posts, userId }) {
  const getToken = () => (user ? `Bearer ${user.token}` : undefined);

  const render = (currentPosts) => {
    const currentUserId = getUserId(user);
    const firstPost = currentPosts[0];
    const postUser = firstPost?.user;
    const escapedUserName = postUser ? escapeHtml(postUser.name || "") : "";

    const userHeaderHtml = postUser
      ? `
        <div class="posts-user-header">
          <img src="${postUser.imageUrl || "./assets/images/default-avatar.jpg"}" class="posts-user-header__user-image" alt="${escapedUserName}">
          <p class="posts-user-header__user-name">${escapedUserName}</p>
        </div>
      `
      : "";

    const postsHtml = currentPosts
      .map((post) => {
        const postId = getPostId(post);
        const isLiked = isPostLikedByUser(post, currentUserId);
        const likeImg = isLiked
          ? "./assets/images/like-active.svg"
          : "./assets/images/like-not-active.svg";
        const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
          addSuffix: true,
          locale: ru,
        });
        const escapedDescription = escapeHtml(post.description || "");
        const escapedUserNamePost = escapeHtml(post.user?.name || "");

        return `
          <li class="post">
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}" alt="${escapedDescription}">
            </div>
            <div class="post-likes">
              <button data-post-id="${postId}" class="like-button">
                <img src="${likeImg}" alt="like">
              </button>
              <p class="post-likes-text">
                Нравится: <strong>${post.likes?.length || 0}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${escapedUserNamePost}</span>
              ${escapedDescription}
            </p>
            <p class="post-date">${timeAgo}</p>
          </li>
        `;
      })
      .join("");

    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        ${userHeaderHtml}
        <ul class="posts">
          ${currentPosts.length === 0 ? "<p>У этого пользователя нет постов</p>" : postsHtml}
        </ul>
      </div>
    `;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    // Лайки
    for (let likeBtn of document.querySelectorAll(".like-button")) {
      likeBtn.addEventListener("click", () => {
        if (!user) {
          goToPage(POSTS_PAGE);
          return;
        }

        const postId = likeBtn.dataset.postId;
        const post = currentPosts.find((p) => getPostId(p) === postId);
        if (!post) return;

        const isLiked = isPostLikedByUser(post, getUserId(user));
        const action = isLiked ? dislikePost : likePost;

        likeBtn.disabled = true;

        action({ token: getToken(), postId })
          .then((data) => {
            const updatedPost = data.post || data;
            const idx = currentPosts.findIndex((p) => getPostId(p) === postId);
            if (idx !== -1) {
              currentPosts[idx] = { ...currentPosts[idx], ...updatedPost };
            }
            render(currentPosts);
          })
          .catch((err) => {
            console.error("Ошибка лайка:", err);
            likeBtn.disabled = false;
          });
      });
    }
  };

  render([...posts]);
}