export class Health
{
	public onDamageTaken = (hp: number) => {};
	public onDeathStarted = (hp: number) => {};
	public onDeathFinished = () => {};
	
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
		
		if(this.onDamageTaken)
		{
			this.onDamageTaken(this.currentPoints);
		}
		
		if(this.currentPoints == 0)
		{
			if(this.onDeathStarted)
			{
				this.onDeathStarted(this.currentPoints);
			}
		}
		
		return this.currentPoints;
	}
	
	public notifyDeathComplete(): void 
	{
		if(this.onDeathFinished)
		{
			this.onDeathFinished();
		}
	}
}