## vite+echarts 数据可视化

演示地址：http://39.106.81.114:8888

### 1.全局注册方法和使用
`main.js`
```
import * as echarts from 'echarts'
app.provide('$echarts', echarts)
```
使用 `test.vue`
```
import { inject } from 'vue'
const echarts = inject('$echarts')
```

### 2.ref获取dom元素
`<div ref="testRef"></div>`
```
import { ref } from 'vue'
testRef = ref(null)
```
在 `onMounted` 获取 `testRef` 才有值

### 3.父组件调用子组件方法
- 子组件
```
import { useContext } from 'vue'
const { expose } = useContext()

const screenAdapter = () => {
  //...
}

// 暴露出去
expose({
  screenAdapter
})
```

- 父组件
```
<Child ref="childRef"></Child>

<script setup>
import { ref } from 'vue'

// 这里必须这样写 不能写 let childRef = ref(null)
ref: childRef = null

// 调用方法
childRef.screenAdapter()
</script>
```