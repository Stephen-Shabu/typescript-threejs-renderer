import RAPIER from "../../../core/PhysicsWorld";
import { Movement } from "../../gameplay/Movement";
import { Health } from "../../gameplay/Health";
import { Animation } from "../../gameplay/Animation";
import { Vector3 } from "three/src/math/Vector3.js";
import { OrbitalCamera } from '../../../classes/gameplay/OrbitalCamera';
import { Group } from 'three';
import { DynamicActor } from "../../actors/DynamicActor";

export class MobContext
{	
    public Rigidbody: RAPIER.RigidBody | undefined;
    public Movement: Movement;
    public Heading: Vector3 = new Vector3(0, 0, 0);
	public HitDirection: Vector3 = new Vector3(0, 0, 0);
    public Transform: Group | undefined;
	public Animation: Animation | undefined;
	public HitBox: DynamicActor;
	public HurtBox: DynamicActor;
	public Health: Health;

    constructor(rb: RAPIER.RigidBody | undefined, 
	move: Movement, 
	heading: Vector3,
	hitDirection: Vector3,
	transform: Group | undefined, 
	anim: Animation,
	health: Health,
	hitBox:DynamicActor,
	hurtBox:DynamicActor)
    {
        this.Rigidbody = rb;
        this.Movement = move;
        this.Heading = heading;
        this.Transform = transform;
		this.Animation = anim;
		this.HitBox = hitBox;
		this.HurtBox = hurtBox;
		this.Health = health;
		this.HitDirection = hitDirection;
    }
}