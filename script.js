import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

const canvas = document.getElementById('resonanceCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let hue = 0;

const settings = {
    particleCount: 300,
    particleSize: 4,
    connectionDistance: 100,
    mouseRadius: 150,
    shockwaveOnClick: false,
    shockwave: () => {
        createShockwave();
    },
    reset: () => {
        init();
    }
};

const gui = new GUI({ title: 'Holophasic Controls' });
gui.add(settings, 'particleCount', 10, 1000, 1).onFinishChange(init);
gui.add(settings, 'particleSize', 1, 10, 0.1);
gui.add(settings, 'connectionDistance', 10, 500, 1);
gui.add(settings, 'mouseRadius', 50, 500, 1);
gui.add(settings, 'shockwaveOnClick').name('Shockwave on Click');
gui.add(settings, 'shockwave').name('Create Shockwave');
gui.add(settings, 'reset').name('Reset Simulation');


let mouse = {
    x: null,
    y: null,
    radius: 150,
    isDown: false,
};

canvas.addEventListener('mousedown', (event) => {
    mouse.isDown = true;
    mouse.x = event.x;
    mouse.y = event.y;
    if (settings.shockwaveOnClick) {
        createShockwave();
    }
});

canvas.addEventListener('mouseup', () => {
    mouse.isDown = false;
});

window.addEventListener('mousemove', (event) => {
    if (mouse.isDown) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
});

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * settings.particleSize + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${hue}, 100%, 50%)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Mouse interaction
        if (mouse.isDown) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < settings.mouseRadius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (settings.mouseRadius - distance) / settings.mouseRadius;
                this.speedX += forceDirectionX * force * 0.5;
                this.speedY += forceDirectionY * force * 0.5;
            }
        }
        
        // Dampening
        this.speedX *= 0.99;
        this.speedY *= 0.99;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < settings.particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
    }
}

function connect() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < settings.connectionDistance) {
                const opacity = 1 - (distance / settings.connectionDistance);
                ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    connect();
    hue += 0.5;
    requestAnimationFrame(animate);
}

function createShockwave() {
    for (let i = 0; i < particles.length; i++) {
        let dx = particles[i].x - mouse.x;
        let dy = particles[i].y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) distance = 0.0001;
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let force = (1 / distance) * 200;
        particles[i].speedX += forceDirectionX * force;
        particles[i].speedY += forceDirectionY * force;
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Slideshow Logic
const slideshow = document.getElementById('slideshow');
const slides = document.querySelectorAll('.slide');
const startTourBtn = document.getElementById('startTourBtn');
const endTourBtn = document.getElementById('endTourBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    prevBtn.style.display = index === 0 ? 'none' : 'block';
    nextBtn.style.display = index === slides.length - 1 ? 'none' : 'block';
}

function startTour() {
    slideshow.classList.remove('hidden');
    slideshow.classList.add('visible');
    document.getElementById('info').style.display = 'none';
    gui.hide();
    currentSlide = 0;
    showSlide(currentSlide);
}

function endTour() {
    slideshow.classList.remove('visible');
    slideshow.classList.add('hidden');
    document.getElementById('info').style.display = 'block';
    gui.show();
}

startTourBtn.addEventListener('click', startTour);
endTourBtn.addEventListener('click', endTour);

nextBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
    }
});

init();
animate();
