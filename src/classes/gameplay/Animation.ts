import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { AnimationAction } from "three/src/animation/AnimationAction";
import { AnimationActionLoopStyles, LoopOnce } from 'three';

export type AnimationState = 
{
	action: AnimationAction;
}

export class Animation
{
	private isMoving: boolean = false;
	private isAttacking: boolean = false;
	
	private idleState: AnimationState;
	private runState: AnimationState;
	private attackState: AnimationState;
	private currentState: AnimationState; 
	private mixer: AnimationMixer;
	
	constructor(mixer: AnimationMixer, idleAction: AnimationAction, runAction: AnimationAction, attackAction: AnimationAction)
	{
		this.mixer = mixer;
		this.idleState = { action: idleAction };
		this.runState = { action: runAction };
		this.attackState = { action: attackAction };
		this.currentState = this.idleState;
	}
	
	public setIsMoving(isMoving: boolean): void
	{	
		if(this.isAttacking) return;
		
		this.isMoving = isMoving;
		
		if(this.isMoving)
		{
			const previousState = this.currentState;
			previousState.action.fadeOut(0.25);
			
			this.currentState = this.runState;
			this.currentState.action.reset()
                .setEffectiveTimeScale(5/2.5)
                .setEffectiveWeight(1)
                .fadeIn(0.25)
                .play();
		}
		else if(!this.isMoving)
		{
			const previousState = this.currentState;
			previousState.action.fadeOut(0.25);
			
			this.currentState = this.idleState;
			this.currentState.action.reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(0.25)
                .play();
		}
		
		console.log("is moving ", this.isMoving );
	}
	
	public setAttacking(isAttacking: boolean): void
	{		
		this.isAttacking = isAttacking;
		
		if(this.isAttacking)
		{
			const previousState = this.currentState;
			previousState.action.fadeOut(0.1);
			
			this.currentState = this.attackState;
			this.currentState.action.reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(.1)
				.setLoop(LoopOnce, 1)
                .play();
			console.log("played attack anim ", this.isAttacking );
		}
		else
		{
			this.setIsMoving(this.isMoving);
		}
	}
	
	public update(dt: number)
	{
		this.mixer.update(dt);
	}
}