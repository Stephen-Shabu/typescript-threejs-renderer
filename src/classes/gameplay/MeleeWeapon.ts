import { DynamicActor } from "../actors/DynamicActor";
import { ActorDesc, ColliderData } from "../../core/Actor";
import { Resources } from "../../core/Resources";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { Group } from "three/src/objects/Group.js";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { Mesh,  MeshStandardMaterial, Object3D, Vector3, Quaternion } from "three";
import { UtilityFunctions } from "../utility/UtilityFunctions";
import RAPIER from '../../core/PhysicsWorld';
import Singleton from "../../core/Singleton";
import { CollisionGroup, ColliderType } from "../../core/PhysicsWorld";

export class Weapon
{
	get Root(): Group
	{
		return this.weaponRoot;
	}
	
	get ColliderData(): ColliderData
	{
		return this.hitboxActor!.ColliderData;
	}
	
	get HitBox(): DynamicActor
	{
		return this.hitboxActor!;
	}
	
	private weaponRoot: Group;
	private hitSocket: Object3D | undefined;
	private _worldPos = new Vector3();
    private _worldQuat = new Quaternion();
	private hitboxActor: DynamicActor | undefined;
	
	constructor(resourceModule: Resources, alias: string, desc: ActorDesc)
	{
		const resource = resourceModule.getAsset(alias);
		this.weaponRoot = SkeletonUtils.clone(resource.scene) as Group;
		const weaponMesh = UtilityFunctions.getMesh(this.weaponRoot);
		const weaponObject = new Mesh(weaponMesh!.geometry, new MeshStandardMaterial({ color:0xffffff }));
	
		weaponObject.castShadow = true;
		weaponObject.receiveShadow = true;
		
		this.setUp(desc);
	}
	
	public syncHitboxToSocket() : void
	{
		if(this.hitSocket == undefined) return;
		
		this.hitSocket.getWorldPosition(this._worldPos);
		this.hitSocket.getWorldQuaternion(this._worldQuat);
		
		const rb = this.hitboxActor!.RigidBody;
        rb?.setNextKinematicTranslation(this._worldPos);
        rb?.setNextKinematicRotation(this._worldQuat);
	}
	
	public setHitBoxInteractivity(isInteractive: boolean): void
	{
		this.hitboxActor!.Collider.setEnabled(isInteractive);
	}
	
	private setUp(desc: ActorDesc): void
	{
		this.hitboxActor = new DynamicActor(desc);
		
		const sockets = UtilityFunctions.getSockets(this.weaponRoot, "socket_");
		this.hitSocket = sockets.get("socket_hit");

		const attachPoint = sockets.get("socket_grip");
		this.weaponRoot.position.set(0, 0, -attachPoint!.position.y);
		this.weaponRoot.quaternion.copy(attachPoint!.quaternion).invert();
		
		const physics = Singleton.get().PhysicsWorld;
		physics?.addActor(this.hitboxActor!);
		this.setHitBoxInteractivity(false);
	}
}