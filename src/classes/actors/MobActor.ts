import { ActorDesc } from "../../core/Actor";
import { DynamicActor } from "./DynamicActor";
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { CollisionGroup, ColliderType, HitInfo } from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Vector3 } from "three/src/math/Vector3.js";
import { Resources } from "../../core/Resources";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { Movement } from "../gameplay/Movement";
import { Health } from "../gameplay/Health";
import { Animation } from "../gameplay/Animation";
import { MobContext } from "../states/mob/MobContext";
import BaseStateMachine from "../../core/StateMachine/BaseStateMachine";
import { MobWaitState, MobMoveState } from "../../classes/states/mob/movement/MobMovementStates";
import { MobIdleActionState } from "../../classes/states/mob/action/MobActionStates";
import { MobNormalState, MobHitReactState, MobDeathState } from "../../classes/states/mob/condition/MobConditionStates";

export class MobActor extends DynamicActor
{
    private mobContext: MobContext;
	private moveStateMachine: BaseStateMachine = new BaseStateMachine();
	private actionStateMachine: BaseStateMachine = new BaseStateMachine();
	private conditionStateMachine: BaseStateMachine = new BaseStateMachine();
	
    private movementComponent: Movement;
	private healthComponent: Health;
	private animationComponent: Animation | undefined = undefined;
	
	private hitboxActor: DynamicActor = new DynamicActor(
	{
		colliderDesc: RAPIER.ColliderDesc.cuboid(0.2, 0.2, 0.2)
			.setSensor(true)
			.setCollisionGroups((CollisionGroup.ENEMY_HITBOX << 16 ) | CollisionGroup.PLAYER_HURTBOX),
		rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased(),
		colliderData: {colliderType: ColliderType.HITBOX}
	}
	);
	
	private hurtboxActor: DynamicActor = new DynamicActor(
	{
		colliderDesc: RAPIER.ColliderDesc.cuboid(0.3, 0.3, 0.3)
			.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL)
			.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
			.setSensor(true)
			.setCollisionGroups((CollisionGroup.ENEMY_HURTBOX << 16 ) | CollisionGroup.PLAYER_HITBOX),
		rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 1, 0),
		colliderData: {colliderType: ColliderType.HURTBOX}
	}
	);

	constructor(desc: ActorDesc)
    {	
		super(desc);
		
		this.movementComponent = new Movement(this.actorRigidbody, this.actorRootObject);
		this.healthComponent = new Health(10);
		
		this.mobContext = {
            Rigidbody: this.actorRigidbody,
            Movement: this.movementComponent,
            Heading: new Vector3(0, 0, 0),
			HitDirection: new Vector3(0, 0, 0),
            Transform: this.actorRootObject,
			Animation: this.animationComponent,
			Health: this.healthComponent,
			HitBox: this.hitboxActor,
			HurtBox: this.hurtboxActor
        };
		
		this.moveStateMachine.addState(MobWaitState, new MobWaitState(this.moveStateMachine, this.mobContext));
        this.moveStateMachine.addState(MobMoveState, new MobMoveState(this.moveStateMachine, this.mobContext));
		this.moveStateMachine.changeState(MobWaitState);
		
		this.actionStateMachine.addState(MobIdleActionState, new MobIdleActionState(this.actionStateMachine, this.mobContext));
		this.actionStateMachine.changeState(MobIdleActionState);
		
		this.conditionStateMachine.addState(MobNormalState, new MobNormalState(this.conditionStateMachine, this.mobContext));
		this.conditionStateMachine.addState(MobHitReactState, new MobHitReactState(this.conditionStateMachine, this.mobContext));
		this.conditionStateMachine.addState(MobDeathState, new MobDeathState(this.conditionStateMachine, this.mobContext));
		this.conditionStateMachine.changeState(MobNormalState);
    }

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        super.addToScene(gameScene);
		
		const physics = Singleton.get().PhysicsWorld;
		physics?.addActor(this.hurtboxActor);
		physics?.addActor(this.hitboxActor);
    }

    public setupCharacterMesh(resourceModule: Resources, alias: string): void
    {
		this.actorMesh!.castShadow = true;
		this.actorMesh!.receiveShadow = true;
    }

    public update(dt: number): void
    {
		this.moveStateMachine.update(dt);
		this.actionStateMachine.update(dt);
		this.conditionStateMachine.update(dt);
    }
}