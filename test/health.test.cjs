const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../dist/app").default;

let baseUrl;
let server;

before(async () => {
    await new Promise((resolve, reject) => {
        server = app.listen(0, "127.0.0.1", () => {
            const address = server.address();
            baseUrl = `http://127.0.0.1:${address.port}`;
            resolve();
        });
        server.on("error", reject);
    });
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test("GET /api/v1/health reports a healthy service", async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        status: "ok",
        service: "salamtak-backend"
    });
});
