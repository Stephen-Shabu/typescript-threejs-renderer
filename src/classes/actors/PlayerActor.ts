import { Actor, ActorDesc } from "../../core/Actor";
import { DynamicActor } from "./DynamicActor";
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { CollisionGroup, ColliderType} from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Group } from 'three';
import { Vector3 } from "three/src/math/Vector3.js";
import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { AnimationClip } from "three/src/animation/AnimationClip";
import { AnimationAction } from "three/src/animation/AnimationAction";
import { Resources } from "../../core/Resources";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import BaseStateMachine from "../../core/StateMachine/BaseStateMachine";
import PlayerActionStateMachine from "../states/player/action/PlayerActionStateMachine";
import { PlayerMoveState, PlayerIdleState } from "../../classes/states/player/movement/PlayerMovementStates";
import { PlayerNormalState, PlayerHitReactState } from "../../classes/states/player/condition/PlayerConditionStates";
import { PlayerIdleActionState, PlayerLightAttackState, PlayerLightAttackFollowUpState } from "../states/player/action/PlayerActionStates";
import { PlayerContext } from "../states/player/PlayerContext";
import { Movement } from "../gameplay/Movement";
import { OrbitalCamera } from '../../classes/gameplay/OrbitalCamera';
import { Animation, Animator } from "../gameplay/Animation";

export class PlayerActor extends DynamicActor
{
    private characterAnimationMixer: AnimationMixer | undefined;
    private characterAnimationClips: AnimationClip[] | undefined;
    private currentClip: AnimationClip = new AnimationClip();
    private currentAction: AnimationAction | undefined;
    private moveStateMachine: BaseStateMachine = new BaseStateMachine();
	private conditionStateMachine: BaseStateMachine = new BaseStateMachine();
    private actionStateMachine: PlayerActionStateMachine = new PlayerActionStateMachine();

    private playerContext: PlayerContext;
    private movementComponent: Movement;
	private animationComponent: Animation | undefined = undefined;
	
	private hitboxActor: DynamicActor = new DynamicActor(
	{
		colliderDesc: RAPIER.ColliderDesc.cuboid(0.2, 0.2, 0.2)
			.setSensor(true)
			.setCollisionGroups((CollisionGroup.PLAYER_HITBOX << 16 ) | CollisionGroup.ENEMY_HURTBOX),
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
			.setCollisionGroups((CollisionGroup.PLAYER_HURTBOX << 16 ) | CollisionGroup.ENEMY_HITBOX),
		rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased(),
		colliderData: {colliderType: ColliderType.HITBOX}
	}
	);

	constructor(desc: ActorDesc, private camera: OrbitalCamera)
    {	
		super(desc);
		
        this.movementComponent = new Movement(this.actorRigidbody, this.actorRootObject);
        this.playerContext = {
            Rigidbody: this.actorRigidbody,
            Movement: this.movementComponent,
            Camera: camera,
            InputVector: new Vector3(0, 0, 0),
            Heading: new Vector3(0, 0, 0),
			HitDirection: new Vector3(0, 0, 0),
            Transform: this.actorRootObject,
			Animation: this.animationComponent,
			HitBox: this.hitboxActor,
			HurtBox: this.hurtboxActor
        };

        this.moveStateMachine.addState(PlayerMoveState, new PlayerMoveState(this.moveStateMachine, this.playerContext));
        this.moveStateMachine.addState(PlayerIdleState, new PlayerIdleState(this.moveStateMachine, this.playerContext));

        this.actionStateMachine.addState(new PlayerIdleActionState(this.actionStateMachine, this.playerContext));
        this.actionStateMachine.addState(new PlayerLightAttackState(this.actionStateMachine, this.playerContext));
		this.actionStateMachine.addState(new PlayerLightAttackFollowUpState(this.actionStateMachine, this.playerContext));
        this.actionStateMachine.changeState(PlayerIdleActionState);
		
		this.conditionStateMachine.addState(PlayerNormalState, new PlayerNormalState(this.conditionStateMachine, this.playerContext));
		this.conditionStateMachine.addState(PlayerHitReactState, new PlayerHitReactState(this.conditionStateMachine, this.playerContext));
		this.conditionStateMachine.changeState(PlayerNormalState);
    }

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        super.addToScene(gameScene);
		
		const physics = Singleton.get().PhysicsWorld;
		physics?.addActor(this.hitboxActor);
		physics?.addActor(this.hurtboxActor);
    }

    public setupCharacterMesh(resourceModule: Resources, alias: string): void
    {		
		this.actorMesh!.castShadow = true;
		this.actorMesh!.receiveShadow = true;
		
		this.animationComponent = new Animation({
			mixer: new AnimationMixer(this.actorRootObject!),
			clips: resourceModule.getAsset(alias).animations
		});
		this.playerContext.Animation = this.animationComponent;
		this.moveStateMachine.changeState(PlayerIdleState);

		const weapon = SkeletonUtils.clone(resourceModule.getAsset("sm_spartan_spear").scene);
		this.actorRootObject!.traverse((object) => 
		{
			if (object.name.startsWith("MCH-hand_tweakL")) 
			{
				object.add(weapon);
				weapon.rotation.set(Math.PI * 0.5, 0, 0);
				weapon.position.set(0, 0, -0.5);
			}
		});
    }

    public update(dt: number): void
    {
        this.moveStateMachine.update(dt);
        this.actionStateMachine.update(dt);
		this.conditionStateMachine.update(dt);
    }
}