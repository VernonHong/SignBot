

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);



//scene
var camera, scene, renderer, model, mixer, action, clip, actions, activeAction, previousAction;
let door_model, button_model, sign_model, sign;
let state = 0;//0:idle,1:get sign,2:hold sign
var sign_context, url, signPlane;//1:小吉,2:吉,3:大吉
let pic_hi;
let state_2=1;
scene = new THREE.Scene();
//scene.add(new THREE.GridHelper(10,10));


//clock
clock = new THREE.Clock();
//load model
model = new THREE.Object3D();
var loader = new THREE.GLTFLoader();
loader.load('https://github.com/mrdoob/three.js/blob/3b1ff7661884f26e6d9af1d94c293129aaba885c/examples/models/gltf/RobotExpressive/RobotExpressive.glb', function (gltf) {
    model = gltf.scene;

    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    animation_init(gltf.animations);

}, undefined, function (e) {
    console.log(e);
});

//door
var loader_2 = new THREE.GLTFLoader();
loader_2.load('../model/uploads_files_3076931_medieval_door/scene.gltf', function (gltf) {
    door_model = gltf.scene;

    door_model.position.z = -15
    door_model.rotation.y = -Math.PI / 2;
    door_model.scale.set(4, 4, 4)
    scene.add(door_model);
    gltf.name = 'door';
    //mixer = new THREE.AnimationMixer(model);
    //animations = gltf.animations
    //clips = animations;

}, undefined, function (e) {
    console.log(e);
});
//button
var loader_3 = new THREE.GLTFLoader();
loader_3.load('../model/scifi_button/scene.gltf', function (gltf) {
    button_model = gltf.scene;
    button_model.position.x = 3
    gltf.name = 'button';
    scene.add(button_model);
}, undefined, function (e) {
    console.log(e);
});
var button_detect = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 5, 5, 10),
    //new THREE.MeshPhongMaterial({
    //   transparent:true
    //})
);
button_detect.visible = false
button_detect.position.x = 3
button_detect.position.y = 1.8
button_detect.position.z = 0.5
scene.add(button_detect);
button_detect.name = "button";
//robot animation
function animation_init(animations) {
    actions = {};
    for (let i = 0; i < animations.length; i++) {

        clip = animations[i];
        action = mixer.clipAction(clip);

        actions[clip.name] = action;
    }
    activeAction = actions['Idle'];
    activeAction.play();
}
function fadeToAction(name, duration) {

    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {

        previousAction.fadeOut(duration);

        activeAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();
    }
    if (name == 'Idle' || name == 'Running' || name == 'Dance') {
        activeAction.loop = THREE.LoopRepeat;
        state_2=1;
    }
    else {
        activeAction.loop = THREE.LoopOnce;
        activeAction.clampWhenFinished = true;    
    }
}
//actions
function goBack(model) {
    fadeToAction('Running', 0.2)
    model.lookAt(0, 0, -100);
    model.position.z += -0.1;
}
function goFront(model) {
    model.lookAt(0, 0, 0);
    model.position.z += 0.1;
}
function holdSign() {
    //sign.visible=true;
    button_click = 0;
    fadeToAction('Dance', 0.2)

    model.lookAt(0, 0, 1);
    model.position.z = 0;

}
var haveSign = 0;
function get_sign() {

    if (model.position.z <= -18) {
        sign.visible = true;
        haveSign = 1;
    }
    if (haveSign == 1) {
        goFront(model);
        if (model.position.z >= 0) {

            state = 2;
        }
    }
    else {
        goBack(model);
    }
}
function openSign() {

    if (signPlane.scale.x < 2.5) {
        signPlane.scale.x += 0.03;
        signPlane.scale.y += 0.03;
        sign.scale.x -= 0.01;
        sign.scale.y -= 0.01;
        sign.scale.z -= 0.01;
    }
}
//state
stats = new Stats();
//document.body.appendChild(stats.domElement);
//skybox
const r = '../texture/';

