/**
 * 乾坤易道 - 首次使用引导模块
 * @module guide
 * @description 为新用户提供功能引导，帮助快速上手
 */

import { showToast } from './utils.js?20260626-4';

/* ========== 引导步骤定义 ========== */

const GUIDE_STEPS = {
    // Dashboard 引导
    dashboard: [
        {
            selector: '.compass-showcase',
            title: '欢迎来到乾坤易道',
            description: '这是太极乾坤主页，您可以看到实时天干地支和今日运势。',
            position: 'right'
        },
        {
            selector: '.feature-link-card[data-goto="bazi"]',
            title: '八字排盘',
            description: '点击这里进入八字排盘，分析您的命理格局。',
            position: 'top'
        },
        {
            selector: '.global-history-card',
            title: '历史记录',
            description: '在这里可以查看所有命理分析的历史记录。',
            position: 'top'
        },
        {
            selector: '#btnOpenSettings',
            title: '偏好设置',
            description: '点击这里可以自定义主题、AI配置、模块管理等。',
            position: 'right'
        }
    ],

    // 八字模块引导
    bazi: [
        {
            selector: '#baziName',
            title: '输入姓名',
            description: '请输入您的姓名，用于生成个性化的命理报告。',
            position: 'bottom'
        },
        {
            selector: '#baziDate',
            title: '选择出生日期',
            description: '请选择您的出生日期和时辰，越精确越好。',
            position: 'bottom'
        },
        {
            selector: '#btnCalculateBazi',
            title: '开始排盘',
            description: '点击此按钮开始八字排盘分析。',
            position: 'bottom'
        }
    ],

    // 六爻模块引导
    liuyao: [
        {
            selector: '#liuyaoCategory',
            title: '选择占卜事项',
            description: '选择您要占卜的事项类别。',
            position: 'bottom'
        },
        {
            selector: '#btnStartLiuyao',
            title: '开始摇卦',
            description: '点击后开始摇卦，模拟抛铜钱的过程。',
            position: 'bottom'
        }
    ],

    // 奇门遁甲模块引导
    qimen: [
        {
            selector: '#qimenDate',
            title: '选择时辰',
            description: '奇门遁甲以时家奇门为主，请选择准确的占卜时辰。',
            position: 'bottom'
        },
        {
            selector: '#btnCalculateQimen',
            title: '开始排盘',
            description: '点击此按钮开始奇门遁甲排盘。',
            position: 'bottom'
        }
    ]
};

/* ========== 引导管理类 ========== */

class GuideManager {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.currentModule = '';
        this.overlay = null;
        this.tooltip = null;
        this.highlightedElement = null;
        this.STORAGE_KEY = 'qky_guide_completed';
    }

    /**
     * 初始化引导管理器
     */
    init() {
        // 检查是否已完成引导
        if (this.isGuideCompleted()) {
            console.log('引导已完成，跳过');
            return;
        }

        // 延迟启动引导，等待页面完全加载
        setTimeout(() => {
            this.startModuleGuide('dashboard');
        }, 1000);
    }

    /**
     * 检查引导是否已完成
     */
    isGuideCompleted() {
        return localStorage.getItem(this.STORAGE_KEY) === 'true';
    }

    /**
     * 标记引导为已完成
     */
    markGuideCompleted() {
        localStorage.setItem(this.STORAGE_KEY, 'true');
    }

    /**
     * 开始模块引导
     */
    startModuleGuide(moduleName) {
        const steps = GUIDE_STEPS[moduleName];
        if (!steps || steps.length === 0) {
            console.warn(`模块 ${moduleName} 没有引导步骤`);
            return;
        }

        // 如果有其他引导正在进行，先结束
        if (this.overlay) {
            this.end();
        }

        this.steps = steps;
        this.currentModule = moduleName;
        this.currentStep = 0;

        // 创建遮罩
        this.createOverlay();

        // 显示第一步
        this.showStep(0);
    }

    /**
     * 创建遮罩
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'guide-overlay';
        this.overlay.addEventListener('click', (e) => {
            // 点击遮罩不关闭，防止误操作
        });
        document.body.appendChild(this.overlay);
    }

    /**
     * 显示指定步骤
     */
    showStep(index) {
        if (index < 0 || index >= this.steps.length) {
            this.end();
            return;
        }

        const step = this.steps[index];
        const element = document.querySelector(step.selector);

        if (!element) {
            console.warn(`引导元素不存在: ${step.selector}`);
            // 跳过这个步骤
            this.next();
            return;
        }

        // 移除之前的高亮
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove('guide-highlight');
        }

        // 高亮当前元素
        element.classList.add('guide-highlight');
        this.highlightedElement = element;

        // 滚动到元素位置
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });

        // 创建提示框
        this.createTooltip(step, element, index);
    }

    /**
     * 创建提示框
     */
    createTooltip(step, targetElement, stepIndex) {
        // 移除之前的提示框
        if (this.tooltip) {
            this.tooltip.remove();
        }

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'guide-tooltip';
        this.tooltip.innerHTML = `
            <div class="guide-tooltip-content">
                <div class="guide-tooltip-header">
                    <span class="guide-step-counter">${stepIndex + 1} / ${this.steps.length}</span>
                    <button class="guide-skip-btn" title="跳过引导">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <h4 class="guide-tooltip-title">${step.title}</h4>
                <p class="guide-tooltip-desc">${step.description}</p>
                <div class="guide-tooltip-actions">
                    ${stepIndex > 0 ? '<button class="guide-prev-btn"><i class="fa-solid fa-chevron-left"></i> 上一步</button>' : ''}
                    <button class="guide-next-btn">
                        ${stepIndex < this.steps.length - 1 ? '下一步 <i class="fa-solid fa-chevron-right"></i>' : '完成引导 <i class="fa-solid fa-check"></i>'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.tooltip);

        // 定位提示框
        this.positionTooltip(step.position, targetElement);

        // 绑定事件
        this.bindTooltipEvents(stepIndex);
    }

    /**
     * 定位提示框
     */
    positionTooltip(position, targetElement) {
        if (!this.tooltip || !targetElement) return;

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const offset = 16;

        let top, left;

        switch (position) {
            case 'top':
                top = targetRect.top - tooltipRect.height - offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = targetRect.bottom + offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.left - tooltipRect.width - offset;
                break;
            case 'right':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.right + offset;
                break;
            default:
                top = targetRect.bottom + offset;
                left = targetRect.left;
        }

        // 确保提示框在视口内
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewportWidth - 10) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > viewportHeight - 10) {
            top = viewportHeight - tooltipRect.height - 10;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }

    /**
     * 绑定提示框事件
     */
    bindTooltipEvents(stepIndex) {
        if (!this.tooltip) return;

        // 跳过按钮
        const skipBtn = this.tooltip.querySelector('.guide-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.markGuideCompleted();
                this.end();
                showToast('引导已跳过，您可以在设置中重新开始', 2000);
            });
        }

        // 上一步按钮
        const prevBtn = this.tooltip.querySelector('.guide-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prev();
            });
        }

        // 下一步按钮
        const nextBtn = this.tooltip.querySelector('.guide-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (stepIndex >= this.steps.length - 1) {
                    // 最后一步，完成引导
                    this.markGuideCompleted();
                    this.end();
                    showToast('引导完成！祝您使用愉快 🎉', 3000);
                } else {
                    this.next();
                }
            });
        }
    }

    /**
     * 下一步
     */
    next() {
        this.currentStep++;
        if (this.currentStep < this.steps.length) {
            this.showStep(this.currentStep);
        } else {
            this.markGuideCompleted();
            this.end();
        }
    }

    /**
     * 上一步
     */
    prev() {
        this.currentStep--;
        if (this.currentStep >= 0) {
            this.showStep(this.currentStep);
        }
    }

    /**
     * 结束引导
     */
    end() {
        // 移除高亮
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove('guide-highlight');
            this.highlightedElement = null;
        }

        // 移除提示框
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }

        // 移除遮罩
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        this.steps = [];
        this.currentStep = 0;
    }

    /**
     * 重置引导（用于测试）
     */
    resetGuide() {
        localStorage.removeItem(this.STORAGE_KEY);
        showToast('引导已重置，刷新页面后将重新开始', 2000);
    }
}

/* ========== 引导 CSS ========== */

const guideCSS = `
/* 引导遮罩 */
.guide-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9998;
    backdrop-filter: blur(2px);
}

