import { ActorDesc } from "../../core/Actor";
import { DynamicActor } from "./DynamicActor";
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { CollisionGroup, ColliderType, HitInfo } from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Vector3 } from "three/src/math/Vector3.js";
import { Resources, Unit } from "../../core/Resources";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { Movement } from "../gameplay/Movement";
import { Health } from "../gameplay/Health";
import HealthFx from "../gameplay/HealthFx";
import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { AnimationClip } from "three/src/animation/AnimationClip";
import { AnimationAction } from "three/src/animation/AnimationAction";
import { Animation } from "../gameplay/Animation";
import { Weapon } from '../../classes/gameplay/MeleeWeapon';
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
	private healthFXComponent: HealthFx;
	private animationComponent: Animation;
	private meleeWeapon: Weapon;
	
	private hurtboxActor: DynamicActor = new DynamicActor(
	{
		colliderDesc: RAPIER.ColliderDesc.cuboid(0.3, 0.3, 0.3)
			.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL)
			.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
			.setSensor(true)
			.setCollisionGroups((CollisionGroup.ENEMY_HURTBOX << 16 ) | CollisionGroup.PLAYER_HITBOX),
		rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 1, 0),
		colliderData: {colliderType: ColliderType.HURTBOX}
	});

	constructor(desc: ActorDesc, unitData: Unit, resourceModule: Resources)
    {	
		super(desc);
		
		this.movementComponent = new Movement(this.actorRigidbody, this.actorRootObject);
		this.healthComponent = new Health(100);
		this.healthFXComponent = new HealthFx(this.healthComponent , this.actorMesh!.material);

		this.meleeWeapon = new Weapon(resourceModule, unitData.weapon, 
		{
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.05, 0.22, 0.1)
				.setSensor(true)
				.setCollisionGroups((CollisionGroup.ENEMY_HITBOX << 16 ) | CollisionGroup.PLAYER_HURTBOX),
			rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased(),
			colliderData: {colliderType: ColliderType.HITBOX}
		});
		
		this.animationComponent = this.createAnimation(resourceModule, unitData.mesh);
		
		this.mobContext = {
            Rigidbody: this.actorRigidbody,
            Movement: this.movementComponent,
            Heading: new Vector3(0, 0, 0),
			HitDirection: new Vector3(0, 0, 0),
            Transform: this.actorRootObject,
			ActorMesh: this.actorMesh,
			Animation: this.animationComponent,
			Health: this.healthComponent,
			MeleeWeapon: this.meleeWeapon,
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
		
		this.actorMesh!.castShadow = true;
		this.actorMesh!.receiveShadow = true;
		
		this.actorRootObject!.traverse((object) => 
		{
			if (object.name.startsWith("MCH-hand_tweakL")) 
			{
				object.add(this.meleeWeapon!.Root);
			}
		});
    }
	
	private createAnimation(resourceModule: Resources, alias: string): Animation
	{
		const mixer = new AnimationMixer(this.actorRootObject!);
		const clips = resourceModule.getAsset(alias).animations;
		console.log(clips);
		
		const idleAction = mixer.clipAction(AnimationClip.findByName(clips, 'AI_Barbarian_Idle_Loop'));
		const runAction = mixer.clipAction(AnimationClip.findByName(clips, 'AI_Barbarian_Run_Fwd_Loop'));
		const attackAction = mixer.clipAction(AnimationClip.findByName(clips, 'AI_Barbarian_Attack_Light_01'));
		const hurtAction = mixer.clipAction(AnimationClip.findByName(clips, 'AI_Barbarian_Hurt_Fwd_01'));
		
		const component = new Animation(
			mixer,
			idleAction,
			runAction,
			attackAction,
			hurtAction
		);
		
		return component;
	}

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        super.addToScene(gameScene);
		
		const physics = Singleton.get().PhysicsWorld;
		physics?.addActor(this.hurtboxActor);
    }

    public update(dt: number): void
    {
		this.moveStateMachine.update(dt);
		this.actionStateMachine.update(dt);
		this.conditionStateMachine.update(dt);
		
		this.animationComponent.update(dt);
		this.meleeWeapon.syncHitboxToSocket();
    }
}