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

export class MobRangedActionState implements ActionStateCapable
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
        return ctor === MobIdleActionState;
    }
}