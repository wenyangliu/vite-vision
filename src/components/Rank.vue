<!-- 地区销售排行 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref">Rank</div>
  </div>
</template>

<script setup>
import {
  reactive,
  onMounted,
  ref,
  inject,
  onUnmounted,
  useContext,
  computed,
  watch,
} from 'vue'
const { expose } = useContext()
import { rank } from '../mock/rank'
import { useStore } from 'vuex'
const store = useStore()
const echarts = inject('$echarts')
const rank_ref = ref(null)
let chartInstance = null
let timerId = null
const state = reactive({
  allData: null,
  startIndex: 0,
  endIndex: 9,
})

onUnmounted(() => {
  clearInterval(timerId)
  window.removeEventListener('resize', screenAdapter)
})

onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

const theme = computed(() => store.state.theme)

function initChart() {
  chartInstance = echarts.init(rank_ref.value, theme.value)
  const initOption = {
    title: {
      text: '▎地区销售排行',
      left: 20,
      top: 20,
    },
    grid: {
      top: '40%',
      left: '5%',
      right: '5%',
      bottom: '5%',
      containLabel: true, // 距离是包含坐标轴上的文字
    },
    xAxis: {
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {},
    series: [
      {
        type: 'bar',
      },
    ],
  }
  chartInstance.setOption(initOption)
  chartInstance.on('mouseover', function () {
    clearInterval(timerId)
  })
  chartInstance.on('mouseout', function () {
    startInterval()
  })
}

function getData() {
  state.allData = rank
  updateChart()
  startInterval()
}

function updateChart() {
  state.allData.sort((a, b) => b.value - a.value)
  const showData = state.allData.slice(state.startIndex, state.endIndex)
  const names = showData.map(it => it.name)
  const values = showData.map(it => it.value)
  const colorArr = [
    ['#0BA82C', '#4FF778'],
    ['#2E72BF', '#23E5E5'],
    ['#5052EE', '#AB6EE5'],
  ]
  const dataOption = {
    xAxis: {
      data: names,
    },
    dataZoom: {
      show: false,
      startValue: state.startIndex,
      endValue: state.endIndex,
    },
    series: [
      {
        data: values,
        itemStyle: {
          color: arg => {
            let targetColorArr = null
            if (arg.value > 300) {
              targetColorArr = colorArr[0]
            } else if (arg.value > 200) {
              targetColorArr = colorArr[1]
            } else {
              targetColorArr = colorArr[2]
            }
            return {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: targetColorArr[0],
                },
                {
                  offset: 1,
                  color: targetColorArr[0],
                },
              ],
              global: false, // 缺省为 false
            }
          },
        },
      },
    ],
  }
  chartInstance.setOption(dataOption)
}

// 分辨率适配
const screenAdapter = () => {
  const titleFontSize = (rank_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          width: titleFontSize,
        },
      },
    },
    series: [
      {
        barWidth: titleFontSize,
        itemStyle: {
          borderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
        },
      },
    ],
  }
  chartInstance.setOption(adapterOption)
  chartInstance.resize()
}

function startInterval() {
  timerId = setInterval(() => {
    state.startIndex++
    state.endIndex++
    if (state.endIndex > state.allData.length - 1) {
      state.startIndex = 0
      state.endIndex = 9
    }
    updateChart()
  }, 2000)
}

// 监听主题变化
watch(theme, (newValue, oldValue) => {
  chartInstance.dispose() // 销毁当前的图表
  initChart() // 重新以最新的主题名称初始化图表对象
  screenAdapter() // 完成屏幕的适配
  updateChart() // 更新图表的展示
})

expose({
  screenAdapter,
})
</script>
