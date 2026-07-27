import { ActionStateCapable, Ctor } from "../../../interfaces/ActionStateCapable"
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine"
import { MobContext } from "../MobContext"
import RAPIER from '../../../../core/PhysicsWorld';
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";
import { UtilityFunctions } from "../../../utility/UtilityFunctions";

export class MobIdleActionState implements ActionStateCapable
{
    priority: number = 0;
    canBeInterupted: boolean = true;

    constructor(private actionFSM: BaseStateMachine, private ctx: MobContext) { }

    enter(): void
    {
		this.ctx.HitBox.Collider.setEnabled(false);
    }

    update(dt: number): void
    {
		const position = this.ctx.Rigidbody?.translation();
		
		if (position != undefined) 
		{
			this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: position.x, y: position.y, z: position.z });
        }
    }

    exit(): void {}

    canTransitionTo(ctor: Ctor): boolean
    {
        return true;
    }
}