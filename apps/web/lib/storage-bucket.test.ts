import test from "node:test"
import assert from "node:assert/strict"

import { getStorageBucketCandidates } from "./storage-bucket"

test("getStorageBucketCandidates prefers configured bucket and includes appspot fallback for firebasestorage domains", () => {
  const candidates = getStorageBucketCandidates({
    configuredBucket: "shugarman.firebasestorage.app",
    projectId: "shugarman",
  })

  assert.deepEqual(candidates, [
    "shugarman.firebasestorage.app",
    "shugarman.appspot.com",
  ])
})

test("getStorageBucketCandidates falls back to project-derived defaults when no bucket is configured", () => {
  const candidates = getStorageBucketCandidates({
    configuredBucket: "",
    projectId: "shugarman",
  })

  assert.deepEqual(candidates, [
    "shugarman.appspot.com",
    "shugarman.firebasestorage.app",
  ])
})

test("getStorageBucketCandidates normalizes gs scheme bucket names", () => {
  const candidates = getStorageBucketCandidates({
    configuredBucket: "gs://shugarman.appspot.com",
    projectId: "shugarman",
  })

  assert.deepEqual(candidates, ["shugarman.appspot.com", "shugarman.firebasestorage.app"])
})