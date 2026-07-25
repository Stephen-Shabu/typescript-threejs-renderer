import StateCapable from "../../classes/interfaces/StateCapable";

export default class BaseStateMachine
{
    private currentState: StateCapable | undefined;
    private previousState: StateCapable | undefined;
    private states: Map<new () => StateCapable, StateCapable> = new Map();

    public addState<T extends StateCapable>(cls: new (...args: any[]) => T ,state: T): void
    {
        this.states.set(cls, state);
        console.log(cls);
    }

    public changeState<T extends StateCapable>(ctor: new (...args: any[]) => T): void
    {
        this.currentState?.exit();
        this.previousState = this.currentState;
        this.currentState = this.states.get(ctor);
        this.currentState?.enter();
    }

    update(dt: number): void
    {
        this.currentState?.update(dt);
    }
}