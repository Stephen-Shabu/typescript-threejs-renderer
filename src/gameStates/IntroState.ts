import { GameState } from "../GameState";
import { MainGameState } from "./MainGameState";
import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";
import { Mesh } from "three/src/objects/Mesh";
import Singleton from "../Singleton";

export class IntroState extends GameState
{
    public initialise(): void
    {
        super.initialise();

        const geometry = new BoxGeometry(3, 3, 3);
        const material = new MeshStandardMaterial({ color: 0x00fffc });
        const cube = new Mesh(geometry, material);
        console.log("Intro State initialised");
        this.gameScene.add(cube);

        const router = Singleton.get().Router;
        setTimeout(() => { router.goToGameState(new MainGameState(this.RenderContext)); }, 3000);
    }
}