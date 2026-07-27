import StateCapable from "../../../interfaces/StateCapable";
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine";
import { MobContext } from "../MobContext";
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";
import { Animator } from "../../../gameplay/Animation";
import { AnimationClip } from "three/src/animation/AnimationClip";

export class MobMoveState implements StateCapable
{
    constructor(private moveFSM: BaseStateMachine, private ctx: MobContext) {

    }

    enter(): void
    {
    }

    update(dt: number): void
    {
     
    }

    exit(): void
    {

    }
	
	private updateAnimation(animator:Animator, dt:number): void
	{
	}
}

export class MobWaitState implements StateCapable
{
    private readonly zeroVector: Vector3 = new Vector3(0, 0, 0);

    constructor(private moveFSM: BaseStateMachine, private ctx: MobContext)
    {

    }

    enter(): void
    {
    }

    update(dt: number): void
    {
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
	
	}
}