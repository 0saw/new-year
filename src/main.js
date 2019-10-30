import {PerspectiveCamera, Scene, WebGLRenderer} from 'three';

const renderer = new WebGLRenderer({
	antialias: true,
	powerPreference: 'high-performance',
});
document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10);
renderer.setAnimationLoop(render);

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