<!-- 库存销量分析 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, inject, useContext, computed, watch } from 'vue'
import { stock } from '../mock/stock'
import {useStore} from 'vuex'
const store = useStore()
const { expose } = useContext()
const echarts = inject('$echarts')
const stock_ref = ref(null)
let chartInstance = null
let timerId = null
const state = reactive({
  allData: null,
  currentIndex: 0,
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
  chartInstance = echarts.init(stock_ref.value, theme.value)
  const initOption = {
    title: {
      text: '▎库存和销量分析',
      left: 20,
      top: 20,
    },
  }
  chartInstance.setOption(initOption)
  chartInstance.on('mouseover', () => {
    clearInterval(timerId)
  })
  chartInstance.on('mouseout', () => {
    startInterval()
  })
}
function getData() {
  state.allData = stock
  updateChart()
  startInterval()
}

function updateChart() {
  const centerArr = [
    ['18%', '40%'],
    ['50%', '40%'],
    ['82%', '40%'],
    ['34%', '75%'],
    ['66%', '75%'],
  ]
  const colorArr = [
    ['#4FF778', '#0BA82C'],
    ['#E5DD45', '#E8B11C'],
    ['#E8821C', '#E55445'],
    ['#5052EE', '#AB6EE5'],
    ['#23E5E5', '#2E72BF'],
  ]
  const start = state.currentIndex * 5
  const end = (state.currentIndex + 1) * 5
  const showData = state.allData.slice(start, end)
  const seriesArr = showData.map((it, index) => {
    return {
      type: 'pie',
      center: centerArr[index], //配置图形的位置,前面一个是x轴,后面一个是y轴,'50%'代表是水平居中
      emphasis: {
        scale: false
      },
      labelLine: {
        show: false,
      },
      data: [
        {
          name: it.name + '\n\n' + it.sales,
          value: it.sales,
          label: {
            position: 'center',
            color: colorArr[index][0],
          },
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 1,
              x2: 0,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: colorArr[index][0], // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: colorArr[index][1], // 100% 处的颜色
                },
              ],
              global: false, // 缺省为 false
            },
          },
        },
        {
          value: it.stock,
          itemStyle: {
            color: '#333843',
          },
        },
      ],
    }
  })
  const dataOption = {
    series: seriesArr,
  }
  chartInstance.setOption(dataOption)
}

const screenAdapter = () => {
  const titleFontSize = (stock_ref.value.offsetWidth / 100) * 3.6
  const innerRadius = titleFontSize * 2.8
  const outterRadius = innerRadius * 1.125
  const obj = {
    type: 'pie',
    radius: [outterRadius, innerRadius],
    label: {
      fontSize: titleFontSize / 2,
    },
  }
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    series: Array.from({ length: 5 }).fill(obj),
  }
  chartInstance.setOption(adapterOption)
  chartInstance.resize()
}

function startInterval() {
  if (timerId) {
    clearInterval(timerId)
  }
  timerId = setInterval(() => {
    state.currentIndex++
    if (state.currentIndex > 1) {
      state.currentIndex = 0
    }
    updateChart()
  }, 5000)
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
