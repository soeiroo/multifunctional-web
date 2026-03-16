"use client";

if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("THREE.Clock: This module has been deprecated") ||
      msg.includes("THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated") ||
      msg.includes("using deprecated parameters for the initialization function")
    ) {
      return;
    }
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args) => {
    const msg = typeof args[0] === "string" || args[0] instanceof Error ? args[0].toString() : "";
    if (
      msg.includes("SecurityError: Pointer lock cannot be acquired") ||
      msg.includes("PointerLockControls: Unable to use Pointer Lock API")
    ) {
      return; // Benign error from rapid pointer locking or unsupported environment
    }
    originalError(...args);
  };
}
