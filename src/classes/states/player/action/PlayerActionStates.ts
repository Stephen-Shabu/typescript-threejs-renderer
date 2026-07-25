import { ActionStateCapable, Ctor } from "../../../interfaces/ActionStateCapable"
import PlayerActionStateMachine from "../action/PlayerActionStateMachine"
import { PlayerContext } from "../PlayerContext"
import RAPIER from '../../../../core/PhysicsWorld';
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";
import { UtilityFunctions } from "../../../utility/UtilityFunctions";
import { Animator } from "../../../gameplay/Animation";
import { AnimationClip } from "three/src/animation/AnimationClip";
import { AnimationActionLoopStyles, LoopRepeat, LoopOnce } from 'three';

const PlayerIdleActionStateKind = Symbol("PlayerIdleActionState");
const PlayerLightAttackStateKind = Symbol("PlayerLightAttackState");

export class PlayerIdleActionState implements ActionStateCapable
{
    kind = PlayerIdleActionStateKind;
    priority: number = 0;
    canBeInterupted: boolean = true;

    constructor(private actionFSM: PlayerActionStateMachine, private ctx: PlayerContext) { }

    enter(): void
    {
        console.log("Entered idle action");
    }

    update(dt: number): void
    {
        const input = Singleton.get().Input;
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);

        if (actionPressed)
        {
            this.actionFSM.changeState(PlayerLightAttackState);
        }
    }

    exit(): void
    {

    }

    canTransitionTo(ctor: Ctor): boolean
    {
        return true;
    }
}

export class PlayerLightAttackState implements ActionStateCapable
{
    kind = PlayerLightAttackStateKind;
    priority: number = 10;
    canBeInterupted: boolean = false;
    private timer: number = 0;
    private queuedNext: boolean = false;
    private hitBox: RAPIER.Collider | undefined;

    private readonly DURATION = 0.6;
    private readonly COMBO_WINDOW_START = 0.3;
    private readonly COMBO_WINDO_END = 0.6;

    constructor(private actionFSM: PlayerActionStateMachine, private ctx: PlayerContext)
    {
        const physics = Singleton.get().PhysicsWorld;
        const hitBoxDesc = RAPIER.ColliderDesc.cuboid(0.2, 0.1, 0.2);

        this.hitBox = physics.World?.createCollider(hitBoxDesc);
    }

    enter(): void
    {
        this.timer = 0;
        this.queuedNext = false;
        console.log("performed light attack");
        //this.hitBox?.setEnabled(true);
        this.hitBox?.setEnabled(false);
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
		
		this.ctx?.Animation?.setAnimationOneShot(this.updateAnimation.bind(this));
		if(this.ctx.Animation !== undefined)
			this.ctx.Animation.applyOneShotAnimation();

        if (playerPosition != undefined)
        {
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);

            this.hitBox?.setTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
        }
    }

    update(dt: number): void
    {
        this.timer += dt;
        const input = Singleton.get().Input;
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
        if (playerPosition != undefined) {
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);

            this.hitBox?.setTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
        }

        if (this.timer >= this.COMBO_WINDOW_START &&
            this.timer <= this.COMBO_WINDO_END && actionPressed)
        {
            this.queuedNext = true;
        }

        if (this.timer >= this.DURATION)
        {
            if (this.queuedNext)
            {
				console.log("try follow up")
                this.actionFSM.changeState(PlayerLightAttackFollowUpState);
            }
            else
            {
                this.actionFSM.forceIdle();
            }
        }
    }

    exit(): void
    {
        this.hitBox?.setEnabled(false);

        const playerPosition = this.ctx.Rigidbody!.translation();

        this.hitBox?.setTranslation({ x: playerPosition.x, y: playerPosition.y, z: playerPosition.z });
    }
	
    canTransitionTo(ctor: Ctor): boolean
    {
        return ctor === PlayerIdleActionState || ctor === PlayerLightAttackFollowUpState;
    }
	
	private updateAnimation(animator:Animator): void
	{
		if(this.ctx.Animation !== undefined)
		{
			const clip = AnimationClip.findByName(animator.clips, 'CH_Spartan_Attack_Light');
			const previousAction = this.ctx.Animation.CurrentAction;
			this.ctx.Animation.CurrentAction = animator.mixer.clipAction(clip);
		
			if (previousAction !== this.ctx.Animation.CurrentAction)
			{
				if (previousAction)
				{
					previousAction.fadeOut(0.25);
				}
			
				this.ctx.Animation.CurrentAction?.reset()
                .setEffectiveTimeScale(this.DURATION)
                .setEffectiveWeight(1)
                .fadeIn(0.25)
				.setLoop(LoopOnce, 0)
                .play();
			}
		}
	}
}

