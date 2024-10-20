import { GameState } from "../GameState";
import Singleton from "../Singleton";
import { Vector3 } from 'three/src/math/Vector3.js';
import { AmbientLight } from "three/src/lights/AmbientLight";
import { HemisphereLight } from "three/src/lights/HemisphereLight";
import { HemisphereLightHelper } from "three/src/helpers/HemisphereLightHelper";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { DirectionalLightHelper } from "three/src/helpers/DirectionalLightHelper";
import { Color } from "three/src/math/Color";
import { Fog } from "three/src/scenes/Fog";
import { Mesh } from "three/src/objects/Mesh";
import { SphereGeometry } from "three/src/geometries/SphereGeometry";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { MeshLambertMaterial } from "three/src/materials/MeshLambertMaterial";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial";
import { BackSide } from "three/src/constants";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { LoadingManager } from 'three/src/loaders/LoadingManager';
import { Group } from "three/src/objects/Group.js";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { MeshStandardMaterial, Vector2 } from "three";
import { Texture } from "three";
import { Box3 } from "three";
import { BoxGeometry } from "three";
import { CapsuleGeometry } from "three";
import { LineSegments } from "three";
import { BufferGeometry } from "three";
import { LineBasicMaterial } from "three";
import RAPIER from '../PhysicsWorld';
import { BufferAttribute } from 'three';
import { StaticActor } from "../StaticActor";
import { DynamicActor } from "../DynamicActor";
import { PlayerActor } from "../PlayerActor";

