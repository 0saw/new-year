import {TweenLite} from 'gsap/TweenLite';
import {
	AmbientLight,
	BoxHelper,
	CameraHelper,
	Color,
	DirectionalLight,
	DirectionalLightShadow,
	Mesh,
	MeshPhongMaterial,
	MeshNormalMaterial,
	Object3D,
	PerspectiveCamera, OrthographicCamera,
	PlaneBufferGeometry,
	Scene,
	ShadowMaterial,
	TorusBufferGeometry,
	Vector3,
	WebGLRenderer,
	Math as TMath,
	Group,
	TorusKnotGeometry,
	DoubleSide,
	BoxBufferGeometry,
	Camera,
	Clock,
	TorusKnotBufferGeometry,
	PCFSoftShadowMap, PlaneGeometry,
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import {TeapotBufferGeometry} from 'three/examples/jsm/geometries/TeapotBufferGeometry';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {initialize, PatternMarker, Source} from 'threear';
import {GUI} from 'dat.gui';

const GUITranslations = {
	selectModel: 'Выберите модель:  ',
};

init();

async function init() {
	// Initialization of context
	const gui = new GUI({
		width: 320,
	});

	const renderer = new WebGLRenderer({
		alpha: true,
		antialias: true,
	});
	renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = PCFSoftShadowMap;

	renderer.setClearColor(new Color('lightgrey'), 0);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const scene = new Scene();
	const clock = new Clock();

	let camera = new Camera();
	scene.add(camera);

	const markerGroup = new Group();
	scene.add(markerGroup);

	// Traker
	const source = new Source({renderer, camera});
	let controller;

	try {
		controller = await initialize({source});

		const patternMarker = new PatternMarker({
			patternUrl: 'patterns/hiro.patt',
			markerObject: markerGroup,
		});

		controller.trackMarker(patternMarker);

	} catch (error) {
		console.error(error);

		camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
		camera.position.set(4, 3, 4);
	}

	const transformControls = new TransformControls(camera, renderer.domElement);
	transformControls.mode = 'rotate';
	transformControls.showX = false;
	transformControls.showZ = false;
	transformControls.size = 1;
	markerGroup.add(transformControls);

	let controls;
	if (controller) {
		// noop
	} else {
		controls = new OrbitControls(camera, renderer.domElement);
		controls.maxPolarAngle = TMath.degToRad(78);
		controls.minPolarAngle = TMath.degToRad(45);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.target.y = 0.5;
		controls.enablePan = false;

		transformControls.addEventListener('dragging-changed', e => controls.enabled = !e.value);
	}

	// lights
	{
		const color = new Color('#fff');
		const light = new AmbientLight(color, 0.4);
		markerGroup.add(light);
	}

	{
		const color = new Color('#fff');
		const light = new DirectionalLight(color, 0.4);
		light.position.set(-30, 30, -20);
		light.castShadow = true;

		const size = controller ? 20 : 5;
		light.shadow.camera = new OrthographicCamera(-size, size, size, -size, 0.5, 200);

		light.shadow.bias = -0.000222;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
		markerGroup.add(light);

		// moving light
		const tweenFish = () => {
			TweenLite.to(light.position, 1 + Math.random() * 2, {
				x: -30 + Math.random() * 60,
				z: -20 + Math.random() * 40,
				onComplete() {
					TweenLite.delayedCall(2, tweenFish);
				},
			});
		};

		tweenFish();
	}

	{
		const color = new Color('#fff');
		const light = new DirectionalLight(color, 0.3);
		light.position.set(0, -30, 20);
		markerGroup.add(light);
	}

	// Shadow plane
	{
		const geometry = new PlaneGeometry(10, 10, 1, 1);
		geometry.rotateX(-Math.PI * 0.5);
		const material = new ShadowMaterial({opacity: 0.2});
		const mesh = new Mesh(geometry, material);
		mesh.receiveShadow = true;
		mesh.depthWrite = false;
		mesh.position.y = 0.1;
		markerGroup.add(mesh);
	}

	{
		const loader = new GLTFLoader();

		let selectedIndex = 1;
		const list = [
			'SuzannePisincipledBSDF.glb',
			'SuzannePisincipledBSDFTextured.glb',
			'fox_rig.glb',
			'dildo.glb',
		];

		// models will be loaded here
		const settingsObject = {
			[GUITranslations.selectModel]: list[selectedIndex],
		};

		gui.add(settingsObject, GUITranslations.selectModel, list).onChange(function () {
			updateModel(this.__select.selectedIndex);
		});
		updateModel();

		async function updateModel(index = selectedIndex) {
			const loadedScene = await loadModel(index);
			const pivot = new Object3D();
			pivot.name = list[index];
			pivot.castShadow = true;
			pivot.translateY(1);

			const existentModel = markerGroup.getObjectByName(list[selectedIndex]);
			if (typeof existentModel !== 'undefined') {
				transformControls.detach();
				markerGroup.remove(existentModel);
			}

			loadedScene.scene.traverse(child => {
				if (child instanceof Mesh) {
					child.castShadow = true;
				}
			});

			pivot.add(...loadedScene.scene.children);

			if (pivot.name === 'dildo.glb') {
				pivot.scale.set(0.1, 0.1, 0.1);
			}

			markerGroup.add(pivot);
			transformControls.attach(pivot);
			selectedIndex = index;
		}

		async function loadModel(index = selectedIndex) {
			return new Promise((resolve, reject) => {
				loader.load(`models/${list[index]}`, gltf => resolve(gltf), void 0, reject);
			});
		}
	}

	// Must be at the bottom
	renderer.setAnimationLoop(animate);

	function animate() {
		const delta = clock.getDelta();

		if (controller) {
			controller.update(source.domElement);
		} else {
			controls.update();
		}

		renderer.render(scene, camera);
	}
}
