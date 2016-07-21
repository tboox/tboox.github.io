---
layout: post.cn
title: "复杂多边形光栅化算法"
tags: gbox c 复杂多边形 光栅化 算法 单调多边形 三角化 凸多边形
categories: gbox
---

虽然已经一年多没有维护[gbox](https://github.com/waruqi/gbox)这个图形库项目了，最近确实时间不够用。。。

今年的重点是把[xmake](http://www.xmake.io)彻底正好，至少在架构和大功能（包依赖管理）上，要完全落实下来，后期就是零散的维护和插件功能扩展了。。

tbox我会陆陆续续一直进行一些小规模更新，明年上半年稍微重构一些模块后，就开始重点重新搞gbox了，这才是我一直最想做，也是最喜欢做的项目了

所以我宁愿开发的慢点，也要把它做精，做到最好。。

好了，回归正题，虽然现在gbox还处于早期开发中，并不能用到实际的项目中去，但是里面的一些算法，还是很有参考学习价值的。。

我这两天没事就拿出来分享下，如果有感兴趣的同学，可以直接阅读源码：[monotone.c](https://github.com/waruqi/gbox/blob/master/src/gbox/utils/impl/tessellator/monotone.c) 

毕竟这个算法我陆陆续续花了整整一年的时间，才把它彻底搞透，并且实现出来。。

为什么会花这么久呢，也许是我太笨了哈。。嘿嘿。。当然也有工作原因哈。。

我先简单讲讲研究和实现这个复杂多边形光栅化算法的背景：




我的gbox目前有两套渲染设备，一套是直接纯算法渲染，其核心算法就是扫描多边形填充算法，这个算法已经算是很普遍了，也很成熟，效率也很高
但是在我的另外一套基于opengl es渲染设备中（为了能够利用gpu进行加速渲染），在渲染复杂多边形时，就遇到了问题：`opengl不支持复杂多边形的填充`

后来我想了很多办法，也去google了下，发现可以通过opengl的模板来实现，然后我就开写了。。

写到一半，整体效果也出来了，自以为搞定了，却又遇到一个很难跨过的瓶颈，效率太低了，用这种方式渲染一个老虎头，帧率只有：15 fps

比我用纯算法的实现还慢，后来就思考为什么这么慢呢，一个原因就是模板确实很慢。。。

第二个原因就是：我要实现通用的渲染接口，要支持各种填充规则，裁剪规则，这些复杂性，也使得基于模板的方式整体不太好优化。。

就这样折腾了半年，最后决定，还是整体重构gbox吧，彻底不用模板实现了，采用另外一种方式：

先在上层对复杂多边形根据各种填充规则和裁剪，进行预处理，核心算法呢就是：`对复杂多边形进行三角化分割，并且合并成凸多边形`
再送到opengl中进行快速渲染。。。

那问题来了，如果才能高效分割多边形呢，而且还要支持各种填充规则？

继续google，最后发现libtess2的光栅化代码里面的算法是可以完全做到的，但是我不可能直接用它的代码，一个原因是维护不方便
另外一个原因是，它里面的实现，很多地方效率不是很高，而我要实现的比他更高效，更稳定。。。

那就必须要先看透它的实现逻辑，然后再去改进和优化里面的算法实现。。。

虽然里面代码不多，但是我光看透，就又花了半年时间，最后陆陆续续写了半年，终于才完全搞定。。

最后效果吗，还是不错的，至少在我的mac pro上用opengl渲染老虎头，帧率可以达到：60 fps

当然，里面肯定还是有很多问题在里面的，不做最近确实没时间整了，只能先搁置下来了，等以后在优化优化。。。

先晒晒，三角化后的效果：

![test_triangulation1](/static/img/gbox/test_triangulation1.png)
![test_triangulation2](/static/img/gbox/test_triangulation2.png)

然后再晒张老虎头效果：

![draw_tiger](/static/img/gbox/draw_tiger.png)

接着我再对分割算法做些简要描述：

gbox中实现算法跟libtess2算法中的一些不同和改进的地方:

- 整体扫描线方向从纵向扫描，改成了横向扫描，这样更符合图像扫描的席位逻辑，代码处理上也会更方便
- 我们移除了3d顶点坐标投影的过程，因为我们只处理2d多边形，所以会比libtess2更快
- 处理了更多交点情况，优化了更多存在交点误差计算的地方，因此我们的算法会更稳定，精度也更高
- 整体支持浮点和定点切换，在效率和精度上可以自己权衡调整
- 采用自己独有的算法实现了活动边缘比较，精度更高，稳定性更好 
- 优化了从三角化的mesh合并成凸多边形的算法，效率更高
- 对每个区域遍历，移除了没必要的定点计数过程，因此效率会快很多

整个算法总共有四个阶段：

1. 从原始复杂多边形构建DCEL mesh网(DCEL双连通边缘链表, 跟quad-edge类似，相当于是个简化版).
2. 如果多边形是凹多边形或者复杂多边形，那么先把它分割成单调多边形区域（mesh结构维护）
3. 对基于mesh的单调多边形进行快速三角化处理
4. 合并三角化后的区域到凸多边形

其中光栅化算法实现上分有七个阶段：

1. 简化mesh网，并且预先处理一些退化的情况（例如：子区域退化成点、线等）
2. 构建顶点事件列表并且排序它 (基于最小堆的优先级排序).
3. 构建活动边缘区域列表并且排序它(使用局部区域的插入排序，大部分情况下都是O(n)，而且量不多).
4. 使用`Bentley-Ottman`扫描算法，从事件队列中扫描所有顶点事件，并且计算交点和winding值（用于填充规则计算）
5. 如果产生交点改变了mesh网的拓扑结构或者活动边缘列表发生改变，需要对mesh的一致性进行修复
6. 当我们处理过程中，发生了一些`mesh face`的退化情况，那么也需要进行处理
7. 将单调区域的`left face`标记为"inside"，也就是最后需要获取的输出区域

如果你想要了解更多算法细节，可以参考： [libtess2/alg_outline.md](https://github.com/memononen/libtess2/blob/master/alg_outline.md)


光栅化接口的使用例子，来自源码：[gbox/gl/render.c](https://github.com/waruqi/gbox/blob/master/src/gbox/core/device/gl/render.c):

更详细的算法实现细节，请参考我的实现: [monotone.c](https://github.com/waruqi/gbox/blob/master/src/gbox/utils/impl/tessellator/monotone.c) 

```c
    static tb_void_t gb_gl_render_fill_convex(gb_point_ref_t points, tb_uint16_t count, tb_cpointer_t priv)
    {
        // check
        tb_assert(priv && points && count);

        // apply it
        gb_gl_render_apply_vertices((gb_gl_device_ref_t)priv, points);

#ifndef GB_GL_TESSELLATOR_TEST_ENABLE
        // draw it
        gb_glDrawArrays(GB_GL_TRIANGLE_FAN, 0, (gb_GLint_t)count);
#else
        // the device 
        gb_gl_device_ref_t device = (gb_gl_device_ref_t)priv;

        // make crc32
        tb_uint32_t crc32 = 0xffffffff ^ tb_crc_encode(TB_CRC_MODE_32_IEEE_LE, 0xffffffff, (tb_byte_t const*)points, count * sizeof(gb_point_t));

        // make color
        gb_color_t color;
        color.r = (tb_byte_t)crc32;
        color.g = (tb_byte_t)(crc32 >> 8);
        color.b = (tb_byte_t)(crc32 >> 16);
        color.a = 128;

        // enable blend
        gb_glEnable(GB_GL_BLEND);
        gb_glBlendFunc(GB_GL_SRC_ALPHA, GB_GL_ONE_MINUS_SRC_ALPHA);

        // apply color
        if (device->version >= 0x20) gb_glVertexAttrib4f(gb_gl_program_location(device->program, GB_GL_PROGRAM_LOCATION_COLORS), (gb_GLfloat_t)color.r / 0xff, (gb_GLfloat_t)color.g / 0xff, (gb_GLfloat_t)color.b / 0xff, (gb_GLfloat_t)color.a / 0xff);
        else gb_glColor4f((gb_GLfloat_t)color.r / 0xff, (gb_GLfloat_t)color.g / 0xff, (gb_GLfloat_t)color.b / 0xff, (gb_GLfloat_t)color.a / 0xff);

        // draw the edges of the filled contour
        gb_glDrawArrays(GB_GL_TRIANGLE_FAN, 0, (gb_GLint_t)count);

        // disable blend
        gb_glEnable(GB_GL_BLEND);
#endif
    }
    static tb_void_t gb_gl_render_fill_polygon(gb_gl_device_ref_t device, gb_polygon_ref_t polygon, gb_rect_ref_t bounds, tb_size_t rule)
    {
        // check
        tb_assert(device && device->tessellator);

#ifdef GB_GL_TESSELLATOR_TEST_ENABLE
        // set mode
        gb_tessellator_mode_set(device->tessellator, GB_TESSELLATOR_MODE_TRIANGULATION);
//      gb_tessellator_mode_set(device->tessellator, GB_TESSELLATOR_MODE_MONOTONE);
#endif

        // set rule
        gb_tessellator_rule_set(device->tessellator, rule);

        // set func
        gb_tessellator_func_set(device->tessellator, gb_gl_render_fill_convex, device);

        // done tessellator
        gb_tessellator_done(device->tessellator, polygon, bounds);
    }
```


