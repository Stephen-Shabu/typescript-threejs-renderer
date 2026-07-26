import { Mesh, SkinnedMesh } from 'three';
import { Group } from 'three';
import { BufferGeometry } from 'three';
import { Material } from 'three';
import { Object3D } from 'three';
import { Scene } from "three/src/scenes/Scene";
import RAPIER from "./PhysicsWorld";
import { ColliderType, HitInfo } from "./PhysicsWorld";

export type ColliderData = 
{
	colliderType : ColliderType;
	hitInfo?: HitInfo;
}

export type ActorDesc = 
{
	geometry: BufferGeometry;
	material: Material;
	group?: Group;
	colliderDesc?: RAPIER.ColliderDesc;
	rigidbodyDesc?: RAPIER.RigidBodyDesc;
	colliderData?: ColliderData;
}

export class Actor
{
    get Mesh(): Mesh | undefined
    {
        return this.actorMesh;
    }

    get Root(): Group | undefined
    {
        return this.actorRootObject;
    }

    protected actorMesh: Mesh | undefined;
    protected actorRootObject: Group | undefined;
	
	constructor(desc: ActorDesc)
    {
        if (desc.group)
        {
            this.actorRootObject = desc.group;

            desc.group.traverse((object): void =>
            {
                if (object.type.startsWith('SkinnedMesh') || object.type.startsWith('Mesh'))
                {
                    this.actorMesh = object as SkinnedMesh | Mesh;

                    if (this.actorRootObject)
                    {
                        this.actorRootObject.add(this.actorMesh);
                    }
                }
            });

            return;
        }

        this.actorMesh = new Mesh(desc.geometry, desc.material);
        this.actorRootObject = new Group();
        this.actorRootObject.add(this.actorMesh);
    }

    public attachObject(object: Object3D | Group): void
    {
        this.actorRootObject?.add(object);
    }

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        if (this.actorRootObject)
        {
            gameScene.add(this.actorRootObject);
        }
    }
}