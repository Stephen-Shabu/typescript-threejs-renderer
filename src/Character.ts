import { Vector3 } from "three/src/math/Vector3.js";
import { Group } from "three/src/objects/Group.js";
import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { AnimationAction } from "three/src/animation/AnimationAction"
import { AnimationClip } from "three/src/animation/AnimationClip"
import { LoadingManager } from "three/src/loaders/LoadingManager";

export abstract class Character
{
    public characterObject: Group | undefined;
    public weaponObject: Group = new Group();
    public characterAnimationMixer: AnimationMixer | undefined;
    public characterAnimationClips: AnimationClip[] | undefined;
    public topSpeed: number = 0;
    public accelerationSpeed: number = 0;
    public deAccelerationSpeed: number = 0;
    public currentSpeed: number = 0;
    public rotationSpeed: number = 0;
    public currentAction: AnimationAction | undefined;
    public lastMoveVector: Vector3 = new Vector3();
    public currentMoveVector: Vector3 = new Vector3();

    public abstract update(direction: Vector3, dt: number): void
    public abstract animate(direction: Vector3, speed: number, dt: number): void
    public abstract loadMesh(resourcePath: string, loadingManager: LoadingManager): void
    public abstract calculateSpeed(canAccelerate: boolean, dt: number): number;
}