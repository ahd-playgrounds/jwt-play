import { request } from 'http';

signInFresh();

// **************************************** //
// Journeys
// **************************************** //

function signInFresh() {
  pipeAsync(
    () => post('/journey-a/init'),
    log('init'),
    ({ context }) =>
      post('/journey-a/test', {
        context,
        age: 4,
      }),
    log('test'),

    ({ context }) => post('/journey-a/foo', { context }),
    log({ msg: 'final', pretty: true })
  )();
}

// **************************************** //
// HELPERS
// **************************************** //
function post(path, body) {
  const data = JSON.stringify(body || {});

  return new Promise((resolve) => {
    const req = request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      },
      (res) => {
        let buffer = '';

        res.on('data', (d) => {
          buffer += d.toString();
        });

        res.on('end', () => {
          resolve(JSON.parse(buffer));
        });
      }
    );

    req.on('error', (e) => {
      console.error(e);
    });

    req.write(data);
    req.end();
  });
}

function pipeAsync(...fns) {
  return async (data) => {
    let res = data;
    // eslint-disable-next-line
    for await (const fn of fns) {
      res = await fn(res);
    }
    return res;
  };
}

function log(config) {
  const { msg, pretty } = parseConfig(config);
  return async (data) => {
    const parsed = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    if (msg) {
      console.log(`${msg}:`, parsed);
    } else {
      console.log(parsed);
    }
    return data;
  };

  function parseConfig(conf) {
    if (typeof conf === 'string') return { msg: conf, pretty: false };
    if (typeof conf === 'boolean') return { msg: null, pretty: conf };
    if (typeof conf === 'object') return { msg: conf.msg, pretty: conf.pretty };
    return {};
  }
}
