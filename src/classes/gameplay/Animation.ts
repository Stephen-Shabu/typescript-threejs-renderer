import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { AnimationAction } from "three/src/animation/AnimationAction";
import { AnimationClip } from "three/src/animation/AnimationClip";
import { AnimationActionLoopStyles, LoopOnce } from 'three';

export type AnimationState = 
{
	action: AnimationAction;
}

export type ActionArgs = 
{
	fadeIn: number;
	fadeOut: number;
	weight: number;
	timeScale: number;
}

export class Animation
{
	private mixer: AnimationMixer;
	private actions: Record<string, AnimationClip> = {};
	private currentAction: AnimationAction;
	
	constructor(mixer: AnimationMixer, map: Record<string, AnimationClip>)
	{
		this.actions = map;
		this.mixer = mixer;
		this.currentAction = this.mixer.clipAction(this.actions["Idle"]);
	}
	
	public playAction(name: string,  args: ActionArgs): void
	{
		const previousAction = this.currentAction;
		previousAction.fadeOut(args.fadeOut);
		
		this.currentAction = this.mixer.clipAction(this.actions[name]);
		
		this.currentAction.reset()
		.setEffectiveTimeScale(args.timeScale)
		.setEffectiveWeight(args.weight)
		.fadeIn(args.fadeIn)
		.play();
	}
	
	public playActionOnce(name: string, args: ActionArgs): void
	{
		const previousAction = this.currentAction;
		previousAction.fadeOut(args.fadeOut);
		
		this.currentAction = this.mixer.clipAction(this.actions[name]);
		
		this.currentAction.reset()
			.setEffectiveTimeScale(args.timeScale)
			.setEffectiveWeight(args.weight)
			.fadeIn(args.fadeIn)
			.setLoop(LoopOnce, 1)
			.play();
	}
	
	public playActionOnceClamped(name: string): void
	{
		const previousAction = this.currentAction;
		previousAction.fadeOut(0.25);
		
		this.currentAction = this.mixer.clipAction(this.actions[name]);
		this.currentAction.clampWhenFinished = true;
		this.currentAction.setLoop(LoopOnce, 1);
		this.currentAction.reset().play();
	}
	
	/*public setIsMoving(isMoving: boolean): void
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
	}*/
	
	/*public setAttacking(isAttacking: boolean): void
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
	}*/
	
	/*public setIsHit(isHurt: boolean): void
	{
		if(isHurt)
		{
			const previousState = this.currentState;
			previousState.action.fadeOut(0);
		
			this.currentState = this.hurtState;
			this.currentState.action.reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(0)
				.setLoop(LoopOnce, 1)
                .play();
		}
		else
		{
			this.setIsMoving(false);
		}
	}*/
	
	/*public playDeath()
	{
		const previousState = this.currentState;
		previousState.action.fadeOut(.1);
		
		this.currentState = this.deathState;
		this.currentState.action.clampWhenFinished = true;
		this.currentState.action.setLoop(LoopOnce, 1);
		this.currentState.action.reset().play();
	}*/
	
	public setHitStop(canStop: boolean): void
	{
		const scale = canStop ? 0 : 1;
		this.currentAction.setEffectiveTimeScale(scale);
	}
	
	public update(dt: number)
	{
		this.mixer.update(dt);
	}
}