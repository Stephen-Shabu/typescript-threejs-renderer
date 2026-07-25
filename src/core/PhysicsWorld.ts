import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsActor } from '../classes/actors/PhysicsActor';
import { DynamicActor } from '../classes/actors/DynamicActor';
import { Actor } from './Actor';
import { PlayerActor } from '../classes/actors/PlayerActor';
import { LineSegments } from "three";
import { BufferGeometry } from "three";
import { LineBasicMaterial } from "three";
import { BufferAttribute } from 'three';

export default RAPIER;

export class PhysicsWorld
{
	get DebugMesh(): LineSegments
	{
		return this.debugMesh;
	}
	
	get World(): RAPIER.World | undefined
	{
		return this.world;
	}

	get EventQueue(): RAPIER.EventQueue | undefined
	{
		return this.eventQueue
	}

	private world: RAPIER.World | undefined;
	private eventQueue: RAPIER.EventQueue | undefined;
	private dynamicActors: Map<number, DynamicActor> = new Map();
	private physicsActors: Map<number, PhysicsActor> = new Map();
	private debugMesh: LineSegments = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: 'lime' }));

	constructor(){}

	public async initAsync(): Promise<void>
	{
		try
		{
			await RAPIER.init();

			this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
			this.eventQueue = new RAPIER.EventQueue(true);
			
			this.debugMesh.frustumCulled = false;
			this.debugMesh.visible = true;
			console.log("rapier initialized: " + RAPIER.version());
		}
		catch(e)
		{
			console.log("rapier: " + e);
		}
	}

	public update(dt: number): void
	{
		if (this.world && this.eventQueue)
		{ 
			this.world.step(this.eventQueue);
			
			this.eventQueue.drainCollisionEvents((handle1, handle2, started) => 
			{    
				if(!started) return;
				
				console.log(`col event: ${handle1} ${handle2} ${started}`);
				const col1 = this.physicsActors.get(handle1);
				const col2 = this.physicsActors.get(handle2);
				
				col1?.onCollisionStarted(col2!);
				col2?.onCollisionStarted(col1!);
			});

			this.eventQueue.drainContactForceEvents(event =>
			{
				console.log(`force event: ${event.collider1()} ${event.collider2() }`);
			});
			
			this.dynamicActors.forEach((actor: DynamicActor | PlayerActor): void => { actor.updatePositionAndRotation(); });
			
			const { vertices } = (this.world.debugRender());
			this.debugMesh.geometry.setAttribute('position', new BufferAttribute(vertices, 3))
		}
	}
	
	public addActor(actor: PhysicsActor): void
	{
		var colliderHandle = actor.ColliderHandle;
		console.log(`actor: ${colliderHandle} ${actor}`);
		if (colliderHandle !== undefined)
		{
			this.physicsActors.set(colliderHandle, actor);
			if (actor instanceof (DynamicActor))
			{
				if (!this.dynamicActors.has(colliderHandle))
				{
					console.log(`added dynamic actor: ${colliderHandle} ${actor}`);
					this.dynamicActors.set(colliderHandle, actor);
				}
			}
		}
	}
}