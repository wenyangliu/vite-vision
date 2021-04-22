<!-- 热销商品占比图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" @click="toRight" :style="comStyle"
      >&#xe6ed;</span
    >
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, onUnmounted, inject, computed, useContext, watch } from 'vue'
import { getThemeValue } from '@/utils/theme_utils'
import { hot } from '../mock/hot'
import {useStore} from 'vuex'
const store = useStore()
const { expose } = useContext()
const echarts = inject('$echarts')
const hot_ref = ref(null)
let chartInstance = null
const state = reactive({
  allData: null,
  currentIndex: 0,
  titleFontSize: 0,
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
})

onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

const theme = computed(() => store.state.theme)

const comStyle = computed(() => {
  return {
    fontSize: state.titleFontSize + 'px',
    color: getThemeValue(theme.value).titleColor,
  }
})

const catName = computed(() => {
  if (!state.allData) return ''
  return state.allData[state.currentIndex].name
})

// 初始化echarts
function initChart() {
  chartInstance = echarts.init(hot_ref.value, theme.value)
  const initOption = {
    title: {
      text: '▎热销商品占比',
      left: 20,
      top: 20,
    },
    legend: {
      top: '15%',
      icon: 'cricle',
    },
    tooltip: {
      formatter: arg => {
        const thirdCategory = arg.data.children
        const total = thirdCategory.reduce((a, b) => a + b.value, 0)
        let retStr = ''
        thirdCategory.forEach(it => {
          retStr += `${it.name}:${parseInt(it.value / total * 100) + '%'}<br/>`
        })
        return retStr
      },
    },
    series: [
      {
        type: 'pie',
        label: {
          show: false,
        },
      },
    ],
  }
  chartInstance.setOption(initOption)
}

// 获取数据
function getData() {
  state.allData = hot // 实际服务端请求
  updateChart()
}

// 更新echarts
function updateChart() {
  const legendData = state.allData[state.currentIndex].children.map(
    it => it.name
  )
  const seriesData = state.allData[state.currentIndex].children.map(it => {
    return {
      name: it.name,
      value: it.value,
      children: it.children,
    }
  })
  const dataOption = {
    legend: {
      data: legendData,
    },
    series: [
      {
        data: seriesData,
      },
    ],
  }
  chartInstance.setOption(dataOption)
}

// 分辨率适配
const screenAdapter = () => {
  state.titleFontSize = (hot_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: state.titleFontSize,
      },
    },
    legend: {
      itemWidth: state.titleFontSize / 2,
      itemHeight: state.titleFontSize / 2,
      itemGap: state.titleFontSize / 2,
      textStyle: {
        fontSize: state.titleFontSize / 2,
      },
    },
    series: [
      {
        radius: state.titleFontSize * 4.5,
        center: ['50%', '60%'],
      },
    ],
  }
  chartInstance.setOption(adapterOption)
  chartInstance.resize()
}

function toLeft() {
  state.currentIndex--
  if (state.currentIndex < 0) {
    state.currentIndex = state.allData.length - 1
  }
  updateChart()
}

function toRight() {
  state.currentIndex++
  if (state.currentIndex > state.allData.length - 1) {
    state.currentIndex = 0
  }
  updateChart()
}

// 监听主题变化
watch(theme, (newValue, oldValue) => {
  chartInstance.dispose() // 销毁当前的图表
  initChart() // 重新以最新的主题名称初始化图表对象
  screenAdapter() // 完成屏幕的适配
  updateChart() // 更新图表的展示
})

expose({
  screenAdapter
})
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>
