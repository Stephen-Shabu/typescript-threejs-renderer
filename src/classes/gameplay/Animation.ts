import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { AnimationClip } from "three/src/animation/AnimationClip";
import { AnimationAction } from "three/src/animation/AnimationAction";

export type Animator = 
{
	mixer: AnimationMixer;
	clips: AnimationClip[];
}

export class Animation
{
	public CurrentAction: AnimationAction | undefined;
	
	private animator: Animator;
	private updateAnimator = (animator:Animator, dt:number) => { }
	private updateAnimatorOneShot = (animator:Animator) => { }
	
	constructor(animator:Animator)
	{
		this.animator = animator;
	}
	
	public setAnimationUpdateCallback(
		callback: (animator:Animator, dt: number)=> void): void
	{
		this.updateAnimator = callback;
	}
	
	public setAnimationOneShot(
		callback: (animator:Animator)=> void): void
	{
		this.updateAnimatorOneShot = callback;
	}
	
	public applyAnimation(dt:number): void
	{
		if(this.updateAnimator != undefined)
			this.updateAnimator(this.animator, dt);
	}
	
	public applyOneShotAnimation(): void
	{
		if(this.updateAnimatorOneShot != undefined)
			this.updateAnimatorOneShot(this.animator);
	}
}