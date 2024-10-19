import { Actor } from "./core/Actor";
import { BufferGeometry } from 'three';
import { Material } from 'three';
import Singleton from "./Singleton";
import RAPIER from "./PhysicsWorld";
import { Scene } from "three/src/scenes/Scene";
import { Group } from 'three';

export class StaticActor extends Actor
{
    get ColliderHandle(): number
    {
        return this.actorCollider.handle;
    }

    get Collider(): RAPIER.Collider
    {
        return this.actorCollider;
    }

    protected actorCollider: RAPIER.Collider;
    protected actorColliderDesc: RAPIER.ColliderDesc;

    constructor(geometry: BufferGeometry, material: Material, colliderDesc: RAPIER.ColliderDesc, collider: RAPIER.Collider, group?: Group)
    {
        super(geometry, material, group);

        this.actorColliderDesc = colliderDesc;
        this.actorCollider = collider;
    }

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        super.addToScene(gameScene);

        const halfHeight = this.actorCollider.halfHeight();

        if (canSetBasePosition && halfHeight)
        {
            //this.actorRootObject?.position.set(0, halfHeight, 0);
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
}