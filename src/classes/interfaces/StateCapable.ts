export default interface StateCapable
{
    enter(): void;
    update(dt: number): void;
    exit(): void;
}