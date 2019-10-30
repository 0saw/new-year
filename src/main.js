import {AmbientLight, Color, DirectionalLight, Object3D, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {GUI} from 'dat.gui';

const GUITranslations = {
	selectModel: 'Выберите модель: ',
};

init();
async function init() {
	const gui = new GUI({
		width: 320
	});
	const renderer = new WebGLRenderer({
		antialias: true,
		alpha: true,
		powerPreference: 'high-performance',
	});
	document.body.appendChild(renderer.domElement);

	const scene = new Scene();
	const camera = new PerspectiveCamera(45, 2, 0.1, 10);
	camera.position.set(0, 0, 7);
	renderer.setAnimationLoop(render);

	{
		const color = new Color('#ffffff');
		const light = new AmbientLight(color, 0.4);
		scene.add(light);
	}

	{
		const color = new Color('#ffffff');
		const light = new DirectionalLight(color, 0.4);
		light.position.set(-30, 50, -20);
		scene.add(light);
	}

	{
		const color = new Color('#ffffff');
		const light = new DirectionalLight(color, 0.3);
		light.position.set(0, -30, 20);
		scene.add(light);
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
			pivot.add(...loadedScene.scene.children);

			const existentModel = scene.getObjectByName(list[selectedIndex]);
			if (typeof existentModel !== 'undefined') {
				scene.remove(existentModel);
			}

			scene.add(pivot);
			selectedIndex = index;
		}

		async function loadModel(index = selectedIndex) {
			return new Promise((resolve, reject) => {
				loader.load(`/models/${list[index]}`, gltf => resolve(gltf), void 0, reject);
			});
		}
	}

	function render() {
		if (resizeRendererToDisplaySize()) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);
	}

	function resizeRendererToDisplaySize() {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}
}
