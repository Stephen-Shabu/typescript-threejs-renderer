import { GameState } from "./GameState";
import { Scene } from "three/src/scenes/Scene";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";

export class Router
{
    get ActiveGameState(): GameState | undefined
    {
        return this.activeGameState;
    }

    private activeGameState: GameState | undefined;
    private isUpdatingState: boolean = false;

    public goToGameState(newState: GameState): void
    {
        let previousState = this.activeGameState;
        this.activeGameState = newState;

        if (previousState !== this.activeGameState)
        {
            this.isUpdatingState = true;
            previousState?.endGameState();
            previousState = undefined;
            this.activeGameState.RenderContext.updateScene(this.activeGameState.GameScene, this.activeGameState.GameCamera.View);
            this.activeGameState.initialise();
        }

        this.isUpdatingState = false;
    }

    public updateGameState(dt: number): void
    {
        while (this.isUpdatingState) return;

        this.activeGameState?.update(dt);
    }
}