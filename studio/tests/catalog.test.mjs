import test from "node:test";
import assert from "node:assert/strict";
import { projects, places } from "../js/projects.js";
import { studies, validateCatalog } from "../js/studies.js";

test("published catalog has complete bilingual scene studies", () => {
  assert.doesNotThrow(() => validateCatalog(projects, places));
  assert.equal(projects.length, 15);
});
test("a supporting project extends the index without renderer changes", () => {
  const entry = {
    id: "extension-example",
    title: "Extension",
    description: { zh: "示例说明", en: "Example description" },
    place: "gate",
  };
  assert.doesNotThrow(() => validateCatalog([...projects, entry], places));
});
test("a fourth mechanism stop is accepted", () => {
  const extra = structuredClone(studies);
  extra[places[0].project].steps.push(
    structuredClone(extra[places[0].project].steps[0]),
  );
  assert.doesNotThrow(() => validateCatalog(projects, places, extra));
});
test("duplicate IDs and broken associations fail before rendering", () => {
  assert.throws(
    () => validateCatalog([...projects, projects[0]], places),
    /unique/,
  );
  assert.throws(
    () =>
      validateCatalog(
        [{ ...projects[0], place: "missing" }, ...projects.slice(1)],
        places,
      ),
    /Unknown place/,
  );
  assert.throws(
    () =>
      validateCatalog(
        [{ ...projects[0], related: ["missing"] }, ...projects.slice(1)],
        places,
      ),
    /Unknown related/,
  );
});
test("a scene needs a reading study and finite annotation positions", () => {
  assert.throws(() => validateCatalog(projects, places, {}), /complete study/);
  const bad = structuredClone(studies);
  bad[places[0].project].steps[0].at[0] = NaN;
  assert.throws(
    () => validateCatalog(projects, places, bad),
    /annotation position/,
  );
});
test("media only references public, local assets with accessible descriptions", () => {
  const replace = (media) => [{ ...projects[0], media }, ...projects.slice(1)];
  assert.doesNotThrow(() =>
    validateCatalog(
      replace([
        {
          type: "image",
          src: "assets/demo.png",
          alt: { zh: "演示", en: "Demo" },
        },
      ]),
      places,
    ),
  );
  assert.throws(
    () =>
      validateCatalog(
        replace([
          {
            type: "image",
            src: "/Users/private/demo.png",
            alt: { zh: "演示", en: "Demo" },
          },
        ]),
        places,
      ),
    /Invalid public media/,
  );
  assert.throws(
    () =>
      validateCatalog(
        replace([{ type: "video", src: "assets/../private.mp4" }]),
        places,
      ),
    /Invalid public media/,
  );
});
