import * as THREE from 'three';

export class Renderer
{
    private activeScene: THREE.Scene = new THREE.Scene();
    private activeCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
    private webGlContext: THREE.WebGLRenderer;
    private hasRenderStarted: boolean = false;
    private elapsedTime: number = 0;

    constructor()
    {
        this.webGlContext = new THREE.WebGLRenderer();
        this.webGlContext.shadowMap.enabled = true;
        this.webGlContext.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.webGlContext.domElement);
    }

    public updateScene(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void
    {
        this.activeScene = scene;
        this.activeCamera = camera;
    }

    public drawScene(updateGameState: (deltaTime: number) => void): void
    {
        if(this.hasRenderStarted) return;

        let prevTime: number = 0;

        const updateFrame = () =>
        {
            const time = performance.now();
            let deltaTime = (time - prevTime) / 1000;
            this.elapsedTime += deltaTime;

            updateGameState(deltaTime);

            prevTime = time;

            this.webGlContext?.render(this.activeScene, this.activeCamera);
        }

        window.addEventListener('resize', this.resizeWindow.bind(this), false);
        this.webGlContext.setAnimationLoop(updateFrame);
        this.hasRenderStarted = true;
    }

    public resizeWindow(): void
    {
        this.activeCamera.aspect = window.innerWidth / window.innerHeight;
        this.activeCamera.updateProjectionMatrix();
        this.webGlContext.setSize(window.innerWidth, window.innerHeight);
    }
}