const urls = [
    r + 'tron_ft.png', r + 'tron_bk.png',
    r + 'tron_up.png', r + 'tron_dn.png',
    r + 'tron_rt.png', r + 'tron_lf.png'
];
const textureCube = new THREE.CubeTextureLoader().load(urls);
textureCube.mapping = THREE.CubeRefractionMapping;
scene.background = textureCube;
//renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000)
renderer.setPixelRatio(window.devicePixelRatio)//像素比
//renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
//light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);
var ambient = new THREE.AmbientLight(0xffffff, 1.5)
scene.add(ambient)
const dirLight = new THREE.DirectionalLight(0xffffff,2);
dirLight.position.set(0, 20, 10);
scene.add(dirLight);
//sign_model
var loader_4 = new THREE.GLTFLoader();
loader_4.load('../model/lightning_capsule/scene.gltf', function (gltf) {
    sign_model = gltf.scene;
    sign_model.position.x = 3
    sign = new THREE.Object3D()
    sign.add(sign_model);
    sign.name = "sign";
    let sign_detect = new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 1.5, 2))
    sign_detect.position.x = 3
    sign_detect.position.y = 4.5
    sign_detect.name = "sign"
    sign_detect.visible = false;
    sign.add(sign_detect)

    sign.scale.set(0.3, 0.3, 0.3);
    sign.position.y = 0.5;
    sign.position.x = -0.9
    sign.position.z = 1.5

    scene.add(sign);
    sign.visible = false;
    model.add(sign);
}, undefined, function (e) {
    console.log(e);
});
//camera
camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 25);
camera.position.set(0, 3, 5)
camera.lookAt(new THREE.Vector3(0, 3, 0))

//orbit controller
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 3, 0);

//raycaster
const raycaster = new THREE.Raycaster();
var pointer = new THREE.Vector2();

function onPointerMove(event) {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

};
document.addEventListener('mousemove', onPointerMove);

let INTERSECTED;
var button_click = 0;
var open_sign = 0;
var ex;
function touch_button() {
    raycaster.setFromCamera(pointer, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        
        switch (intersects[0].object.name) {
            
            case "button": button_click = 1;
            case "sign": if (sign.visible == true) open_sign = 1;
        
        }
        
        document.addEventListener('mousedown', () => {
            //console.log(intersects[0].object.name)
            
            switch (intersects[0].object.name) {
                case 'hi':
                    fadeToAction('Wave',0.2);
                    break;
                case 'yes':
                    fadeToAction('Yes',0.2);
                     break;
                case 'no':
                    fadeToAction('No',0.2);
                    break;
                case 'punch':
                    fadeToAction('Punch',0.2);
                    break;
                case 'TU':
                    fadeToAction('ThumbsUp',0.2);
                    break;
            }} 
        )
    } else {
        button_click = 0;
        open_sign = 0;
    }

    renderer.render(scene, camera);
}
window.requestAnimationFrame(touch_button);
document.addEventListener('mousedown', () => {
    if (button_click == 1) {
        state = 1;
    }
    if (open_sign == 1) {
        state = 3;
        sign_context = Math.floor(Math.random() * 3 + 1);
        switch (sign_context) {
            case 1: url = '../texture/sign_context/level1.png';break;
            case 2: url = '../texture/sign_context/level2.png';break;
            case 3: url = '../texture/sign_context/level3.png';break;
        }
        //load pic
        const textureLoader = new THREE.TextureLoader();
        const sign_pic = textureLoader.load(url);
        const sign_material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: sign_pic,
            depthWrite: false,
            depthTest: false,
            transparent: true
        });
        signPlane = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), sign_material);
        signPlane.position.y = model.position.y + 3;
        scene.add(signPlane);
        fadeToAction('Death', 0.2)
    }

});
//conversation
const pics_url = '../texture/conversation/'
const pic_url = ['pic_hi.png','pic_yes.png','pic_no.png','pic_punch.png','pic_TU.png']
let pic_name = ['hi','yes','no','punch','TU']
let c_pics=[];
for (let i = 0; i <= 4; i++) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(pics_url + pic_url[i]);
    const sign_material = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        map: texture,
        depthWrite: false,
        depthTest: false,
        transparent: true
    });
    //c_pics[i] = new THREE.Object3D();
    c_pics[i] = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), sign_material);
    //c_pics[i].add(mesh)
    c_pics[i].name = pic_name[i];
    //c_pics[i].name = pic_name[i];
    //console.log(mesh.name)
    c_pics[i].scale.set(0.5,0.5,0.5)
    c_pics[i].position.x = -5
    c_pics[i].position.y = 6-(i*1.5);
    scene.add(c_pics[i]);
}

//animation
animation();
function animation() {
    requestAnimationFrame(animation);
    if (sign_model) sign_model.rotation.y += 0.05;
    renderer.render(scene, camera)
    controls.update();
    const dt = clock.getDelta();
    touch_button();
    if (mixer) mixer.update(dt);
    //stats.update();
    if (model) {
        switch (state) {
            case 0:
                //
                break;
            case 1:
                get_sign();
                break;
            case 2:
                holdSign();
                break;
            case 3:
                openSign();
                break;
            
        }
    }

    
}
