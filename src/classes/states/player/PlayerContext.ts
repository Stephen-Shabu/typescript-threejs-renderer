import RAPIER from "../../../core/PhysicsWorld";
import { Movement } from "../../gameplay/Movement";
import { Animation } from "../../gameplay/Animation";
import { Vector3 } from "three/src/math/Vector3.js";
import { OrbitalCamera } from '../../../classes/gameplay/OrbitalCamera';
import { Group } from 'three';

export class PlayerContext
{
    //get Heading(): Vector3 { return this.heading; }
    //set Heading(value: Vector3){ this.heading = value; }

    public Rigidbody: RAPIER.RigidBody | undefined;
    public Movement: Movement;
    public InputVector: Vector3;
    public Camera: OrbitalCamera;
    public Heading: Vector3 = new Vector3(0, 0, 0);
    public Transform: Group | undefined;
	public Animation: Animation | undefined;


    constructor(rb: RAPIER.RigidBody | undefined, 
	move: Movement, 
	inputVector: Vector3, 
	camera: OrbitalCamera, 
	heading: Vector3, 
	transform: Group | undefined, anim: Animation)
    {
        this.Rigidbody = rb;
        this.Movement = move;
        this.InputVector = inputVector;
        this.Camera = camera;
        this.Heading = heading;
        this.Transform = transform;
		this.Animation = anim;
    }
}