import RAPIER from "../../../core/PhysicsWorld";
import { Movement } from "../../gameplay/Movement";
import { Health } from "../../gameplay/Health";
import { Animation } from "../../gameplay/Animation";
import { Vector3 } from "three/src/math/Vector3.js";
import { OrbitalCamera } from '../../../classes/gameplay/OrbitalCamera';
import { Group, Mesh } from 'three';
import { DynamicActor } from "../../actors/DynamicActor";
import { Weapon } from "../../gameplay/MeleeWeapon";

export class MobContext
{	
    public Rigidbody: RAPIER.RigidBody | undefined;
    public Movement: Movement;
    public Heading: Vector3 = new Vector3(0, 0, 0);
	public HitDirection: Vector3 = new Vector3(0, 0, 0);
    public Transform: Group | undefined;
	public ActorMesh: Mesh | undefined;
	public Animation: Animation;
	public MeleeWeapon: Weapon;
	public HurtBox: DynamicActor;
	public Health: Health;

    constructor(rb: RAPIER.RigidBody | undefined, 
	move: Movement, 
	heading: Vector3,
	hitDirection: Vector3,
	transform: Group | undefined,
	mesh: Mesh | undefined,
	anim: Animation,
	health: Health,
	weapon: Weapon,
	hurtBox:DynamicActor)
    {
        this.Rigidbody = rb;
        this.Movement = move;
        this.Heading = heading;
        this.Transform = transform;
		this.ActorMesh = mesh;
		this.Animation = anim;
		this.MeleeWeapon = weapon;
		this.HurtBox = hurtBox;
		this.Health = health;
		this.HitDirection = hitDirection;
    }
}