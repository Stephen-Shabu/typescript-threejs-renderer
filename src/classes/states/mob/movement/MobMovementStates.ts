import StateCapable from "../../../interfaces/StateCapable";
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine";
import { MobContext } from "../MobContext";
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";

export class MobMoveState implements StateCapable
{
    constructor(private moveFSM: BaseStateMachine, private ctx: MobContext) {}

    enter(): void
    {
    }

    update(dt: number): void
    {
     
    }

    exit(): void
    {

    }
}

export class MobWaitState implements StateCapable
{
    private readonly zeroVector: Vector3 = new Vector3(0, 0, 0);

    constructor(private moveFSM: BaseStateMachine, private ctx: MobContext){}

    enter(): void
    {
    }

    update(dt: number): void
    {
        this.ctx.Movement.move(this.zeroVector, dt);
        this.ctx.Movement.look(dt);
    }

    exit(): void
    {
	}
}