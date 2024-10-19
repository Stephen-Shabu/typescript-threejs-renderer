import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { Vector3 } from "three/src/math/Vector3.js";
import { MathUtilsExtended } from "./MathUtilsExtended";

export class OrbitalCamera
{
    get View(): PerspectiveCamera
    {
        return this.activeCamera;
    }

    private activeCamera: PerspectiveCamera = new PerspectiveCamera();
    private currentAngle: number = 0;

    constructor(fov: number, nearClipPlane: number, farClipPlane: number)
    {
        this.activeCamera.fov = fov;
        this.activeCamera.aspect = window.innerWidth / window.innerHeight;
        this.activeCamera.near = nearClipPlane;
        this.activeCamera.far = farClipPlane;
        this.activeCamera.updateProjectionMatrix();
        this.activeCamera.position.y = 10;
        this.activeCamera.position.z = 100;
    }

    public updateOrbit(target: Vector3 | undefined, orbitDirection: number, targetHeight: number, dt: number): void
    {
        if (target == undefined) return;

        this.currentAngle += (1 * orbitDirection * dt);
        this.currentAngle = (this.currentAngle % MathUtilsExtended.RAD_CIRCLE + MathUtilsExtended.RAD_CIRCLE) % MathUtilsExtended.RAD_CIRCLE;

        const distance = 10;
        let x = target.x + Math.cos(this.currentAngle) * distance;
        let z = target.z + Math.sin(this.currentAngle) * distance;
        let direction: Vector3 = new Vector3();
        direction.x = target.x - this.activeCamera.position.x;
        direction.z = target.z - this.activeCamera.position.z;

        this.activeCamera.position.x = x;
        this.activeCamera.position.z = z;
        this.activeCamera.position.y = targetHeight;
    }
}