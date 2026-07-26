import { Actor, ActorDesc } from "../../core/Actor";
import { DynamicActor } from "./DynamicActor";
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { CollisionGroup, ColliderType} from "../../core/PhysicsWorld";
import { HitInfo } from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Group } from 'three';
import { AnimationActionLoopStyles, LoopRepeat } from 'three';
import { Vector3 } from "three/src/math/Vector3.js";
import { BoxGeometry } from "three";
import { MeshStandardMaterial } from "three";
import { Mesh } from "three/src/objects/Mesh";
import { Object3D } from 'three';
import { Resources } from "../../core/Resources";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import BaseStateMachine from "../../core/StateMachine/BaseStateMachine";
import { Movement } from "../gameplay/Movement";
import { Animation, Animator } from "../gameplay/Animation";

export class MobActor extends DynamicActor
{
	private hurtboxActor: DynamicActor = new DynamicActor(
	{
		geometry: new BoxGeometry(1, 1, 1),
		material: new MeshStandardMaterial(),
		colliderDesc: RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
			.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL)
			.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
			.setSensor(true)
			.setCollisionGroups((CollisionGroup.ENEMY_HURTBOX << 16 ) | CollisionGroup.PLAYER_HITBOX),
		rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 1, 0),
		group: new Group(),
		colliderData: {colliderType: ColliderType.HURTBOX}
	}
	);

	constructor(desc: ActorDesc)
    {	
		super(desc);
    }

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        super.addToScene(gameScene);
		
		const physics = Singleton.get().PhysicsWorld;
		physics?.addActor(this.hurtboxActor);

        const head = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshStandardMaterial());
        this.attachObject(head);
        head.position.z = 0.5;
    }

    public setupCharacterMesh(resourceModule: Resources, alias: string): void
    {
        const clonedCharacter = SkeletonUtils.clone(resourceModule.getAsset(alias).scene);
		console.log(resourceModule.getAsset(alias));
		console.log(clonedCharacter.type)
        clonedCharacter.scale.set(1, 1, 1);
        clonedCharacter.castShadow = true;

        this.attachObject(clonedCharacter);
        clonedCharacter.position.y = -1;
		this.hurtboxActor.onActorHit = (hitInfo:HitInfo) => { this.handleOnHurtBoxCollision(hitInfo)};
    }
	
	private handleOnHurtBoxCollision(hitInfo:HitInfo): void
	{	
		const hitDirection = new Vector3(
			hitInfo.hitNormal.x,
			hitInfo.hitNormal.y,
			hitInfo.hitNormal.z
		);
		
		if(hitDirection)
			this.actorRigidbody?.setLinvel(hitDirection.clone().multiplyScalar(3), true);
	}

    public update(dt: number): void
    {
    }
}