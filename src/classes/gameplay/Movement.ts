import { Vector3 } from "three/src/math/Vector3.js";
import { MathUtilsExtended } from "../utility/MathUtilsExtended";
import RAPIER from "../../core/PhysicsWorld";
import { Group } from 'three';
import { Quaternion } from 'three';

export class Movement
{
	private topSpeed: number = 10;
    private accelerationSpeed: number = 100;
    private deAccelerationSpeed: number = 200;
    private currentSpeed: number = 0;
    private rotationSpeed: number = 12;
    private lastMoveVector: Vector3 = new Vector3();
    private currentMoveVector: Vector3 = new Vector3();
	private impulseForce: Vector3 = new Vector3(0, 0, 0);

    constructor(private actorRigidbody: RAPIER.RigidBody | undefined, private actorRootObject: Group | undefined) { }

    public move(direction: Vector3, dt:number): void
    {
        const canAccelerate: boolean = direction.lengthSq() > 0.25;

        if (canAccelerate) {
            this.lastMoveVector = this.currentMoveVector;
            this.currentMoveVector = direction;
        }
        else {
            this.currentMoveVector = this.lastMoveVector;
        }

        let speed = this.calculateSpeed(canAccelerate, dt);
        let moveVector = this.currentMoveVector.clone().multiplyScalar(speed);
		
		let vel = new Vector3(this.actorRigidbody!.linvel().x, this.actorRigidbody!.linvel().y, this.actorRigidbody!.linvel().z);
		vel.lerp(moveVector, dt);
		vel.y = this.actorRigidbody!.linvel().y;
		
        this.actorRigidbody?.setLinvel(vel, true);
    }

    public look(dt: number): void
    {				
        const currentAngle = MathUtilsExtended.getAngleFromDirection(this.actorRootObject!.getWorldDirection(new Vector3()));
        const targetAngle = MathUtilsExtended.getAngleFromDirection(new Vector3(this.currentMoveVector.x, 0, this.currentMoveVector.z));
        const angle = MathUtilsExtended.interpolateAngle(currentAngle, targetAngle, this.rotationSpeed * dt);
        let angleDelta = MathUtilsExtended.piToRange(currentAngle - targetAngle);

        if (angleDelta > Math.PI * 0.5 || angleDelta < -(Math.PI * 0.5)) {
            this.currentSpeed *= 0.25;
        }

        const rot: Quaternion = new Quaternion();
        rot.setFromAxisAngle(new Vector3(0, 1, 0), angle);
		
        this.actorRigidbody?.setRotation(rot, true);
        this.actorRigidbody?.lockRotations(true, true);
    }

    private calculateSpeed(canAccelerate: boolean, dt: number): number
    {
        this.currentSpeed += canAccelerate ? this.accelerationSpeed * dt : -(this.deAccelerationSpeed * dt);

        if (this.currentSpeed > this.topSpeed) {
            this.currentSpeed = this.topSpeed;
        }
        else if (this.currentSpeed < 0) {
            this.currentSpeed = 0;
        }

        return this.currentSpeed;
    }
}