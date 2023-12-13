import { useEffect, useRef } from "react";
import "./test.css";

class CanvasOption {
  protected canvas: HTMLCanvasElement;
  constructor(
    canvas: HTMLCanvasElement,
    protected clientWidth = document.documentElement.clientWidth,
    protected clientHeight = document.documentElement.clientHeight,
    protected dpr = window.devicePixelRatio,
    protected fps = 60,
    protected interval = 1000 / fps,
    protected then = Date.now(),
    protected now = Date.now(),
    protected delta = now - then,
    protected bgColor = "#000000"
  ) {
    this.canvas = canvas;
  }
}

class Tail extends CanvasOption {
  private ctx: CanvasRenderingContext2D | null;
  public x: number;
  public y: number;
  public vy: number;
  public color: string;
  private opacity: number;
  private friction: number;
  private angle: number;
  constructor(canvas: HTMLCanvasElement, x: number, vy: number, color: string) {
    super(canvas);
    this.ctx = canvas.getContext("2d");

    this.angle = randomNumBetween(0, 2);

    this.x = x;
    this.y = this.clientHeight;

    this.vy = vy;
    this.color = color;

    this.friction = 0.985;
    this.opacity = 1;
  }

  update() {
    this.vy *= this.friction;

    this.y += this.vy;

    this.angle += 1;
    this.x += Math.cos(this.angle) * 0.2 * this.vy;

    this.opacity = -this.vy * 0.1;
  }

  draw() {
    this.ctx!.fillStyle = `rgba(${this.color},${this.opacity})`;
    this.ctx!.beginPath();
    this.ctx!.arc(this.x, this.y, 2, 0, Math.PI * 2);
    this.ctx?.fill();
    this.ctx?.closePath();
  }
}
export const randomNumBetween = (max: number, min: number) =>
  Math.random() * (max - min) + min;

export const hypotenuse = (x: number, y: number) =>
  Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
export class Particles {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null | undefined;
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  public opacity: number;
  private gravity: number;
  private friction: number;
  constructor(
    canvas: HTMLCanvasElement | null,
    x: number,
    y: number,
    vx: number,
    vy: number,
    opacity: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext("2d");
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.opacity = opacity;
    this.gravity = 0.12;
    this.friction = 0.93;
  }

  update() {
    this.vy += this.gravity;

    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= 0.01;
  }
  draw() {
    this.ctx?.beginPath();
    this.ctx?.arc(this.x, this.y, 2, 0, Math.PI * 2);
    this.ctx!.fillStyle = `rgba(255,255,255,${this.opacity})`;
    this.ctx?.fill();
    this.ctx?.closePath();
  }
}
export class Canvas extends CanvasOption {
  // private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null | undefined;
  private particles: Particles[] = [];
  private tails: Tail[] = [];
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.ctx = canvas?.getContext("2d");
    this.particles = [];
  }
  init() {
    this.clientWidth = document.documentElement.clientWidth;
    this.clientHeight = document.documentElement.clientHeight;

    this.canvas!.width = this.clientWidth * this.dpr;
    this.canvas!.height = this.clientHeight * this.dpr;

    this.ctx?.scale(this.dpr, this.dpr);
    this.canvas!.style.width = `${this.clientWidth}px`;
    this.canvas!.style.height = `${this.clientHeight}px`;

    // this.createParticles();
    // this.createTales();
  }

  createTales() {
    const x = randomNumBetween(this.clientWidth * 0.2, this.clientWidth * 0.8);
    const vy = this.clientHeight * randomNumBetween(0.01, 0.015) * -1;
    const color = "255,255,255";
    this.tails.push(new Tail(this.canvas, x, vy, color));
  }

  createParticles(x: number, y: number, color: string) {
    const _mxCnt = 700;

    // const x = randomNumBetween(0, this.clientWidth);
    // const y = randomNumBetween(0, this.clientHeight);
    for (let i = 0; _mxCnt > i; i++) {
      const r =
        randomNumBetween(2, 100) *
        hypotenuse(this.clientWidth, this.clientHeight) *
        0.0001;
      const angle = (Math.PI / 180) * randomNumBetween(0, 360);
      const vx = r * Math.cos(angle);
      const vy = r * Math.sin(angle);
      const opacity = randomNumBetween(0.6, 0.9);
      this.particles.push(new Particles(this.canvas, x, y, vx, vy, opacity));
    }
  }

  render() {
    const frame = () => {
      requestAnimationFrame(frame);
      this.now = Date.now();
      this.delta = this.now - this.then;
      if (this.delta < this.interval) return;

      if (Math.random() < 0.03) this.createTales();
      this.tails.forEach((tail, idx) => {
        tail.update();
        tail.draw();

        if (tail.vy > -0.7) {
          this.tails.splice(idx, 1);
          this.createParticles(tail.x, tail.y, tail.color);
        }
      });

      this.ctx!.fillStyle = this.bgColor + "30";
      this.ctx?.fillRect(0, 0, this.clientWidth, this.clientHeight);
      this.particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.opacity < 0) this.particles.splice(index, 1);
      });
      this.then = this.now - (this.delta % this.interval);
    };
    frame();
  }
}
const Option = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = new Canvas(canvasRef.current!);
    canvas.init();
    canvas.render();
    window.addEventListener("resize", canvas.init);

    return () => {
      window.removeEventListener("resize", canvas.init);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};
export { Option };
