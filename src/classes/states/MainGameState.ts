import { GameState } from "../../core/GameState";
import { UtilityFunctions, YieldInstructions, genRunner } from "../utility/UtilityFunctions";
import { ActorDesc, ColliderData } from "../../core/Actor";
import Singleton from "../../core/Singleton";
import { Vector3 } from 'three/src/math/Vector3.js';
import { HemisphereLight } from "three/src/lights/HemisphereLight";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { Group } from "three/src/objects/Group.js";
import { MeshStandardMaterial, Vector2, Mesh, CameraHelper, InstancedMesh, Matrix4} from "three";
import { Texture } from "three";
import { BoxGeometry } from "three";
import { CapsuleGeometry } from "three";
import { BufferGeometry } from "three";
import RAPIER from '../../core/PhysicsWorld';
import { HitInfo } from '../../core/PhysicsWorld';
import { PhysicsActor } from "../actors/PhysicsActor";
import { DynamicActor } from "../actors/DynamicActor";
import { PlayerActor } from "../actors/PlayerActor";
import { MobActor } from "../actors/MobActor";
import { CollisionGroup, ColliderType } from "../../core/PhysicsWorld";
import { LightProbeGrid } from 'three/examples/jsm/lighting/LightProbeGrid.js';
import { LightProbeGridHelper } from 'three/examples/jsm/helpers/LightProbeGridHelper.js';
import { Box3, Color, Object3D } from "three";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import MessageBus from "../messages/MessageBus";
import { MobDiedMessage } from "../messages/Messages";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

export class MainGameState extends GameState
{
	private player: PlayerActor | undefined;
	private barbarian: MobActor | undefined;
	private sampler: MeshSurfaceSampler | undefined;
	
	private directionalLight: DirectionalLight = new DirectionalLight(0xffffff, 1);
	private sunPosition: Vector3 = new Vector3();
	
    public initialise(): void
    {
        super.initialise();

        const physics = Singleton.get().PhysicsWorld;
		
		this.sunPosition.setFromSphericalCoords(1, Math.PI * .1, Math.PI *  0.25);

        this.resourceModule.loadbundle((loadedBundles) =>
        {
			const playerResource = this.resourceModule.getAsset("sm_lone_spartan");
			const playerClone = SkeletonUtils.clone(playerResource.scene) as Group;

			if(playerClone)
			{
				this.player = new PlayerActor(
				{
					skinnedRoot: playerClone,
					material: new MeshStandardMaterial(),
					visualOffset: new Vector3(0, -1, 0),
					colliderDesc: RAPIER.ColliderDesc.capsule(0.5, 0.5)
					.setCollisionGroups((CollisionGroup.PLAYER << 16 ) | CollisionGroup.WORLD | CollisionGroup.ENEMY),
					rigidbodyDesc: RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 3, 0),
					colliderData: {colliderType: ColliderType.BODY }
				}, this.gameCamera, this.resourceModule );
			}
						
            this.player?.addToScene(this.gameScene);

			const unitData = this.resourceModule.getUnit("babarian_warior_03");
			const unitResource = this.resourceModule.getAsset(unitData.mesh);
			const unitClone = SkeletonUtils.clone(unitResource.scene) as Group;
			const unitMesh = UtilityFunctions.getMesh(unitClone);
			
			if(unitClone)
			{
				this.barbarian = new MobActor(
				{
					skinnedRoot: unitClone,
					material: new MeshStandardMaterial(),
					visualOffset: new Vector3(0, -1, 0),
					colliderDesc: RAPIER.ColliderDesc.capsule(0.5, 0.5)
						.setCollisionGroups((CollisionGroup.ENEMY << 16 ) | CollisionGroup.WORLD | CollisionGroup.PLAYER),
					rigidbodyDesc: RAPIER.RigidBodyDesc.dynamic().setTranslation(5, 5, 5),
					colliderData: {colliderType: ColliderType.BODY }
				},
				unitData,
				this.resourceModule
				);
			}
			
			this.barbarian?.addToScene(this.gameScene);

            if (physics.World)
            {
                let floorAlphaTexture = new Texture();
                floorAlphaTexture = this.resourceModule.getAsset("t_alpha_01_d");
				
                const groundMat = new MeshStandardMaterial({ color: 0x2E8B57, alphaMap: floorAlphaTexture, transparent: true });

                const floorDesc: ActorDesc = 
				{
					geometries: [new PlaneGeometry(40 ,40)],
					material: groundMat,
					colliderDesc: RAPIER.ColliderDesc.cuboid(20.0, 0.1, 20.0),
					colliderData: {colliderType: ColliderType.BODY }
				};
				
                const floorActor: PhysicsActor = new PhysicsActor(floorDesc);
				floorActor.setShadowSetting({canCast: false, canRecieve: true});
                floorActor.Root!.rotation.x = -Math.PI / 2;
                floorActor.addToScene(this.gameScene);
				this.sampler = new MeshSurfaceSampler(floorActor.Meshes[0]);
				this.sampler.setWeightAttribute("color").build();
            }
			
			const propResource = this.resourceModule.getAsset("sm_barbarian_warhammer_01");
			const propClone = SkeletonUtils.clone(propResource.scene) as Group;
			const propMesh = UtilityFunctions.getMesh(propClone);
			
			const prop = new Mesh(propMesh!.geometry, new MeshStandardMaterial({color:0xff6b6b}));
			prop.position.set(1, 1.5, 2);
			prop.castShadow = true;
			prop.receiveShadow = true;
			this.gameScene.add(prop);
			
			this.generateEnvironmentTerrain();
			this.initBake();	
        }, "character-models", "utility-textures", "environment-models");
		
