import { ActionStateCapable, Ctor } from "../../../interfaces/ActionStateCapable"
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine"
import { MobContext } from "../MobContext"
import RAPIER from '../../../../core/PhysicsWorld';
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";

export class MobIdleActionState implements ActionStateCapable
{
    priority: number = 0;
    canBeInterupted: boolean = true;
	
    constructor(private actionFSM: BaseStateMachine, private ctx: MobContext) { }

    enter(): void
    {
		this.ctx.MeleeWeapon.setHitBoxInteractivity(false);
    }

    update(dt: number): void
    {
    }

    exit(): void {}

    canTransitionTo(ctor: Ctor): boolean
    {
        return true;
    }
}

export class MobMeleeActionState implements ActionStateCapable
{
	priority: number = 0;
    canBeInterupted: boolean = true;
    private timer: number = 0;
    private readonly DURATION = 0.6;
	
    constructor(private actionFSM: BaseStateMachine, private ctx: MobContext) { }

    enter(): void
    {
		this.timer = 0;
		this.ctx.Animation?.playActionOnce("Attack_Light_01", {fadeOut: 0.25, fadeIn: 0.1, weight: 1, timeScale: 1})
		this.ctx.MeleeWeapon.setHitBoxInteractivity(false);
    }

    update(dt: number): void
    {
		this.timer += dt;
		if (this.timer >= this.DURATION)
		{
			this.actionFSM.changeState(MobIdleActionState);
		}
    }

    exit(): void {}

    canTransitionTo(ctor: Ctor): boolean
    {
        return ctor === MobIdleActionState;
    }
}

export class MobRangedActionState implements ActionStateCapable
{
	priority: number = 0;
    canBeInterupted: boolean = true;
    private timer: number = 0;
    private readonly DURATION = 0.6;
	
    constructor(private actionFSM: BaseStateMachine, private ctx: MobContext) { }

    enter(): void
    {
		this.timer = 0;
    }

    update(dt: number): void
    {
    }

    exit(): void {}

    canTransitionTo(ctor: Ctor): boolean
    {
        return ctor === MobIdleActionState;
    }
}