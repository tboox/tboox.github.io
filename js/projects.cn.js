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
        description: 'XMake是一个基于Lua的轻量级跨平台自动构建工具，支持在各种主流平台上构建项目'
    },
    {
        page_link: 'https://github.com/tboox/tbox',
        img_link: '/static/img/logo2.jpg',
        code_repo: 'tbox',
        title: 'tbox',
        description: 'TBox是一个用c语言实现的跨平台开发库'
    },
    {
        page_link: 'https://github.com/tboox/gbox',
        img_link: '/static/img/gbox/tiger.svg',
        code_repo: 'gbox',
        title: 'gbox',
        description: 'GBox是一个用c语言实现的跨平台的2d图形库渲染库'
    },
    {
        page_link: 'https://github.com/tboox/ltui',
        img_link: '/static/img/ltui/choicebox.png',
        code_repo: 'ltui',
        title: 'ltui',
        description: 'LTUI是一个基于lua的跨平台字符终端UI界面库'
    },
    {
        page_link: 'https://github.com/tboox/itrace',
        img_link: '/static/img/itrace/itrace.png',
        code_repo: 'itrace',
        title: 'itrace',
        description: 'ios objc方法调用记录工具'
    },
    {
        page_link: 'https://github.com/tboox/hnr',
        img_link: '/static/img/hnr/demo.png',
        code_repo: 'hnr',
        title: 'hnr',
        description: '一个早期学生时期写的脱机手写识别系统，仅供学习参考'
    },
    {
        page_link: 'https://asciinema.org/a/133693',
        img_link: '/static/img/xmake/videodemo.png',
        code_repo: 'xmake',
        title: 'xmake: 演示',
        description: '演示: 使用xmake快速构建项目'
    },
    {
        page_link: 'https://github.com/tboox/vm86',
        img_link: '/static/img/vm86/idapro.png',
        code_repo: 'vm86',
        title: 'vm86',
        description: '这是一个可以直接解释执行从ida pro里面提取出来的x86汇编代码的虚拟机'
    },
    {
        page_link: 'https://github.com/tboox/benchbox',
        img_link: '/static/img/benchbox/benchbox.jpg',
        code_repo: 'benchbox',
        title: '基准测试包',
        description: 'Benchbox是一个基准测试包，里面包含许多针对第三方库功能的性能基准测试和对比'
    },
    {
        page_link: 'https://github.com/xmake-io/xmake-vscode',
        img_link: '/static/img/xmake/xmake-vscode-problem.gif',
        code_repo: 'xmake-vscode',
        title: 'xmake-vscode',
        description: 'xmake-vscode是一个高度集成xmake的vscode插件，提供方便快速的xmake构建支持，实现高效c/c++跨平台开发'
    },
    {
        page_link: 'https://github.com/xmake-io/xmake-idea',
        img_link: '/static/img/xmake/xmake-idea-problem.gif',
        code_repo: 'xmake-idea',
        title: 'xmake-idea',
        description: 'xmake-idea是一个高度集成xmake的Intellij-IDEA插件，提供方便快速的xmake构建支持，实现高效c/c++跨平台开发'
    },
    {
        page_link: 'https://github.com/xmake-io/xmake-sublime',
        img_link: '/static/img/xmake/xmake-sublime-problem.gif',
        code_repo: 'xmake-sublime',
        title: 'xmake-sublime',
        description: 'xmake-sublime是一个高度集成xmake的Sublime Text2/3插件，提供方便快速的xmake构建支持，实现高效c/c++跨平台开发'
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
            '   <span class="demo-repostar"> <iframe src="https://ghbtns.com/github-btn.html?user=tboox&repo=' + content[i].code_repo + '&type=star&count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe></span>' +
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
