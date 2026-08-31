
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { AudioLoader } from 'three/src/loaders/AudioLoader';

export interface Unit 
{
	name: string;
	mesh: string;
	weapon: string;
}

export class Resources
{
	private bundleList: Record<string, { name: string, assets: { alias: string; type: string; src: string }[] }>;
	private unitList: Record<string, { name: string, units: Unit[] }>;
	private assets: Record<string, any>;
	private units: Record<string, any>;
	
	constructor()
	{
		this.assets = {};
		this.bundleList = {};
		this.unitList = {};
		this.units = {};
	}

	public async init(): Promise<void>
	{
		try
		{
			const assetsResponse = await fetch("./assets/assets.json");
			const unitsResponse = await fetch("./assets/data/units.json");
			
			const assetData = await assetsResponse.json();
			const unitData = await unitsResponse.json();

			this.bundleList = Object.fromEntries(assetData.bundles.map((bundle: any) => [bundle.name, bundle]));
			this.unitList = Object.fromEntries(unitData.units.map((unitCategory: any) => [unitCategory.name, unitCategory ]));
			this.loadUnitCategories();
		}
		catch (e)
		{
			console.error("failed to load asset manifest: ", e);
		}
	}

	public async loadbundle(callback: (loadedBundles: string[]) => void, ...bundleNames: string[]): Promise<void>
	{
		try
		{
			const bundlesToLoad = bundleNames.map(name => this.bundleList[name]).filter(Boolean);

			const loaders =
			{
				texture: new TextureLoader(),
				gltf: new GLTFLoader(),
				fbx: new FBXLoader(),
				audio: new AudioLoader(),
			};

			const loadPromises = bundlesToLoad.flatMap(bundle =>
				bundle.assets.map(async (asset) => {
					try {
						let loadedAsset;
						switch (asset.type) {
							case "texture":
								loadedAsset = await loaders.texture.loadAsync(asset.src);
								break;
							case "gltf":
								loadedAsset = await loaders.gltf.loadAsync(asset.src);
								break;
							case "fbx":
								loadedAsset = await loaders.fbx.loadAsync(asset.src);
								break;
							case "audio":
								loadedAsset = await loaders.audio.loadAsync(asset.src);
								break;
							default:
								console.warn(`Unknown asset type: ${asset.type}`);
								return;
						}
						this.assets[asset.alias] = loadedAsset;

						console.log(`Loaded ${asset.type}: ${asset.alias}`);
					}
					catch (e)
					{
						console.error(`Failed to load asset: ${asset.alias}`, e);
					}
				})
			);

			await Promise.all(loadPromises).then(() =>
			{
				console.log(`Bundles Loaded: ${bundleNames.join(", ")}`);
				callback(bundleNames);
			});
		}
		catch (e)
		{
			console.error("bundle name not reconised: ", e)
		}
	}

	public getAsset(alias: string): any
	{
		return this.assets[alias] || undefined;
	}
	
	public getUnit(name: string): Unit
	{
		return this.units[name] || undefined;
	}
	
	private loadUnitCategories(): void
	{
		Object.entries(this.unitList).forEach(([name, category])=> 
		{
			category.units.map(unit => this.units[unit.name] = unit)
		});
	}
}