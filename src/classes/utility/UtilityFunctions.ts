export class UtilityFunctions
{
    public static isInstanceOf<T>(resource: any, type: new (...args: any[]) => T): resource is T
    {
        return resource instanceof type;
    }
}