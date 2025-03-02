export class Target {
  x: number;
  y: number;
  size: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = 15;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}