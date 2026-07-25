import StateCapable from "../../../interfaces/StateCapable";
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine";
import { PlayerContext } from "../PlayerContext";
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";
import { Animator } from "../../../gameplay/Animation";
import { AnimationClip } from "three/src/animation/AnimationClip";

export class PlayerMoveState implements StateCapable
{
    constructor(private moveFSM: BaseStateMachine, private ctx: PlayerContext) {

    }

    enter(): void
    {
		this.ctx?.Animation?.setAnimationUpdateCallback(this.updateAnimation.bind(this));
    }

    update(dt: number): void
    {
        const input = Singleton.get().Input;

        let sidewardDirection: number = (input.Keys.get('a')?.isDown ? 1 : 0) + (input.Keys.get('d')?.isDown ? -1 : 0);
        let forwardDirection: number = (input.Keys.get('w')?.isDown ? 1 : 0) + (input.Keys.get('s')?.isDown ? -1 : 0);

        if (sidewardDirection == 0 && forwardDirection == 0) {
            this.ctx.InputVector.x = sidewardDirection;
            this.ctx.InputVector.y = forwardDirection;

            this.moveFSM.changeState(PlayerIdleState);
        }

        const cameraForward: Vector3 = new Vector3(0, 0, -1).applyQuaternion(this.ctx.Camera.View.quaternion);
        const cameraRight = new Vector3().crossVectors(cameraForward, this.ctx.Camera.View.up).negate();
        cameraForward.y = 0;

        let movementDirection: Vector3 = new Vector3().addVectors(cameraForward.multiplyScalar(forwardDirection), cameraRight.multiplyScalar(sidewardDirection));
        movementDirection.normalize();
        this.ctx.Heading = movementDirection;

        this.ctx.Movement.move(movementDirection, dt);
        this.ctx.Movement.look(dt);
		
		if(this.ctx.Animation !== undefined)
			this.ctx.Animation.applyAnimation(dt);
    }

    exit(): void
    {

    }
	
	private updateAnimation(animator:Animator, dt:number): void
	{
		if(this.ctx.Animation !== undefined)
		{
			const clip = AnimationClip.findByName(animator.clips, 'CH_Spartan_Run_Fwd_Loop');
			const previousAction = this.ctx.Animation.CurrentAction;
			this.ctx.Animation.CurrentAction = animator.mixer.clipAction(clip);
		
			if (previousAction !== this.ctx.Animation.CurrentAction)
			{
				if (previousAction)
				{
					previousAction.fadeOut(0.25);
				}
			
				this.ctx.Animation.CurrentAction?.reset()
                .setEffectiveTimeScale(5/2.5)
                .setEffectiveWeight(1)
                .fadeIn(0.25)
                .play();
			}
		
			animator.mixer.update(dt);
		}
	}
}

export class PlayerIdleState implements StateCapable
{
    private readonly zeroVector: Vector3 = new Vector3(0, 0, 0);

    constructor(private moveFSM: BaseStateMachine, private ctx: PlayerContext)
    {

    }

    enter(): void
    {
		this.ctx?.Animation?.setAnimationUpdateCallback(this.updateAnimation.bind(this));
    }

    update(dt: number): void
    {
        const input = Singleton.get().Input;

        let sidewardDirection: number = (input.Keys.get('a')?.isDown ? 1 : 0) + (input.Keys.get('d')?.isDown ? -1 : 0);
        let forwardDirection: number = (input.Keys.get('w')?.isDown ? 1 : 0) + (input.Keys.get('s')?.isDown ? -1 : 0);

        if (sidewardDirection != 0 || forwardDirection != 0)
        {
            this.ctx.InputVector.x = sidewardDirection;
            this.ctx.InputVector.y = forwardDirection;

            this.moveFSM.changeState(PlayerMoveState);
        }

        this.ctx.Movement.move(this.zeroVector, dt);
        this.ctx.Movement.look(dt);
		
		if(this.ctx.Animation !== undefined)
			this.ctx.Animation.applyAnimation(dt);
    }

    exit(): void
    {
	}
	
	private updateAnimation(animator:Animator, dt:number): void
	{	
		if(this.ctx.Animation !== undefined)
		{
			const clip = AnimationClip.findByName(animator.clips, 'CH_Spartan_Idle_Loop');
			
			const previousAction = this.ctx.Animation.CurrentAction;
			this.ctx.Animation.CurrentAction = animator.mixer.clipAction(clip);
		
			if (previousAction !== this.ctx.Animation.CurrentAction)
			{
				if (previousAction)
				{
					previousAction.fadeOut(0.25);
				}
				
				this.ctx.Animation.CurrentAction?.reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(0.25)
                .play();
			}
		
			animator.mixer.update(dt);
		}
	}
}