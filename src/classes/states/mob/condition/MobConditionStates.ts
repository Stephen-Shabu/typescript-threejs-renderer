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
		//this.ctx.HurtBox.onActorHit = (hitInfo:HitInfo) => { this.handleOnHurtBoxCollision(hitInfo)};
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
		//this.ctx.HurtBox.onActorHit = () => {};
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
		
		this.conditionFSM.changeState(MobHitReactState);
	}
}

export class MobHitReactState implements StateCapable 
{
	private readonly HIT_DURATION: number = .2;
	private hitTimer: number = 0;
	
    constructor(private conditionFSM: BaseStateMachine, private ctx: MobContext) 
	{

    }

    enter(): void 
	{
		this.ctx.HurtBox.Collider.setEnabled(false);
		this.hitTimer = 0;
        console.log(" hit react state entered");
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
		console.log(" hit react state exited");
		this.ctx.HurtBox.Collider.setEnabled(true);
    }
}

export class MobDeathState implements StateCapable {
    constructor(private conditionFSM: BaseStateMachine, private ctx: MobContext) {

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