        const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
			.setCollisionGroups((CollisionGroup.ENEMY_HURTBOX << 16 ) | CollisionGroup.PLAYER_HITBOX)
			.setMass(1)
			.setRestitution(0.1)
			.setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL)
			.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

		const cubeDesc: ActorDesc = 
		{
			geometries: [new BoxGeometry(1, 1, 1)],
			material: new MeshStandardMaterial({color:0xF54927}),
			colliderDesc: cubeColliderDesc,
			rigidbodyDesc: RAPIER.RigidBodyDesc.kinematicPositionBased()
				.setTranslation(0, 1, 5)
				.setCanSleep(false),
			colliderData: {colliderType: ColliderType.HURTBOX }
		};
		
		const cube: DynamicActor = new DynamicActor(cubeDesc);
		cube.setShadowSetting({canCast: true, canRecieve: true});
		cube.addToScene(this.gameScene);
		
		const hitCube: DynamicActor = new DynamicActor(
		{
			geometries: [new BoxGeometry(1, 1, 1)],
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
		hitCube.setShadowSetting({canCast:true, canRecieve: true});
		hitCube.addToScene(this.gameScene);
		
		this.gameScene.add(physics.DebugMesh);
		
		this.directionalLight.position.copy(this.sunPosition).multiplyScalar(15);
		this.directionalLight.castShadow = true;
		this.directionalLight.shadow.mapSize.width = 2048;
		this.directionalLight.shadow.mapSize.height = 2048;
		this.directionalLight.shadow.camera.near = 1;
		this.directionalLight.shadow.camera.far = 40;
		this.directionalLight.shadow.camera.left = -40;
		this.directionalLight.shadow.camera.right = 40;
		this.directionalLight.shadow.camera.top = 20;
		this.directionalLight.shadow.camera.bottom = -20;
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
		
		lightProbeGrid.bake( this.renderContext.getGLRenderer(), this.gameScene, { cubemapSize: 32, near: 0.05, far: 20, bounces: 3 } );
		this.gameScene.remove(hemiLight);
		const helper = new LightProbeGridHelper(lightProbeGrid);
		this.gameScene.add(helper);
	}
	
	private generateEnvironmentTerrain(): void
	{
		const grassResource = this.resourceModule.getAsset("sm_common_tree_01");
		const grassDenseResource = this.resourceModule.getAsset("sm_common_grass_02");
		
		const grassClone = grassDenseResource.scene.clone() as Group;
		const grassMesh = UtilityFunctions.getMesh(grassClone);
		const grassInstance = new InstancedMesh(grassMesh!.geometry, new MeshStandardMaterial({color:0x006400}), 1000);
		
		const dummy = new Object3D();
		const grassPosition = new Vector3();
		
		for (let i = 0; i < 1000; i++) 
		{
			this.sampler!.sample(grassPosition);
			dummy.position.set(grassPosition.x, 0, grassPosition.y);
			dummy.scale.set(3, 3, 3);
			dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
			dummy.updateMatrix();
			
			grassInstance.setMatrixAt(i, dummy.matrix);
		}
	
		grassInstance.instanceMatrix.needsUpdate = true;
		this.gameScene.add(grassInstance);

		const treeResource = this.resourceModule.getAsset("sm_common_tree_01");
		const treePosition = new Vector3();
		
		for(let i = 0; i < 10; i++)
		{
			const clonedTree = treeResource.scene.clone() as Group;
			const meshes = UtilityFunctions.getMeshes(clonedTree);
			
			const treeDesc: ActorDesc = 
			{
				geometries: meshes.map(mesh => mesh.geometry),
				material: new MeshStandardMaterial(),
				colliderDesc: RAPIER.ColliderDesc.cylinder(2.5, 0.3),
			};
			
			const treeActor: PhysicsActor = new PhysicsActor(treeDesc);
			treeActor.setShadowSetting({canCast: true, canRecieve: true});
			treeActor.addToScene(this.gameScene);
			
			this.sampler!.sample(treePosition);
			treeActor.Root!.position.x = treePosition.x;
			treeActor.Root!.position.z = treePosition.y;
			treeActor.Root!.scale.set(1, 1, 1);
			treeActor.Root!.rotation.set(0, Math.random() * Math.PI * 2, 0);
			treeActor.updatePositionAndRotation();
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
		this.barbarian?.update(dt);
		
        this.gameCamera.updateOrbit(characterPos, orbitDirection, 10, dt);
        this.gameCamera.View.lookAt(characterPos);
    }
}