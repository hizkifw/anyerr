import { parseAnyError } from '../src/index';
import axios from 'axios';
import * as http from 'http';

describe('index', () => {
  let serverAddress = '';
  let server: http.Server;

  beforeAll(() => {
    server = http.createServer((req, res) => {
      if (req.url === '/400') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(
          JSON.stringify({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'One or more validation errors occurred.',
            status: 400,
            traceId: '00-0b1f1c9a0a1b4f4e9f3b9b9b0a1b4f4e',
            errors: {
              name: ['The Name field is required.'],
            },
          })
        );
        res.end();
      } else if (req.url === '/404') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Page not found');
        res.end();
      } else if (req.url === '/500') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(
          JSON.stringify({
            ok: false,
            data: {
              error: {
                code: 500,
                message: {
                  detail: 'Uh-oh, an oopsie-whoopsie has happened',
                },
              },
            },
          })
        );
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Hello ' + req.url);
        res.end();
      }
    });

    server.listen(0, () => {
      serverAddress = `http://127.0.0.1:${(server.address() as any).port}`;
    });
  });

  afterAll(() => {
    server.close();
  });

  const matrix: [any, string][] = [
    [null, 'Unknown error'],
    [undefined, 'Unknown error'],
    [true, 'Unknown error'],
    [false, 'Unknown error'],
    [0, 'Unknown error'],
    [1, 'Unknown error'],
    ['', 'Unknown error'],
    ['foo', 'foo'],
    [new Error('foo'), 'foo'],
    [{}, 'Unknown error'],
    [{ message: 'foo' }, 'foo'],
    [{ error: 'foo' }, 'foo'],
    [{ error: { message: 'foo' } }, 'foo'],
    [
      () => (({} as any).a.b),
      "Cannot read properties of undefined (reading 'b')",
    ],
    [() => (null as any).a, "Cannot read properties of null (reading 'a')"],
    [
      async () => await axios.get('http://240.0.0.0:80', { timeout: 1 }),
      'timeout of 1ms exceeded',
    ],
    [
      async () => await axios.get(serverAddress + '/400'),
      'The Name field is required.',
    ],
    [async () => await axios.get(serverAddress + '/404'), 'Page not found'],
    [
      async () => await axios.get(serverAddress + '/500'),
      'Uh-oh, an oopsie-whoopsie has happened',
    ],
  ];

  for (const [input, output] of matrix) {
    it(`should parse ${JSON.stringify(input)} as ${JSON.stringify(
      output
    )}`, async () => {
      let result: any;
      if (typeof input === 'function') {
        try {
          result = await Promise.resolve(input());
        } catch (e) {
          result = e;
        }
      } else {
        result = input;
      }
      expect(parseAnyError(result)).toEqual({ message: output });
    });
  }
});
