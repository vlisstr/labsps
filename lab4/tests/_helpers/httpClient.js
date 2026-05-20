'use strict';

const http = require('node:http');

async function startApp(app) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } =  (server.address());
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(method, path, { body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(baseUrl + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = text;
    }
    return { status: res.status, body: json };
  }

  async function close() {
    await new Promise((resolve) => server.close(() => resolve()));
  }

  return { request, close, baseUrl };
}

module.exports = { startApp };
