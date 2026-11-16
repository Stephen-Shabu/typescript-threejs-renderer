import { Material, Color, Vector2 } from "three";

const fogSettings = {
    center: new Vector2(0, 0),
    visibleRadius: 10,
    silhouetteRadius: 15,
    disappearRadius: 25,
    fogColor: new Color(0x87CEEB)
};

export const applyFogOfWar = (material: Material): void =>
{
	 material.onBeforeCompile = (shader) => {

        shader.uniforms.uFogCenter = {
            value: fogSettings.center
        };

        shader.uniforms.uVisibleRadius = {
            value: fogSettings.visibleRadius
        };

        shader.uniforms.uSilhouetteRadius = {
            value: fogSettings.silhouetteRadius
        };

        shader.uniforms.uDisappearRadius = {
            value: fogSettings.disappearRadius
        };

        shader.uniforms.uFogColor = {
            value: fogSettings.fogColor
        };

        shader.vertexShader = `
            varying vec3 vFogWorldPosition;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `
                #include <project_vertex>

                vec4 fogWorldPosition =
                    vec4(transformed, 1.0);

                #ifdef USE_INSTANCING
                    fogWorldPosition =
                        instanceMatrix * fogWorldPosition;
                #endif

                fogWorldPosition =
                    modelMatrix * fogWorldPosition;

                vFogWorldPosition =
                    fogWorldPosition.xyz;
            `
        );

        shader.fragmentShader = `
            uniform vec2 uFogCenter;
            uniform float uVisibleRadius;
            uniform float uSilhouetteRadius;
            uniform float uDisappearRadius;
            uniform vec3 uFogColor;

            varying vec3 vFogWorldPosition;
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <opaque_fragment>',
            `
			float dist = distance(
				vFogWorldPosition.xz,
				uFogCenter
			);

			float silhouette = smoothstep(
				uVisibleRadius,
				uSilhouetteRadius,
				dist
			);

			float disappearance = smoothstep(
				uSilhouetteRadius,
				uDisappearRadius,
				dist
			);

			float grey = dot(
				outgoingLight,
				vec3(0.299, 0.587, 0.114)
			);

			vec3 silhouetteColour = mix(
				outgoingLight,
				vec3(grey) * 0.55,
				0.7
			);

			vec3 foggedColour = mix(
				outgoingLight,
				silhouetteColour,
				silhouette
			);

			outgoingLight = mix(
				foggedColour,
				uFogColor,
				disappearance
			);

                #include <opaque_fragment>
            `
        );
    };

    material.customProgramCacheKey = () =>
        'battlefield-fog-dither-v1';

    material.needsUpdate = true;
} 