---
layout: default
---

## TBOX

* [More Documents](https://github.com/waruqi/tbox/wiki/documents)

### Build
please install xmake first: [xmake](https://github.com/waruqi/xmake)

	// build for the host platform
    cd ./tbox
    xmake

	// build for the iphoneos platform
    cd ./tbox
    xmake f -p iphoneos 
    xmake
    
	// build for the android platform
    cd ./tbox
    xmake f -p android --ndk=xxxxx
    xmake

## XMake

* [More Documents](https://github.com/waruqi/xmake/wiki/documents)

### Install

#### windows
1. download xmake source codes
2. enter the xmake directory
3. run install.bat 
4. select the install directory and enter
5. please wait some mintues

#### linux/macosx

    git clone git@github.com:waruqi/xmake.git
    cd ./xmake
    sudo ./install

#### homebrew for macosx

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    sudo brew install xmake

#### homebrew for linux

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

