<script setup>
import { computed } from 'vue'

// 属性
const props = defineProps({
  // 是否显示加载状态
  loading: {
    type: Boolean,
    default: true
  },
  // 大小
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // 颜色
  color: {
    type: String,
    default: '#007aff'
  },
  // 是否显示文字
  text: {
    type: String,
    default: ''
  },
  // 是否为全屏遮罩
  fullscreen: {
    type: Boolean,
    default: false
  },
  // 背景色（仅全屏时有效）
  backgroundColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.8)'
  },
  // z-index（仅全屏时有效）
  zIndex: {
    type: Number,
    default: 9999
  }
})

// 计算大小样式
const spinnerSize = computed(() => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  }
  return sizes[props.size] || sizes.medium
})

// 计算文字大小
const textSize = computed(() => {
  const sizes = {
    small: '12px',
    medium: '14px',
    large: '16px'
  }
  return sizes[props.size] || sizes.medium
})

// 计算样式对象
const spinnerStyle = computed(() => {
  return {
    width: spinnerSize.value,
    height: spinnerSize.value,
    borderColor: `${props.color}20`,
    borderTopColor: props.color,
    borderWidth: props.size === 'small' ? '2px' : '3px'
  }
})
</script>

<template>
  <transition name="loading">
    <div 
      v-if="loading"
      :class="[
        'loading-container',
        {
          'loading-fullscreen': fullscreen,
          'loading-with-text': text
        }
      ]"
      :style="{
        backgroundColor: fullscreen ? backgroundColor : 'transparent',
        zIndex: fullscreen ? zIndex : 'auto'
      }"
    >
      <div class="loading-content">
        <div 
          class="loading-spinner"
          :style="spinnerStyle"
        ></div>
        <span 
          v-if="text"
          class="loading-text"
          :style="{
            color: props.color,
            fontSize: textSize.value,
            marginTop: props.size === 'small' ? '8px' : '12px'
          }"
        >
          {{ text }}
        </span>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  border-radius: 50%;
  border-style: solid;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-weight: 500;
  text-align: center;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 过渡动画 */
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>