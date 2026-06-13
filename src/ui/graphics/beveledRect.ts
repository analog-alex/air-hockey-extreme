import Phaser from 'phaser';

export function getBeveledRectPoints(
  x: number,
  y: number,
  width: number,
  height: number,
  bevel: number,
): Phaser.Geom.Point[] {
  const cut = Math.min(bevel, width / 2 - 1, height / 2 - 1);

  return [
    new Phaser.Geom.Point(x + cut, y),
    new Phaser.Geom.Point(x + width - cut, y),
    new Phaser.Geom.Point(x + width, y + cut),
    new Phaser.Geom.Point(x + width, y + height - cut),
    new Phaser.Geom.Point(x + width - cut, y + height),
    new Phaser.Geom.Point(x + cut, y + height),
    new Phaser.Geom.Point(x, y + height - cut),
    new Phaser.Geom.Point(x, y + cut),
  ];
}

export function fillBeveledRect(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  bevel: number,
): void {
  graphics.fillPoints(getBeveledRectPoints(x, y, width, height, bevel), true);
}

export function strokeBeveledRect(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  bevel: number,
): void {
  graphics.strokePoints(getBeveledRectPoints(x, y, width, height, bevel), true, true);
}

export function drawChevrons(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  direction: 1 | -1,
): void {
  for (let index = -1; index <= 1; index += 1) {
    const centerX = x + index * 15 * direction;
    graphics.beginPath();
    graphics.moveTo(centerX - 7 * direction, y - 10);
    graphics.lineTo(centerX + 3 * direction, y);
    graphics.lineTo(centerX - 7 * direction, y + 10);
    graphics.strokePath();
  }
}
