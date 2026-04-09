import test from "node:test"
import assert from "node:assert/strict"

import { getLinkedImageForColor, setColorImageIndex } from "./product-color-links"

test("setColorImageIndex stores one selected image index for a color", () => {
  const nextColors = setColorImageIndex(
    [
      { name: "Black", hex: "#111111" },
      { name: "Blue", hex: "#3366ff", imageIndices: [0] },
    ],
    "Black",
    2
  )

  assert.deepEqual(nextColors, [
    { name: "Black", hex: "#111111", imageIndices: [2] },
    { name: "Blue", hex: "#3366ff", imageIndices: [0] },
  ])
})

test("getLinkedImageForColor returns the image matched to the selected color", () => {
  const linkedImage = getLinkedImageForColor(
    {
      colors: [
        { name: "Black", hex: "#111111", imageIndices: [1] },
        { name: "Blue", hex: "#3366ff", imageIndices: [0] },
      ],
      images: [
        { src: "/blue-front.jpg", alt: "Blue front" },
        { src: "/black-front.jpg", alt: "Black front" },
      ],
    },
    "Black"
  )

  assert.deepEqual(linkedImage, {
    src: "/black-front.jpg",
    alt: "Black front",
  })
})

test("getLinkedImageForColor returns null when the color has no valid linked image", () => {
  const linkedImage = getLinkedImageForColor(
    {
      colors: [{ name: "Silver", hex: "#dddddd", imageIndices: [9] }],
      images: [{ src: "/silver-front.jpg", alt: "Silver front" }],
    },
    "Silver"
  )

  assert.equal(linkedImage, null)
})