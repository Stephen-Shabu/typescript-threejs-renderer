import { Scene } from "three/src/scenes/Scene";
import { GridHelper } from "three/src/helpers/GridHelper";
import { AxesHelper } from "three/src/helpers/AxesHelper";
import { OrbitalCamera } from './OrbitalCamera';
import { Renderer } from "./Renderer";

export class GameState
{
    get GameScene(): Scene
    {
        return this.gameScene;
    }

    get GameCamera(): OrbitalCamera
    {
        return this.gameCamera;
    }

    get RenderContext(): Renderer
    {
        return this.renderContext;
    }

    protected gameScene: Scene;
    protected gameCamera: OrbitalCamera;
    protected renderContext: Renderer;

    constructor(renderer: Renderer)
    {
        this.renderContext = renderer;
        this.gameScene = new Scene();
        this.gameCamera = new OrbitalCamera(75, 0.1, 1000);
    }

    public initialise(): void
    {
        const gridHelper = new GridHelper(400, 40);
        const axesHelper = new AxesHelper(5);
        this.gameScene.add(axesHelper)
        this.gameScene.add(gridHelper);
    }

    public update(deltaTime: number): void
    {

    }

    public endGameState(): void
    {

    }
}