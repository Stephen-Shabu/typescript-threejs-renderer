import { Renderer } from "./core/Renderer";
import { InputHandler } from './core/InputHandler';
import { GameState } from './core/GameState';
import { SplashState } from './classes/states/SplashState';
import { MainGameState } from './classes/states/MainGameState';
import Singleton from './core/Singleton';
import { Resources } from "./core/Resources"
export class App
{
    private renderBackend: Renderer;
    private resourceModule: Resources;
    private isAppRunning: boolean = false;

    constructor()
    {
        this.renderBackend = new Renderer();
        this.resourceModule = new Resources();
        this.isAppRunning = true;
    }

    public async initialize(): Promise<void>
    {
        const updateGameState = (deltaTime: number) =>
        {
            this.update(deltaTime);
        }

        const singleton = Singleton.get();

        await this.resourceModule.init();
        await singleton.PhysicsWorld.initAsync();

        singleton.Router.goToGameState(new MainGameState(this.renderBackend, this.resourceModule));

        this.renderBackend.drawScene(updateGameState);
    }

    public update(deltaTime: number): void
    {
        const singleton = Singleton.get();
        singleton.Input.update();
        singleton.PhysicsWorld.update(deltaTime);
        singleton.Router.updateGameState(deltaTime);
    }
}

window.onload = () =>
{
    const game = new App();
    console.log("new game instance created");

    game.initialize();
};
