import { ShaderMaterial, Color } from "three";

export const GrassMaterial = new ShaderMaterial({
	vertexShader: `
	attribute float phase;
    attribute float amplitude;
	
    uniform float uTime;
    uniform float uWindStrength;

    varying float vHeightRatio;
	varying vec3 vFogWorldPosition;
	
    void main() 
	{
		vHeightRatio = position.y / 1.5;
		vec3 pos = position;
		float heightPower = vHeightRatio * vHeightRatio;
		float windEffect = sin(uTime + phase) * uWindStrength * heightPower;
		pos.x += windEffect * amplitude;

		vec4 worldPos = modelMatrix * instanceMatrix * vec4(pos, 1.0);
		vFogWorldPosition = worldPos.xyz;
		gl_Position = projectionMatrix * viewMatrix * worldPos;
    }`,
	fragmentShader:`
    varying float vHeightRatio;
	uniform vec3 uBaseColor;
	uniform vec3 uTipColor;
	
	uniform float uVisibleRadius;
	uniform float uFogRadius;
	uniform vec3 uFogColor;

	varying vec3 vFogWorldPosition;

    void main() 
	{
		vec3 grassColor = mix(uBaseColor, uTipColor, vHeightRatio);

		float dist = length(vFogWorldPosition.xz);

		float fogAmount = smoothstep(
		uVisibleRadius,
		uFogRadius,
		dist
		);

		grassColor = mix(
		grassColor,
		uFogColor,
		fogAmount
		);

		gl_FragColor = vec4(grassColor, 1.0);
		#include <tonemapping_fragment>
		#include <colorspace_fragment>
    }
	`,
	uniforms: { 
		uTime: { value: 0 }, 
		uWindStrength: { value: 2.5 },
		uBaseColor: {value: new Color(0xFFFFFF)},
		uTipColor: {value: new Color(0xFFFFFF)},
		uVisibleRadius: {value: 10},
		uFogRadius: {value: 15},
		uFogColor: {value: new Color(0x87CEEB)}
		},
		toneMapped: true
});