import { YieldInstructions, genRunner } from "../utility/UtilityFunctions";
import { MathUtilsExtended } from "../utility/MathUtilsExtended";
import { Health } from "./Health";
import { Renderer } from "../../core/Renderer"
import { MeshStandardMaterial, Material, Color } from "three";

export default class HealthFx
{
	private healthComponent: Health;
	private targetMaterials: Array<MeshStandardMaterial> = new Array();
	private cachedColour: Color;
	private readonly HIT_FLASH_DURATION: number = 0.1;
	
	constructor(health: Health, materials: Material | Array<Material>)
	{
		this.targetMaterials.push(materials as MeshStandardMaterial);
		this.cachedColour = this.targetMaterials[0].color;
		this.healthComponent = health;
		
		this.healthComponent.onDamageTaken = (hp: number)=> 
		{
			this.handleOnDamageTaken(hp);
		}
		
		this.healthComponent.onDeathStarted = (hp: number)=> 
		{
			this.handleOnDamageTaken(hp);
		}
	}
	
	private handleOnDamageTaken(hp: number): void
	{
		genRunner(this.hitFlashGenerator(), Renderer.DeltaTime);
	}
	
	private handleOnDeathStarted (hp: number): void
	{
		genRunner(this.deathGenerator(), Renderer.DeltaTime);
	}
	
	private *deathGenerator()
	{
		yield* YieldInstructions.waitForSeconds(this.HIT_FLASH_DURATION, Renderer.DeltaTime);
		
		this.healthComponent.notifyDeathComplete();
	}
	
	private *hitFlashGenerator()
	{
		let timer = 0;
		
		this.targetMaterials[0].color.setHex(0xff7b00);
		this.targetMaterials[0].emissive.setHex(0xff7b00);
		
		while(timer < this.HIT_FLASH_DURATION)
		{
			timer += Renderer.DeltaTime;
			
			yield* YieldInstructions.waitForFrame();
		}
		
		this.targetMaterials[0].color.setHex(0xffffff);
		this.targetMaterials[0].emissive.setHex(0x000000);
	}
}