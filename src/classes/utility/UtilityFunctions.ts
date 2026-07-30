import { Mesh, SkinnedMesh, Object3D, Group } from 'three';

export class UtilityFunctions
{
    public static isInstanceOf<T>(resource: any, type: new (...args: any[]) => T): resource is T
    {
        return resource instanceof type;
    }
	
	public static getMesh(group: Group): Mesh | undefined
    {
		let mesh: Mesh | undefined = undefined;
		
		group.traverse((object): void =>
		{	
			if (object.type.startsWith('Mesh'))
			{		
				mesh = object as Mesh;
			}
		});
		
		return mesh;
    }
	
	public static getSkinnedMesh(group: Group):SkinnedMesh | undefined
    {
		let mesh: Mesh | undefined = undefined;
		
		group.traverse((object): void =>
		{	
			if (object.type.startsWith('SkinnedMesh'))
			{		
				mesh = object as Mesh;
			}
		});
		
		return mesh;
    }
}
