import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Activity {
  id: number
  name: string
  description: string
  startTime: string
  endTime: string
  location: string
  maxParticipants: number
  currentParticipants: number
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'canceled'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([
    {
      id: 1,
      name: '街舞合作班',
      description: '与知名街舞工作室合作举办的培训班',
      startTime: '2024-02-15 19:00',
      endTime: '2024-02-15 21:30',
      location: '社团活动中心103室',
      maxParticipants: 30,
      currentParticipants: 15,
      status: 'approved',
      createdBy: 'admin',
      createdAt: '2024-02-01 10:00',
      updatedAt: '2024-02-02 14:30'
    }
  ])
  
  const activityStats = computed(() => {
    return {
      total: activities.value.length,
      approved: activities.value.filter(a => a.status === 'approved').length,
      pending: activities.value.filter(a => a.status === 'pending').length,
      completed: activities.value.filter(a => a.status === 'completed').length
    }
  })
  
  function createActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now(),
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString()
    }
    activities.value.push(newActivity)
    return newActivity
  }
  
  function updateActivity(id: number, activityData: Partial<Omit<Activity, 'id' | 'createdAt'>>) {
    const index = activities.value.findIndex(a => a.id === id)
    if (index !== -1) {
      // 创建一个新对象，确保只更新允许的属性
      const updatedActivity = {
        ...activities.value[index],
        ...activityData,
        updatedAt: new Date().toLocaleString()
      } as Activity
      activities.value[index] = updatedActivity
      return updatedActivity
    }
    return null
  }
  
  function deleteActivity(id: number) {
    const index = activities.value.findIndex(a => a.id === id)
    if (index !== -1) {
      activities.value.splice(index, 1)
      return true
    }
    return false
  }
  
  function getActivityById(id: number) {
    return activities.value.find(a => a.id === id)
  }
  
  return {
    activities,
    activityStats,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivityById
  }
})