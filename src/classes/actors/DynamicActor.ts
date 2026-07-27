import { Actor, ActorDesc} from "../../core/Actor";
import { PhysicsActor} from "./PhysicsActor";
import { BufferGeometry } from 'three';
import { Material } from 'three';
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Vector3 } from "three/src/math/Vector3.js";
import { HitInfo } from "../../core/PhysicsWorld";

export class DynamicActor extends PhysicsActor
{
	get RigidBody()
	{
		return this.actorRigidbody!;
	}
	
	public onActorHit = (hitData:HitInfo) => {};
	
    protected actorRigidbodyDesc: RAPIER.RigidBodyDesc | undefined;
    protected actorRigidbody: RAPIER.RigidBody | undefined;

    constructor(desc: ActorDesc)
	{	
		super(desc);
		
        const physics = Singleton.get().PhysicsWorld;
	
		this.actorRigidbodyDesc = desc.rigidbodyDesc;
        this.actorRigidbody = physics.World?.createRigidBody(desc.rigidbodyDesc!);
		
		// Remove collider created by base call
		physics.World?.removeCollider(this.actorCollider, true);
		
        this.actorCollider = physics.World?.createCollider(desc.colliderDesc!, this.actorRigidbody)!;
    }

    public updatePositionAndRotation(): void
    {
        const rbPosition = this.actorRigidbody?.translation();
        const rbRotation = this.actorRigidbody?.rotation();

        if (rbPosition && rbRotation)
        {
            this.actorRootObject?.position.copy(rbPosition);
            this.actorRootObject?.quaternion.copy(rbRotation);
            this.actorCollider?.setRotation(rbRotation);
        }
    }
	
	
	public onCollisionStarted(otherActor: PhysicsActor): void
	{
		super.onCollisionStarted(otherActor);
	
		if(otherActor.ColliderData.hitInfo)
		{
			if(this.onActorHit)
			{
				this.onActorHit(otherActor.ColliderData.hitInfo);
			}
		}
	}
}