import { Router } from "./Router";
import { InputHandler } from './InputHandler';
import { PhysicsWorld } from './PhysicsWorld';

export default class Singleton
{
    get Router(): Router
    {
        return this.stateRouter;
    }
    get Input(): InputHandler
    {
        return this.inputHandler;
    }

    get PhysicsWorld(): PhysicsWorld
    {
        return this.physicsWorld;
    }

    private static instance: Singleton;
    private stateRouter: Router;
    private inputHandler: InputHandler;
    private physicsWorld: PhysicsWorld;

    constructor()
    {
        this.stateRouter = new Router();
        this.inputHandler = new InputHandler();
        this.physicsWorld = new PhysicsWorld();
    }

    public static get(): Singleton
    {
        if (this.instance == null)
        {
            return this.instance = new Singleton();
        }

        return this.instance;
    }
}