export class PlayerLightAttackFollowUpState implements ActionStateCapable
{
	kind = PlayerLightAttackStateKind;
    priority: number = 11;
    canBeInterupted: boolean = false;
    private timer: number = 0;
    private queuedNext: boolean = false;
    private hitBox: RAPIER.Collider | undefined;

    private readonly DURATION = 0.6;
    private readonly COMBO_WINDOW_START = 0.3;
    private readonly COMBO_WINDO_END = 0.6;

    constructor(private actionFSM: PlayerActionStateMachine, private ctx: PlayerContext)
    {
        const physics = Singleton.get().PhysicsWorld;
        const hitBoxDesc = RAPIER.ColliderDesc.cuboid(0.2, 0.1, 0.2);

        this.hitBox = physics.World?.createCollider(hitBoxDesc);
    }

    enter(): void
    {
        this.timer = 0;
        this.queuedNext = false;
        console.log("performed light attack follow");
        //this.hitBox?.setEnabled(true);
        this.hitBox?.setEnabled(false);
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
		
		this.ctx?.Animation?.setAnimationOneShot(this.updateAnimation.bind(this));
		if(this.ctx.Animation !== undefined)
			this.ctx.Animation.applyOneShotAnimation();

        if (playerPosition != undefined)
        {
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);

            this.hitBox?.setTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
        }
    }

    update(dt: number): void
    {
        this.timer += dt;
        const input = Singleton.get().Input;
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
        if (playerPosition != undefined) {
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);

            this.hitBox?.setTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
        }

        if (this.timer >= this.COMBO_WINDOW_START &&
            this.timer <= this.COMBO_WINDO_END && actionPressed)
        {
            this.queuedNext = true;
        }

        if (this.timer >= this.DURATION)
        {
            if (this.queuedNext)
            {
                this.actionFSM.changeState(PlayerLightAttackState);
            }
            else
            {
                this.actionFSM.forceIdle();
            }
        }
    }

    exit(): void
    {
        this.hitBox?.setEnabled(false);

        const playerPosition = this.ctx.Rigidbody!.translation();

        this.hitBox?.setTranslation({ x: playerPosition.x, y: playerPosition.y, z: playerPosition.z });
    }

    canTransitionTo(ctor: Ctor): boolean
    {
        return ctor === PlayerIdleActionState || ctor === PlayerLightAttackFollowUpState;
    }
	
	private updateAnimation(animator:Animator): void
	{
		if(this.ctx.Animation !== undefined)
		{
			const clip = AnimationClip.findByName(animator.clips, 'CH_Spartan_Attack_Light');
			const previousAction = this.ctx.Animation.CurrentAction;
			this.ctx.Animation.CurrentAction = animator.mixer.clipAction(clip);
		
			if (previousAction !== this.ctx.Animation.CurrentAction)
			{
				if (previousAction)
				{
					previousAction.fadeOut(0.25);
				}
			
				this.ctx.Animation.CurrentAction?.reset()
                .setEffectiveTimeScale(this.DURATION)
                .setEffectiveWeight(1)
                .fadeIn(0.25)
				.setLoop(LoopOnce, 0)
                .play();
			}
		}
	}
}