<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// 定义组件props
const props = defineProps({
  // 图片src
  src: {
    type: String,
    required: true
  },
  // 图片alt
  alt: {
    type: String,
    default: ''
  },
  // 图片宽度
  width: {
    type: [Number, String],
    default: 'auto'
  },
  // 图片高度
  height: {
    type: [Number, String],
    default: 'auto'
  },
  // 占位图src
  placeholder: {
    type: String,
    default: ''
  },
  // 加载失败时显示的图片
  error: {
    type: String,
    default: ''
  },
  // 是否使用渐入效果
  fadeIn: {
    type: Boolean,
    default: true
  },
  // 延迟加载的阈值（px）
  threshold: {
    type: Number,
    default: 0
  }
})

// 定义事件
const emit = defineEmits(['load', 'error'])

// 图片状态
const isLoaded = ref(false)
const isError = ref(false)
const imageRef = ref(null)
let observer = null

// 图片加载成功处理
const handleLoad = () => {
  isLoaded.value = true
  emit('load')
  // 停止观察
  if (observer && imageRef.value) {
    observer.unobserve(imageRef.value)
  }
}

// 图片加载失败处理
const handleError = () => {
  isError.value = true
  emit('error')
}

// 创建IntersectionObserver实例
const createObserver = () => {
  if (!window.IntersectionObserver) {
    // 不支持IntersectionObserver的浏览器直接加载图片
    loadImage()
    return
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadImage()
      }
    })
  }, {
    threshold: props.threshold
  })

  // 观察图片元素
  if (imageRef.value) {
    observer.observe(imageRef.value)
  }
}

// 加载图片
const loadImage = () => {
  const img = new Image()
  img.src = props.src
  img.onload = handleLoad
  img.onerror = handleError
}

// 监听src变化
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc) {
      isLoaded.value = false
      isError.value = false
      if (observer && imageRef.value) {
        observer.unobserve(imageRef.value)
        observer.observe(imageRef.value)
      } else {
        createObserver()
      }
    }
  }
)

onMounted(() => {
  createObserver()
})

onUnmounted(() => {
  if (observer && imageRef.value) {
    observer.unobserve(imageRef.value)
  }
})
</script>

<template>
  <div 
    class="lazy-image-container" 
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }"
  >
    <!-- 占位图 -->
    <img
      v-if="!isLoaded && placeholder && !isError"
      :src="placeholder"
      :alt="alt"
      class="lazy-image-placeholder"
      :class="{ 'lazy-image-fade-in': fadeIn }"
    />
    
    <!-- 主图片 -->
    <img
      ref="imageRef"
      v-if="src && !isError"
      :src="isLoaded ? src : placeholder"
      :alt="alt"
      class="lazy-image"
      :class="{
        'lazy-image-loaded': isLoaded,
        'lazy-image-fade-in': fadeIn
      }"
      @load="handleLoad"
      @error="handleError"
    />
    
    <!-- 错误图片 -->
    <img
      v-if="isError && error"
      :src="error"
      :alt="alt"
      class="lazy-image-error"
    />
    
    <!-- 加载骨架屏 -->
    <div v-if="!isLoaded && !placeholder && !isError" class="lazy-image-skeleton"></div>
  </div>
</template>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.lazy-image-placeholder,
.lazy-image-error {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image-loaded {
  opacity: 1;
}

.lazy-image-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.lazy-image-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>