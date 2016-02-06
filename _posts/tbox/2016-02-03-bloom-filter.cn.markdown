---
layout: post.cn
title:  "利用bloom filter算法处理大规模数据过滤"
comments: true
categories: tbox
---

Bloom Filter是由Bloom在1970年提出的一种快速查找算法，通过多个hash算法来共同判断某个元素是否在某个集合内。可以用于网络爬虫的url重复过滤、垃圾邮件的过滤等等。

它相比hash容器的一个优势就是，不需要存储元素的实际数据到容器中去来一个个的比较是否存在。
只需要对应的位段来标记是否存在就行了，所以想当节省内存，特别适合海量的数据处理。并且由于省去了存储元素和比较操作，所以性能也比基于hash容器的高了很多。

但是由于bloom filter没有去比较元素，只通过多个hash来判断唯一性，所以存在一定的hash冲突导致误判。误判率的大小由hash函数的个数、hash函数优劣、以及存储的位空间大小共同决定。

并且删除也比较困难，解决办法是使用其变种，带计数的bloom filter，这个这里就不多说了。

对于bloom filter算法的实现，相当简单：
首先分配一块固定的连续空间，大小是m个比特位（m/8+1个字节），然后再提供k个不同hash函数，同时对每个元素进行计算位索引。如果每个位索引对应的位都为1，则存在该元素，否则就是不存在。

可以看出，如果判断为不存在，那么肯定是不存在的，只有在判断为存在的时候，才会存在误判。

bloom filter主要的难点其实在于估算：
保证指定误判率的情况下，到底需要多少个hash函数，多少的存储空间。

首先来看下bloom filter的误判率计算公式：

假定有k个hash函数，m个比特位的存储空间，n个集合元素，则有误判率p：

    p = (1 - ((1 - 1/ m) ^ kn))^k ~= (1 - e^(-kn/m))^k
 
根据这个，官方给出了一个计算k的最优解公式，使其满足给定p的情况下，存储空间达到最小：

    k = (m / n) * ln2

把它带入概率公式得到：

    p = (1 - e ^-((m/nln2)n/m))^(m/nln2)

简化为：

    lnp = -m/n * (ln2)^2

因此，如果指定p，只需要满足如果公式，就可以得到最优解：

    s = m/n = -lnp / (ln2 * ln2) = -log2(p) / ln2
    k = s * ln2 = -log2(p)

理论值：

    p < 0.1: k = 3.321928, m/n = 4.79
    p < 0.01: k = 6.643856, m/n = 9.58
    p < 0.001: k = 9.965784, m/n = 14.37
    p < 0.0001: k = 13.287712, m/n = 19.170117

可以看出，这个确实能够在保证误判率的前提下，使其存储空间达到最小，但是使用的hash函数个数k
相对较多，至少也得4个，要满足p < 0.001，需要10个才行，这个对于字符串hash的计算来讲，性能损耗相当大的，实际使用中根本没法接受。

因此我们需要另外一种推到公式，可以认为指定p和k的情况下，来计算空间使用s=m/n的大小，这样我们在实际使用的时候，灵活性就大大提高了。

下面来看下，我自己推到出来的公式，首先还是依据误判率公式：

    p = (1 - e^(-kn/m))^k

假定s=m/n，则有

    p = (1 - e^(-k/s))^k

两边取导，得到：

    lnp = k * ln(1 - e^(-k/s))

交换k：

    (lnp) / k = ln(1 - e^(-k/s))

重新上e：

    e^((lnp) / k) = 1 - e^(-k/s)

化简：

    e^(-k/s) = 1 - e^((lnp) / k) = 1 - (e^lnp)^(1/k) = 1 - p^(1/k)

再求导：

    -k/s = ln(1 - p^(1/k))

得出：

    s = -k / ln(1 - p^(1/k))

假定`c = p^(1/k)`：

    s = -k / ln(1 - c)
    
利用泰勒展开式：`ln(1 + x) ~= x - 0.5x^2 while x < 1` 化简得到：

    s ~= -k / (-c-0.5c^2) = 2k / (2c + c * c)

最后得出公式：

    c = p^(1/k)
    s = m / n = 2k / (2c + c * c)

