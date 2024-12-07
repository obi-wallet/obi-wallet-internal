/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { IDBFactory } from "fake-indexeddb";
import { vi } from "vitest";

// Mock IndexedDB
global.indexedDB = new IDBFactory();

// Mock canvas operations
const mockCanvasContext = {
  fillStyle: "",
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => {
    return {
      data: new Uint8ClampedArray(0),
    };
  }),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  scale: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
} as unknown as CanvasRenderingContext2D;

// Mock canvas element
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  return mockCanvasContext;
}) as unknown as {
  (
    contextId: "2d",
    options?: CanvasRenderingContext2DSettings,
  ): CanvasRenderingContext2D | null;
  (
    contextId: "bitmaprenderer",
    options?: ImageBitmapRenderingContextSettings,
  ): ImageBitmapRenderingContext | null;
  (
    contextId: "webgl",
    options?: WebGLContextAttributes,
  ): WebGLRenderingContext | null;
  (
    contextId: "webgl2",
    options?: WebGLContextAttributes,
  ): WebGL2RenderingContext | null;
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  callback(0);
  return 0;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn();

// Mock window.URL.createObjectURL
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();
