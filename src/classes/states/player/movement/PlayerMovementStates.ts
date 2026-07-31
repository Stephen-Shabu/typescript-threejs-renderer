import StateCapable from "../../../interfaces/StateCapable";
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine";
import { PlayerContext } from "../PlayerContext";
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";

export class PlayerMoveState implements StateCapable
{
    constructor(private moveFSM: BaseStateMachine, private ctx: PlayerContext) {}

    enter(): void
    {
		this.ctx.Animation?.setIsMoving(true);
    }

    update(dt: number): void
    {
        const input = Singleton.get().Input;

        let sidewardDirection: number = (input.Keys.get('a')?.isDown ? 1 : 0) + (input.Keys.get('d')?.isDown ? -1 : 0);
        let forwardDirection: number = (input.Keys.get('w')?.isDown ? 1 : 0) + (input.Keys.get('s')?.isDown ? -1 : 0);

        if (sidewardDirection == 0 && forwardDirection == 0 || this.ctx?.IsAttackPause) 
		{
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
    }

    exit(): void {}
}

export class PlayerIdleState implements StateCapable
{
    private readonly zeroVector: Vector3 = new Vector3(0, 0, 0);

    constructor(private moveFSM: BaseStateMachine, private ctx: PlayerContext){}

    enter(): void
    {
		this.ctx.Animation?.setIsMoving(false);
    }

    update(dt: number): void
    {
        const input = Singleton.get().Input;

        let sidewardDirection: number = (input.Keys.get('a')?.isDown ? 1 : 0) + (input.Keys.get('d')?.isDown ? -1 : 0);
        let forwardDirection: number = (input.Keys.get('w')?.isDown ? 1 : 0) + (input.Keys.get('s')?.isDown ? -1 : 0);

        if (sidewardDirection != 0 && !this.ctx.IsAttackPause || forwardDirection != 0 && !this.ctx.IsAttackPause)
        {
            this.ctx.InputVector.x = sidewardDirection;
            this.ctx.InputVector.y = forwardDirection;

            this.moveFSM.changeState(PlayerMoveState);
        }

        this.ctx.Movement.move(this.zeroVector, dt);
        this.ctx.Movement.look(dt);
    }

    exit(): void {}
}