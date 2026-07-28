import { GameState } from "../../core/GameState";
import { ActorDesc, ColliderData } from "../../core/Actor";
import Singleton from "../../core/Singleton";
import { Vector3 } from 'three/src/math/Vector3.js';
import { HemisphereLight } from "three/src/lights/HemisphereLight";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { Group } from "three/src/objects/Group.js";
import { MeshStandardMaterial, Vector2, Mesh, CameraHelper } from "three";
import { Texture } from "three";
import { BoxGeometry } from "three";
import { CapsuleGeometry } from "three";
import { LineSegments } from "three";
import { BufferGeometry } from "three";
import { LineBasicMaterial } from "three";
import RAPIER from '../../core/PhysicsWorld';
import { BufferAttribute } from 'three';
import { PhysicsActor } from "../actors/PhysicsActor";
import { DynamicActor } from "../actors/DynamicActor";
import { PlayerActor } from "../actors/PlayerActor";
import { MobActor } from "../actors/MobActor";
import { CollisionGroup, ColliderType } from "../../core/PhysicsWorld";
import { LightProbeGrid } from 'three/examples/jsm/lighting/LightProbeGrid.js';
import { LightProbeGridHelper } from 'three/examples/jsm/helpers/LightProbeGridHelper.js';
import { Box3, Color } from "three";

