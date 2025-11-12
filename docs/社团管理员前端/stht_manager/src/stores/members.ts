import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Member {
  id: number
  name: string
  studentId: string
  major: string
  joinDate: string
  attendanceRate: number
  status: 'active' | 'inactive' | 'pending'
  role: 'member' | 'manager' | 'admin'
  phone?: string
  email?: string
}

export interface MemberStats {
  total: number
  active: number
  inactive: number
  pending: number
  averageAttendance: number
}

export const useMembersStore = defineStore('members', () => {
  const members = ref<Member[]>([
    {
      id: 1,
      name: '张三',
      studentId: '2021001',
      major: '计算机科学与技术',
      joinDate: '2023-09-01',
      attendanceRate: 92,
      status: 'active',
      role: 'admin',
      phone: '13800138001',
      email: 'zhangsan@example.com'
    },
    {
      id: 2,
      name: '李四',
      studentId: '2021002',
      major: '电子工程',
      joinDate: '2023-09-05',
      attendanceRate: 85,
      status: 'active',
      role: 'manager',
      phone: '13800138002',
      email: 'lisi@example.com'
    },
    {
      id: 3,
      name: '王五',
      studentId: '2021003',
      major: '软件工程',
      joinDate: '2023-09-10',
      attendanceRate: 78,
      status: 'active',
      role: 'member',
      phone: '13800138003',
      email: 'wangwu@example.com'
    },
    {
      id: 4,
      name: '赵六',
      studentId: '2021004',
      major: '数据科学',
      joinDate: '2023-10-01',
      attendanceRate: 65,
      status: 'inactive',
      role: 'member',
      phone: '13800138004',
      email: 'zhaoliu@example.com'
    },
    {
      id: 5,
      name: '陈七',
      studentId: '2021005',
      major: '人工智能',
      joinDate: '2023-10-15',
      attendanceRate: 90,
      status: 'active',
      role: 'member',
      phone: '13800138005',
      email: 'chenqi@example.com'
    },
    {
      id: 6,
      name: '周八',
      studentId: '2021006',
      major: '网络工程',
      joinDate: '2023-11-01',
      attendanceRate: 82,
      status: 'active',
      role: 'member',
      phone: '13800138006',
      email: 'zhouba@example.com'
    },
    {
      id: 7,
      name: '吴九',
      studentId: '2021007',
      major: '信息安全',
      joinDate: '2023-11-10',
      attendanceRate: 75,
      status: 'inactive',
      role: 'member',
      phone: '13800138007',
      email: 'wujin@example.com'
    },
    {
      id: 8,
      name: '郑十',
      studentId: '2021008',
      major: '物联网工程',
      joinDate: '2023-12-01',
      attendanceRate: 0,
      status: 'pending',
      role: 'member',
      phone: '13800138008',
      email: 'zhengshi@example.com'
    },
    {
      id: 9,
      name: '钱十一',
      studentId: '2021009',
      major: '通信工程',
      joinDate: '2023-12-15',
      attendanceRate: 88,
      status: 'active',
      role: 'member',
      phone: '13800138009',
      email: 'qianshiyi@example.com'
    },
    {
      id: 10,
      name: '孙十二',
      studentId: '2021010',
      major: '计算机应用技术',
      joinDate: '2024-01-01',
      attendanceRate: 70,
      status: 'active',
      role: 'member',
      phone: '13800138010',
      email: 'sunshener@example.com'
    },
    {
      id: 11,
      name: '李十三',
      studentId: '2021011',
      major: '软件工程',
      joinDate: '2024-01-15',
      attendanceRate: 60,
      status: 'inactive',
      role: 'member',
      phone: '13800138011',
      email: 'lishisan@example.com'
    },
    {
      id: 12,
      name: '王十四',
      studentId: '2021012',
      major: '计算机科学与技术',
      joinDate: '2024-02-01',
      attendanceRate: 0,
      status: 'pending',
      role: 'member',
      phone: '13800138012',
      email: 'wangshisi@example.com'
    }
  ])
  
  const memberStats = computed((): MemberStats => {
    const total = members.value.length
    const active = members.value.filter(m => m.status === 'active').length
    const inactive = members.value.filter(m => m.status === 'inactive').length
    const pending = members.value.filter(m => m.status === 'pending').length
    
    // 计算平均出勤率（只考虑非pending状态的成员）
    const activeMembers = members.value.filter(m => m.status === 'active' || m.status === 'inactive')
    const averageAttendance = activeMembers.length > 0 
      ? Math.round(activeMembers.reduce((sum, m) => sum + m.attendanceRate, 0) / activeMembers.length)
      : 0
    
    return {
      total,
      active,
      inactive,
      pending,
      averageAttendance
    }
  })
  
  function addMember(memberData: Omit<Member, 'id'>) {
    const newMember: Member = {
      ...memberData,
      id: Date.now()
    }
    members.value.push(newMember)
    return newMember
  }
  
  function updateMember(id: number, memberData: Partial<Omit<Member, 'id'>>) {
    const index = members.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const updatedMember = {
        ...members.value[index],
        ...memberData
      } as Member
      members.value[index] = updatedMember
      return updatedMember
    }
    return null
  }
  
  function removeMember(id: number) {
    const index = members.value.findIndex(m => m.id === id)
    if (index !== -1) {
      members.value.splice(index, 1)
      return true
    }
    return false
  }
  
  function getMemberById(id: number) {
    return members.value.find(m => m.id === id)
  }
  
  function searchMembers(keyword: string): Member[] {
    if (!keyword) return members.value
    const lowercaseKeyword = keyword.toLowerCase()
    return members.value.filter(m => 
      m.name.toLowerCase().includes(lowercaseKeyword) ||
      m.studentId.toLowerCase().includes(lowercaseKeyword) ||
      m.major.toLowerCase().includes(lowercaseKeyword)
    )
  }
  
  return {
    members,
    memberStats,
    addMember,
    updateMember,
    removeMember,
    getMemberById,
    searchMembers
  }
})