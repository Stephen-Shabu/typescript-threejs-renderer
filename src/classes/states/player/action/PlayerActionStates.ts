import { ActionStateCapable, Ctor } from "../../../interfaces/ActionStateCapable"
import PlayerActionStateMachine from "../action/PlayerActionStateMachine"
import { PlayerContext } from "../PlayerContext"
import RAPIER from '../../../../core/PhysicsWorld';
import { Vector3 } from "three/src/math/Vector3.js";
import Singleton from "../../../../core/Singleton";

export class PlayerIdleActionState implements ActionStateCapable
{
    priority: number = 0;
    canBeInterupted: boolean = true;

    constructor(private actionFSM: PlayerActionStateMachine, private ctx: PlayerContext) { }

    enter(): void
    {
		this.ctx.HitBox.Collider.setEnabled(false);
    }

    update(dt: number): void
    {
		const playerPosition = this.ctx.Rigidbody?.translation();
		
		if (playerPosition != undefined) 
		{
			this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: playerPosition.x, y: playerPosition.y, z: playerPosition.z });
        }
		
        const input = Singleton.get().Input;
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);

        if (actionPressed)
        {
            this.actionFSM.changeState(PlayerLightAttackState);
        }
    }

    exit(): void {}

    canTransitionTo(ctor: Ctor): boolean
    {
        return true;
    }
}

export class PlayerLightAttackState implements ActionStateCapable
{
    priority: number = 10;
    canBeInterupted: boolean = false;
    private timer: number = 0;
    private queuedNext: boolean = false;
    private readonly DURATION = 0.6;
    private readonly COMBO_WINDOW_START = 0.3;
    private readonly COMBO_WINDO_END = 0.6;

    constructor(private actionFSM: PlayerActionStateMachine, private ctx: PlayerContext){}

    enter(): void
    {
        this.timer = 0;
        this.queuedNext = false;
		
		this.ctx.Animation?.setAttacking(true);
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
		
        if (playerPosition != undefined)
        {
			this.ctx.HitBox.Collider.setEnabled(true);
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);
			this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
			attackVector.normalize();
			
			const hitDirection = playerForward.clone().normalize();
			
			this.ctx.HitBox.ColliderData.hitInfo = 
			{ 
				hitPoint: {x:0, y:0, z:0}, 
				hitNormal: {x:hitDirection.x, y:hitDirection.y, z:hitDirection.z}
			};
        }
		
		this.ctx.IsAttackPause = true;
    }

    update(dt: number): void
    {
        this.timer += dt;
        const input = Singleton.get().Input;
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);
		
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
		
        if (playerPosition != undefined) 
		{
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);
			this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
			this.ctx.HitBox.Collider.setEnabled(false);
        }

        if (this.timer >= this.COMBO_WINDOW_START &&
            this.timer <= this.COMBO_WINDO_END && actionPressed)
        {
            this.queuedNext = true;
        }

        if (this.timer >= this.DURATION)
        {
            if (this.queuedNext)
            {
				console.log("try follow up")

                this.actionFSM.changeState(PlayerLightAttackRecovery);
            }
            else
            {
                this.actionFSM.forceIdle();
            }
        }
    }

    exit(): void
    {
		this.ctx.Animation?.setAttacking(false);
		this.ctx.HitBox.Collider.setEnabled(false);
		
		this.ctx.IsAttackPause = false;
        const playerPosition = this.ctx.Rigidbody!.translation();
		this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: playerPosition.x, y: playerPosition.y, z: playerPosition.z });
    }
	
    canTransitionTo(ctor: Ctor): boolean
    {
        return ctor === PlayerIdleActionState || ctor === PlayerLightAttackRecovery;
    }
}

export class PlayerLightAttackRecovery implements ActionStateCapable
{
	priority: number = 11;
    canBeInterupted: boolean = false;
	private timer: number = 0;
	private readonly DURATION = 0.1;
	
	constructor(private actionFSM: PlayerActionStateMachine, private ctx: PlayerContext){}
	
	enter(): void
    {
		this.timer = 0;
	}
	
	update(dt: number): void
    {
        this.timer += dt;
		
		if (this.timer >= this.DURATION)
        {
			this.actionFSM.changeState(PlayerLightAttackFollowUpState);
        }
	}
	
	canTransitionTo(ctor: Ctor): boolean
    {
        return ctor === PlayerLightAttackFollowUpState;
    }
	
	exit(): void {}
}

export class PlayerLightAttackFollowUpState implements ActionStateCapable
{
    priority: number = 12;
    canBeInterupted: boolean = false;
    private timer: number = 0;
    private queuedNext: boolean = false;
    private readonly DURATION = 0.6;
    private readonly COMBO_WINDOW_START = 0.3;
    private readonly COMBO_WINDO_END = 0.6;

    constructor(private actionFSM: PlayerActionStateMachine, private ctx: PlayerContext){}

    enter(): void
    {
		console.log("performed light attack follow");
        this.timer = 0;
        this.queuedNext = false;
		this.ctx.Animation?.setAttacking(true);
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
		
		const hitDirection = playerForward.clone().normalize();
		this.ctx.Rigidbody?.setLinvel(hitDirection.clone().multiplyScalar(3), true);
		
		this.ctx.HitBox.ColliderData.hitInfo = 
		{ 
			hitPoint: {x:0, y:0, z:0}, 
			hitNormal: {x:hitDirection.x, y:hitDirection.y, z:hitDirection.z}
		};

        if (playerPosition != undefined)
        {
			this.ctx.HitBox.Collider.setEnabled(true);
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);
			this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
        }
    }

    update(dt: number): void
    {
        this.timer += dt;
		
        const input = Singleton.get().Input;
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);
		
        const playerPosition = this.ctx.Rigidbody?.translation();
        const playerForward: Vector3 = new Vector3(0, 0, 1).applyQuaternion(this.ctx.Transform!.quaternion);
		
        if (playerPosition != undefined) 
		{
            const attackVector = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z).add(playerForward);
			this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: attackVector.x, y: playerPosition.y, z: attackVector.z });
        }

        if (this.timer >= this.COMBO_WINDOW_START &&
            this.timer <= this.COMBO_WINDO_END && actionPressed)
        {
            this.queuedNext = true;
        }

        if (this.timer >= this.DURATION)
        {
			this.actionFSM.forceIdle();
        }
    }

    exit(): void
    {
		this.ctx.Animation?.setAttacking(false);
		this.ctx.HitBox.Collider.setEnabled(false);
				
        const playerPosition = this.ctx.Rigidbody!.translation();
		this.ctx.HitBox.RigidBody.setNextKinematicTranslation({ x: playerPosition.x, y: playerPosition.y, z: playerPosition.z });
    }

    canTransitionTo(ctor: Ctor): boolean
    {
        return ctor === PlayerIdleActionState || ctor === PlayerLightAttackState;
    }
}