/* 高亮效果 */
.guide-highlight {
    position: relative;
    z-index: 9999;
    box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.4) !important;
    border-radius: 8px;
    animation: guidePulse 1.5s ease-in-out infinite;
}

@keyframes guidePulse {
    0%, 100% {
        box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.4);
    }
    50% {
        box-shadow: 0 0 0 6px rgba(212, 175, 55, 0.9), 0 0 30px rgba(212, 175, 55, 0.6);
    }
}

/* 提示框 */
.guide-tooltip {
    position: fixed;
    z-index: 10000;
    background: #14141A;
    border: 1px solid rgba(212, 175, 55, 0.5);
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    max-width: 360px;
    min-width: 280px;
    animation: guideTooltipFadeIn 0.3s ease;
}

@keyframes guideTooltipFadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.guide-tooltip-content {
    padding: 16px;
}

.guide-tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.guide-step-counter {
    font-size: 0.75rem;
    color: #A2A2AC;
    background: rgba(212, 175, 55, 0.1);
    padding: 4px 10px;
    border-radius: 12px;
}

.guide-skip-btn {
    background: transparent;
    border: none;
    color: #A2A2AC;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.guide-skip-btn:hover {
    color: #e86b6b;
    background: rgba(199, 62, 58, 0.1);
}

.guide-tooltip-title {
    font-size: 1.1rem;
    color: #D4AF37;
    margin-bottom: 8px;
    font-family: 'Noto Serif SC', serif;
}

.guide-tooltip-desc {
    font-size: 0.88rem;
    color: #F5F0E8;
    line-height: 1.6;
    margin-bottom: 16px;
}

.guide-tooltip-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.guide-prev-btn,
.guide-next-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-family: 'Noto Serif SC', serif;
    cursor: pointer;
    transition: all 0.2s ease;
}

.guide-prev-btn {
    background: transparent;
    border: 1px solid rgba(212, 175, 55, 0.3);
    color: #D4AF37;
}

.guide-prev-btn:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: rgba(212, 175, 55, 0.5);
}

.guide-next-btn {
    background: linear-gradient(135deg, #D4AF37, #B8941F);
    border: none;
    color: #0A0A0C;
    font-weight: 600;
}

.guide-next-btn:hover {
    background: linear-gradient(135deg, #E6C280, #D4AF37);
    transform: translateY(-1px);
}
`;

/* ========== 注入 CSS ========== */

function injectGuideCSS() {
    const style = document.createElement('style');
    style.textContent = guideCSS;
    document.head.appendChild(style);
}

/* ========== 初始化函数 ========== */

const guideManager = new GuideManager();

function initGuide() {
    injectGuideCSS();
    guideManager.init();
}

function startGuide(moduleName) {
    guideManager.startModuleGuide(moduleName);
}

function resetGuide() {
    guideManager.resetGuide();
}

/* ========== 导出 ========== */
export {
    initGuide,
    startGuide,
    resetGuide,
    guideManager,
    GuideManager,
};
