<!-- 地区销售排行 -->
<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▎' + showTitle }}</span>
      <span
        class="iconfont title-icon"
        :style="comStyle"
        @click="state.showChoice = !state.showChoice"
        >&#xe6eb;</span
      >
      <div class="select-con" v-show="state.showChoice" :style="marginStyle">
        <div
          class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handleSelect(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script setup>
import {
  computed,
  reactive,
  onMounted,
  ref,
  useContext,
  inject,
  watch,
} from 'vue'
import { getThemeValue } from '@/utils/theme_utils'
import { trend } from '../mock/trend'
import { useStore } from 'vuex'
const store = useStore()
const { expose } = useContext()
const echarts = inject('$echarts')
let chartInstance = null
const state = reactive({
  allData: null, // 从服务器中获取的所有数据
  showChoice: false, // 是否显示可选项
  choiceType: 'map', // 显示的数据类型
  titleFontSize: 0, // 指明标题的字体大小
})

const theme = computed(() => store.state.theme)

const selectTypes = computed(() => {
  if (!state.allData) {
    return []
  } else {
    return state.allData.type.filter(item => item.key !== state.choiceType)
  }
})
const showTitle = computed(() => {
  if (!state.allData) {
    return ''
  } else {
    return state.allData[state.choiceType].title
  }
})
const comStyle = computed(() => {
  return {
    fontSize: state.titleFontSize + 'px',
    color: getThemeValue(theme.value).titleColor,
  }
})
const marginStyle = computed(() => {
  return {
    marginLeft: state.titleFontSize + 'px',
  }
})
const trend_ref = ref(null)
onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

function initChart() {
  chartInstance = echarts.init(trend_ref.value, theme.value)
  const initOption = {
    grid: {
      left: '3%',
      top: '35%',
      right: '4%',
      bottom: '1%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      left: 20,
      top: '15%',
      icon: 'circle',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
    },
  }
  chartInstance.setOption(initOption)
}

function getData() {
  state.allData = trend
  updateChart()
}

function updateChart() {
  // 半透明的颜色值
  const colorArr1 = [
    'rgba(11, 168, 44, 0.5)',
    'rgba(44, 110, 255, 0.5)',
    'rgba(22, 242, 217, 0.5)',
    'rgba(254, 33, 30, 0.5)',
    'rgba(250, 105, 0, 0.5)',
  ]
  // 全透明的颜色值
  const colorArr2 = [
    'rgba(11, 168, 44, 0)',
    'rgba(44, 110, 255, 0)',
    'rgba(22, 242, 217, 0)',
    'rgba(254, 33, 30, 0)',
    'rgba(250, 105, 0, 0)',
  ]
  // 处理数据
  // 类目轴的数据
  const timeArr = state.allData.common.month
  // y轴的数据 series下的数据
  const valueArr = state.allData[state.choiceType].data
  const seriesArr = valueArr.map((item, index) => {
    return {
      name: item.name,
      type: 'line',
      data: item.data,
      stack: state.choiceType,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: colorArr1[index], // 0% 处的颜色
            },
            {
              offset: 1,
              color: colorArr2[index], // 100% 处的颜色
            },
          ],
          global: false, // 缺省为 false
        },
      },
    }
  })
  // 图例的数据
  const legendArr = valueArr.map(item => item.name)
  const dataOption = {
    xAxis: {
      data: timeArr,
    },
    legend: {
      data: legendArr,
    },
    series: seriesArr,
  }
  chartInstance.setOption(dataOption)
}

// 选择类型
function handleSelect(currentType) {
  state.choiceType = currentType
  updateChart()
  state.showChoice = false
}

// 缩放屏幕
const screenAdapter = () => {
  state.titleFontSize = (trend_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    legend: {
      itemWidth: state.titleFontSize,
      itemHeight: state.titleFontSize,
      itemGap: state.titleFontSize,
      textStyle: {
        fontSize: state.titleFontSize / 2,
      },
    },
  }
  chartInstance.setOption(adapterOption)
  chartInstance.resize()
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
<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .select-con {
    background-color: #222733;
  }
}
</style>
