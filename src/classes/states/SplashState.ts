import { GameState } from "../../core/GameState";
import { IntroState } from "./IntroState";
import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";
import { Mesh } from "three/src/objects/Mesh";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import Singleton from "../../core/Singleton";


export class SplashState extends GameState
{
    public initialise(): void
    {
        super.initialise();

        const directionalLight = new DirectionalLight(0x00fffc, 0.9);
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new Mesh(geometry, material);
        cube.position.set(0, 0, 0);

        this.gameScene.add(directionalLight);
        this.gameScene.add(cube);

        console.log("Splash State initialised");
        const router = Singleton.get().Router;
        setTimeout(() => { router.goToGameState(new IntroState(this.RenderContext, this.resourceModule)); }, 6000);
    }

    public endGameState(): void
    {

    }
}