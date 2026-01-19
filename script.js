// SceneManager.js - Production Version (Animated Cubes + Hero Human 3D)
class SceneManager {
  constructor() {
    this.scenes = {};
    this.renderers = {};
    this.cameras = {};
    this.animationFrames = {};
    this.isDarkMode = true;
    this.scrollY = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    this.contentSections = [
      { cubeSettings: { xOffset: 0, yOffset: 0, color: 0x00d4ff, scale: {x:1.5, y:1.5, z:1.5} } },
      { cubeSettings: { xOffset: 5, yOffset: -3, color: 0x00ffff, scale: {x:2, y:0.8, z:1} } },
      { cubeSettings: { xOffset: -4, yOffset: -6, color: 0x0066ff, scale: {x:1, y:2, z:1} } },
    ];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.createBackgroundScene();
    this.createHeroScene();
    this.createProductScenes();
    this.createTechScene();
    this.hideLoadingScreen();
  }

  setupEventListeners() {
    window.addEventListener("scroll", () => this.scrollY = window.scrollY);
    window.addEventListener("mousemove", e => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener("resize", () => this.handleResize());
    const modeToggle = document.getElementById("modeToggle");
    if (modeToggle) modeToggle.addEventListener("click", () => this.toggleTheme());
  }

  // ---------- Background Scene ----------
  createBackgroundScene() {
    const container = document.getElementById("canvas-container");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404040,0.5));
    const dirLight = new THREE.DirectionalLight(0x00d4ff,1);
    dirLight.position.set(5,10,5);
    scene.add(dirLight);

    this.createRepeatingCubes(scene, this.contentSections);

    camera.position.z = 20;
    this.scenes.background = scene;
    this.cameras.background = camera;
    this.renderers.background = renderer;

