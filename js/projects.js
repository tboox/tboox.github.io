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
    var demoContent = [{
        page_link: 'http://xmake.io',
        img_link: '/static/img/xmake/xmake_site.png',
        code_repo: 'xmake',
        title: 'xmake',
        description: 'XMake is a make-like build utility based on lua.'
    },
    {
        page_link: 'https://github.com/waruqi/tbox',
        img_link: '/static/img/logo2.jpg',
        code_repo: 'tbox',
        title: 'tbox',
        description: 'TBox is a glib-like cross-platform C library that is simple to use yet powerful in nature.'
    },
    {
        page_link: 'https://github.com/waruqi/gbox',
        img_link: '/static/img/gbox/tiger.svg',
        code_repo: 'gbox',
        title: 'gbox',
        description: 'GBox is a cross-platform 2d graphic library in c language.'
    },
    {
        page_link: 'https://github.com/waruqi/itrace',
        img_link: '/static/img/itrace/itrace.png',
        code_repo: 'itrace',
        title: 'itrace',
        description: 'Trace objc method call for ios and mac.'
    },
    {
        page_link: 'https://github.com/waruqi/hnr',
        img_link: '/static/img/hnr/demo.png',
        code_repo: 'hnr',
        title: 'hnr',
        description: 'An off-line handwritten numeral recognition system.'
    },
    {
        page_link: 'https://asciinema.org/a/79998',
        img_link: '/static/img/xmake/videodemo.png',
        code_repo: 'xmake',
        title: 'xmake: demo',
        description: 'Demo: Build a simple project using xmake.'
    }];

    contentInit(demoContent) //内容初始化
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
            '   <a class="a-img" href="' + content[i].page_link + '">' +
            '       <img src="' + content[i].img_link + '">' +
            '   </a>' +
            '   <h3 class="demo-title">' +
            '       <a href="' + content[i].page_link + '">' + content[i].title + '</a>' +
            '   </h3>' +
            '   <span class="demo-repostar"> <iframe src="https://ghbtns.com/github-btn.html?user=waruqi&repo=' + content[i].code_repo + '&type=star&count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe></span>' +
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
        columnWidth: 250,
        isFitWidth: true,
        gutter: 20,
    })
}
