---
layout: default.cn
---

## TBOX

* [在线文档](https://github.com/waruqi/tbox/wiki/%E7%9B%AE%E5%BD%95)

### 编译

一般情况下，编译只需要执行：

    cd ./tbox
    xmake 
	
如果要编译ios版本：

    cd ./tbox
    xmake f -p iphoneos 
    xmake
    
编译android需要指定ndk路径：

    cd ./tbox
    xmake f -p android --ndk=xxxxx
    xmake

使用xmake编译完tbox后，可以执行下面的命令，对tbox进行打包：

    # 打包输出到默认目录：tbox/build
    xmake p

    # 打包输出到指定目录
    xmake p -o outdir

更加详细的编译过程，请参考：

* [xmake的安装和使用](https://github.com/waruqi/xmake/wiki/%E7%9B%AE%E5%BD%95)
* [使用xmake进行编译](https://github.com/waruqi/xmake/wiki/%E7%BC%96%E8%AF%91%E5%B7%A5%E7%A8%8B)

## XMake

* [在线文档](https://github.com/waruqi/xmake/wiki/%E7%9B%AE%E5%BD%95)

###在windows上安装xmake

1. 下载xmake源码
2. 进入xmake目录
3. 双击运行install.bat 
4. 默认回车安装到c盘，也可指定安装目录（注：在win7以上的平台，可能会提示需要管理员权限，点击允许就行了）
5. windows下安装可能会比较慢，请耐心等待5分钟。。

###在linux/macosx上安装xmake

    git clone git@github.com:waruqi/xmake.git
    cd ./xmake
    sudo ./install

###在macosx上使用homebrew进行安装：

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    sudo brew install xmake

###在linux上使用homebrew进行安装：

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/linuxbrew/go/install)"
    sudo brew install xmake

<div id="disqus_thread"></div>
<script>
    /**
     *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
     *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables
     */
    /*
    var disqus_config = function () {
        this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
        this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    */
    (function() {  // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        
        s.src = '//zh-tboox.disqus.com/embed.js';
        
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>

