import StateCapable from "./StateCapable"

export type Ctor<T extends ActionStateCapable = ActionStateCapable> = new (...args: any[]) => T;

export interface ActionStateCapable extends StateCapable
{
    priority: number;
    canBeInterupted: boolean;
    canTransitionTo(cls: Ctor): boolean;
}