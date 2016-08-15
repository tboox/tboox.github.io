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
        page_link: 'https://www.amazon.com/gp/product/0131103628/ref=as_li_tl?ie=UTF8&tag=tboox-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=0131103628&linkId=1014f2036ed02046027425e274cd704f',
        img_link: '/static/img/books/en/c-programing.jpg',
        title: 'The C Programming Language (2nd Edition)',
        description: 'The authors present the complete guide to ANSI standard C language programming'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/111860864X/ref=as_li_tl?ie=UTF8&tag=tboox-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=111860864X&linkId=d33c3c92c278171d902281baf5799838',
        img_link: '/static/img/books/en/android-hacker.jpg',
        title: 'Android Hacker\'s Handbook (1st Edition)',
        description: 'A complete guide to securing the Android operating system'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/1568814240/ref=as_li_tl?ie=UTF8&tag=tboox-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=1568814240&linkId=f0c94c1ea163a20f09699d27fea9b63e',
        img_link: '/static/img/books/en/real-time-render.jpg',
        title: 'Real-Time Rendering (3rd Edition)',
        description: 'Thoroughly revised, this third edition focuses on modern techniques used to generate synthetic three-dimensional images in a fraction of a second'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/1118057651/ref=as_li_tl?ie=UTF8&tag=tboox-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=1118057651&linkId=2b0b389bcc3b221ce4a5b4c3eff7d70b',
        img_link: '/static/img/books/en/macosx-ios-internals.jpg',
        title: 'Mac OS X and iOS Internals: To the Apple\'s Core (1st Edition)',
        description: 'From architecture to implementation, this book is essential reading if you want to get serious about the internal workings of Mac OS X and iOS'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/1118787315/ref=as_li_tl?ie=UTF8&tag=tboox-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=1118787315&linkId=b26e34cd334d36328b2a80c9a5d4adc1',
        img_link: '/static/img/books/en/reverse-engineering.jpg',
        title: 'Practical Reverse Engineering: x86, x64, ARM, Windows Kernel, Reversing Tools, and Obfuscation (1st Edition)',
        description: 'The book covers x86, x64, and ARM (the first book to cover all three); Windows kernel-mode code rootkits and drivers; virtual machine protection techniques; and much more'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/0132017997/ref=as_li_tl?ie=UTF8&tag=tboox-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=0132017997&linkId=aacd921f26657abe01e34423875bf0a8',
        img_link: '/static/img/books/en/unix-os.jpg',
        title: 'The Design of the UNIX Operating System (1st Edition)',
        description: 'This book describes the internal algorithms and the structures that form the basis of the UNIX operating system and their relationship to the programmer interface'
    },
    {
        page_link: 'https://www.amazon.com/gp/product/0735619670/ref=as_li_tl?ie=UTF8&tag=tboox-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=0735619670&linkId=40e6b2dd60c583ba4a820fee08602c3d',
        img_link: '/static/img/books/en/code-complete.jpg',
        title: 'Code Complete: A Practical Handbook of Software Construction (2nd Edition)',
        description: 'Widely considered one of the best practical guides to programming'
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
