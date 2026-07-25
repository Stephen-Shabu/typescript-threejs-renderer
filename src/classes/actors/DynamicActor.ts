import { Actor, ActorDesc} from "../../core/Actor";
import { PhysicsActor} from "./PhysicsActor";
import { BufferGeometry } from 'three';
import { Material } from 'three';
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";

export class DynamicActor extends PhysicsActor
{
    protected actorRigidbodyDesc: RAPIER.RigidBodyDesc | undefined;
    protected actorRigidbody: RAPIER.RigidBody | undefined;

    constructor(desc: ActorDesc)
	{	
		super(desc);
		
        const physics = Singleton.get().PhysicsWorld;
	
		this.actorRigidbodyDesc = desc.rigidbodyDesc;
        this.actorRigidbody = physics.World?.createRigidBody(desc.rigidbodyDesc!);
		
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
}