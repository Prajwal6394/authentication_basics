const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();
app.use(bodyParser.json());

const users = [
  {
    username: 'user1',
    password: '$2b$10$lW5Z5OYpYCXoE/SsYMyLu.hPJhhEctjIMX9XJIFvQQ1DfQieT11wG'
  },
  {
    username: 'user2',
    password: '$2b$10$lW5Z5OYpYCXoE/SsYMyLu.hPJhhEctjIMX9XJIFvQQ1DfQieT11wG'
  }
];

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const accessToken = jwt.sign({ username: user.username }, config.secret, { expiresIn: config.accessTokenExpirationTime });
  const refreshToken = jwt.sign({ username: user.username }, config.secret, { expiresIn: config.refreshTokenExpirationTime });

  res.json({ accessToken, refreshToken });
});

app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, config.secret);
    const accessToken = jwt.sign({ username: decoded.username }, config.secret, { expiresIn: config.accessTokenExpirationTime });

    res.json({ accessToken });
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
