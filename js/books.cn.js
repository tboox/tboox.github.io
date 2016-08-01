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
        page_link: 'http://www.amazon.cn/gp/product/B01FE26HAU/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B01FE26HAU&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/c-primer-plus.jpg',
        title: 'C Primer Plus(第6版)(中文版)',
        description: '经久不衰的C语言畅销经典教程，针对C11标准进行全面更新'
    },
    {
        page_link: 'https://www.amazon.cn/gp/product/B01HI4WMEC/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B01HI4WMEC&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/password-tech.jpg',
        title: '图解密码技术(第3版)',
        description: '以图配文的形式，详细讲解了6种最重要的密码技术：对称密码、公钥密码、单向散列函数、消息认证码、数字签名和伪随机数生成器'
    },
    {
        page_link: 'http://www.amazon.cn/gp/product/B01H1RZTIM/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B01H1RZTIM&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/linux-programing.jpg',
        title: 'Linux环境编程:从应用到内核',
        description: '从一个全新的角度带领读者重新进入Linux环境编程，从应用出发，深入内核源码，研究Linux各接口的工作机制和原理'
    },
    {
        page_link: 'http://www.amazon.cn/gp/product/B00513FBZK/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B00513FBZK&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/digital-image.jpg',
        title: '数字图像处理(第3版)',
        description: '数字图像处理领域的经典之作'
    },
    {
        page_link: 'https://www.amazon.cn/gp/product/B0039K94IC/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B0039K94IC&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/pattern-recognition.jpg',
        title: '模式识别(第4版)',
        description: '全面阐述了模式识别的基础理论、最新方法以及各种应用。模式识别是信息科学和人工智能的重要组成部分，主要应用领域有图像分析、光学字符识别、信道均衡、语言识别和音频分类等'
    },
    {
        page_link: 'http://www.amazon.cn/gp/product/B00DMS9990/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B00DMS9990&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/image-tcp-ip.jpg',
        title: '图灵程序设计丛书:图解TCP/IP(第5版)',
        description: '这是一本图文并茂的网络管理技术书籍，旨在让广大读者理解TCP/IP的基本知识、掌握TCP/IP的基本技能'
    },
    {
        page_link: 'http://www.amazon.cn/gp/product/B011S72JB6/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B011S72JB6&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/unix-network.jpg',
        title: 'UNIX网络编程(卷1):套接字联网API(第3版)',
        description: '这是一部传世之作！书中吸纳了近几年网络技术的发展，增添了IPv6、SCTP协议和密钥管理套接字等内容，深入讨论了最新的关键标准、实现和技术'
    },
    {
        page_link: 'http://www.amazon.cn/gp/product/B0061XKRXA/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B0061XKRXA&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/code-handbook.jpg',
        title: '代码大全(第2版)',
        description: '这是一本百科全书式的软件构建手册，涵盖了软件构建活动的方方面面，尤其强调提高软件质量的种种实践方法'
    },
    {
        page_link: 'http://www.amazon.cn/gp/product/B00VHFSR34/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B00VHFSR34&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/android-safe.jpg',
        title: 'Android安全攻防权威指南',
        description: '书中细致地介绍了Android系统中的漏洞挖掘、分析，并给出了大量利用工具，结合实例从白帽子角度分析了诸多系统问题，是一本难得的安全指南'
    },
    {
        page_link: 'http://www.amazon.cn/gp/product/B008Z1IEQ8/ref=as_li_tf_tl?ie=UTF8&camp=536&creative=3200&creativeASIN=B008Z1IEQ8&linkCode=as2&tag=tboox01-23',
        img_link: '/static/img/books/cn/unix-programing-art.jpg',
        title: '传世经典书丛:UNIX编程艺术',
        description: '主要介绍了Unix系统领域中的设计和开发哲学、思想文化体系、原则与经验，由公认的Unix编程大师、开源运动领袖人物之一Eric S.Raymond倾力多年写作而成'
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
        columnWidth: 200,
        isFitWidth: true,
        gutter: 20,
    })
}
