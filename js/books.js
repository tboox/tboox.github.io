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
        page_link: 'https://www.amazon.com/gp/product/0131103628?ie=UTF8&tag=tboox-20&camp=1789&linkCode=xm2&creativeASIN=0131103628',
        img_link: '/static/img/books/en/c-programing.jpg',
        title: 'The C Programming Language (2nd Edition)',
        description: 'The authors present the complete guide to ANSI standard C language programming'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/B011DC1XRW?ie=UTF8&tag=tboox-20&camp=1789&linkCode=xm2&creativeASIN=B011DC1XRW',
        img_link: '/static/img/books/en/android-hacker.jpg',
        title: 'Android Hacker\'s Handbook (1st Edition)',
        description: 'A complete guide to securing the Android operating system'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/1568814240?ie=UTF8&tag=tboox-20&camp=1789&linkCode=xm2&creativeASIN=1568814240',
        img_link: '/static/img/books/en/real-time-render.jpg',
        title: 'Real-Time Rendering (3rd Edition)',
        description: 'Thoroughly revised, this third edition focuses on modern techniques used to generate synthetic three-dimensional images in a fraction of a second'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/1118057651?ie=UTF8&tag=tboox-20&camp=1789&linkCode=xm2&creativeASIN=1118057651',
        img_link: '/static/img/books/en/macosx-ios-internals.jpg',
        title: 'Mac OS X and iOS Internals: To the Apple\'s Core (1st Edition)',
        description: 'From architecture to implementation, this book is essential reading if you want to get serious about the internal workings of Mac OS X and iOS'
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
            '   <a class="a-img" href="' + content[i].page_link + '">' +
            '       <img src="' + content[i].img_link + '">' +
            '   </a>' +
            '   <h3 class="book-title">' +
            '       <a href="' + content[i].page_link + '">' + content[i].title + '</a>' +
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
