import {TweenLite} from 'gsap/TweenLite';
import {
	AmbientLight, BoxHelper, CameraHelper,
	Color,
	DirectionalLight, DirectionalLightShadow, Mesh, MeshPhongMaterial, MeshNormalMaterial,
	Object3D,
	PerspectiveCamera, PlaneBufferGeometry,
	Scene,
	ShadowMaterial, TorusBufferGeometry,
	Vector3,
	WebGLRenderer,
	Math as TMath, Group, TorusKnotGeometry, DoubleSide, BoxBufferGeometry, Camera, Clock,
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {initialize, PatternMarker, Source} from 'threear';
import {GUI} from 'dat.gui';

const GUITranslations = {
	selectModel: 'Выберите модель: ',
};

init();
async function init() {
	const gui = new GUI({
		width: 320
	});
	const clock = new Clock();
	const renderer = new WebGLRenderer({
		antialias: true,
		alpha: true,
		powerPreference: 'high-performance',
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;

	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';

	document.body.appendChild(renderer.domElement);

	const scene = new Scene();
	const camera = new Camera();
	// camera.position.set(3, 3, 7);
	// camera.lookAt(new Vector3(0, 1, 0));

	const markerGroup = new Group();
	scene.add(markerGroup);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = TMath.degToRad(78);
	controls.minPolarAngle = TMath.degToRad(45);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	const transformControls = new TransformControls(camera, renderer.domElement);
	transformControls.addEventListener('dragging-changed', e => controls.enabled = !e.value);
	transformControls.mode = 'rotate';
	transformControls.showX = false;
	transformControls.showZ = false;
	transformControls.size = 1;
	markerGroup.add(transformControls);

	{
		const color = new Color('#ffffff');
		const light = new AmbientLight(color, 0.4);
		markerGroup.add(light);
	}

	{
		const color = new Color('#ffffff');
		const light = new DirectionalLight(color, 0.4);
		light.position.set(-30, 50, -20);
		light.castShadow = true;
		light.shadow = new DirectionalLightShadow(new PerspectiveCamera(70, 1, 1, 20));
		light.shadow.bias = -0.000222;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;
		markerGroup.add(light);

		const tweenFish = () => {
			TweenLite.to(light.position,  1 + Math.random() * 2, {
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
		const color = new Color('#ffffff');
		const light = new DirectionalLight(color, 0.3);
		light.position.set(0, -30, 20);
		markerGroup.add(light);
	}

	{
		const geometry = new PlaneBufferGeometry(200, 200, 1, 1);
		geometry.rotateX(-Math.PI * 0.5);
		const material = new ShadowMaterial({opacity: 0.2});
		const mesh = new Mesh(geometry, material);
		mesh.receiveShadow = true;
		markerGroup.add(mesh);
	}

	{
		const loader = new GLTFLoader();

		let selectedIndex = 1;
		const list = [
			'Suzanne.glb',
			'SuzannePisincipledBSDF.glb',
			'SuzannePisincipledBSDFMultiMaterial.glb',
			'SuzannePisincipledBSDFTextured.glb',
		];

		// models will be loaded here
		const settingsObject = {
			[GUITranslations.selectModel]: list[selectedIndex]
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

			markerGroup.add(pivot);
			transformControls.attach(pivot);
			selectedIndex = index;
		}

		async function loadModel(index = selectedIndex) {
			return new Promise((resolve, reject) => {
				loader.load(`/models/${list[index]}`, gltf => resolve(gltf), void 0, reject);
			});
		}
	}

	const source = new Source({renderer, camera});

	const controller = await initialize({source});

	const patternMarker = new PatternMarker({
		patternUrl: '/patterns/hiro.patt',
		markerObject: markerGroup
	});

	controller.trackMarker(patternMarker);


	renderer.setAnimationLoop(render);

	function render() {
		// if (resizeRendererToDisplaySize()) {
		// 	const canvas = renderer.domElement;
		// 	camera.aspect = canvas.clientWidth / canvas.clientHeight;
		// 	camera.updateProjectionMatrix();
		// }

		controls.update();

		controller.update(source.domElement);

		renderer.render(scene, camera);
	}

	// function resizeRendererToDisplaySize() {
	// 	const canvas = renderer.domElement;
	// 	const width = canvas.clientWidth;
	// 	const height = canvas.clientHeight;
	// 	const needResize = canvas.width !== width || canvas.height !== height;
	// 	if (needResize) {
	// 		renderer.setSize(width, height, false);
	// 	}
	// 	return needResize;
	// }
}