假定有n=10000000的数据量，则有理论值：

    p < 0.1 and k = 1: s = m/n = 9.523810
    p < 0.1 and k = 2: s = m/n = 5.461082
    p < 0.1 and k = 3: s = m/n = 5.245850, space ~= 6.3MB
    p < 0.1 and k = 4: s = m/n = 5.552045, space ~= 6.6MB

    p < 0.01 and k = 1: s = m/n = 99.502488
    p < 0.01 and k = 2: s = m/n = 19.047619
    p < 0.01 and k = 3: s = m/n = 12.570636, space ~= 15MB
    p < 0.01 and k = 4: s = m/n = 10.922165, space ~= 13MB

    p < 0.001 and k = 1: s = m/n = 999.500250
    p < 0.001 and k = 2: s = m/n = 62.261118
    p < 0.001 and k = 3: s = m/n = 28.571429, space ~= 34MB
    p < 0.001 and k = 4: s = m/n = 20.656961, space ~= 24.6MB

    p < 0.0001 and k = 1: s = m/n = 9999.500025
    p < 0.0001 and k = 2: s = m/n = 199.004975
    p < 0.0001 and k = 3: s = m/n = 63.167063, space ~= 75.3MB
    p < 0.0001 and k = 4: s = m/n = 38.095238, space ~= 45.4MB
    p < 0.0001 and k = 5: s = m/n = 29.231432, space ~= 24.8MB

可以看到，在k=3的情况下，其实已经可以达到我们平常使用所能的接受范围内了，没必要非得
使用最优解，除非在空间使用极为苛刻的情况下，而且这个公式，针对程序空间使用的调整，更加的灵活智能。

特别提下，经过实测，如果每个hash的实现非常优质，分布很均匀的情况下，其实际的误判率比理论值低很多:

就拿TBOX的bloom filter的实现做测试，n=10000000：

    p < 0.01 and k = 3的情况下，其实际误判率为：0.004965
    p < 0.001 and k = 3的情况下，其实际误判率为：0.000967

所以好的hash函数算法也是尤为的重要。

下面来看下TBOX提供的bloom filter的使用，用起来也是相当的方便：

    // 总的元素个数
    tb_size_t count = 10000000;

    /* 初始化bloom filter
     *
     * TB_BLOOM_FILTER_PROBABILITY_0_01: 预定义的误判率，接近0.01
     * 注：由于内部使用位移数来表示：1 / 2^6 = 0.015625 ~= 0.01
     * 所以实际传入的误判率，有可能稍微大一点，但是还是相当接近的
     *
     * 3：为k值，hash函数的个数，最大不超过15个
     *
     * count：指定的元素规模数
     *
     * tb_item_func_long()：容器的元素类型，主要是用其内定的hash函数，如果要自定义hash函数，可以替换:
     *
     * tb_size_t tb_xxxxxx_hash(tb_item_func_t* func, tb_cpointer_t data, tb_size_t mask, tb_size_t index)
     * {
     *      // mask为hash掩码，index为第index个hash算法的索引
     *      return compute_hash(data, index) & mask;
     * }
     *
     * tb_item_func_t func = tb_item_func_long();
     * func.hash = tb_xxxxxx_hash;
     *
     * 来进行
     */
    tb_bloom_filter_ref_t filter = tb_bloom_filter_init(TB_BLOOM_FILTER_PROBABILITY_0_01, 3, count, tb_item_func_long());

    if (filter)
    {
        tb_size_t i = 0;
        for (i = 0; i < count; i++)
        {
            // 产生随机数
            tb_long_t value = tb_random();
            
            // 设置值到filter内，如果不存在，则返回tb_true表示设置成功
            if (tb_bloom_filter_set(filter, (tb_cpointer_t)value))
            {
                 // 添加元素成功，之前元素不存在
                 // 不会存在误判
            }
            else
            {
                 // 添加失败，添加的元素已经存在
                 // 这里可能会存在误判
            }
            
            // 仅仅判断元素是否存在
            if (tb_bloom_filter_get(filter, (tb_cpointer_t)data)
            {
                 // 元素已经存在
                 // 这里可能会存在误判
            }
            else
            {
                 // 元素不存在
                 // 不会存在误判
            }
        }
        
        // 退出filter
        tb_bloom_filter_exit(filter);
    }

    // 常用预定义的误判率，也可以指定其他值，注：必须是位移数，而不是实际值
    typedef enum __tb_bloom_filter_probability_e
    {
        TB_BLOOM_FILTER_PROBABILITY_0_1         = 3 ///!< 1 / 2^3 = 0.125 ~= 0.1
    ,   TB_BLOOM_FILTER_PROBABILITY_0_01        = 6 ///!< 1 / 2^6 = 0.015625 ~= 0.01
    ,   TB_BLOOM_FILTER_PROBABILITY_0_001       = 10 ///!< 1 / 2^10 = 0.0009765625 ~= 0.001
    ,   TB_BLOOM_FILTER_PROBABILITY_0_0001      = 13 ///!< 1 / 2^13 = 0.0001220703125 ~= 0.0001
    ,   TB_BLOOM_FILTER_PROBABILITY_0_00001     = 16 ///!< 1 / 2^16 = 0.0000152587890625 ~= 0.00001
    ,   TB_BLOOM_FILTER_PROBABILITY_0_000001    = 20 ///!< 1 / 2^20 = 0.00000095367431640625 ~= 0.000001
            
    }tb_bloom_filter_probability_e;

