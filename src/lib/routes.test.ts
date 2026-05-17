import assert from "node:assert/strict";
import test from "node:test";
import { buildLinksHref, getCurrentPageFromRoute } from "./routes.ts";

test("buildLinksHref creates stable URLs for dashboard card navigation", () => {
  assert.equal(buildLinksHref(), "/links");
  assert.equal(buildLinksHref({ status: "reading" }), "/links?status=reading");
  assert.equal(
    buildLinksHref({ category: "레퍼런스", status: "completed" }),
    "/links?category=%EB%A0%88%ED%8D%BC%EB%9F%B0%EC%8A%A4&status=completed",
  );
});

test("getCurrentPageFromRoute maps nested URLs to sidebar sections", () => {
  assert.equal(getCurrentPageFromRoute("dashboard"), "dashboard");
  assert.equal(getCurrentPageFromRoute("links"), "links");
  assert.equal(getCurrentPageFromRoute("detail"), "links");
  assert.equal(getCurrentPageFromRoute("favorites"), "favorites");
  assert.equal(getCurrentPageFromRoute("categories"), "categories");
});