export class MainGameState extends GameState
{
    private player: PlayerActor = new PlayerActor(new Group(), RAPIER.ColliderDesc.capsule(0.5, 0.5), RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 0));
    private debugMesh: LineSegments = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: 'lime' }));
    private enabled: boolean = true;

    public initialise(): void
    {
        super.initialise();

        const loadingManager = new LoadingManager();
        const loader = new FBXLoader(loadingManager);
        const textureLoader = new TextureLoader(loadingManager);
        const gltfLoader = new GLTFLoader(loadingManager);

        const environmentTextures =
        {
            alphaMap: { url: 'assets/models/Courthouse.glb', tex: new Texture() },
        }

        const environmentModels =
        {
            courtHouse: { url: 'assets/models/Courthouse.glb', obj: new Group() },
            tree: { url: 'assets/models/common_tree_1.fbx', obj: new Group() }
        }

        const characterModels =
        {
            player: { url: 'assets/models/lone_knight.fbx', obj: new Group() }
        }

        const propModels =
        {
            shortSword: { url: 'assets/models/short_sword.fbx', obj: new Group() }
        }

        loadingManager.onLoad = (): void =>
        {
            environmentModels.courtHouse.obj.castShadow = true;
            environmentModels.courtHouse.obj.receiveShadow = true;
            environmentModels.tree.obj.castShadow = true;
            environmentModels.tree.obj.receiveShadow = true;

            const physics = Singleton.get().PhysicsWorld;

            if (physics.World)
            {
                this.player.addToScene(this.gameScene);
                const clonedCharacter = SkeletonUtils.clone(characterModels.player.obj);
                const clonedWeapon = propModels.shortSword.obj.clone();
                clonedCharacter.scale.set(0.004, 0.004, 0.004);
                clonedWeapon.scale.set(0.006, 0.006, 0.006);
                clonedCharacter.castShadow = true;

                clonedCharacter.traverse((object): void =>
                {
                    console.log(object);
                    if (object.name.startsWith('PalmR'))
                    {
                        console.log("found " + object.name);
                        object.add(clonedWeapon);
                        clonedWeapon.rotation.set(0, 0, Math.PI * .5);
                    }
                });

                this.player.attachObject(clonedCharacter);
                this.player.setUpAnimations(clonedCharacter);
                clonedCharacter.position.y = -1;

                physics.addActor(this.player);

                const capsuleColDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5);
                const capsuleRbDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 10, 10);
                const capsule: DynamicActor = new DynamicActor(new CapsuleGeometry(0.5), new MeshStandardMaterial(), capsuleColDesc, capsuleRbDesc);
                capsule.addToScene(this.gameScene);
                physics.addActor(capsule);

                const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setMass(1).setRestitution(0.1).setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS | RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS);
                const cubeRbDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 1, 0).setCanSleep(false);
                const cube: DynamicActor = new DynamicActor(new BoxGeometry(1, 1, 1), new MeshStandardMaterial(), cubeColliderDesc, cubeRbDesc);
                cube.addToScene(this.gameScene);
                physics.addActor(cube);

                const groundColliderDesc = RAPIER.ColliderDesc.cuboid(20.0, 0.1, 20.0);
                const floorAlphaTexture = environmentTextures.alphaMap.tex;
                const groundGeo = new PlaneGeometry(40, 40);
                const groundMat = new MeshStandardMaterial({ color: 0xffffff, alphaMap: floorAlphaTexture, transparent: true });
                groundMat.color.setHSL(0.095, 1, 0.75);

                const floorActor: StaticActor = new StaticActor(groundGeo, groundMat, groundColliderDesc, physics.World.createCollider(groundColliderDesc));
                floorActor.Mesh!.receiveShadow = true;
                floorActor.Root!.rotation.x = -Math.PI / 2;
                floorActor.addToScene(this.gameScene);
                physics.addActor(floorActor);

                this.debugMesh.frustumCulled = false;
                this.gameScene.add(this.debugMesh);

                const minimumRadius = 5;
                const maxSampleCount = 30;
                const cellSize = minimumRadius / Math.sqrt(2);
                let trees: StaticActor[] = [];
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

                console.log("grid length: " + grid.length);

                const angle = Math.random() * Math.PI * 2;
                const radius = 10 + Math.random() * 10;
                let x = -10;
                let z = -10;
                console.log("rand x " + x + "rand z " + z);
                const iPos: Vector2 | number = new Vector2(x, z);
                const iRow = Math.floor(x / cellSize);
                const iCol = Math.floor(z / cellSize);
                const index = Math.abs(iRow + iCol * cols);

                console.log("initial row " + iRow + "initial col " + iCol);
                console.log("index " + index);

                grid[index] = iPos;
                activePoints.push(iPos);

                for (let i = 0; i < grid.length; i++)
                {
                    if (grid[i] != -1)
                    {
                        const clonedTree = environmentModels.tree.obj.clone();
                        const treeColDesc = RAPIER.ColliderDesc.cylinder(2.5, 1);
                        const treeCol = physics.World.createCollider(treeColDesc);
                        const treeActor: StaticActor = new StaticActor(new BoxGeometry(1, 1, 1), new MeshStandardMaterial(), treeColDesc, treeCol, clonedTree);
                        treeActor.Mesh!.receiveShadow = true;
                        treeActor.addToScene(this.gameScene, false);
                        physics.addActor(treeActor);

                        const pos = grid[i] as Vector2;
                        console.log("Grid Pos X: " + pos.x + "Grid Pos Z: " + pos.y);

                        treeActor.Root!.position.x = pos.x;
                        treeActor.Root!.position.z = pos.y;
                        treeActor.updatePositionAndRotation();
                    }
                }
            }
        };

        textureLoader.load('assets/textures/alpha.jpg', (tex): void =>
        {
            environmentTextures.alphaMap.tex = tex;
        }, undefined, (error) => {
            console.error(" texture assets: " + error);
        });

        gltfLoader.load(environmentModels.courtHouse.url, (gltf) =>
        {
            environmentModels.courtHouse.obj = gltf.scene;
        }, undefined, (error) => {
            console.error(" environment assets: " + error);
        });

        loader.load(environmentModels.tree.url, (object) =>
        {
            environmentModels.tree.obj = object;
            environmentModels.tree.obj.scale.set(0.02, 0.02, 0.02);
            environmentModels.tree.obj.position.set(0, 0, 50);
        }, undefined, (error) => {
            console.error(" environment assets: " + error);
        });

        for (const model of Object.values(characterModels))
        {
            loader.load(model.url, (object) => {
                model.obj = object;

            }, undefined, (error) => {
                console.error(error);
            });
        }

        for (const model of Object.values(propModels))
        {
            loader.load(model.url, (object) => {
                model.obj = object;

            }, undefined, (error) => {
                console.error(error);
            });
        }

        
        const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 2);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 50, 0);
        this.gameScene.add(hemiLight);

        console.log("Main Game State initialised");
    }

    public update(dt: number): void
    {
        if(this.player == undefined) return;

        const input = Singleton.get().Input;

        let orbitDirection: number = (input.Keys.get('left')?.isDown ? 1 : 0) + (input.Keys.get('right')?.isDown ? -1 : 0);
        let sidewardDirection: number = (input.Keys.get('a')?.isDown ? 1 : 0) + (input.Keys.get('d')?.isDown ? -1 : 0);
        let forwardDirection: number = (input.Keys.get('w')?.isDown ? 1 : 0) + (input.Keys.get('s')?.isDown ? -1 : 0);
        let actionPressed: number = (input.MouseButtons.get('leftMouse')?.isDown ? 1 : 0);
        let dodgePressed: number = (input.Keys.get('space')?.isDown ? 1 : 0);
        const characterPos = this.player.Root!.position.clone();

        const cameraForward: Vector3 = new Vector3(0, 0, -1).applyQuaternion(this.gameCamera.View.quaternion);
        const cameraRight = new Vector3().crossVectors(cameraForward, this.gameCamera.View.up).negate();
        cameraForward.y = 0;

        let movementDirection: Vector3 = new Vector3().addVectors(cameraForward.multiplyScalar(forwardDirection), cameraRight.multiplyScalar(sidewardDirection));
        movementDirection.normalize();

        this.player.update(movementDirection, dt);

        this.gameCamera.updateOrbit(characterPos, orbitDirection, 10, dt);
        this.gameCamera.View.lookAt(characterPos);

        if (this.enabled)
        {
            const physics = Singleton.get().PhysicsWorld;

            if (physics.EventQueue)
            {
                physics.EventQueue.drainCollisionEvents((handle1, handle2, started) => 
                {    
                    console.log(`col event: ${handle1} ${handle2} ${started}`);
                });

                physics.EventQueue.drainContactForceEvents(event =>
                {
                    console.log(`force event: ${event.collider1()} ${event.collider2() }`);
                });
            }

            if (physics.World)
            {
                const { vertices } = (physics.World.debugRender());

                this.debugMesh.geometry.setAttribute('position', new BufferAttribute(vertices, 3))
                this.debugMesh.visible = true
            }
            else
            {
                this.debugMesh.visible = false
            } 
        }
    }
}