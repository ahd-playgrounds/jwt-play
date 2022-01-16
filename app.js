/* eslint-disable consistent-return */
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const secret = randomBytes(64).toString('hex');

const app = express();

app.use(bodyParser.json());

app.use((req, _, next) => {
  const quiet = {
    ...req.body,
    context: req.body.context ? '<...>' : null,
  };
  console.log(req.path, quiet);
  next();
});

app.use(authenticateToken);

app.post('/journey-a/init', (_, out) => {
  const context = signJwt({});

  out.json({ context });
});

app.post('/journey-a/test', (req, out) => {
  const { age } = req.body;
  const newAge = age + 1;

  const context = signJwt({ age: newAge });

  out.json({ age: newAge, context });
});

app.post('/journey-a/foo', (req, out) => {
  const { age } = req.app.locals;
  const newAge = age + 1;

  const context = signJwt({ age: newAge });

  out.json({ context, age: newAge });
});

export default app;

function signJwt(username) {
  return jwt.sign(username, secret, { expiresIn: '1800s' });
}

function authenticateToken(req, out, next) {
  if (req.path.endsWith('/init')) {
    // init has no context
    next();
  } else {
    const { context } = req.body;
    if (!context) {
      console.log('error, no context');
      return out.sendStatus(401);
    }

    jwt.verify(context, secret, (err, token) => {
      if (err) {
        console.error('JWT ERR', err);
        return out.sendStatus(403);
      }

      req.app.locals = { context: token };

      next();
    });
  }
}

// error handler
app.use((err, req, res, _) => {
  console.log(req.path, err.message);
  res.status(500).send(err.message);
});
