document.addEventListener("DOMContentLoaded", function () {
  const userDataElement = document.getElementById("user-data");
  const userData = userDataElement ? userDataElement.textContent : "{}";
  let user;

  try {
    user = JSON.parse(userData);
  } catch (e) {
    console.error("Ошибка при парсинге JSON:", e);
    user = null;
  }

  const authLinks = document.getElementById("auth-links");

  if (user) {
    authLinks.innerHTML = `
          
          <a href="/profile">Личный кабинет</a> | <a href="/logout">Выйти</a>
      `;
  } else {
    authLinks.innerHTML = `
          <a href="/login">Войти</a> | <a href="/register">Регистрация</a>
      `;
  }
});
