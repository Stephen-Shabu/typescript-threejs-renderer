import { Mesh } from 'three';
import { Group, Vector3 } from 'three';
import { BufferGeometry } from 'three';
import { Material } from 'three';
import { Object3D } from 'three';
import { Scene } from "three/src/scenes/Scene";
import RAPIER from "./PhysicsWorld";
import { ColliderType, HitInfo } from "./PhysicsWorld";
import { UtilityFunctions } from "../classes/utility/UtilityFunctions"

export type ColliderData = 
{
	colliderType : ColliderType;
	hitInfo?: HitInfo;
}

export type ActorDesc = 
{
	geometry?: BufferGeometry;
	material?: Material;
	colliderDesc?: RAPIER.ColliderDesc;
	rigidbodyDesc?: RAPIER.RigidBodyDesc;
	colliderData?: ColliderData;
	skinnedRoot?: Group;
	visualOffset?: Vector3;
}

export class Actor
{
    get Mesh(): Mesh | undefined
    {
        return this.actorMesh;
    }

    get Root(): Group
    {
        return this.actorRootObject;
    }

    protected actorMesh: Mesh | undefined;
    protected actorRootObject: Group;
	
	constructor(desc: ActorDesc)
    {
		this.actorRootObject = new Group();
		
		if(desc.skinnedRoot)
		{
			const skinned = UtilityFunctions.getSkinnedMesh(desc.skinnedRoot);
			
			if(desc.material)
			{
				skinned!.material = desc.material;
			}
			
			this.actorMesh = skinned!;
			this.actorRootObject.add(desc.skinnedRoot);
		}
		else
		{
			if(desc.geometry && desc.material)
			{
				this.actorMesh = new Mesh(desc.geometry, desc.material);
				this.actorRootObject.add(this.actorMesh);
			}
		}
		
		if (desc.visualOffset) 
		{
			const visualChild = desc.skinnedRoot ?? this.actorMesh;
			visualChild?.position.add(desc.visualOffset);
		}
    }

    public attachObject(object: Object3D | Group): void
    {
        this.actorRootObject.add(object);
    }

    public addToScene(gameScene: Scene, canSetBasePosition?: boolean): void
    {
        if (this.actorRootObject)
        {
            gameScene.add(this.actorRootObject);
        }
    }
}