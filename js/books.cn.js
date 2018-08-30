/* jshint asi:true */
//先等图片都加载完成
//再执行布局函数

/**
 * 执行主函数
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

    /**
     * 内容JSON
     */
    var content = [{
        page_link: 'https://amazon.cn/gp/product/B01FE26HAU/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B01FE26HAU&linkId=1c6195064fc016bac01b77ca9f762ea1',
        img_link: '/static/img/books/cn/c-primer-plus.jpg',
        title: 'C Primer Plus(第6版)(中文版)',
        description: '经久不衰的C语言畅销经典教程，针对C11标准进行全面更新'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B008A4XZRI/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B008A4XZRI&linkId=5b971841b71dda197d2717e10e0ced9f',
        img_link: '/static/img/books/cn/cplusplus_primer_plus.jpg',
        title: 'C++ Primer Plus中文版(第6版)',
        description: '一本经久不衰的C++畅销经典教程；一本支持C++11新标准的程序设计图书'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B073LWHBBY/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B073LWHBBY&linkId=c8edf83e2b4f28bd29fe27c84d9ce77f',
        img_link: '/static/img/books/cn/deep_learning.jpg',
        title: '深度学习(deep learning)',
        description: '由全球知名的三位专家撰写，是深度学习领域奠基性的经典教材'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B071436YV8/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B071436YV8&linkId=f0304f2b625edcca430123e1d1a3e219',
        img_link: '/static/img/books/cn/digital-image.jpg',
        title: '数字图像处理(第三版)',
        description: '数字图像处理领域的经典之作'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B06XKCV7X9/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B06XKCV7X9&linkId=c4e0c902942c95a0b53ee37ab8a85e6f',
        img_link: '/static/img/books/cn/image_algorithom.jpg',
        title: '算法图解',
        description: '图文并茂，以让人容易理解的方式阐释了算法，旨在帮助程序员在日常项目中更好地发挥算法的能量'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B00AK7BYJY/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B00AK7BYJY&linkId=99c547b8017e99ccd179cc2c6f7b9835',
        img_link: '/static/img/books/cn/algorithom.jpg',
        title: '算法导论',
        description: '全球超过50万人阅读的算法圣经！算法标准教材，国内外1000余所高校采用。国内知名高校6位教授历时3年倾心翻译'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B07G1YNCRC/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B07G1YNCRC&linkId=2f30f551010881b8f3e27ea2735d5c42',
        img_link: '/static/img/books/cn/encrypt_and_decrypt.jpg',
        title: '加密与解密',
        description: '由看雪软件安全论众多高手共同打造而成，讲述了软件安全领域许多基础知识和技能，如调试技能、逆向分析、加密保护、外壳开发、虚拟机设计等'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B00163LU68/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B00163LU68&linkId=eea1436de0113f9bdcfb659e10fad306',
        img_link: '/static/img/books/cn/c_and_pointer.jpg',
        title: 'C和指针 Pointers On C',
        description: '提供与C语言编程、指针相关的全面资源和深入讨论'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B00QKU9B7M/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B00QKU9B7M&linkId=9e4aafa8fc07ded4272073bde39466ba',
        img_link: '/static/img/books/cn/graphic.jpg',
        title: '计算机图形学(第四版)',
        description: '图形学经典著作'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B008Z1IEQ8/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B008Z1IEQ8&linkId=d3445bba1deaaf620b2f19b9a4f3fc41',
        img_link: '/static/img/books/cn/unix-programing-art.jpg',
        title: '传世经典书丛:UNIX编程艺术',
        description: 'Unix编程大师、开源运动领袖人物之一Eric S.Raymond倾力多年写作而成'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B0012NIW9K/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B0012NIW9K&linkId=11d754e3db7a99da5a8af4a998f73f4f',
        img_link: '/static/img/books/cn/c_expert.jpg',
        title: 'C专家编程',
        description: '专家级的C编程指南展示C程序员的编程技巧'
    },
    {
        page_link: 'https://amazon.cn/gp/product/B0012UMPBY/ref=as_li_tl?ie=UTF8&tag=tboox01-23&camp=536&creative=3200&linkCode=as2&creativeASIN=B0012UMPBY&linkId=d14ce572694134030fe1dba51c4071d5',
        img_link: '/static/img/books/cn/c_trap.jpg',
        title: 'C陷阱与缺陷',
        description: 'AndrewKoenig自己在Bell实验室时发表的论文为基础，结合自己的工作经验扩展成这本对C程序员具有珍贵价值的经典著作'
    }];

    contentInit(content) //内容初始化
    waitImgsLoad() //等待图片加载，并执行布局初始化
}());



/**
 * 内容初始化
 * @return {[type]} [description]
 */
function contentInit(content) {
    var htmlStr = ''
    for (var i = 0; i < content.length; i++) {
        htmlStr +=
            '<div class="grid-item">' +
            '   <a class="a-img" href="' + content[i].page_link + '" target="_blank" >' +
            '       <img src="' + content[i].img_link + '">' +
            '   </a>' +
            '   <h3 class="book-title">' +
            '       <a href="' + content[i].page_link + '" target="_blank" >' + content[i].title + '</a>' +
            '   </h3>' +
            '   <p>' + content[i].description +
            '   </p>' +
            '</div>'
    }
    var grid = document.querySelector('.grid')
    grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * 等待图片加载
 * @return {[type]} [description]
 */
function waitImgsLoad() {
    var imgs = document.querySelectorAll('.grid img')
    var totalImgs = imgs.length
    var count = 0
        //console.log(imgs)
    for (var i = 0; i < totalImgs; i++) {
        if (imgs[i].complete) {
            //console.log('complete');
            count++
        } else {
            imgs[i].onload = function() {
                // alert('onload')
                count++
                //console.log('onload' + count)
                if (count == totalImgs) {
                    //console.log('onload---bbbbbbbb')
                    initGrid()
                }
            }
        }
    }
    if (count == totalImgs) {
        //console.log('---bbbbbbbb')
        initGrid()
    }
}

/**
 * 初始化栅格布局
 * @return {[type]} [description]
 */
function initGrid() {
    var msnry = new Masonry('.grid', {
        // options
        itemSelector: '.grid-item',
        columnWidth: 160,
        isFitWidth: true,
        gutter: 10,
    })
}
