import StateCapable from "../../../interfaces/StateCapable"
import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine"
import { PlayerContext } from "../PlayerContext"
import { HitInfo } from "../../../../core/PhysicsWorld";
import { Vector3 } from "three/src/math/Vector3.js";

export class PlayerNormalState implements StateCapable {
    constructor(private conditionFSM: BaseStateMachine, private ctx: PlayerContext) {

    }

    enter(): void 
	{
		this.ctx.HurtBox.onActorHit = (hitInfo:HitInfo) => { this.handleOnHurtBoxCollision(hitInfo)};
    }

    update(dt: number): void
	{
		const playerPosition = this.ctx.Rigidbody?.translation();
		
		if (playerPosition != undefined) 
		{
			this.ctx.HurtBox.RigidBody.setNextKinematicTranslation({ x: playerPosition.x, y: playerPosition.y, z: playerPosition.z });
        }
    }

    exit(): void 
	{
		this.ctx.HurtBox.onActorHit = () => {};
    }
	
	private handleOnHurtBoxCollision(hitInfo:HitInfo): void
	{	
		console.log("my hurt box!")
		const hitDirection = new Vector3(
			hitInfo.hitNormal.x,
			hitInfo.hitNormal.y,
			hitInfo.hitNormal.z
		);
		console.log(hitDirection);
		if(hitDirection)
			this.ctx.Rigidbody?.setLinvel(hitDirection.clone().multiplyScalar(3), true);
		
		this.conditionFSM.changeState(PlayerHitReactState);
	}
}

export class PlayerHitReactState implements StateCapable 
{
	private readonly HIT_DURATION: number = .2;
	private hitTimer: number = 0;
	
    constructor(private conditionFSM: BaseStateMachine, private ctx: PlayerContext) 
	{

    }

    enter(): void 
	{
		this.ctx.HurtBox.Collider.setEnabled(false);
		this.hitTimer = 0;
    }

    update(dt: number): void 
	{
		this.hitTimer += dt;
		
		const playerPosition = this.ctx.Rigidbody?.translation();
		
		if (playerPosition != undefined) 
		{
			this.ctx.HurtBox.RigidBody.setNextKinematicTranslation({ x: playerPosition.x, y: playerPosition.y, z: playerPosition.z });
        }
		
		if(this.hitTimer >= this.HIT_DURATION)
		{
			this.conditionFSM.changeState(PlayerNormalState);
		}
    }

    exit(): void 
	{
		this.ctx.HurtBox.Collider.setEnabled(true);
    }
}

export class PlayerDeathState implements StateCapable {
    constructor(private conditionFSM: BaseStateMachine, private ctx: PlayerContext) {

    }

    enter(): void {
        console.log("State Entered");
    }

    update(dt: number): void {
        console.log("State Updating");
    }

    exit(): void {
        console.log("State Exited");
    }
}