document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.main-nav');
    const filterBar = document.querySelector('.filter-bar');
    const backToTopBtn = document.getElementById('backToTop');

    function handleScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // --- 1. LÓGICA DE LA BARRA DINÁMICA ---
        if (scrollTop <= 10) {
            navbar.classList.remove('compact');
            navbar.style.setProperty('--nav-shift', '0px');
        } else {
            navbar.classList.add('compact');
            // Calculamos cuánto hay que subir para que solo quede la filter-bar
            // Usamos offsetTop que nos da la posición exacta de la barra de filtros
            const shift = filterBar.offsetTop;
            navbar.style.setProperty('--nav-shift', `-${shift}px`);
        }

        // --- 2. LÓGICA DEL BOTÓN SUBIR ---
        if (backToTopBtn) {
            if (scrollTop > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    }

    // Escuchamos el scroll
    window.addEventListener('scroll', handleScroll);

    // --- 3. RE-CALCULAR AL CAMBIAR DE CONTENIDO ---
    // Esto es vital: cuando haces clic en una marca, el alto de la nav cambia.
    // Esperamos un momento a que los iconos se dibujen y recalculamos.
    document.addEventListener('click', (e) => {
        if (e.target.closest('.brand-icon') || e.target.closest('.tab-link')) {
            setTimeout(handleScroll, 150);
        }
    });

    // --- 4. ACCIÓN DEL BOTÓN ---
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
