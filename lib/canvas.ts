export function applyTransformToContext(
  ctx: CanvasRenderingContext2D,
  transform: { scale: number; x: number; y: number; },
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(transform.scale, transform.scale);
  ctx.translate(
    -canvasWidth / 2 + transform.x / transform.scale,
    -canvasHeight / 2 + transform.y / transform.scale
  );
}

// Add other canvas-related functions here 