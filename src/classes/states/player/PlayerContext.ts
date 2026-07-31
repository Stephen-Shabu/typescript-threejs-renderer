import RAPIER from "../../../core/PhysicsWorld";
import { Movement } from "../../gameplay/Movement";
import { Animation } from "../../gameplay/Animation";
import { Vector3 } from "three/src/math/Vector3.js";
import { OrbitalCamera } from '../../../classes/gameplay/OrbitalCamera';
import { Group } from 'three';
import { DynamicActor } from "../../actors/DynamicActor";

export class PlayerContext
{	
    public Rigidbody: RAPIER.RigidBody | undefined;
    public Movement: Movement;
    public InputVector: Vector3;
    public Camera: OrbitalCamera;
    public Heading: Vector3 = new Vector3(0, 0, 0);
	public HitDirection: Vector3 = new Vector3(0, 0, 0);
    public Transform: Group | undefined;
	public Animation: Animation | undefined;
	public HitBox: DynamicActor;
	public HurtBox: DynamicActor;
	public IsAttackPause: boolean = false;

    constructor(rb: RAPIER.RigidBody | undefined, 
	move: Movement, 
	inputVector: Vector3, 
	camera: OrbitalCamera, 
	heading: Vector3,
	hitDirection: Vector3,
	transform: Group | undefined, 
	anim: Animation,
	hitBox:DynamicActor,
	hurtBox:DynamicActor,
	isAttackPause: boolean)
    {
        this.Rigidbody = rb;
        this.Movement = move;
        this.InputVector = inputVector;
        this.Camera = camera;
        this.Heading = heading;
        this.Transform = transform;
		this.Animation = anim;
		this.HitBox = hitBox;
		this.HurtBox = hurtBox;
		this.HitDirection = hitDirection;
		this.IsAttackPause = isAttackPause;
    }
}