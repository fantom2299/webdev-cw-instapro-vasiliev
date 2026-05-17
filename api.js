// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "vasiliev_nikolay";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function getUserPosts({ token, userId }) {
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}


export function addPost({ token, description, imageUrl }) {
  // Отправляем как JSON
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,

    },
    body: JSON.stringify({
      description: description,
      imageUrl: imageUrl,
    }),
  })
    .then(async (response) => {
      const text = await response.text();
      console.log("addPost response status:", response.status);
      console.log("addPost response body:", text);

      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status} - ${text}`);
      }
      return JSON.parse(text);
    });
}


export function likePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

export function dislikePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    headers: {

    },
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    headers: {

    },
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }
    return response.json();
  });
}