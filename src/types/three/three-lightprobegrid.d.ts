declare module 'three/examples/jsm/lighting/LightProbeGrid.js' {
  import { Object3D, Vector3, Box3, Sphere, LightProbe, Scene } from 'three';

  export class LightProbeGrid extends Object3D {
    resolution: Vector3;
    bounds: Box3;
    boundingSphere: Sphere | null;
    probes: LightProbe[];
    scene: Scene | null;
    ready: boolean;

    constructor(width = 1, height = 1, depth = 1, widthProbes, heightProbes, depthProbes);

    setScene(scene: Scene): void;
    setBounds(box: Box3): void;
    setBoundingSphere(sphere: Sphere): void;
    generate(): void;
    update(): void;
	updateBoundingBox():void;
    sampleProbe(index: number): void;
	bake( renderer, scene, options = {} )
	dispose()
  }
}

declare module 'three/examples/jsm/helpers/LightProbeGridHelper.js' {
  import { Object3D } from 'three';
  import { LightProbeGrid } from 'three/examples/jsm/lighting/LightProbeGrid.js';

  export class LightProbeGridHelper extends Object3D {
    grid: LightProbeGrid;

    constructor(grid: LightProbeGrid);

    update(): void;
  }
}
