import { Actor } from "../../core/Actor";
import {Quaternion } from 'three';
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Group } from 'three';
import { Vector3 } from "three/src/math/Vector3.js";
import { MathUtilsExtended } from "../utility/MathUtilsExtended";
import { BoxGeometry } from "three";
import { MeshStandardMaterial } from "three";
import { Mesh } from "three/src/objects/Mesh";
import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { AnimationClip } from "three/src/animation/AnimationClip";
import { AnimationAction } from "three/src/animation/AnimationAction";
import { Object3D } from 'three';
import { Resources } from "../../core/Resources";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

export class PlayerActor extends Actor
{
    get ColliderHandle(): number | undefined
    {
        return this.actorCollider?.handle;
    }

    private topSpeed: number = 5;
    private accelerationSpeed: number = 10;
    private deAccelerationSpeed: number = 20;
    private currentSpeed: number = 0;
    private rotationSpeed: number = 12;
    private lastMoveVector: Vector3 = new Vector3();
    private currentMoveVector: Vector3 = new Vector3();
    private canAttack: boolean = false;
    private canDodge: boolean = false;

    protected actorCollider: RAPIER.Collider | undefined;
    protected actorColliderDesc: RAPIER.ColliderDesc;
    protected actorRigidbodyDesc: RAPIER.RigidBodyDesc;
    protected actorRigidbody: RAPIER.RigidBody | undefined;

    private characterAnimationMixer: AnimationMixer | undefined;
    private characterAnimationClips: AnimationClip[] | undefined;
    private currentClip: AnimationClip = new AnimationClip();
    private currentAction: AnimationAction | undefined;


    constructor(group: Group, colliderDesc: RAPIER.ColliderDesc, rbDesc: RAPIER.RigidBodyDesc)
    {
        super(undefined, undefined, group);

        const physics = Singleton.get().PhysicsWorld;

        this.actorColliderDesc = colliderDesc;
        this.actorRigidbodyDesc = rbDesc;
        this.actorRigidbody = physics.World?.createRigidBody(rbDesc);
        this.actorCollider = physics.World?.createCollider(colliderDesc, this.actorRigidbody);
    }

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        super.addToScene(gameScene);

        const head = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshStandardMaterial());
        this.attachObject(head);
        head.position.z = 0.5;
    }

    public setupCharacterMesh(resourceModule: Resources, alias: string): void
    {
        const clonedCharacter = SkeletonUtils.clone(resourceModule.getAsset(alias));
        clonedCharacter.scale.set(0.01, 0.01, 0.01);
        clonedCharacter.castShadow = true;

        //const clonedWeapon = SkeletonUtils.clone(resourceModule.getAsset("sm_short_sword"));
        //clonedWeapon.scale.set(0.006, 0.006, 0.006);

        clonedCharacter.traverse((object): void =>
        {
            //console.log(object);
            if (object.name.startsWith('PalmR'))
            {
                //console.log("found " + object.name);
                //object.add(clonedWeapon);
                //clonedWeapon.rotation.set(0, 0, Math.PI * .5);
            }
        });

        this.attachObject(clonedCharacter);
        this.setUpAnimations(clonedCharacter);
        clonedCharacter.position.y = -1;
    }

    private setUpAnimations(group: Object3D): void
    {
        this.characterAnimationMixer = new AnimationMixer(group);
        this.characterAnimationClips = group.animations;
    }

    public updatePositionAndRotation(): void
    {
        const rbPosition = this.actorRigidbody?.translation();
        const rbRotation = this.actorRigidbody?.rotation();

        if (rbPosition && rbRotation)
        {
            this.actorRootObject?.position.copy(rbPosition);
            this.actorRootObject?.quaternion.copy(rbRotation);
        }
    }

    public update(direction: Vector3, dt: number): void
    {
        const canAccelerate: boolean = direction.lengthSq() > 0.25;

        if (canAccelerate)
        {
            this.lastMoveVector = this.currentMoveVector;
            this.currentMoveVector = direction;
        }
        else
        {
            this.currentMoveVector = this.lastMoveVector;
        }


        let speed = this.calculateSpeed(canAccelerate, dt);
        let moveVector = this.currentMoveVector.clone().multiplyScalar(speed);
        moveVector.y = this.actorRigidbody!.linvel().y;

        const currentAngle = MathUtilsExtended.getAngleFromDirection(this.actorRootObject!.getWorldDirection(new Vector3()));
        const targetAngle = MathUtilsExtended.getAngleFromDirection(new Vector3(this.currentMoveVector.x, 0, this.currentMoveVector.z));
        const angle = MathUtilsExtended.interpolateAngle(currentAngle, targetAngle, this.rotationSpeed * dt);
        let angleDelta = MathUtilsExtended.piToRange(currentAngle - targetAngle);

        if (angleDelta > Math.PI * 0.5 || angleDelta < -(Math.PI * 0.5))
        {
            speed *= 0.25;
        }
        const rot: Quaternion = new Quaternion();
        rot.setFromAxisAngle(new Vector3(0, 1, 0), angle);

        this.actorRigidbody?.setLinvel(moveVector, true);
        this.actorRigidbody?.setRotation(rot, true);
        this.animate(direction, 0, dt);
    }

    public animate(direction: Vector3, speed: number, deltaTime: number): void
    {
        if (this.characterAnimationClips == undefined) return;

        const input = Singleton.get().Input;
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);
        let dodgePressed: number = (input.Keys.get('space')?.isDown ? 1 : 0);

        if (dodgePressed)
        {
            if (!this.canDodge)
            {
                console.log("dogde pressed");
                this.canDodge = true;
            }
        }

        if (actionPressed)
        {
            if (!this.canAttack)
            {
                console.log("action pressed");

                this.canAttack = true;
                this.currentClip = AnimationClip.findByName(this.characterAnimationClips, 'Armature|spartan_slash_l');

                setTimeout((): void =>
                {
                    const thrustDirection = this.actorRootObject?.getWorldDirection(new Vector3());

                    if (thrustDirection)
                    {
                        this.actorRigidbody?.setLinvel(thrustDirection.multiplyScalar(30), true);
                    }

                }, (this.currentClip.duration * 1000) * 0.3);

                setTimeout((): void => { this.canAttack = false; console.log("action complete"); }, this.currentClip.duration * 1000);
            }
        }

        if (!this.canAttack && !this.canDodge)
        {
            this.currentClip = direction.lengthSq() > 0.25 ? AnimationClip.findByName(this.characterAnimationClips, 'Armature|spartan_run') :
                AnimationClip.findByName(this.characterAnimationClips, 'Armature|spartan_idle');
        }

        const previousAction = this.currentAction;
        this.currentAction = this.characterAnimationMixer?.clipAction(this.currentClip);

        if (previousAction !== this.currentAction)
        {
            if (previousAction)
            {
                previousAction.fadeOut(0.25);
            }

            this.currentAction?.reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(0.25)
                .play();
        }

        if (this.characterAnimationMixer) this.characterAnimationMixer.update(deltaTime);
    }

    private performDodge(): void
    {
        if (this.characterAnimationClips == undefined) return;

        this.currentClip = AnimationClip.findByName(this.characterAnimationClips, 'HumanArmature|Roll');
        setTimeout((): void => { this.canDodge = false; console.log("roll complete"); }, this.currentClip.duration * 1000);
    }

    public calculateSpeed(canAccelerate: boolean, dt: number): number
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