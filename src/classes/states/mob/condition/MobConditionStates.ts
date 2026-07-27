import StateCapable from "../../../interfaces/StateCapable"
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine"
import { MobContext } from "../MobContext"
import { HitInfo } from "../../../../core/PhysicsWorld";
import { Vector3 } from "three/src/math/Vector3.js";

export class MobNormalState implements StateCapable 
{
    constructor(private conditionFSM: BaseStateMachine, private ctx: MobContext) {

    }

    enter(): void 
	{
		this.ctx.HurtBox.onActorHit = (hitInfo:HitInfo) => { this.handleOnHurtBoxCollision(hitInfo)};
    }

    update(dt: number): void
	{	
		const position = this.ctx.Rigidbody?.translation();
		
		if (position != undefined) 
		{
			this.ctx.HurtBox.RigidBody.setNextKinematicTranslation({ x: position.x, y: position.y, z: position.z });
        }
    }

    exit(): void 
	{
		this.ctx.HurtBox.onActorHit = () => {};
    }
	
	private handleOnHurtBoxCollision(hitInfo:HitInfo): void
	{
		const remainingHealth = this.ctx.Health.reactToHit();
		console.log("mob health", remainingHealth);
		
		const hitDirection = new Vector3(
			hitInfo.hitNormal.x,
			hitInfo.hitNormal.y,
			hitInfo.hitNormal.z
		);
		
		if(remainingHealth == 0)
		{
			this.conditionFSM.changeState(MobDeathState);
		}
		else
		{	
			this.ctx.HitDirection = hitDirection;
			this.conditionFSM.changeState(MobHitReactState);
		}
	}
}

export class MobHitReactState implements StateCapable 
{
	private readonly HIT_DURATION: number = .2;
	private hitTimer: number = 0;
	private readonly HIT_IMPULSE: number = 3;
	
    constructor(private conditionFSM: BaseStateMachine, private ctx: MobContext) 
	{

    }

    enter(): void 
	{
		this.ctx.Rigidbody?.setLinvel(this.ctx.HitDirection.clone().multiplyScalar(this.HIT_IMPULSE), true);
		this.ctx.HurtBox.Collider.setEnabled(false);
		this.hitTimer = 0;
    }

    update(dt: number): void 
	{
		this.hitTimer += dt;
		
		const position = this.ctx.Rigidbody?.translation();
		
		if (position != undefined) 
		{
			this.ctx.HurtBox.RigidBody.setNextKinematicTranslation({ x: position.x, y: position.y, z: position.z });
        }
		
		if(this.hitTimer >= this.HIT_DURATION)
		{
			this.conditionFSM.changeState(MobNormalState);
		}
    }

    exit(): void 
	{
		this.ctx.HurtBox.Collider.setEnabled(true);
    }
}

export class MobDeathState implements StateCapable 
{
	private readonly HIT_DURATION: number = .6;
	private hitTimer: number = 0;
	private readonly HIT_IMPULSE: number = 6;
	private toggle: boolean = false;
	
    constructor(private conditionFSM: BaseStateMachine, private ctx: MobContext) {}

    enter(): void 
	{
        this.ctx.HurtBox.Collider.setEnabled(false);
    }

    update(dt: number): void 
	{	
		if(this.hitTimer < this.HIT_DURATION)
		{
			this.hitTimer += dt
		}
		else if(!this.toggle)
		{
			this.toggle = true;
			console.log("i have finally died!")
		}
    }

    exit(): void 
	{
		
    }
}