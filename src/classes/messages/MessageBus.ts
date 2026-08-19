type MessageCtor<T> = new (...args: any[]) => T; 

export default class MessageBus
{
    private static listeners: Map<MessageCtor<any>, Set<(m: any) => void>> = new Map();

    public static subscribe<T>(ctor: MessageCtor<T>, callBack: (m: T) => void): void
    {
        if (!this.listeners.has(ctor)) {
            this.listeners.set(ctor, new Set<(msg: any) => void>);
        }

        this.listeners.get(ctor)?.add(callBack as (msg: any) => void); 
    }

    public static unSubscribe<T>(ctor: MessageCtor<T>, callBack: () => void): void
    {
        if (this.listeners.has(ctor))
        {
            const list = this.listeners.get(ctor);
            list?.delete(callBack);

            if (list?.size == 0)
                this.listeners.delete(ctor);
        }
    }

    public static publish<T>(message: T): void
    {
		const narrowed = message as T & object;
		
		const ctor = narrowed.constructor as MessageCtor<T>;
		
        if (this.listeners.has(ctor))
        {
            const list = this.listeners.get(ctor);
 
            list?.forEach((del) => { del(message); });
        }
    }
}