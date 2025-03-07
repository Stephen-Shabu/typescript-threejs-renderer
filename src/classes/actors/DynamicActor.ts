import { Actor } from "../../core/Actor";
import { BufferGeometry } from 'three';
import { Material } from 'three';
import Singleton from "../../core/Singleton";
import RAPIER from "../../core/PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";

export class DynamicActor extends Actor
{
    get ColliderHandle(): number | undefined
    {
        return this.actorCollider?.handle;
    }

    protected actorCollider: RAPIER.Collider | undefined;
    protected actorColliderDesc: RAPIER.ColliderDesc;
    protected actorRigidbodyDesc: RAPIER.RigidBodyDesc;
    protected actorRigidbody: RAPIER.RigidBody | undefined;

    constructor(geometry: BufferGeometry, material: Material, colliderDesc: RAPIER.ColliderDesc, rbDesc: RAPIER.RigidBodyDesc)
    {
        super(geometry, material);

        const physics = Singleton.get().PhysicsWorld;

        this.actorColliderDesc = colliderDesc;
        this.actorRigidbodyDesc = rbDesc;
        this.actorRigidbody = physics.World?.createRigidBody(rbDesc);
        this.actorCollider = physics.World?.createCollider(colliderDesc, this.actorRigidbody);
    }

    public addToScene(gameScene: Scene): void
    {
        super.addToScene(gameScene);

        const halfHeight = this.actorCollider?.halfHeight();

        if (halfHeight)
        {
            this.actorRootObject?.position.set(0, halfHeight, 0);
        }
    }

    public updatePositionAndRotation(): void
    {
        const rbPosition = this.actorRigidbody?.translation();
        const rbRotation = this.actorRigidbody?.rotation();

        if (rbPosition && rbRotation)
        {
            this.actorRootObject?.position.copy(rbPosition);
            this.actorRootObject?.quaternion.copy(rbRotation);
        }
    }
}