import test from "node:test"
import assert from "node:assert/strict"

import { normalizeSocialLink } from "./settings-helpers"

test("normalizeSocialLink builds an Instagram URL from just a handle", () => {
  const link = normalizeSocialLink({
    platform: "Instagram",
    handle: "@sugarman_store",
    url: "",
  })

  assert.equal(link.handle, "@sugarman_store")
  assert.equal(link.url, "https://instagram.com/sugarman_store")
})

test("normalizeSocialLink keeps an explicit URL when both handle and URL are provided", () => {
  const link = normalizeSocialLink({
    platform: "Facebook",
    handle: "sugarman.istore",
    url: "https://facebook.com/sugarman.custom",
  })

  assert.equal(link.url, "https://facebook.com/sugarman.custom")
})

test("normalizeSocialLink supports WhatsApp handles by converting digits into wa.me URLs", () => {
  const link = normalizeSocialLink({
    platform: "WhatsApp",
    handle: "+233 20 123 4567",
    url: "",
  })

  assert.equal(link.url, "https://wa.me/233201234567")
})