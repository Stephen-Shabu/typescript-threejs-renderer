import { Vector3 } from "three/src/math/Vector3.js";

export class MathUtilsExtended
{
    public static readonly RAD_CIRCLE: number = Math.PI * 2;

    static lerp(start: number, target: number, alpha: number): number
    {
        return start + (target - start) * alpha;
    }

    static getAngleFromDirection(direction: Vector3): number
    {
        let angle = Math.atan2(direction.x, direction.z);
        angle = (angle % MathUtilsExtended.RAD_CIRCLE + MathUtilsExtended.RAD_CIRCLE) % MathUtilsExtended.RAD_CIRCLE;

        return angle;
    }

    static interpolateAngle(startAngle: number, endAngle: number, t: number): number
    {
        let difference = endAngle - startAngle;
        difference += MathUtilsExtended.RAD_CIRCLE;

        difference = (difference + Math.PI) % (MathUtilsExtended.RAD_CIRCLE) - Math.PI;

        const interpolatedaAngle = startAngle + t * difference

        return interpolatedaAngle;
    }

    static piToRange(angle: number): number
    {
        angle = angle % (Math.PI * 2);

        if (angle > Math.PI || angle < -Math.PI)
        {

            return ((-Math.PI) - (Math.PI - Math.abs(angle))) * Math.sign(angle);
        }
        else
        {
            return angle;
        }
    }
}