import { Actor, ActorDesc, ColliderData } from "../../core/Actor";
import { BufferGeometry } from 'three';
import { Material } from 'three';
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { ColliderType, HitInfo } from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Group } from 'three';

export class PhysicsActor extends Actor
{
    get ColliderHandle(): number 
    {
        return this.actorCollider.handle;
    }

    get Collider(): RAPIER.Collider
    {
        return this.actorCollider;
    }
	
	get ColliderData(): ColliderData
    {
        return this.colliderData;
    }
	
	protected actorCollider: RAPIER.Collider;
    protected actorColliderDesc: RAPIER.ColliderDesc;
	protected colliderData: ColliderData;
	
	constructor(desc: ActorDesc)
    {
        super(desc);
		
		const physics = Singleton.get().PhysicsWorld;
		
        this.actorColliderDesc = desc.colliderDesc!;	
		this.actorCollider = physics.World?.createCollider(this.actorColliderDesc)!;
		this.colliderData = desc.colliderData!; 
    }
	
	public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        super.addToScene(gameScene);
		
		const physics = Singleton.get().PhysicsWorld;
		physics?.addActor(this);

        const halfHeight = this.actorCollider?.halfHeight();

        if (canSetBasePosition && halfHeight)
        {
            this.actorRootObject?.position.set(0, halfHeight, 0);
        }
    }
	
	public updatePositionAndRotation(): void
    {
        const actorPosition = this.actorRootObject?.position;
        const actorRotation = this.actorRootObject?.quaternion;

        if (actorPosition && actorRotation)
        {
            const halfHeight = this.actorCollider.halfHeight();

            this.actorCollider?.setTranslation({ x: actorPosition.x, y: actorPosition.y + halfHeight, z: actorPosition.z});
            this.actorCollider?.setRotation(actorRotation);
        }
    }
	
	public onCollisionStarted(otherActor: PhysicsActor): void
	{
		console.log(this, "collided with:", otherActor);
	}
}