/**
 * 乾坤易道 - 移动端优化模块
 * @module mobile-optimizer
 * @description 优化移动端体验，包括安全区域适配、触摸反馈、性能优化
 */

/* ========== 安全区域适配 ========== */

/**
 * 检测并应用安全区域
 */
function applySafeArea() {
    // 检测是否支持安全区域
    if (!CSS.supports('padding-top', 'env(safe-area-inset-top)')) {
        console.log('浏览器不支持安全区域');
        return;
    }

    // 添加安全区域到 body
    document.body.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';

    // 特定元素适配
    const header = document.querySelector('.app-header');
    if (header) {
        header.style.paddingTop = 'env(safe-area-inset-top)';
    }

    const bottomNav = document.querySelector('.mobile-bottom-nav');
    if (bottomNav) {
        bottomNav.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }

    console.log('安全区域适配完成');
}

/* ========== 触摸反馈 ========== */

/**
 * 添加触摸反馈到按钮
 */
function addTouchFeedback() {
    // 为所有按钮添加触摸反馈
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary, .nav-item, .mobile-nav-item');

    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });

        btn.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        }, { passive: true });

        btn.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });

    console.log('触摸反馈已添加');
}

/* ========== 性能优化 ========== */

/**
 * 图片懒加载
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => observer.observe(img));
    } else {
        // 回退方案：直接加载所有图片
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    console.log('图片懒加载已初始化');
}

/**
 * 动画性能优化
 */
function optimizeAnimations() {
    // 检测是否支持 transform3d
    const has3d = CSS.supports('transform', 'translateZ(0)');

    if (!has3d) {
        // 降级动画效果
        document.body.classList.add('reduced-motion');
    }

    // 为动画元素添加 GPU 加速
    const animatedElements = document.querySelectorAll('.glass-card, .nav-item, .btn-primary');
    animatedElements.forEach(el => {
        el.style.willChange = 'transform';
    });

    console.log('动画性能优化完成');
}

/* ========== 视口优化 ========== */

/**
 * 处理视口变化（横屏/竖屏）
 */
function handleViewportChanges() {
    // 监听方向变化
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // 重新计算布局
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

            // 提示用户
            const orientation = window.orientation || window.screen.orientation?.angle;
            if (Math.abs(orientation) === 90) {
                showToast('建议使用竖屏模式获得最佳体验', 2000);
            }
        }, 100);
    });

    // 设置 CSS 变量 --vh
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    });

    console.log('视口优化完成');
}

/* ========== 防误触 ========== */

/**
 * 防止误触（快速连续点击）
 */
function preventAccidentalClicks() {
    let lastClickTime = 0;
    const minInterval = 300; // 最小点击间隔 300ms

    document.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastClickTime < minInterval) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        lastClickTime = now;
    }, true);

    console.log('防误触已启用');
}

/* ========== 滚动优化 ========== */

/**
 * 优化滚动性能
 */
function optimizeScrolling() {
    // 为可滚动容器添加惯性滚动
    const scrollContainers = document.querySelectorAll('.scroll-body, .chat-history, .global-history-list');

    scrollContainers.forEach(container => {
        container.style.webkitOverflowScrolling = 'touch';
        container.style.overflowY = 'auto';
    });

    // 平滑滚动到顶部
    function smoothScrollToTop(element) {
        element.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    console.log('滚动优化完成');
}

/* ========== 初始化函数 ========== */

/**
 * 初始化移动端优化
 */
function initMobileOptimizer() {
    // 安全区域适配
    applySafeArea();

    // 触摸反馈
    addTouchFeedback();

    // 图片懒加载
    initLazyLoading();

    // 动画优化
    optimizeAnimations();

    // 视口处理
    handleViewportChanges();

    // 防误触
    preventAccidentalClicks();

    // 滚动优化
    optimizeScrolling();

    console.log('移动端优化初始化完成');
}

/* ========== 导出 ========== */
export {
    initMobileOptimizer,
    applySafeArea,
    addTouchFeedback,
    initLazyLoading,
    optimizeAnimations,
    handleViewportChanges,
};