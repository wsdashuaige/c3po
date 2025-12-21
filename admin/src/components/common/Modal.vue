<script setup>
import { ref, watch } from 'vue'

// 模态框属性
const props = defineProps({
  // 是否显示
  visible: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 是否可关闭
  closable: {
    type: Boolean,
    default: true
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: true
  },
  // 是否点击遮罩关闭
  maskClosable: {
    type: Boolean,
    default: true
  },
  // 是否显示遮罩
  mask: {
    type: Boolean,
    default: true
  },
  // 模态框宽度
  width: {
    type: String,
    default: '520px'
  },
  // 模态框高度
  height: {
    type: String,
    default: 'auto'
  },
  // 是否全屏
  fullscreen: {
    type: Boolean,
    default: false
  },
  // 关闭时销毁内容
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  // z-index
  zIndex: {
    type: Number,
    default: 2000
  }
})

// 事件
const emit = defineEmits(['update:visible', 'close', 'cancel', 'ok'])

// 内部状态
const modalRef = ref(null)
const bodyRef = ref(null)

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 显示时添加body样式
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${getScrollbarWidth()}px`
  } else {
    // 隐藏时恢复body样式
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
})

// 获取滚动条宽度
const getScrollbarWidth = () => {
  const scrollDiv = document.createElement('div')
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'
  document.body.appendChild(scrollDiv)
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return scrollbarWidth
}

// 关闭模态框
const closeModal = () => {
  if (props.closable) {
    emit('update:visible', false)
    emit('close')
  }
}

// 点击遮罩关闭
const handleMaskClick = () => {
  if (props.maskClosable && props.closable) {
    closeModal()
  }
}

// 点击内容区阻止冒泡
const handleContentClick = (e) => {
  e.stopPropagation()
}

// 取消
const handleCancel = () => {
  emit('cancel')
  closeModal()
}

// 确定
const handleOk = () => {
  emit('ok')
}
</script>

<template>
  <transition name="modal">
    <div 
      v-if="visible" 
      class="modal-overlay" 
      :style="{ zIndex: zIndex }"
      @click="handleMaskClick"
    >
      <div 
        ref="modalRef"
        class="modal-content"
        :style="{
          width: fullscreen ? '100%' : width,
          height: fullscreen ? '100%' : height,
          maxWidth: fullscreen ? '100%' : '95vw',
          maxHeight: fullscreen ? '100%' : '90vh'
        }"
        @click="handleContentClick"
      >
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button 
            v-if="showClose"
            class="modal-close-btn"
            @click="closeModal"
            :disabled="!closable"
          >
            ×
          </button>
        </div>
        <div ref="bodyRef" class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button 
              class="btn btn-secondary" 
              @click="handleCancel"
              :disabled="!closable"
            >
              取消
            </button>
            <button class="btn btn-primary" @click="handleOk">
              确定
            </button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #86868b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f2f2f7;
  color: #1d1d1f;
}

.modal-close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-footer {
    padding: 16px;
  }
}
</style>