export class MainGameState extends GameState
{
	private player: PlayerActor = new PlayerActor(
	{
		geometry: new BoxGeometry(1, 1, 1),
		material: new MeshStandardMaterial(),
		colliderDesc: RAPIER.ColliderDesc.capsule(0.5, 0.5)
		.setCollisionGroups((CollisionGroup.PLAYER << 16 ) | CollisionGroup.WORLD | CollisionGroup.ENEMY),
		rigidbodyDesc: RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 3, 0),
		group: new Group(),
		colliderData: {colliderType: ColliderType.BODY }
	}, this.gameCamera);
	
	private barbarian: MobActor = new MobActor(
	{
		geometry: new BoxGeometry(1, 1, 1),
		material: new MeshStandardMaterial(),
		colliderDesc: RAPIER.ColliderDesc.capsule(0.5, 0.5)
			.setCollisionGroups((CollisionGroup.ENEMY << 16 ) | CollisionGroup.WORLD | CollisionGroup.PLAYER),
		rigidbodyDesc: RAPIER.RigidBodyDesc.dynamic().setTranslation(5, 5, 5),
		group: new Group(),
		colliderData: {colliderType: ColliderType.BODY }
	});
	
	private directionalLight: DirectionalLight = new DirectionalLight(0xffffff, 1);
	private sunPosition: Vector3 = new Vector3();
	
    public initialise(): void
    {
        super.initialise();

        const physics = Singleton.get().PhysicsWorld;
		
		this.sunPosition.setFromSphericalCoords(1, Math.PI * .1, Math.PI *  0.25);

        this.resourceModule.loadbundle((loadedBundles) =>
        {
            this.player.addToScene(this.gameScene);
            this.player.setupCharacterMesh(this.resourceModule, "sm_lone_spartan");
			
			this.barbarian.addToScene(this.gameScene);
			this.barbarian.setupCharacterMesh(this.resourceModule, "sm_barabian_base_unit_01");

            if (physics.World)
            {
                let floorAlphaTexture = new Texture();
                floorAlphaTexture = this.resourceModule.getAsset("t_alpha_01_d");
				
                const groundMat = new MeshStandardMaterial({ color: 0x2E8B57, alphaMap: floorAlphaTexture, transparent: true });

                const floorDesc: ActorDesc = 
				{
					geometry: new PlaneGeometry(40 ,40),
					material: groundMat,
					colliderDesc: RAPIER.ColliderDesc.cuboid(20.0, 0.1, 20.0)
				};
				
                const floorActor: PhysicsActor = new PhysicsActor(floorDesc);
				floorActor.Mesh!.receiveShadow = true;
                floorActor.Root!.rotation.x = -Math.PI / 2;

                floorActor.addToScene(this.gameScene);
				console.log(floorActor.Mesh!.material);
				console.log(floorActor.Root!.name = "floor");
            }
            this.spawnTreeElements();
			this.initBake();
			
        }, "character-models", "utility-textures", "environment-models");
		
		const capsuleDesc: ActorDesc = 
		{
			geometry: new CapsuleGeometry(0.5),
			material: new MeshStandardMaterial(),
			colliderDesc: RAPIER.ColliderDesc.capsule(0.5, 0.5),
			rigidbodyDesc: RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 10)
		};
		
		const capsule: DynamicActor = new DynamicActor(capsuleDesc);
		
		capsule.Mesh!.castShadow = true;
		capsule.Mesh!.receiveShadow = true;
		capsule.addToScene(this.gameScene);
		
        const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
			.setCollisionGroups((CollisionGroup.ENEMY_HURTBOX << 16 ) | CollisionGroup.PLAYER_HITBOX)
			.setMass(1)
			.setRestitution(0.1)
			.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL)
			.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

		const cubeDesc: ActorDesc = 
		{
			geometry: new BoxGeometry(1, 1, 1),
			material: new MeshStandardMaterial(),
			colliderDesc: cubeColliderDesc,
			rigidbodyDesc: RAPIER.RigidBodyDesc.dynamic()
				.setTranslation(0, 1, 5)
				.setCanSleep(false),
			colliderData: {colliderType: ColliderType.HURTBOX }
		};
		
		const cube: DynamicActor = new DynamicActor(cubeDesc);
		cube.Mesh!.castShadow = true;
		cube.Mesh!.receiveShadow = true;
		const hitCube: DynamicActor = new DynamicActor(
		{
			geometry: new BoxGeometry(1, 1, 1),
			material: new MeshStandardMaterial(),
			colliderDesc: RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
				.setSensor(true)
				.setCollisionGroups((CollisionGroup.ENEMY_HITBOX << 16 ) | CollisionGroup.PLAYER_HURTBOX),
			rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased()
				.setTranslation(2, 1, 5),
			colliderData: 
			{ 
				colliderType: ColliderType.HITBOX, 
				hitInfo: 
					{
						hitPoint: {x:0, y:0, z:0}, 
						hitNormal: {x:2, y:0, z:-1}
					}  
			}
		});
		hitCube.Mesh!.castShadow = true;
		hitCube.Mesh!.receiveShadow = true;
        cube.addToScene(this.gameScene);
		hitCube.addToScene(this.gameScene);
		
		this.gameScene.add(physics.DebugMesh);
		
		this.directionalLight.position.copy(this.sunPosition).multiplyScalar(15);
		this.directionalLight.castShadow = true;
		this.directionalLight.shadow.mapSize.width = 2048;
		this.directionalLight.shadow.mapSize.height = 2048;
		this.directionalLight.shadow.camera.near = 1;
		this.directionalLight.shadow.camera.far = 40;
		this.directionalLight.shadow.camera.left = -20;
		this.directionalLight.shadow.camera.right = 20;
		this.directionalLight.shadow.camera.top = 10;
		this.directionalLight.shadow.camera.bottom = -10;
		this.directionalLight.shadow.bias = -0.001;
		
		this.gameScene.add(this.directionalLight);
		this.gameScene.add(new CameraHelper(this.directionalLight.shadow.camera));
		
        console.log("Main Game State initialised");
    }
	
	async initBake() : Promise<void>
	{
		await this.bake();
	}
	
	async bake(): Promise<void>
	{
		this.gameScene.background = new Color(0x87CEEB);
		const hemiLight = new HemisphereLight(0x87CEEB, 0xFFBF00, 4);
        hemiLight.position.copy(this.sunPosition).multiplyScalar(15);
        this.gameScene.add(hemiLight);
		
		const lightProbeGrid = new LightProbeGrid(45, 4, 45, 10, 5, 10);
		this.gameScene.add(lightProbeGrid);
		lightProbeGrid.position.set(0, 1.2, 0);
		lightProbeGrid.scene = this.gameScene;
		
		lightProbeGrid.bake( this.renderContext.getGLRenderer(), this.gameScene, { cubemapSize: 32, near: 0.05, far: 20 } );
		
		this.gameScene.remove(hemiLight);
		const helper = new LightProbeGridHelper(lightProbeGrid);
		this.gameScene.add(helper);
	}
	

    private spawnTreeElements(): void
    {
        const physics = Singleton.get().PhysicsWorld;

        if (physics.World)
        {
            const minimumRadius = 5;
            const maxSampleCount = 30;
            const cellSize = minimumRadius / Math.sqrt(2);
            let trees: PhysicsActor[] = [];
            let samples: Vector2[] = [];
            const xSize: number = 20;
            const zSize: number = 20;
            const cols: number = Math.floor(zSize / cellSize);
            const rows: number = Math.floor(xSize / cellSize);

            const grid: Vector2[] | number[] = [];
            const activePoints: Vector2[] = [];

            for (let i = 0; i < cols * rows; i++) 
			{
                grid[i] = -1;
            }
			
			const angle = Math.random() * Math.PI * 2;
			const radius = 10 + Math.random() * 10;
			let x = angle;
			let z = radius;
			console.log("rand x " + x + "rand z " + z);
			const iPos: Vector2 | number = new Vector2(x, z);
			const iRow = Math.floor(x / cellSize);
			const iCol = Math.floor(z / cellSize);
			const index = Math.abs(iRow + iCol * cols);

			console.log("initial row " + iRow + "initial col " + iCol);
			console.log("index " + index);

			grid[index] = iPos;
			
            activePoints.push(iPos);

            const tree: Group = this.resourceModule.getAsset("sm_rock_moss_07") as Group;
			
            for (let i = 0; i < grid.length; i++)
            {
			
                if (grid[i] != -1)
                {
                    const clonedTree = tree.clone();
                    clonedTree.scale.set(0.02, 0.02, 0.02);
					
					const treeDesc: ActorDesc = 
					{
						geometry: new BoxGeometry(1, 1, 1),
						material: new MeshStandardMaterial(),
						colliderDesc: RAPIER.ColliderDesc.cylinder(2.5, 1),
						group: clonedTree
					};
					
					const treeActor: PhysicsActor = new PhysicsActor(treeDesc);
                    treeActor.Mesh!.receiveShadow = true;
					treeActor.Mesh!.castShadow = true;
                    treeActor.addToScene(this.gameScene);
                    const pos = grid[i] as Vector2;
                    console.log("Grid Pos X: " + pos.x + "Grid Pos Z: " + pos.y);

                    treeActor.Root!.position.x = pos.x;
                    treeActor.Root!.position.z = pos.y;
                    treeActor.updatePositionAndRotation();
                }
            }
        }
    }

    public update(dt: number): void
    {
        if(this.player == undefined) return;

        const input = Singleton.get().Input;
        const deltaX = input.consumeMouseInput();
		
        let orbitDirection: number = deltaX * dt * 1.5;
        const characterPos = this.player.Root!.position.clone();
        this.player.update(dt);
		this.barbarian.update(dt);
		
        this.gameCamera.updateOrbit(characterPos, orbitDirection, 10, dt);
        this.gameCamera.View.lookAt(characterPos);
    }
}