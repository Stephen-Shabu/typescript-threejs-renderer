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
	geometries?: BufferGeometry[];
	material?: Material;
	colliderDesc?: RAPIER.ColliderDesc;
	rigidbodyDesc?: RAPIER.RigidBodyDesc;
	colliderData?: ColliderData;
	skinnedRoot?: Group;
	visualOffset?: Vector3;
}

type ShadowArgs = 
{
	canCast: boolean;
	canRecieve: boolean;
}

export class Actor
{
	get Meshes(): Mesh[]
    {
        return this.meshes;
    }

    get Root(): Group
    {
        return this.actorRootObject;
    }
	
	protected meshes: Mesh[] = [];
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
			
			this.meshes.push(skinned!);
			this.actorRootObject.add(desc.skinnedRoot);
		}
		else
		{
			if(desc.geometries && desc.material)
			{
				for(let i = 0; i < desc.geometries.length; i++)
				{
					const mesh = new Mesh(desc.geometries[i], desc.material);
					this.meshes.push(mesh);
					this.actorRootObject.add(mesh);
				}
			}
		}
		
		if (desc.visualOffset) 
		{
			const visualChild = desc.skinnedRoot ?? this.meshes[0];
			visualChild?.position.add(desc.visualOffset);
		}
    }
	
	public setShadowSetting(args: ShadowArgs): void
	{
		for(let i = 0; i < this.meshes.length; i++)
		{
			this.meshes[i].receiveShadow = args.canRecieve;
			this.meshes[i].castShadow = args.canCast;
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