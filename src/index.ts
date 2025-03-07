import { Renderer } from "./Renderer";
import { InputHandler } from './InputHandler';
import { GameState } from './GameState';
import { SplashState } from './gameStates/SplashState';
import { MainGameState } from './gameStates/MainGameState';
import Singleton from './Singleton';
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

    public loadContent(): void
    {

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
    game.initialize();

    console.log("new game instance created");
};