    this.animateBackground();
  }

  createRepeatingCubes(scene, contentSections) {
    const cubeGroup = new THREE.Group();
    this.cubes = [];
    
    // Create fewer, more elegant cubes
    const cubeCount = 6; // Reduced from many to just 6
    
    for (let i = 0; i < cubeCount; i++) {
      const size = 0.8 + Math.random() * 1.2;
      const geometry = new THREE.BoxGeometry(size, size, size);
      
      // Better color variation
      const colors = [0x00d4ff, 0x00ffff, 0x0066ff, 0x0099ff];
      const color = colors[i % colors.length];
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2 + Math.random() * 0.1,
        shininess: 100,
        transparent: true,
        opacity: 0.7
      });
      
      const cube = new THREE.Mesh(geometry, material);
      
      // Better positioning - more spread out and organized
      const angle = (i / cubeCount) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      cube.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius
      );
      
      cube.rotation.set(
        Math.random() * 0.3,
        Math.random() * 0.3,
        Math.random() * 0.3
      );
      
      cubeGroup.add(cube);
      this.cubes.push({
        mesh: cube,
        originalY: cube.position.y,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.002,
          y: (Math.random() - 0.5) * 0.003,
          z: (Math.random() - 0.5) * 0.001
        },
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatAmount: 0.5 + Math.random() * 0.5
      });
    }
    
    scene.add(cubeGroup);
    this.cubeGroup = cubeGroup;
  }

  animateBackground() {
    const animate = () => {
      this.animationFrames.background = requestAnimationFrame(animate);
      const time = Date.now()*0.001;

      // Smoother, more elegant cube animations
      this.cubes.forEach((c,i)=>{
        // Slower rotation
        c.mesh.rotation.y += c.rotationSpeed.y;
        c.mesh.rotation.x += c.rotationSpeed.x;
        
        // Gentle floating
        c.mesh.position.y = c.originalY + Math.sin(time * c.floatSpeed + i)*c.floatAmount*0.3;
        
        // Subtle opacity pulsing
        c.mesh.material.opacity = 0.6 + Math.sin(time*0.8 + i)*0.15;
        
        // Gentle scale variation
        const scaleAmount = 1 + Math.sin(time*0.5 + i*0.2)*0.05;
        c.mesh.scale.set(scaleAmount, scaleAmount, scaleAmount);
        
        // Parallax effect
        c.mesh.position.z = -this.scrollY*0.005 + i*0.3;
      });

      // Slower group rotation
      if(this.cubeGroup){
        this.cubeGroup.rotation.y = Math.sin(time*0.1)*0.02;
        this.cubeGroup.rotation.x = Math.cos(time*0.08)*0.01;
      }

      this.renderers.background.render(this.scenes.background,this.cameras.background);
    };
    animate();
  }

  // ---------- Hero Scene ----------
  createHeroScene() {
    const container = document.getElementById("hero-3d");
    if(!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight,0.1,1000);
    const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404040,0.6));
    const pointLight = new THREE.PointLight(0x00d4ff,1);
    pointLight.position.set(10,10,10);
    scene.add(pointLight);

    // Create 3D Robot
    this.create3DRobot(scene);

    camera.position.z = 5;
    this.scenes.hero = scene;
    this.cameras.hero = camera;
    this.renderers.hero = renderer;

    this.animateHero();
  }

  animateHero() {
    const animate = () => {
      this.animationFrames.hero = requestAnimationFrame(animate);
      const time = Date.now()*0.001;
      
      if(this.robot3D){
        // Robot floating animation
        this.robot3D.position.y = Math.sin(time * 0.8) * 0.2;
        
        // Robot rotation
        this.robot3D.rotation.y = Math.sin(time * 0.5) * 0.1;
        
        // Arms movement
        this.robot3D.children.forEach((child, index) => {
          if(child.geometry && child.geometry.type === 'BoxGeometry' && index > 2){
            child.rotation.z = Math.sin(time * 2 + index) * 0.1;
          }
        });
        
        // Eye pulsing
        if(this.robot3D.children[1] && this.robot3D.children[2]){
          const eyePulse = 0.8 + Math.sin(time * 3) * 0.2;
          this.robot3D.children[1].material.emissiveIntensity = eyePulse;
          this.robot3D.children[2].material.emissiveIntensity = eyePulse;
        }
        
        // Antenna tip pulsing
        if(this.robot3D.children[7]){
          const tipPulse = 1.0 + Math.sin(time * 4) * 0.3;
          this.robot3D.children[7].material.emissiveIntensity = tipPulse;
        }
      }
      
      this.renderers.hero.render(this.scenes.hero,this.cameras.hero);
    };
    animate();
  }

  // ---------- Product Scenes ----------
  createProductScenes() {
    const products = [
      { containerId:"product-3d-1", id:"product1", createFunc:this.createQuantumProcessor.bind(this)},
      { containerId:"product-3d-2", id:"product2", createFunc:this.createNeuralInterface.bind(this)}
    ];
    products.forEach(p=>{
      const container = document.getElementById(p.containerId);
      if(container) this.createProductScene(container,p.id,p.createFunc);
    });
  }

  createProductScene(container, productId, createFunc){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight,0.1,1000);
    const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404040,0.6));
    const dirLight = new THREE.DirectionalLight(0x00d4ff,1);
    dirLight.position.set(5,10,5);
    scene.add(dirLight);

    createFunc(scene);
    camera.position.z = 3;

    this.scenes[productId] = scene;
    this.cameras[productId] = camera;
    this.renderers[productId] = renderer;

    this.animateProduct(productId);
  }

  create3DRobot(scene) {
    const robotGroup = new THREE.Group();
    
    // Robot Head
    const headGeometry = new THREE.BoxGeometry(1.5, 1.2, 1);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a2a2a,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.1,
      shininess: 100,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    robotGroup.add(head);
    
    // Robot Eyes (glowing)
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
      shininess: 120,
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 1.5, 0.4);
    robotGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 1.5, 0.4);
    robotGroup.add(rightEye);
    
    // Robot Body
    const bodyGeometry = new THREE.BoxGeometry(2, 2.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.05,
      shininess: 80,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.5;
    robotGroup.add(body);
    
    // Robot Arms
    const armGeometry = new THREE.BoxGeometry(0.4, 2, 0.4);
    const armMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a2a2a,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.08,
      shininess: 90,
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.3, -0.5, 0);
    leftArm.rotation.z = 0.3;
    robotGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.3, -0.5, 0);
    rightArm.rotation.z = -0.3;
    robotGroup.add(rightArm);
    
    // Robot Chest Panel (glowing center)
    const chestGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
    const chestMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.6,
      shininess: 120,
    });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.set(0, -0.5, 0.55);
    robotGroup.add(chest);
    
    // Robot Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const antennaMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.3,
      shininess: 100,
    });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 2.3, 0);
    robotGroup.add(antenna);
    
    // Antenna Tip (glowing ball)
    const tipGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const tipMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.0,
      shininess: 120,
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.set(0, 2.7, 0);
    robotGroup.add(tip);
    
    scene.add(robotGroup);
    this.robot3D = robotGroup;
  }

  animateProduct(productId){
    const animate = ()=>{
      this.animationFrames[productId] = requestAnimationFrame(animate);
      if(productId==="product1" && this.quantumProcessor) this.quantumProcessor.rotation.y+=0.003;
      if(productId==="product2" && this.neuralInterface) this.neuralInterface.rotation.y-=0.002;
      this.renderers[productId].render(this.scenes[productId],this.cameras[productId]);
    };
    animate();
  }

  createQuantumProcessor(scene) {
    const group = new THREE.Group();
    
    // Main quantum chip body
    const chipGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.3);
    const chipMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      emissive: 0x0f3460,
      emissiveIntensity: 0.2,
      shininess: 100,
    });
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    group.add(chip);
    
    // Quantum dots
    const gridSize = 5;
    const spacing = 0.5;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const dotGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const dotMaterial = new THREE.MeshPhongMaterial({
          color: 0x00d4ff,
          emissive: 0x00d4ff,
          emissiveIntensity: 0.5 + Math.random() * 0.3,
          shininess: 120,
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(
          (x - gridSize / 2) * spacing,
          (y - gridSize / 2) * spacing,
          0.2
        );
        group.add(dot);
      }
    }
    
    // Central quantum core
    const coreGeometry = new THREE.IcosahedronGeometry(0.35, 4);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
      shininess: 120,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.z = 0.25;
    group.add(core);
    
    scene.add(group);
    this.quantumProcessor = group;
  }

  createNeuralInterface(scene) {
    const group = new THREE.Group();
    
    // Main interface board
    const boardGeometry = new THREE.BoxGeometry(2.8, 1.8, 0.15);
    const boardMaterial = new THREE.MeshPhongMaterial({
      color: 0x0d1b2a,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.05,
      shininess: 100,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    group.add(board);
    
    // Neural pathway nodes
    const nodePositions = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        const x = (col - 2.5) * 0.45;
        const y = (row - 1.5) * 0.4;
        nodePositions.push({ x, y });
      }
    }
    
    // Create neural nodes
    nodePositions.forEach((pos, index) => {
      const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const nodeColor = Math.random() > 0.5 ? 0x00ff41 : 0x00d4ff;
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.4 + Math.random() * 0.3,
        shininess: 120,
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(pos.x, pos.y, 0.15);
      group.add(node);
    });
    
    // Central processing core
    const coreGeometry = new THREE.TetrahedronGeometry(0.25, 2);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff41,
      emissive: 0x00ff41,
      emissiveIntensity: 0.6,
      shininess: 120,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.z = 0.25;
    group.add(core);
    
    scene.add(group);
    this.neuralInterface = group;
  }

  // ---------- Tech Scene ----------
  createTechScene() {
    const container = document.getElementById("tech-3d");
    if(!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight,0.1,1000);
    const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404040,0.6));
    const spotLight = new THREE.SpotLight(0x00d4ff,1);
    spotLight.position.set(10,10,10);
    scene.add(spotLight);

    this.createCircuitBoard(scene);
    camera.position.z = 8;

    this.scenes.tech = scene;
    this.cameras.tech = camera;
    this.renderers.tech = renderer;

    this.animateTech();
  }

  createCircuitBoard(scene) {
    const group = new THREE.Group();

    // Main board
    const boardGeometry = new THREE.BoxGeometry(6, 0.2, 4);
    const boardMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a4d2a,
      shininess: 30,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    group.add(board);

    // Circuit traces
    for (let i = 0; i < 20; i++) {
      const traceGeometry = new THREE.BoxGeometry(
        Math.random() * 2 + 0.5,
        0.01,
        0.1
      );
      const traceMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.1,
      });
      const trace = new THREE.Mesh(traceGeometry, traceMaterial);
      trace.position.set(
        (Math.random() - 0.5) * 5,
        0.11,
        (Math.random() - 0.5) * 3
      );
      trace.rotation.z = Math.random() * Math.PI;
      group.add(trace);
    }

    // Components
    for (let i = 0; i < 15; i++) {
      const componentGeometry = new THREE.BoxGeometry(
        Math.random() * 0.3 + 0.1,
        Math.random() * 0.2 + 0.1,
        Math.random() * 0.3 + 0.1
      );
      const componentMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
        shininess: 80,
      });
      const component = new THREE.Mesh(componentGeometry, componentMaterial);
      component.position.set(
        (Math.random() - 0.5) * 5,
        0.2,
        (Math.random() - 0.5) * 3
      );
      group.add(component);
    }

    scene.add(group);
    this.circuitBoard = group;
  }

  animateTech() {
    const animate = () => {
      this.animationFrames.tech = requestAnimationFrame(animate);
      if(this.circuitBoard){
        this.circuitBoard.rotation.y = Math.sin(Date.now()*0.0005)*0.2;
        this.circuitBoard.rotation.x = Math.cos(Date.now()*0.0003)*0.1;
      }
      this.renderers.tech.render(this.scenes.tech,this.cameras.tech);
    };
    animate();
  }
  handleResize(){
    Object.keys(this.scenes).forEach(sceneKey=>{
      if(this.cameras[sceneKey] && this.renderers[sceneKey]){
        const container = this.renderers[sceneKey].domElement.parentElement;
        this.cameras[sceneKey].aspect = container.clientWidth/container.clientHeight;
        this.cameras[sceneKey].updateProjectionMatrix();
        this.renderers[sceneKey].setSize(container.clientWidth, container.clientHeight);
      }
    });
  }

  toggleTheme(){
    this.isDarkMode=!this.isDarkMode;
    const body=document.body;
    if(this.isDarkMode){
      body.classList.remove("light"); body.classList.add("dark");
      body.style.background="#0a0a0a"; body.style.color="#fff";
    } else {
      body.classList.remove("dark"); body.classList.add("light");
      body.style.background="#fff"; body.style.color="#000";
    }
  }

  hideLoadingScreen(){
    setTimeout(()=>{
      const loading=document.getElementById("loadingScreen");
      if(loading){loading.style.opacity="0"; setTimeout(()=>loading.style.display="none",500);}
    },2000);
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded",()=>new SceneManager());
