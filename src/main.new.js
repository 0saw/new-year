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

const renderer = new WebGLRenderer({
	// antialias	: true,
	alpha: true,
});
renderer.setClearColor(new Color('lightgrey'), 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0px';
renderer.domElement.style.left = '0px';
document.body.appendChild(renderer.domElement);

// init scene and camera
const scene = new Scene();
const camera = new Camera();
scene.add(camera);

const markerGroup = new Group();
scene.add(markerGroup);

const source = new Source({renderer, camera});

initialize({source}).then((controller) => {
	let torus, cube;
	// add a torus knot
	{
		const geometry = new TorusKnotGeometry(0.3, 0.1, 64, 16);
		const material = new MeshNormalMaterial();
		torus = new Mesh(geometry, material);
		torus.position.y = 0.5;
		markerGroup.add(torus);
	}

	{
		const geometry = new BoxBufferGeometry(1, 1, 1);
		const material = new MeshNormalMaterial({
			transparent: true,
			opacity: 0.5,
			side: DoubleSide,
		});
		cube = new Mesh(geometry, material);
		cube.position.y = geometry.parameters.height / 2;
		markerGroup.add(cube);
	}

	const patternMarker = new PatternMarker({
		patternUrl: '/patterns/hiro.patt',
		markerObject: markerGroup,
	});

	controller.trackMarker(patternMarker);

	// run the rendering loop
	let lastTimeMsec = 0;
	requestAnimationFrame(function animate(nowMsec) {
		// keep looping
		requestAnimationFrame(animate);
		// measure time
		lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
		let deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
		lastTimeMsec = nowMsec;
		// call each update function
		controller.update(source.domElement);
		// cube.rotation.x += deltaMsec/10000 * Math.PI
		torus.rotation.y += deltaMsec / 10000 * Math.PI;
		torus.rotation.z += deltaMsec / 10000 * Math.PI;
		renderer.render(scene, camera);
	});

});
