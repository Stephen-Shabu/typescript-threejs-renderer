import { Mesh, SkinnedMesh } from 'three';
import { Group } from 'three';
import { BufferGeometry } from 'three';
import { Material } from 'three';
import { Object3D } from 'three';
import { Scene } from "three/src/scenes/Scene";

export class Actor
{
    get Mesh(): Mesh | undefined
    {
        return this.actorMesh;
    }

    get Root(): Group | undefined
    {
        return this.actorRootObject;
    }

    protected actorMesh: Mesh | undefined;
    protected actorRootObject: Group | undefined;

    constructor(geometry?: BufferGeometry, material?: Material, group?: Group)
    {
        if (group)
        {
            this.actorRootObject = group;

            group.traverse((object): void =>
            {
                if (object.type.startsWith('SkinnedMesh') || object.type.startsWith('Mesh'))
                {
                    this.actorMesh = object as SkinnedMesh | Mesh;

                    if (this.actorRootObject)
                    {
                        this.actorRootObject.add(this.actorMesh);
                    }
                }
            });

            return;
        }

        this.actorMesh = new Mesh(geometry, material);
        this.actorRootObject = new Group();
        this.actorRootObject.add(this.actorMesh);
    }

    public attachObject(object: Object3D | Group): void
    {
        this.actorRootObject?.add(object);
    }

    public addToScene(gameScene: Scene): void
    {
        if (this.actorRootObject)
        {
            gameScene.add(this.actorRootObject);
        }
    }
}