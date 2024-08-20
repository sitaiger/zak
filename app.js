const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const db = require("./database");

const app = express();
const PORT = 3000;

// Настройка статических файлов
app.use(express.static("public"));

// Настройка парсера для обработки POST-запросов
app.use(bodyParser.urlencoded({ extended: false }));

// Настройка сессий
app.use(
  session({
    store: new SQLiteStore(),
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware для передачи переменной user в шаблоны
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home.html");
});

// Страница входа
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// Обработка входа
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      res.send("Error: " + err.message);
      return;
    }
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
      res.redirect("/profile");
    } else {
      res.send("Invalid username or password");
    }
  });
});

// Страница регистрации
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

// Обработка регистрации
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err) => {
      if (err) {
        res.send("Error: " + err.message);
      } else {
        res.redirect("/login");
      }
    }
  );
});

// Личный кабинет
app.get("/profile", (req, res) => {
  if (req.session.user) {
    res.render("profile", { user: req.session.user });
  } else {
    res.redirect("/login");
  }
});

// Выход из системы
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
