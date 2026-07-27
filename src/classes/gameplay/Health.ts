export class Health
{
	private maxPoints: number;
	private currentPoints: number;
	
	constructor(maxPoints: number)
	{
		this.maxPoints = maxPoints;
		this.currentPoints = this.maxPoints;
	}
	
	public reactToHit(): number
	{
		if(this.currentPoints > 0)
		{
			this.currentPoints -= 1;
		}
		
		return this.currentPoints;
	}
}