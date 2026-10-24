export const imageFrames = new Map();

export function measureFood(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  let left;
  let top;
  let right;
  let bottom;
  let radius;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, width, height);
    left = width;
    top = height;
    right = 0;
    bottom = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] > 20) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x + 1);
          bottom = Math.max(bottom, y + 1);
        }
      }
    }
    if (right <= left || bottom <= top) {
      left = top = 0;
      right = width;
      bottom = height;
    }
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    let radiusSquared = 0;
    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) {
        if (data[(y * width + x) * 4 + 3] > 20) {
          radiusSquared = Math.max(
            radiusSquared,
            (x + 0.5 - centerX) ** 2 + (y + 0.5 - centerY) ** 2,
          );
        }
      }
    }
    radius = Math.sqrt(radiusSquared);
  } catch {
    left = top = 0;
    right = width;
    bottom = height;
  }

  const size = Math.max(right - left, bottom - top);
  return {
    width: `${(width / size) * 100}%`,
    height: `${(height / size) * 100}%`,
    left: `${((size - right - left) / (2 * size)) * 100}%`,
    top: `${((size - bottom - top) / (2 * size)) * 100}%`,
   
    "--rotation-fit": radius
      ? Math.min(1, (size * 0.49) / radius)
      : size / Math.hypot(width, height),
  };
}
