export default class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    
    subtract(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    
    multiply(other: Vector2): Vector2 {
        return new Vector2(this.x * other.x, this.y * other.y);
    }
    
    divide(other: Vector2): Vector2 {
        return new Vector2(this.x / other.x, this.y / other.y);
    }
    
    equals(other: Vector2): boolean {
        return this.x === other.x && this.y === other.y;
    }
    
    toString(): string {
        return `[${this.x}, ${this.y}]`;
    }
}