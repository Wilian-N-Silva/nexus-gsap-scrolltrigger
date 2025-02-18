import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = this.setupCamera();
        this.renderer = this.setupRenderer();
        this.composer = this.setupComposer();
        this.setupLights();
        this.setupGUI();
        this.loadModel();
        this.animate = this.animate.bind(this);
        this.handleResize();
    }

    setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            35,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 500;
        return camera;
    }

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        renderer.setClearColor( 0xffffff, 0 );
        renderer.toneMapping = THREE.NoToneMapping;
        this.container.appendChild(renderer.domElement);
        return renderer;
    }

    setupComposer() {
        const composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        composer.addPass(renderPass);

        // this.bloomPass = new UnrealBloomPass(
        //     new THREE.Vector2(window.innerWidth, window.innerHeight),
        //     1.5, 1.16, 0.02
        // );
        // composer.addPass(this.bloomPass);

        return composer;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1000);

        this.scene.add(ambientLight, directionalLight);
    }

    setupGUI() {
        const gui = new lil.GUI();

        // Bloom Settings Folder
        const bloomFolder = gui.addFolder('Bloom Settings');
        const bloomSettings = {
            strength: 1.5,
            radius: 1.66,
            threshold: 0.02,
        };

        bloomFolder.add(bloomSettings, 'strength', 0, 10, 0.1)
            .name('Strength')
            .onChange(value => this.bloomPass.strength = value);

        bloomFolder.add(bloomSettings, 'radius', 0, 10, 0.01)
            .name('Radius')
            .onChange(value => this.bloomPass.radius = value);

        bloomFolder.add(bloomSettings, 'threshold', 0, 1, 0.01)
            .name('Threshold')
            .onChange(value => this.bloomPass.threshold = value);

        const toneMappingFolder = gui.addFolder('Tone Mapping');
        const toneSettings = { tone: THREE.NoToneMapping, exposure: 1 };

        toneMappingFolder.add(toneSettings, 'tone', {
            NoToneMapping: THREE.NoToneMapping,
            LinearToneMapping: THREE.LinearToneMapping,
            ReinhardToneMapping: THREE.ReinhardToneMapping,
            CineonToneMapping: THREE.CineonToneMapping,
            ACESFilmicToneMapping: THREE.ACESFilmicToneMapping,
            AgXToneMapping: THREE.AgXToneMapping,
            NeutralToneMapping: THREE.NeutralToneMapping,
            CustomToneMapping: THREE.CustomToneMapping,
        }).onChange(value => this.renderer.toneMapping = value);


        toneMappingFolder.add(toneSettings, 'exposure', 0.1, 2)
            .onChange(value => this.renderer.toneMappingExposure = value);

        const cameraFolder = gui.addFolder('Camera');
        const cameraSettings = {
            x: 0,
            y: 0,
            z: 500
        };

        cameraFolder.add(cameraSettings, 'x', -500, 500, 1)
            .onChange(value => this.camera.position.x = value);

        cameraFolder.add(cameraSettings, 'y', -500, 500, 1)
            .onChange(value => this.camera.position.y = value);

        cameraFolder.add(cameraSettings, 'z', -1000, 1000, 1)
            .onChange(value => this.camera.position.z = value);

        const rotationFolder = gui.addFolder('Rotation');
        const rotationSettings = {
            x: 0.15,
            y: 0,
            z: -0.15
        };

        this.rotationSettings = rotationSettings

        rotationFolder.add(rotationSettings, 'x', -359, 359, .1)
            .onChange(value => {
                gsap.to(this.model.rotation, {
                    x: value,
                    duration: 1,
                    ease: 'expo.out'
                });
            }).listen();

        rotationFolder.add(rotationSettings, 'y', -359, 359, .1)
            .onChange(value => {
                gsap.to(this.model.rotation, {
                    y: value,
                    duration: 1,
                    ease: 'expo.out'
                });
            }).listen();

        rotationFolder.add(rotationSettings, 'z', -359, 359, .1)
            .onChange(value => {
                gsap.to(this.model.rotation, {
                    z: value,
                    duration: 1,
                    ease: 'expo.out'
                });
            }).listen();

        this.rotationFolder = rotationFolder;
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            'assets/cube_blender.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.model.rotation.set(0.15, 0, -0.15);

                this.bloomModel = this.createBloomModel(this.model);

                this.scene.add(this.model, this.bloomModel);
                // this.setupModelControls();
            },
            undefined,
            error => console.error('Error loading model:', error)
        );
    }

    createBloomModel(originalModel) {
        const bloomModel = originalModel.clone();
        bloomModel.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    map: child.material.map,
                });
                child
                child.layers.set(1);
            }
        });

        return bloomModel;
    }

    setupModelControls() {
        const rotationSpeed = 0.01;
        const maxRotation = 6.489;

        window.addEventListener('wheel', (event) => {
            if (this.model) {
                const targetRotation = this.model.rotation.y + event.deltaY * rotationSpeed;
                const clampedRotation = Math.min(Math.max(targetRotation, 0), maxRotation);

                gsap.to(this.model.rotation, {
                    y: clampedRotation,
                    duration: 1,
                    ease: 'expo.out',
                    onUpdate: () => {
                        // Atualiza os valores da GUI
                        this.rotationSettings.y = this.model.rotation.y;
                        this.rotationFolder.controllers.forEach(controller => controller.updateDisplay());
                    }
                });
            }
        });
    }


    clampRotation() {

    }

    handleResize() {
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
            this.composer.setSize(width, height);
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.composer.render();
    }
}

// Initialize
const sceneManager = new SceneManager('cube-container');
sceneManager.animate();