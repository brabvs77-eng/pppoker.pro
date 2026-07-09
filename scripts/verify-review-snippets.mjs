#!/usr/bin/env node
/**
 * Verifies native review snippets on homepage bodies and static export.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadReviewSnippets } from "./lib/review-snippets-static-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "apps/web/out");
const BODIES = path.join(ROOT, "content/bodies");
const CHROME = path.join(ROOT, "apps/web/src/config/elementor-chrome.json");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function outPathForRoute(route) {
  if (route === "/") return path.join(OUT, "index.html");
  return path.join(OUT, route.slice(1), "index.html");
}

function verifyBodyHtml(html, label) {
  assert(html.includes('id="native-review-snippets"'), `${label}: missing native-review-snippets`);
  assert(!html.includes("elementor-element-ccad702"), `${label}: legacy reviews section still present`);
  assert(html.includes("review-snippets__card"), `${label}: missing review cards`);
  assert(html.includes("review-stars"), `${label}: missing star markup`);
  assert(html.includes("review-snippets__score"), `${label}: missing aggregate score`);
  const cardCount = (html.match(/class="review-snippets__card"/g) || []).length;
  assert(cardCount === 6, `${label}: expected 6 review cards, got ${cardCount}`);
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match = pattern.exec(html);
  while (match) {
    blocks.push(match[1].trim());
    match = pattern.exec(html);
  }
  return blocks;
}

function verifyExportHtml(html, route) {
  assert(html.includes('id="native-review-snippets"'), `${route}: export missing review section`);
  assert(html.includes("review-snippets__card"), `${route}: export missing cards`);
  assert(html.includes("review-snippets__score"), `${route}: export missing aggregate`);

  const blocks = extractJsonLdBlocks(html);

  // GSC "Отзыву назначено несколько общих оценок": exactly one AggregateRating
  // JSON-LD entity per page, defined once.
  const aggBlocks = blocks.filter((block) => block.includes('"AggregateRating"'));
  assert(aggBlocks.length === 1, `${route}: expected 1 AggregateRating JSON-LD block, got ${aggBlocks.length}`);

  // The legacy Yoast @graph must not be duplicated (used to leak twice via
  // runtimeScripts on Elementor-runtime homepages).
  const graphBlocks = blocks.filter((block) => block.includes('"@graph"'));
  assert(
    graphBlocks.length <= 1,
    `${route}: legacy Yoast @graph JSON-LD duplicated (${graphBlocks.length} copies)`
  );

  // The review entity must not reuse the Yoast `#organization` @id — merging
  // the nodes is what confused Google's review-snippet parser.
  const reviewBlock = aggBlocks[0] ?? "";
  assert(reviewBlock.includes('#nuts-club'), `${route}: review JSON-LD must use distinct #nuts-club @id`);
  assert(
    !/"@id":"[^"]*#organization"[^}]*"aggregateRating"/.test(reviewBlock),
    `${route}: review JSON-LD must not attach aggregateRating to #organization`
  );
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const reviewRoutes = chrome.homeReviewSlotRoutes ?? [];
  const { reviews } = loadReviewSnippets("ru");
  assert(reviews.length === 6, "config: expected 6 RU reviews");

  for (const { fileId, route } of reviewRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId);
  }

  if (!fs.existsSync(OUT)) {
    console.warn("verify-review-snippets: apps/web/out missing — skipping export checks");
    console.log("verify-review-snippets: OK (bodies only)");
    return;
  }

  for (const { route } of reviewRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyExportHtml(read(p), route);
  }

  console.log("verify-review-snippets: OK");
}

main();
