const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const { test } = require("node:test");
const path = require("node:path");

test("build emits the main server entrypoint", () => {
    assert.equal(existsSync(path.join(__dirname, "..", "dist", "index.js")), true);
    assert.equal(existsSync(path.join(__dirname, "..", "dist", "bootstrap.js")), true);
});

test("main routes include the booking endpoint", () => {
    const routes = readFileSync(path.join(__dirname, "..", "src", "modules", "routers.ts"), "utf8");

    assert.match(routes, /BookingModule\/booking\.controller/);
    assert.match(routes, /router\.use\('\/booking',bookingRouter\)/);
});
