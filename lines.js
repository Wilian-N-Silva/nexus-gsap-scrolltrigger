class LineManager {
    constructor(containerId) {
        this.setupTimeline();
        // this.animate = this.animate.bind(this);
        // this.handleResize();
    }

    setupTimeline() {
        gsap.registerPlugin(ScrollTrigger);

        let toggleGlow = false;

        let line_tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#line-container",
                start: "top 70%",
                end: "bottom top",
                ease: "sine.inOut",
                duration: 500,
                markers: true,
                scrub: 1,
            }
        });
    


        line_tl.fromTo(".data_line-animate", {
            opacity: 0,
            strokeDashoffset: 1e3,
            ease: "sine.inOut",
            duration: 500
        }, {
            opacity: 1,
            strokeDashoffset: 0,
            ease: "sine.inOut",
            duration: 500
        });


        let glow_tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#graph-container",
                start: "top 80%",
                end: "bottom 50%",
                ease: "sine.inOut",
                duration: 500,
                markers: true,
                scrub: 1,
            }
        });
        
        glow_tl.fromTo("#graph-container", {
            boxShadow: 'none'
        }, {
            boxShadow: '0 0 0 0 rgba(229, 255, 93, 0), 0 1.5px 17.7px 0 #36A2EB, 0 0 50px 0 #36A2EB', // Adiciona glow azul
            ease: "sine.inOut",
            duration: 500
        });

    }


    handleResize() {
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
            this.composer.setSize(width, height);
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.composer.render();
    }
}

// Initialize
const lineManager = new LineManager('line-container');
// lineManager.animate();