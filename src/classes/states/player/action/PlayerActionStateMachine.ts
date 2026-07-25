import BaseStateMachine from "../../../../core/StateMachine/BaseStateMachine";
import { ActionStateCapable, Ctor } from "../../../interfaces/ActionStateCapable";
import { PlayerIdleActionState } from "../action/PlayerActionStates";

export default class PlayerActionStateMachine
{
    private currentState: ActionStateCapable | undefined;
    private previousState: ActionStateCapable | undefined;
    private states: Map<Function, ActionStateCapable> = new Map();
	
	public addState<T extends ActionStateCapable>(state: T): void
    {
        this.states.set(state.constructor as Ctor<ActionStateCapable>, state);
    }
	
    public changeState<T extends ActionStateCapable>(ctor: Ctor): void
    {
        const next = this.states.get(ctor);
		
        if (this.currentState != undefined)
        {
			
            if (!this.currentState.canTransitionTo(ctor))
                return;

            if (!this.currentState.canBeInterupted && next!.priority <= this.currentState.priority)
                return;

            this.currentState.exit();
        }

        this.currentState = next;
        this.currentState?.enter();
    }

    public forceIdle(): void
    {
        this.currentState?.exit();
        this.currentState = this.states.get(PlayerIdleActionState);
        this.currentState?.enter();
    }

    update(dt: number): void
    {
        this.currentState?.update(dt);
    }
}