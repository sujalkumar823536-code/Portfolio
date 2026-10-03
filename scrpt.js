 const text = "final-year CS student. backend-leaning full-stack dev.\nbuilds with python + django. trains models on the side.\nstatus: shipping.";
    const el = document.getElementById('typed-out');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function typeText(str, node, speed) {
      let i = 0;
      node.innerHTML = '';
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      function tick() {
        if (i <= str.length) {
          node.textContent = str.slice(0, i);
          node.appendChild(cursor);
          i++;
          setTimeout(tick, speed);
        }
      }
      tick();
    }

    if (el) {
      if (reduced) {
        el.textContent = text;
      } else {
        typeText(text, el, 28);
      }
    }

    function openProject(url) {
      window.open(url, "_blank");
    }

    const logo = document.querySelector('.logo');

    if (logo && !reduced) {
      logo.addEventListener('pointermove', (event) => {
        const bounds = logo.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        logo.style.transform = `perspective(500px) rotateX(${y * -16}deg) rotateY(${x * 16}deg)`;
      });

      logo.addEventListener('pointerleave', () => {
        logo.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
      });
    }

    const timeline = document.querySelector('.experience-timeline');
    const progress = document.querySelector('.timeline-progress');

    function updateTimeline() {

      const rect = timeline.getBoundingClientRect();

      const windowHeight = window.innerHeight;

      // Start when timeline enters the viewport
      const start = windowHeight * 0.75;

      // Calculate how far user has scrolled through timeline
      let progressValue = (start - rect.top) / timeline.offsetHeight;

      // Keep between 0 and 1
      progressValue = Math.max(0, Math.min(1, progressValue));

      // Expand the line
      progress.style.height = (progressValue * 100) + '%';
    }

    window.addEventListener('scroll', updateTimeline);
    window.addEventListener('resize', updateTimeline);

    updateTimeline();

    const hero = document.querySelector('.hero');
    const canvas = document.querySelector('#hero-animation');

    if (hero && canvas) {
      const context = canvas.getContext('2d');
      const frameCount = 300;
      const frameDuration = 1000 / 24;
      const framePath = './ezgif-376b5d9d68b39324-jpg/ezgif-frame-';
      const frames = [];
      let currentFrame = 0;
      let lastFrameTime = 0;
      let isVisible = false;
      let isRendering = false;

      function drawFrame(index) {
        const image = frames[index];
        if (!image || !image.complete) return;

        const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      }

      function resizeCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(hero.clientWidth * ratio);
        canvas.height = Math.floor(hero.clientHeight * ratio);
        drawFrame(currentFrame);
      }

      function render(timestamp) {
        if (!isVisible) {
          isRendering = false;
          return;
        }

        if (timestamp - lastFrameTime >= frameDuration) {
          currentFrame = (currentFrame + 1) % frameCount;
          drawFrame(currentFrame);
          lastFrameTime = timestamp;
        }

        requestAnimationFrame(render);
      }

      const observer = new IntersectionObserver(([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;

        if (isVisible && !wasVisible) {
          currentFrame = 0;
          lastFrameTime = 0;
          drawFrame(currentFrame);
        }

        if (isVisible && !isRendering) {
          isRendering = true;
          requestAnimationFrame(render);
        }
      }, { threshold: 0.05 });

      observer.observe(hero);
      window.addEventListener('resize', resizeCanvas, { passive: true });

      for (let index = 0; index < frameCount; index += 1) {
        const image = new Image();
        image.src = `${framePath}${String(index + 1).padStart(3, '0')}.jpg`;
        image.onload = () => {
          if (index === 0) resizeCanvas();
        };
        frames[index] = image;
      }

      resizeCanvas();
    }

    const contactCanvas = document.querySelector('#contact-canvas');
    const contactSection = document.querySelector('#contact');
    const contactForm = document.querySelector('#contact-form');

    if (contactCanvas && contactSection && window.THREE) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 6;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      contactCanvas.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const geometry = new THREE.IcosahedronGeometry(2.1, 1);
      group.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00D9A3, wireframe: true, transparent: true, opacity: 0.55 })));
      group.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x4A9EFF, size: 0.045, transparent: true, opacity: 0.9 })));

      const innerMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.9, 0),
        new THREE.MeshBasicMaterial({ color: 0xE8ECF1, wireframe: true, transparent: true, opacity: 0.25 })
      );
      group.add(innerMesh);

      let mouseX = 0;
      let mouseY = 0;
      let isContactVisible = false;

      contactSection.addEventListener('pointermove', (event) => {
        const bounds = contactSection.getBoundingClientRect();
        mouseX = (event.clientX - bounds.left) / bounds.width - 0.5;
        mouseY = (event.clientY - bounds.top) / bounds.height - 0.5;
      });

      const contactObserver = new IntersectionObserver(([entry]) => {
        isContactVisible = entry.isIntersecting;
      }, { threshold: 0.05 });
      contactObserver.observe(contactSection);

      const clock = new THREE.Clock();
      function animateContact() {
        requestAnimationFrame(animateContact);
        if (!isContactVisible) return;

        const time = clock.getElapsedTime();
        const speed = reduceMotion ? 0.05 : 1;
        group.rotation.y = time * 0.18 * speed + mouseX * 0.6;
        group.rotation.x = time * 0.09 * speed + mouseY * 0.4;
        innerMesh.rotation.y = -time * 0.25 * speed;
        innerMesh.rotation.x = time * 0.15 * speed;
        renderer.render(scene, camera);
      }

      function resizeContact() {
        const width = Math.max(contactCanvas.clientWidth, 1);
        const height = Math.max(contactCanvas.clientHeight, 1);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }

      window.addEventListener('resize', resizeContact, { passive: true });
      resizeContact();
      animateContact();
    }

    if (contactForm) {
      const status = document.querySelector('#contact-status');

      contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());

        status.classList.add('show');
        status.textContent = 'Sending...';
        status.style.color = '#f1c27d';

        try {
          const response = await fetch('https://YOUR-RENDER-URL.onrender.com/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json();

          status.textContent = result.message || 'Message sent successfully!';
          status.style.color = result.success ? '#7ef0b1' : '#ff9a9a';

          if (result.success) {
            contactForm.reset();
          }
        } catch (error) {
          status.textContent = 'Something went wrong. Please try again later.';
          status.style.color = '#ff9a9a';
        }
      });
    }

    const pythonSkillCard = document.querySelector('.python-skill-card');
    const pythonOrbit = document.querySelector('.python-orbit');
    const pythonSkillArt = document.querySelector('.python-skill-art');

    if (pythonSkillArt) {
      for (let index = 0; index < 12; index += 1) {
        const sparkle = document.createElement('span');
        sparkle.className = 'python-sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 4}s`;
        sparkle.style.animationDuration = `${3 + Math.random() * 3}s`;
        pythonSkillArt.appendChild(sparkle);
      }
    }

    if (pythonSkillCard && pythonOrbit && !reduced) {
      pythonSkillCard.addEventListener('pointermove', (event) => {
        const bounds = pythonSkillCard.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        pythonOrbit.style.transform = `translate(${x * 28}px, ${y * 22}px) rotateY(${x * 35}deg) rotateX(${y * -35}deg) scale(1.08)`;
      });

      pythonSkillCard.addEventListener('pointerleave', () => {
        pythonOrbit.style.transform = '';
      });
    }

    const javaSkillCard = document.querySelector('.java-skill-card');
    const javaOrbit = document.querySelector('.java-orbit');
    const javaSkillArt = document.querySelector('.java-skill-art');

    if (javaSkillArt) {
      for (let index = 0; index < 12; index += 1) {
        const sparkle = document.createElement('span');
        sparkle.className = 'java-sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 4}s`;
        sparkle.style.animationDuration = `${3 + Math.random() * 3}s`;
        javaSkillArt.appendChild(sparkle);
      }
    }

    if (javaSkillCard && javaOrbit && !reduced) {
      javaSkillCard.addEventListener('pointermove', (event) => {
        const bounds = javaSkillCard.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        javaOrbit.style.transform = `translate(${x * 28}px, ${y * 22}px) rotateY(${x * 35}deg) rotateX(${y * -35}deg) scale(1.08)`;
      });

      javaSkillCard.addEventListener('pointerleave', () => {
        javaOrbit.style.transform = '';
      });
    }

    const djangoSkillCard = document.querySelector('.django-skill-card');
    const djangoOrbit = document.querySelector('.django-orbit');
    const djangoSkillArt = document.querySelector('.django-skill-art');

    if (djangoSkillArt) {
      for (let index = 0; index < 12; index += 1) {
        const sparkle = document.createElement('span');
        sparkle.className = 'django-sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 4}s`;
        sparkle.style.animationDuration = `${3 + Math.random() * 3}s`;
        djangoSkillArt.appendChild(sparkle);
      }
    }

    if (djangoSkillCard && djangoOrbit && !reduced) {
      djangoSkillCard.addEventListener('pointermove', (event) => {
        const bounds = djangoSkillCard.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        djangoOrbit.style.transform = `translate(${x * 28}px, ${y * 22}px) rotateY(${x * 35}deg) rotateX(${y * -35}deg) scale(1.08)`;
      });

      djangoSkillCard.addEventListener('pointerleave', () => {
        djangoOrbit.style.transform = '';
      });
    }

    const javascriptSkillCard = document.querySelector('.javascript-skill-card');
    const javascriptOrbit = document.querySelector('.javascript-orbit');
    const javascriptSkillArt = document.querySelector('.javascript-skill-art');

    if (javascriptSkillArt) {
      for (let index = 0; index < 12; index += 1) {
        const sparkle = document.createElement('span');
        sparkle.className = 'javascript-sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 4}s`;
        sparkle.style.animationDuration = `${3 + Math.random() * 3}s`;
        javascriptSkillArt.appendChild(sparkle);
      }
    }

    if (javascriptSkillCard && javascriptOrbit && !reduced) {
      javascriptSkillCard.addEventListener('pointermove', (event) => {
        const bounds = javascriptSkillCard.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        javascriptOrbit.style.transform = `translate(${x * 28}px, ${y * 22}px) rotateY(${x * 35}deg) rotateX(${y * -35}deg) scale(1.08)`;
      });

      javascriptSkillCard.addEventListener('pointerleave', () => {
        javascriptOrbit.style.transform = '';
      });
    }

    const sqlSkillCard = document.querySelector('.sql-skill-card');
    const sqlOrbit = document.querySelector('.sql-orbit');
    const sqlSkillArt = document.querySelector('.sql-skill-art');

    if (sqlSkillArt) {
      for (let index = 0; index < 12; index += 1) {
        const sparkle = document.createElement('span');
        sparkle.className = 'sql-sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 4}s`;
        sparkle.style.animationDuration = `${3 + Math.random() * 3}s`;
        sqlSkillArt.appendChild(sparkle);
      }
    }

    if (sqlSkillCard && sqlOrbit && !reduced) {
      sqlSkillCard.addEventListener('pointermove', (event) => {
        const bounds = sqlSkillCard.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        sqlOrbit.style.transform = `translate(${x * 28}px, ${y * 22}px) rotateY(${x * 35}deg) rotateX(${y * -35}deg) scale(1.08)`;
      });

      sqlSkillCard.addEventListener('pointerleave', () => {
        sqlOrbit.style.transform = '';
      });
    }

    [
      ['.python-skill-card', '.python-orbit'],
      ['.java-skill-card', '.java-orbit'],
      ['.django-skill-card', '.django-orbit'],
      ['.javascript-skill-card', '.javascript-orbit'],
      ['.sql-skill-card', '.sql-orbit']
    ].forEach(([cardSelector, orbitSelector]) => {
      const card = document.querySelector(cardSelector);
      const orbit = document.querySelector(orbitSelector);

      if (!card || !orbit) return;

      let restoreTimer;
      const resetOrbit = () => {
        clearTimeout(restoreTimer);
        orbit.style.animationPlayState = 'paused';
        orbit.style.transform = 'rotateY(0deg) rotateX(8deg)';
      };

      const restoreOrbit = () => {
        clearTimeout(restoreTimer);
        orbit.style.animationPlayState = 'paused';
        orbit.style.transform = 'rotateY(0deg) rotateX(8deg)';
        restoreTimer = setTimeout(() => {
          orbit.style.animationPlayState = '';
          orbit.style.transform = '';
        }, 450);
      };

      card.addEventListener('pointerenter', resetOrbit);
      card.addEventListener('pointermove', resetOrbit);
      card.addEventListener('touchstart', resetOrbit, { passive: true });
      card.addEventListener('touchmove', resetOrbit, { passive: true });
      card.addEventListener('pointerleave', restoreOrbit);
      card.addEventListener('touchend', restoreOrbit, { passive: true });
      card.addEventListener('touchcancel', restoreOrbit, { passive: true });
    });

