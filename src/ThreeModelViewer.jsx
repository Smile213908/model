import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function ThreeModelViewer() {
    const mountRef = useRef(null); // 用于挂载Three.js场景的DOM元素的引用
    const renderRequestedRef = useRef(false); // 是否请求渲染的标志

    useEffect(() => {
        // 加载管理器，用于跟踪资源加载进度
        const manager = new THREE.LoadingManager();
        // 加载开始时的回调
        manager.onStart = function (url, itemsLoaded, itemsTotal) {
            console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };

        // 加载完成时的回调
        manager.onLoad = function () {
            console.log('Loading complete!');
            requestRender();
        };

        // 加载过程中的回调
        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
            console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };

        // 加载出错时的回调
        manager.onError = function (url) {
            console.log('There was an error loading ' + url);
        };

        // 场景设置
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0)
        mountRef.current.appendChild(renderer.domElement);

        // 轨道控制器，用于用户交互
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', requestRender);
        camera.position.set(20, 20, 100);

        // 光照设置
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // 加载材质和模型
        const mtlLoader = new MTLLoader(manager);
        mtlLoader.load('/MachineTool.mtl', (materials) => {
            materials.preload();
            const objLoader = new OBJLoader(manager);
            objLoader.setMaterials(materials);
            objLoader.load('/MachineTool.obj', (object) => {
                object.scale.set(25,25,25) // 缩放模型
                 // 计算并重置模型的旋转中心
                const box = new THREE.Box3().setFromObject(object); // 计算包围盒
                const center = box.getCenter(new THREE.Vector3()); // 计算中心点
                object.position.sub(center); // 将模型中心移动到原点 
                scene.add(object); // 将模型添加到场景
                requestRender(); // 确保场景更新以反映位置的变更3333333333333333333333333333
            });
        });

        // 动画函数
        function animate() {
            renderRequestedRef.current = false;
            controls.update(); // 更新控制器
            renderer.render(scene, camera); // 渲染场景
        }

        // 请求渲染的函数
        function requestRender() {
            if (!renderRequestedRef.current) {
                renderRequestedRef.current = true;
                requestAnimationFrame(animate); // 请求动画帧
            }
        }

        requestRender(); // 初始渲染

        // 清理函数
        return () => {
            controls.removeEventListener('change', requestRender); // 移除事件监听器
            mountRef.current.removeChild(renderer.domElement); // 移除渲染器元素
            scene.traverse(object => {
                if (object.isMesh) {
                    object.geometry.dispose(); // 释放几何体资源
                    object.material.dispose(); // 释放材质资源
                }
            });
            renderer.dispose(); // 释放渲染器资源
        };
    }, []); // 空依赖数组表示此效果仅运行一次

    return <div ref={mountRef}/>; // 返回用于挂载渲染器的 div 元素
}

export default ThreeModelViewer;
