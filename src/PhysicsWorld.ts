import RAPIER from '@dimforge/rapier3d-compat';
import { DynamicActor } from './DynamicActor';
import { StaticActor } from './StaticActor';
import { Actor } from './core/Actor';
import { PlayerActor } from './PlayerActor';

export default RAPIER;

export class PhysicsWorld
{
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
	private dynamicActors: Map<number, DynamicActor | PlayerActor> = new Map();
	private staticActors: Map<number, StaticActor> = new Map();

	constructor(){}

	public async initAsync(): Promise<void>
	{
		try
		{
			await RAPIER.init();

			this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
			this.eventQueue = new RAPIER.EventQueue(true);
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
			this.dynamicActors.forEach((actor: DynamicActor | PlayerActor): void => { actor.updatePositionAndRotation(); });
		}
	}

	public addActor(actor: StaticActor | DynamicActor | PlayerActor): void
	{
		var colliderHandle = actor.ColliderHandle;
		console.log(`actor: ${colliderHandle} ${actor}`);
		if (colliderHandle !== undefined)
		{
			if (actor instanceof (DynamicActor) || actor instanceof (PlayerActor))
			{
				if (!this.dynamicActors.has(colliderHandle))
				{
					console.log(`added dynamic actor: ${colliderHandle} ${actor}`);
					this.dynamicActors.set(colliderHandle, actor);
				}
			}
			else
			{
				if (!this.staticActors.has(colliderHandle))
				{
					console.log(`added static actor: ${colliderHandle} ${actor}`);
					this.staticActors.set(colliderHandle, actor);
				}
			}
		}
	}
}